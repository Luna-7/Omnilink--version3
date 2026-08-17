import { createClientServer } from '@/lib/supabase/server'
import type { 
  ProductOption, 
  ProductVariant, 
  CreateProductOptionInput, 
  UpdateProductOptionInput,
  CreateProductVariantInput,
  UpdateProductVariantInput 
} from './types'
import {
  normalizeOptionCode,
  canonicalizeOptionValues,
  isValidOptionCode,
  isValidSKU,
  isValidVariantStatus,
  validateVariantForPublish,
  validateInventory,
  validateOptionValues
} from './validation'

/**
 * Get authenticated user and their store
 */
async function getAuthenticatedContext() {
  const supabase = await createClientServer()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('Unauthorized')
  }
  
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle()
  
  if (storeError) {
    throw new Error(storeError.message)
  }
  
  if (!store) {
    throw new Error('Store not found')
  }
  
  return { supabase, user, store }
}

/**
 * Verify product belongs to the authenticated user's store
 */
async function verifyProductOwnership(productId: string, storeId: string) {
  const supabase = await createClientServer()
  
  const { data: product, error } = await supabase
    .from('products')
    .select('id, store_id')
    .eq('id', productId)
    .single()
  
  if (error) {
    throw new Error(error.message)
  }
  
  if (!product) {
    throw new Error('Product not found')
  }
  
  if (product.store_id !== storeId) {
    throw new Error('Product does not belong to your store')
  }
  
  return product
}

/**
 * Verify variant belongs to the authenticated user's store
 */
async function verifyVariantOwnership(variantId: string, storeId: string) {
  const supabase = await createClientServer()
  
  const { data: variant, error } = await supabase
    .from('product_variants')
    .select('id, product_id')
    .eq('id', variantId)
    .single()
  
  if (error) {
    throw new Error(error.message)
  }
  
  if (!variant) {
    throw new Error('Variant not found')
  }
  
  // Verify the product belongs to the store
  await verifyProductOwnership(variant.product_id, storeId)
  
  return variant
}

/**
 * Check SKU uniqueness within a store
 */
async function checkSKUUniqueness(storeId: string, sku: string, excludeVariantId?: string): Promise<boolean> {
  const supabase = await createClientServer()
  
  // First, get all variants with the SKU
  const { data: variants, error: variantError } = await supabase
    .from('product_variants')
    .select('id, product_id')
    .eq('sku', sku)
  
  if (variantError) {
    throw new Error(variantError.message)
  }
  
  if (!variants || variants.length === 0) {
    return true // No variants with this SKU
  }
  
  // Filter out the excluded variant ID
  const filteredVariants = excludeVariantId 
    ? variants.filter(v => v.id !== excludeVariantId)
    : variants
  
  if (filteredVariants.length === 0) {
    return true // Only the excluded variant has this SKU
  }
  
  // Check if any of the remaining variants belong to products in the store
  const productIds = filteredVariants.map(v => v.product_id)
  
  const { data: products, error: productError } = await supabase
    .from('products')
    .select('id')
    .in('id', productIds)
    .eq('store_id', storeId)
  
  if (productError) {
    throw new Error(productError.message)
  }
  
  // If any product belongs to the store, SKU is not unique
  return (products?.length ?? 0) === 0
}

/**
 * Check for duplicate option_values within a product
 */
async function checkOptionValuesUniqueness(productId: string, optionValues: Record<string, string>, excludeVariantId?: string): Promise<boolean> {
  const supabase = await createClientServer()
  
  const canonical = canonicalizeOptionValues(optionValues)
  
  // Get all variants for this product
  const { data: variants, error } = await supabase
    .from('product_variants')
    .select('id, option_values')
    .eq('product_id', productId)
  
  if (error) {
    throw new Error(error.message)
  }
  
  for (const variant of variants || []) {
    if (excludeVariantId && variant.id === excludeVariantId) {
      continue
    }
    
    const variantCanonical = canonicalizeOptionValues(variant.option_values as Record<string, string>)
    if (variantCanonical === canonical) {
      return false // Duplicate found
    }
  }
  
  return true // No duplicates
}

// ============================================================================
// Product Options
// ============================================================================

export async function getProductOptions(productId: string): Promise<ProductOption[]> {
  const { supabase, store } = await getAuthenticatedContext()
  
  // Verify product ownership
  await verifyProductOwnership(productId, store.id)
  
  const { data, error } = await supabase
    .from('product_options')
    .select('*')
    .eq('product_id', productId)
    .order('position', { ascending: true })
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data || []
}

