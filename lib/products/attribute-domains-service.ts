// ============================================================================
// Product Attribute Domains Service
// ============================================================================
// This file provides service functions for interacting with the three new
// product attribute domain tables:
// - product_attributes
// - product_composition
// - product_content
//
// All functions include authentication and ownership verification.
// ============================================================================

import { createClientServer } from '@/lib/supabase/server'
import type {
  ProductAttribute,
  CreateProductAttributeInput,
  UpdateProductAttributeInput,
  ProductComposition,
  CreateProductCompositionInput,
  UpdateProductCompositionInput,
  ProductContent,
  CreateProductContentInput,
  UpdateProductContentInput,
} from './product-attribute-domains'

// ============================================================================
// Authentication & Ownership Helpers
// ============================================================================

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

// ============================================================================
// ProductAttribute Service
// ============================================================================

export async function getProductAttributes(
  productId: string,
  variantId?: string | null
): Promise<ProductAttribute[]> {
  const { supabase, store } = await getAuthenticatedContext()
  
  await verifyProductOwnership(productId, store.id)
  
  let query = supabase
    .from('product_attributes')
    .select('*')
    .eq('product_id', productId)
  
  if (variantId) {
    query = query.eq('variant_id', variantId)
  } else {
    query = query.is('variant_id', null)
  }
  
  const { data, error } = await query.order('field_key', { ascending: true })
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data || []
}

export async function createProductAttribute(
  input: CreateProductAttributeInput
): Promise<ProductAttribute> {
  const { supabase, store } = await getAuthenticatedContext()
  
  await verifyProductOwnership(input.product_id, store.id)
  
  if (input.variant_id) {
    await verifyVariantOwnership(input.variant_id, store.id)
  }
  
  const { data, error } = await supabase
    .from('product_attributes')
    .insert({
      product_id: input.product_id,
      variant_id: input.variant_id || null,
      field_key: input.field_key,
      label: input.label || null,
      value: input.value,
      value_type: input.value_type || 'text',
      unit: input.unit || null,
      source: input.source || 'manual',
      confidence: input.confidence ?? 1.0,
      is_standard: input.is_standard ?? true,
    })
    .select()
    .single()
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data
}

export async function updateProductAttribute(
  attributeId: string,
  input: UpdateProductAttributeInput
): Promise<ProductAttribute> {
  const { supabase, store } = await getAuthenticatedContext()
  
  // Get the attribute to verify ownership
  const { data: existing, error: fetchError } = await supabase
    .from('product_attributes')
    .select('id, product_id, variant_id')
    .eq('id', attributeId)
    .single()
  
  if (fetchError || !existing) {
    throw new Error('Attribute not found')
  }
  
  await verifyProductOwnership(existing.product_id, store.id)
  
  if (existing.variant_id) {
    await verifyVariantOwnership(existing.variant_id, store.id)
  }
  
  const update: Partial<CreateProductAttributeInput> = {}
  
  if (input.label !== undefined) update.label = input.label
  if (input.value !== undefined) update.value = input.value
  if (input.value_type !== undefined) update.value_type = input.value_type
  if (input.unit !== undefined) update.unit = input.unit
  if (input.source !== undefined) update.source = input.source
  if (input.confidence !== undefined) update.confidence = input.confidence
  if (input.is_standard !== undefined) update.is_standard = input.is_standard
  
  const { data, error } = await supabase
    .from('product_attributes')
    .update(update)
    .eq('id', attributeId)
    .select()
    .single()
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data
}

export async function deleteProductAttribute(
  attributeId: string
): Promise<boolean> {
  const { supabase, store } = await getAuthenticatedContext()
  
  // Get the attribute to verify ownership
  const { data: existing, error: fetchError } = await supabase
    .from('product_attributes')
    .select('id, product_id, variant_id')
    .eq('id', attributeId)
    .single()
  
  if (fetchError || !existing) {
    throw new Error('Attribute not found')
  }
  
  await verifyProductOwnership(existing.product_id, store.id)
  
  if (existing.variant_id) {
    await verifyVariantOwnership(existing.variant_id, store.id)
  }
  
  const { error } = await supabase
    .from('product_attributes')
    .delete()
    .eq('id', attributeId)
  
  if (error) {
    throw new Error(error.message)
  }
  
  return true
}

