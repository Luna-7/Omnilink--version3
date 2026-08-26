import { createClientServer } from '@/lib/supabase/server'
import { 
  createProductOption, 
  createProductVariant 
} from './variants/service'
import { 
  normalizeOptionCode, 
  validateOptionValues,
  generateVariantCombinations 
} from './variants/validation'

/**
 * Input for creating a product with options and variants
 */
export interface CreateProductWithVariantsInput {
  // Product core fields
  name: string
  sku?: string
  price?: number
  currency?: string
  inventory?: number
  description?: string
  status?: string
  category?: string
  category_id?: string
  origin?: string
  attributes?: Array<Record<string, unknown>>
  raw_data?: Record<string, unknown>
  store_id: string

  // Options for variant generation
  options?: Array<{
    name: string
    code: string
    values: string[]
  }>
}

/**
 * Result of product with variants creation
 */
export interface CreateProductWithVariantsResult {
  success: boolean
  productId?: string
  error?: string
  optionsCreated?: number
  variantsCreated?: number
}

/**
 * Generate deterministic SKU for a variant based on product SKU and option values
 */
function generateVariantSKU(
  productSku: string | undefined, 
  optionValues: Record<string, string>
): string {
  const baseSku = productSku || 'PROD'
  
  // Create a normalized suffix from option values
  const suffixParts: string[] = []
  
  // Sort keys for consistent ordering
  const sortedKeys = Object.keys(optionValues).sort()
  
  for (const key of sortedKeys) {
    const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 3)
    const normalizedValue = optionValues[key]
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 3)
    suffixParts.push(`${normalizedKey}-${normalizedValue}`)
  }
  
  const suffix = suffixParts.join('-')
  
  // Combine base SKU with suffix, ensuring total length <= 100
  const maxLength = 100
  const baseLength = maxLength - suffix.length - 1
  
  if (baseLength <= 0) {
    // If suffix is too long, truncate it
    return suffix.substring(0, maxLength)
  }
  
  const truncatedBase = baseSku.substring(0, baseLength)
  return `${truncatedBase}-${suffix}`.substring(0, maxLength)
}

/**
 * Create a product with options and variants in a coordinated manner
 * 
 * This function orchestrates the creation of:
 * 1. Product record
 * 2. Product Option records (if options provided)
 * 3. Product Variant records (generated from option combinations)
 * 
 * Error handling: If any step fails, attempts to clean up created records
 */