export async function createProductOption(
  productId: string,
  input: CreateProductOptionInput
): Promise<ProductOption> {
  const { supabase, store } = await getAuthenticatedContext()
  
  // Verify product ownership
  await verifyProductOwnership(productId, store.id)
  
  // Validate input
  const normalizedCode = normalizeOptionCode(input.code)
  if (!isValidOptionCode(normalizedCode)) {
    throw new Error('Invalid option code format')
  }
  
  const valuesValidation = validateOptionValues(input.values)
  if (!valuesValidation.valid) {
    throw new Error(valuesValidation.error)
  }
  
  // Check for duplicate code
  const { data: existing } = await supabase
    .from('product_options')
    .select('id')
    .eq('product_id', productId)
    .eq('code', normalizedCode)
    .maybeSingle()
  
  if (existing) {
    throw new Error('Option with this code already exists for this product')
  }
  
  const { data, error } = await supabase
    .from('product_options')
    .insert({
      product_id: productId,
      name: input.name,
      code: normalizedCode,
      position: input.position ?? 0,
      values: input.values
    })
    .select()
    .single()
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data
}

export async function updateProductOption(
  productId: string,
  optionId: string,
  input: UpdateProductOptionInput
): Promise<ProductOption> {
  const { supabase, store } = await getAuthenticatedContext()
  
  // Verify product ownership
  await verifyProductOwnership(productId, store.id)
  
  // Verify option belongs to product
  const { data: existingOption, error: optionError } = await supabase
    .from('product_options')
    .select('id')
    .eq('id', optionId)
    .eq('product_id', productId)
    .single()
  
  if (optionError || !existingOption) {
    throw new Error('Option not found or does not belong to this product')
  }
  
  // Build update object
  const update: Partial<CreateProductOptionInput> = {}
  
  if (input.name !== undefined) {
    update.name = input.name
  }
  
  if (input.code !== undefined) {
    const normalizedCode = normalizeOptionCode(input.code)
    if (!isValidOptionCode(normalizedCode)) {
      throw new Error('Invalid option code format')
    }
    
    // Check for duplicate code (excluding current option)
    const { data: duplicate } = await supabase
      .from('product_options')
      .select('id')
      .eq('product_id', productId)
      .eq('code', normalizedCode)
      .neq('id', optionId)
      .maybeSingle()
    
    if (duplicate) {
      throw new Error('Option with this code already exists for this product')
    }
    
    update.code = normalizedCode
  }
  
  if (input.position !== undefined) {
    update.position = input.position
  }
  
  if (input.values !== undefined) {
    const valuesValidation = validateOptionValues(input.values)
    if (!valuesValidation.valid) {
      throw new Error(valuesValidation.error)
    }
    update.values = input.values
  }
  
  const { data, error } = await supabase
    .from('product_options')
    .update(update)
    .eq('id', optionId)
    .select()
    .single()
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data
}

export async function deleteProductOption(
  productId: string,
  optionId: string
): Promise<boolean> {
  const { supabase, store } = await getAuthenticatedContext()
  
  // Verify product ownership
  await verifyProductOwnership(productId, store.id)
  
  // Verify option belongs to product
  const { data: existingOption, error: optionError } = await supabase
    .from('product_options')
    .select('id')
    .eq('id', optionId)
    .eq('product_id', productId)
    .single()
  
  if (optionError || !existingOption) {
    throw new Error('Option not found or does not belong to this product')
  }
  
  const { error } = await supabase
    .from('product_options')
    .delete()
    .eq('id', optionId)
  
  if (error) {
    throw new Error(error.message)
  }
  
  return true
}

// ============================================================================
// Product Variants
// ============================================================================

export async function getProductVariants(productId: string): Promise<ProductVariant[]> {
  const { supabase, store } = await getAuthenticatedContext()
  
  // Verify product ownership
  await verifyProductOwnership(productId, store.id)
  
  const { data, error } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: true })
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data || []
}

export async function getProductVariant(
  productId: string,
  variantId: string
): Promise<ProductVariant> {
  const { supabase, store } = await getAuthenticatedContext()
  
  // Verify product ownership
  await verifyProductOwnership(productId, store.id)
  
  const { data, error } = await supabase
    .from('product_variants')
    .select('*')
    .eq('id', variantId)
    .eq('product_id', productId)
    .single()
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data
}