export async function batchCreateProductAttributes(
  productId: string,
  attributes: Omit<CreateProductAttributeInput, 'product_id'>[]
): Promise<ProductAttribute[]> {
  const { supabase, store } = await getAuthenticatedContext()
  
  await verifyProductOwnership(productId, store.id)
  
  const records = attributes.map(attr => ({
    product_id: productId,
    variant_id: attr.variant_id || null,
    field_key: attr.field_key,
    label: attr.label || null,
    value: attr.value,
    value_type: attr.value_type || 'text',
    unit: attr.unit || null,
    source: attr.source || 'manual',
    confidence: attr.confidence ?? 1.0,
    is_standard: attr.is_standard ?? true,
  }))
  
  const { data, error } = await supabase
    .from('product_attributes')
    .insert(records)
    .select()
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data || []
}

// ============================================================================
// ProductComposition Service
// ============================================================================

export async function getProductCompositions(
  productId: string,
  variantId?: string | null
): Promise<ProductComposition[]> {
  const { supabase, store } = await getAuthenticatedContext()
  
  await verifyProductOwnership(productId, store.id)
  
  let query = supabase
    .from('product_composition')
    .select('*')
    .eq('product_id', productId)
  
  if (variantId) {
    query = query.eq('variant_id', variantId)
  } else {
    query = query.is('variant_id', null)
  }
  
  const { data, error } = await query.order('is_primary', { ascending: false })
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data || []
}

export async function createProductComposition(
  input: CreateProductCompositionInput
): Promise<ProductComposition> {
  const { supabase, store } = await getAuthenticatedContext()
  
  await verifyProductOwnership(input.product_id, store.id)
  
  if (input.variant_id) {
    await verifyVariantOwnership(input.variant_id, store.id)
  }
  
  const { data, error } = await supabase
    .from('product_composition')
    .insert({
      product_id: input.product_id,
      variant_id: input.variant_id || null,
      component_name: input.component_name,
      component_type: input.component_type,
      material_code: input.material_code || null,
      percentage: input.percentage || null,
      quantity: input.quantity || null,
      quantity_unit: input.quantity_unit || null,
      supplier_name: input.supplier_name || null,
      origin_country: input.origin_country || null,
      is_primary: input.is_primary ?? false,
      notes: input.notes || null,
    })
    .select()
    .single()
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data
}

export async function updateProductComposition(
  compositionId: string,
  input: UpdateProductCompositionInput
): Promise<ProductComposition> {
  const { supabase, store } = await getAuthenticatedContext()
  
  // Get the composition to verify ownership
  const { data: existing, error: fetchError } = await supabase
    .from('product_composition')
    .select('id, product_id, variant_id')
    .eq('id', compositionId)
    .single()
  
  if (fetchError || !existing) {
    throw new Error('Composition not found')
  }
  
  await verifyProductOwnership(existing.product_id, store.id)
  
  if (existing.variant_id) {
    await verifyVariantOwnership(existing.variant_id, store.id)
  }
  
  const update: Partial<CreateProductCompositionInput> = {}
  
  if (input.component_name !== undefined) update.component_name = input.component_name
  if (input.component_type !== undefined) update.component_type = input.component_type
  if (input.material_code !== undefined) update.material_code = input.material_code
  if (input.percentage !== undefined) update.percentage = input.percentage
  if (input.quantity !== undefined) update.quantity = input.quantity
  if (input.quantity_unit !== undefined) update.quantity_unit = input.quantity_unit
  if (input.supplier_name !== undefined) update.supplier_name = input.supplier_name
  if (input.origin_country !== undefined) update.origin_country = input.origin_country
  if (input.is_primary !== undefined) update.is_primary = input.is_primary
  if (input.notes !== undefined) update.notes = input.notes
  
  const { data, error } = await supabase
    .from('product_composition')
    .update(update)
    .eq('id', compositionId)
    .select()
    .single()
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data
}