export async function createProductWithVariants(
  input: CreateProductWithVariantsInput
): Promise<CreateProductWithVariantsResult> {
  const supabase = await createClientServer()
  
  let createdProductId: string | undefined = undefined
  const createdOptionIds: string[] = []
  const createdVariantIds: string[] = []
  
  try {
    // Step 1: Create the product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        store_id: input.store_id,
        name: input.name,
        sku: input.sku || null,
        price: input.price || 0,
        currency: input.currency || 'USD',
        inventory: input.inventory || 0,
        description: input.description || null,
        status: input.status || 'draft',
        // NOTE: Do NOT write `category` / `category_id` as top-level columns on `products`.
        // The `products` table does not have these columns. Category compatibility lives in
        // `raw_data.category` / `raw_data.category_id` (already set by the route from
        // `body.category` / `body.category_id`). See P0 audit (2026-08-26).
        raw_data: {
          ...input.raw_data,
          origin: input.origin,
          attributes: input.attributes,
          // DO NOT write options to raw_data - they go to product_options table
        },
      })
      .select()
      .single()
    
    if (productError || !product) {
      throw new Error(productError?.message || 'Failed to create product')
    }
    
    createdProductId = product.id
    
    // If no options provided, we're done (single-SKU product)
    if (!input.options || input.options.length === 0) {
      return {
        success: true,
        productId: createdProductId,
        optionsCreated: 0,
        variantsCreated: 0,
      }
    }
    
    // Step 2: Create product options
    const normalizedOptions: Array<{ code: string; values: string[] }> = []
    
    for (const option of input.options) {
      // Validate option values
      const valuesValidation = validateOptionValues(option.values)
      if (!valuesValidation.valid) {
        throw new Error(`Invalid option values for ${option.name}: ${valuesValidation.error}`)
      }
      
      // Normalize option code
      const normalizedCode = normalizeOptionCode(option.code)
      
      // Create the option (createdProductId is guaranteed to be defined here)
      const createdOption = await createProductOption(createdProductId!, {
        name: option.name,
        code: normalizedCode,
        values: option.values,
      })
      
      createdOptionIds.push(createdOption.id)
      normalizedOptions.push({
        code: normalizedCode,
        values: option.values,
      })
    }
    
    // Step 3: Generate variant combinations
    const variantCombinations = generateVariantCombinations(normalizedOptions)
    
    if (variantCombinations.length === 0) {
      // No valid combinations, but options were created
      return {
        success: true,
        productId: createdProductId,
        optionsCreated: createdOptionIds.length,
        variantsCreated: 0,
      }
    }
    
    // Step 4: Create variants for each combination
    const basePrice = input.price || 0
    const baseCurrency = input.currency || 'USD'
    const baseInventory = input.inventory || 0
    
    for (const combination of variantCombinations) {
      // Generate deterministic SKU
      const variantSku = generateVariantSKU(input.sku, combination)
      
      // Create the variant (createdProductId is guaranteed to be defined here)
      const variant = await createProductVariant(createdProductId!, {
        sku: variantSku,
        price: basePrice,
        currency: baseCurrency,
        inventory: baseInventory,
        status: 'draft', // Variants start as draft until merchant reviews
        option_values: combination,
      })
      
      createdVariantIds.push(variant.id)
    }
    
    return {
      success: true,
      productId: createdProductId,
      optionsCreated: createdOptionIds.length,
      variantsCreated: createdVariantIds.length,
    }
    
  } catch (error) {
    // Compensation rollback: track failures so the caller is never lied to.
    // The DB has NO multi-statement transaction here, so we must surface partial
    // state explicitly when cleanup fails. See P0 audit (2026-08-26).
    const originalError = error instanceof Error ? error.message : 'Unknown error occurred'

    console.error('[createProductWithVariants] Failed; attempting compensation rollback:', {
      productId: createdProductId,
      optionIds: createdOptionIds,
      variantIds: createdVariantIds,
      originalError,
    })

    const cleanupFailures: string[] = []
    const deletedVariants: string[] = []
    const deletedOptions: string[] = []
    let deletedProduct = false

    // 1) Delete variants in reverse insertion order
    for (const variantId of [...createdVariantIds].reverse()) {
      try {
        const { error: delError } = await supabase
          .from('product_variants')
          .delete()
          .eq('id', variantId)
        if (delError) throw new Error(delError.message)
        deletedVariants.push(variantId)
      } catch (e) {
        cleanupFailures.push(`variant ${variantId}: ${e instanceof Error ? e.message : String(e)}`)
      }
    }

    // 2) Delete options in reverse insertion order
    for (const optionId of [...createdOptionIds].reverse()) {
      try {
        const { error: delError } = await supabase
          .from('product_options')
          .delete()
          .eq('id', optionId)
        if (delError) throw new Error(delError.message)
        deletedOptions.push(optionId)
      } catch (e) {
        cleanupFailures.push(`option ${optionId}: ${e instanceof Error ? e.message : String(e)}`)
      }
    }

    // 3) Delete product last
    if (createdProductId) {
      try {
        const { error: delError } = await supabase
          .from('products')
          .delete()
          .eq('id', createdProductId)
        if (delError) throw new Error(delError.message)
        deletedProduct = true
      } catch (e) {
        cleanupFailures.push(`product ${createdProductId}: ${e instanceof Error ? e.message : String(e)}`)
      }
    }

    // Build an honest error message that exposes partial state when cleanup fails.
    let errorMessage = originalError
    if (cleanupFailures.length > 0) {
      const remainingVariants = createdVariantIds.length - deletedVariants.length
      const remainingOptions = createdOptionIds.length - deletedOptions.length
      const productRemains = createdProductId && !deletedProduct
      const partialBits: string[] = []
      if (remainingVariants > 0) partialBits.push(`${remainingVariants} variant(s)`)
      if (remainingOptions > 0) partialBits.push(`${remainingOptions} option(s)`)
      if (productRemains) partialBits.push('product')

      errorMessage =
        `${originalError}. ` +
        `Compensation cleanup incomplete (${cleanupFailures.length} failure(s): ${cleanupFailures.join('; ')}). ` +
        `Manual cleanup required — possible partial state remains: ${partialBits.join(', ') || 'none'}.`
      console.error('[createProductWithVariants] Partial state — manual cleanup needed:', {
        remainingVariants,
        remainingOptions,
        productRemains,
        cleanupFailures,
      })
    } else {
      console.error('[createProductWithVariants] Compensation rollback succeeded.')
    }

    return {
      success: false,
      error: errorMessage,
    }
  }
}