export async function createProductVariant(
  productId: string,
  input: CreateProductVariantInput
): Promise<ProductVariant> {
  const { supabase, store } = await getAuthenticatedContext()
  
  // Verify product ownership
  await verifyProductOwnership(productId, store.id)
  
  // Validate SKU if provided
  if (input.sku) {
    if (!isValidSKU(input.sku)) {
      throw new Error('Invalid SKU format')
    }
    
    // Check SKU uniqueness within store
    const isUnique = await checkSKUUniqueness(store.id, input.sku)
    if (!isUnique) {
      throw new Error('SKU already exists in this store')
    }
  }
  
  // Validate inventory if provided
  if (input.inventory !== undefined) {
    const inventoryValidation = validateInventory(input.inventory)
    if (!inventoryValidation.valid) {
      throw new Error(inventoryValidation.error)
    }
  }
  
  // Validate status
  if (input.status && !isValidVariantStatus(input.status)) {
    throw new Error('Invalid variant status')
  }
  
  // Validate for publish if status is active
  if (input.status === 'active') {
    const publishValidation = validateVariantForPublish({
      sku: input.sku ?? null,
      price: input.price ?? null,
      option_values: input.option_values
    })
    if (!publishValidation.valid) {
      throw new Error(publishValidation.error)
    }
  }
  
  // Check for duplicate option_values
  const isUnique = await checkOptionValuesUniqueness(productId, input.option_values)
  if (!isUnique) {
    throw new Error('Variant with these option values already exists')
  }
  
  const { data, error } = await supabase
    .from('product_variants')
    .insert({
      product_id: productId,
      sku: input.sku || null,
      price: input.price || null,
      currency: input.currency || 'USD',
      inventory: input.inventory ?? null,
      status: input.status || 'draft',
      option_values: input.option_values,
      raw_data: input.raw_data || null,
      semantic_data: input.semantic_data || null
    })
    .select()
    .single()
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data
}

export async function updateProductVariant(
  productId: string,
  variantId: string,
  input: UpdateProductVariantInput
): Promise<ProductVariant> {
  const { supabase, store } = await getAuthenticatedContext()
  
  // Verify variant ownership
  await verifyVariantOwnership(variantId, store.id)
  
  // Build update object
  const update: Partial<CreateProductVariantInput> = {}
  
  if (input.sku !== undefined) {
    if (input.sku) {
      if (!isValidSKU(input.sku)) {
        throw new Error('Invalid SKU format')
      }
      
      // Check SKU uniqueness within store (excluding current variant)
      const isUnique = await checkSKUUniqueness(store.id, input.sku, variantId)
      if (!isUnique) {
        throw new Error('SKU already exists in this store')
      }
    }
    update.sku = input.sku
  }
  
  if (input.price !== undefined) {
    update.price = input.price
  }
  
  if (input.currency !== undefined) {
    update.currency = input.currency
  }
  
  if (input.inventory !== undefined) {
    const inventoryValidation = validateInventory(input.inventory)
    if (!inventoryValidation.valid) {
      throw new Error(inventoryValidation.error)
    }
    update.inventory = input.inventory
  }
  
  if (input.status !== undefined) {
    if (!isValidVariantStatus(input.status)) {
      throw new Error('Invalid variant status')
    }
    
    // Validate for publish if status is being set to active
    if (input.status === 'active') {
      // Get current variant data for validation
      const { data: currentVariant } = await supabase
        .from('product_variants')
        .select('sku, price, option_values')
        .eq('id', variantId)
        .single()
      
      if (!currentVariant) {
        throw new Error('Variant not found')
      }
      
      const currentPrice = input.price !== undefined ? input.price : (currentVariant.price as number | null)
      const currentSKU = input.sku !== undefined ? input.sku : (currentVariant.sku as string | null)
      const currentOptionValues = input.option_values !== undefined ? input.option_values : (currentVariant.option_values as Record<string, string>)
      
      const publishValidation = validateVariantForPublish({
        sku: currentSKU,
        price: currentPrice,
        option_values: currentOptionValues
      })
      if (!publishValidation.valid) {
        throw new Error(publishValidation.error)
      }
    }
    
    update.status = input.status
  }
  
  if (input.option_values !== undefined) {
    // Check for duplicate option_values (excluding current variant)
    const isUnique = await checkOptionValuesUniqueness(productId, input.option_values, variantId)
    if (!isUnique) {
      throw new Error('Variant with these option values already exists')
    }
    update.option_values = input.option_values
  }
  
  if (input.raw_data !== undefined) {
    update.raw_data = input.raw_data
  }
  
  if (input.semantic_data !== undefined) {
    update.semantic_data = input.semantic_data
  }
  
  const { data, error } = await supabase
    .from('product_variants')
    .update(update)
    .eq('id', variantId)
    .select()
    .single()
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data
}

export async function deleteProductVariant(
  productId: string,
  variantId: string
): Promise<boolean> {
  const { supabase, store } = await getAuthenticatedContext()
  
  // Verify variant ownership
  await verifyVariantOwnership(variantId, store.id)
  
  const { error } = await supabase
    .from('product_variants')
    .delete()
    .eq('id', variantId)
  
  if (error) {
    throw new Error(error.message)
  }
  
  return true
}