export async function deleteProductComposition(
  compositionId: string
): Promise<boolean> {
  const { supabase, store } = await getAuthenticatedContext()
  
  // Get the composition to verify ownership
  const { data: existing, error: fetchError } = await supabase
    .from('product_composition')
    .select('id, product_id, variant_id')
    .eq('id', compositionId)
    .single()
  
  if (fetchError || !existing) {
    throw new Error('Composition not found')
  }
  
  await verifyProductOwnership(existing.product_id, store.id)
  
  if (existing.variant_id) {
    await verifyVariantOwnership(existing.variant_id, store.id)
  }
  
  const { error } = await supabase
    .from('product_composition')
    .delete()
    .eq('id', compositionId)
  
  if (error) {
    throw new Error(error.message)
  }
  
  return true
}

// ============================================================================
// ProductContent Service
// ============================================================================

export async function getProductContents(
  productId: string,
  contentType?: string
): Promise<ProductContent[]> {
  const { supabase, store } = await getAuthenticatedContext()
  
  await verifyProductOwnership(productId, store.id)
  
  let query = supabase
    .from('product_content')
    .select('*')
    .eq('product_id', productId)
  
  if (contentType) {
    query = query.eq('content_type', contentType)
  }
  
  const { data, error } = await query.order('position', { ascending: true })
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data || []
}

export async function createProductContent(
  input: CreateProductContentInput
): Promise<ProductContent> {
  const { supabase, store } = await getAuthenticatedContext()
  
  await verifyProductOwnership(input.product_id, store.id)
  
  const { data, error } = await supabase
    .from('product_content')
    .insert({
      product_id: input.product_id,
      content_type: input.content_type,
      language: input.language || 'zh',
      title: input.title || null,
      body: input.body || null,
      position: input.position ?? 0,
      meta_title: input.meta_title || null,
      meta_description: input.meta_description || null,
      keywords: input.keywords || null,
      is_visible: input.is_visible ?? true,
    })
    .select()
    .single()
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data
}

export async function updateProductContent(
  contentId: string,
  input: UpdateProductContentInput
): Promise<ProductContent> {
  const { supabase, store } = await getAuthenticatedContext()
  
  // Get the content to verify ownership
  const { data: existing, error: fetchError } = await supabase
    .from('product_content')
    .select('id, product_id')
    .eq('id', contentId)
    .single()
  
  if (fetchError || !existing) {
    throw new Error('Content not found')
  }
  
  await verifyProductOwnership(existing.product_id, store.id)
  
  const update: Partial<CreateProductContentInput> = {}
  
  if (input.content_type !== undefined) update.content_type = input.content_type
  if (input.language !== undefined) update.language = input.language
  if (input.title !== undefined) update.title = input.title
  if (input.body !== undefined) update.body = input.body
  if (input.position !== undefined) update.position = input.position
  if (input.meta_title !== undefined) update.meta_title = input.meta_title
  if (input.meta_description !== undefined) update.meta_description = input.meta_description
  if (input.keywords !== undefined) update.keywords = input.keywords
  if (input.is_visible !== undefined) update.is_visible = input.is_visible
  
  const { data, error } = await supabase
    .from('product_content')
    .update(update)
    .eq('id', contentId)
    .select()
    .single()
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data
}

export async function deleteProductContent(
  contentId: string
): Promise<boolean> {
  const { supabase, store } = await getAuthenticatedContext()
  
  // Get the content to verify ownership
  const { data: existing, error: fetchError } = await supabase
    .from('product_content')
    .select('id, product_id')
    .eq('id', contentId)
    .single()
  
  if (fetchError || !existing) {
    throw new Error('Content not found')
  }
  
  await verifyProductOwnership(existing.product_id, store.id)
  
  const { error } = await supabase
    .from('product_content')
    .delete()
    .eq('id', contentId)
  
  if (error) {
    throw new Error(error.message)
  }
  
  return true
}
