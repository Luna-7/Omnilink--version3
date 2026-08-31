import { createClientServer } from '@/lib/supabase/server'
import {
  normalizeOptionCode,
  validateOptionValues,
  generateVariantCombinations,
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
  optionValues: Record<string, string>,
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
 * Minimal structural type for the atomic RPC response.
 */
interface AtomicCreateResult {
  success: boolean
  product_id: string
  options_created: number
  variants_created: number
}

/**
 * Typed accessor for supabase.rpc so we can call the not-yet-generated
 * `create_product_atomic` function without widening the Database type here.
 */
type AtomicRpcClient = {
  rpc: (
    fn: string,
    params: Record<string, unknown>,
  ) => Promise<{ data: AtomicCreateResult | null; error: { message: string } | null }>
}

/**
 * Create a product with options and variants atomically.
 *
 * The option/variant *combination* logic stays in the application layer (where it
 * is unit-tested), but ALL inserts are performed by a single database transaction
 * via the `create_product_atomic` SECURITY INVOKER RPC. RLS still applies inside
 * the function, so the store-ownership boundary (99c8337) is preserved and a
 * non-owned store_id is rejected by the database.
 *
 * Because the entire create is one transaction, a failure at any step rolls back
 * every inserted row — no orphan products, options, or partial variant sets.
 */
export async function createProductWithVariants(
  input: CreateProductWithVariantsInput,
): Promise<CreateProductWithVariantsResult> {
  const supabase = await createClientServer()

  // Product core payload. NOTE: `category` / `category_id` are intentionally NOT
  // written as top-level columns on `products` (the table has none). Category
  // compatibility lives under raw_data (set by the route from body.category /
  // body.category_id). See P0 audit (2026-08-26).
  const productPayload: Record<string, unknown> = {
    name: input.name,
    sku: input.sku ?? null,
    price: input.price ?? 0,
    currency: input.currency ?? 'USD',
    inventory: input.inventory ?? 0,
    description: input.description ?? null,
    status: input.status ?? 'draft',
    raw_data: {
      ...(input.raw_data ?? {}),
      origin: input.origin,
      attributes: input.attributes,
      // DO NOT write options to raw_data - they go to product_options table
    },
  }

  const optionsPayload: Array<Record<string, unknown>> = []
  const variantsPayload: Array<Record<string, unknown>> = []

  // Single-SKU product: no options → variants array stays empty.
  if (input.options && input.options.length > 0) {
    const normalizedOptions: Array<{ code: string; values: string[] }> = []

    for (const option of input.options) {
      const valuesValidation = validateOptionValues(option.values)
      if (!valuesValidation.valid) {
        return {
          success: false,
          error: `Invalid option values for ${option.name}: ${valuesValidation.error}`,
        }
      }
      const normalizedCode = normalizeOptionCode(option.code)
      optionsPayload.push({
        name: option.name,
        code: normalizedCode,
        values: option.values,
      })
      normalizedOptions.push({ code: normalizedCode, values: option.values })
    }

    // Generate the full Cartesian product of option values.
    const combinations = generateVariantCombinations(normalizedOptions)
    const basePrice = input.price ?? 0
    const baseCurrency = input.currency ?? 'USD'
    const baseInventory = input.inventory ?? 0

    for (const combination of combinations) {
      variantsPayload.push({
        sku: generateVariantSKU(input.sku, combination),
        price: basePrice,
        currency: baseCurrency,
        inventory: baseInventory,
        status: 'draft', // Variants start as draft until merchant reviews
        option_values: combination,
      })
    }
  }

  // Single DB transaction. The RPC enforces RLS/ownership and rolls back on any
  // failure, so this layer never needs compensation cleanup.
  const rpcClient = supabase as unknown as AtomicRpcClient
  const { data, error } = await rpcClient.rpc('create_product_atomic', {
    p_store_id: input.store_id,
    p_product: productPayload,
    p_options: optionsPayload,
    p_variants: variantsPayload,
  })

  if (error || !data) {
    console.error('[createProductWithVariants] Atomic create failed', {
      storeId: input.store_id,
      error: error?.message ?? 'no data returned',
    })
    return {
      success: false,
      error: error?.message ?? 'Failed to create product',
    }
  }

  if (!data.success || !data.product_id) {
    return {
      success: false,
      error: 'Atomic product creation returned an empty product id',
    }
  }

  return {
    success: true,
    productId: data.product_id,
    optionsCreated: data.options_created,
    variantsCreated: data.variants_created,
  }
}
