// ============================================================================
// Product Attribute Domain Models
// ============================================================================
// This file defines TypeScript interfaces for the three new product attribute
// domain tables introduced in migration 20260822_000001_add_product_attribute_domain.sql
//
// Domains:
// - ProductAttribute: General physical/measurable attributes
// - ProductComposition: Material/component composition data
// - ProductContent: Marketing content, features, SEO data
// ============================================================================

// ============================================================================
// ProductAttribute Domain
// ============================================================================

export type ProductAttributeValueType = 'text' | 'number' | 'boolean' | 'select'
export type ProductAttributeSource = 'manual' | 'system' | 'ai'

export interface ProductAttribute {
  id: string
  product_id: string
  variant_id: string | null
  
  // Attribute identification
  field_key: string
  label: string | null
  
  // Attribute value
  value: string
  value_type: ProductAttributeValueType
  unit: string | null
  
  // Metadata
  source: ProductAttributeSource
  confidence: number
  is_standard: boolean
  
  // Timestamps
  created_at: string
  updated_at: string
}

export interface CreateProductAttributeInput {
  product_id: string
  variant_id?: string | null
  
  field_key: string
  label?: string | null
  
  value: string
  value_type?: ProductAttributeValueType
  unit?: string | null
  
  source?: ProductAttributeSource
  confidence?: number
  is_standard?: boolean
}

export interface UpdateProductAttributeInput {
  label?: string | null
  value?: string
  value_type?: ProductAttributeValueType
  unit?: string | null
  source?: ProductAttributeSource
  confidence?: number
  is_standard?: boolean
}

// ============================================================================
// ProductComposition Domain
// ============================================================================

export type ProductComponentType = 'material' | 'part' | 'ingredient' | 'assembly'

export interface ProductComposition {
  id: string
  product_id: string
  variant_id: string | null
  
  // Component identification
  component_name: string
  component_type: ProductComponentType
  material_code: string | null
  
  // Composition data
  percentage: number | null
  quantity: number | null
  quantity_unit: string | null
  
  // Supplier/origin
  supplier_name: string | null
  origin_country: string | null
  
  // Metadata
  is_primary: boolean
  notes: string | null
  
  // Timestamps
  created_at: string
  updated_at: string
}

export interface CreateProductCompositionInput {
  product_id: string
  variant_id?: string | null
  
  component_name: string
  component_type: ProductComponentType
  material_code?: string | null
  
  percentage?: number | null
  quantity?: number | null
  quantity_unit?: string | null
  
  supplier_name?: string | null
  origin_country?: string | null
  
  is_primary?: boolean
  notes?: string | null
}

export interface UpdateProductCompositionInput {
  component_name?: string
  component_type?: ProductComponentType
  material_code?: string | null
  
  percentage?: number | null
  quantity?: number | null
  quantity_unit?: string | null
  
  supplier_name?: string | null
  origin_country?: string | null
  
  is_primary?: boolean
  notes?: string | null
}

// ============================================================================
// ProductContent Domain
// ============================================================================

export type ProductContentType = 'feature' | 'benefit' | 'description' | 'seo_title' | 'seo_description' | 'seo_keywords'

export interface ProductContent {
  id: string
  product_id: string
  
  // Content type
  content_type: ProductContentType
  language: string
  
  // Content data
  title: string | null
  body: string | null
  position: number
  
  // SEO-specific fields
  meta_title: string | null
  meta_description: string | null
  keywords: string[] | null
  
  // Display settings
  is_visible: boolean
  
  // Timestamps
  created_at: string
  updated_at: string
}

export interface CreateProductContentInput {
  product_id: string
  
  content_type: ProductContentType
  language?: string
  
  title?: string | null
  body?: string | null
  position?: number
  
  meta_title?: string | null
  meta_description?: string | null
  keywords?: string[] | null
  
  is_visible?: boolean
}

export interface UpdateProductContentInput {
  content_type?: ProductContentType
  language?: string
  
  title?: string | null
  body?: string | null
  position?: number
  
  meta_title?: string | null
  meta_description?: string | null
  keywords?: string[] | null
  
  is_visible?: boolean
}

// ============================================================================
// Legacy Compatibility Types
// ============================================================================

/**
 * Represents the legacy raw_data structure for backward compatibility.
 * This is used to migrate data from raw_data to the new domain tables.
 */
export interface LegacyProductRawData {
  packaging?: {
    weight?: number
    weight_unit?: string
    dimensions?: {
      length?: number
      width?: number
      height?: number
      unit?: string
    }
  }
  seo?: {
    title?: string
    description?: string
    keywords?: string[]
  }
  attributes?: Record<string, unknown>
  composition?: Array<{
    name?: string
    type?: string
    percentage?: number
  }>
}

/**
 * Converts legacy CanonicalProductAttribute to ProductAttribute.
 * This helper function bridges the gap between the old canonical system
 * and the new domain-specific tables.
 */
export function canonicalToProductAttribute(
  canonical: {
    fieldKey: string
    label?: string | null
    value: string
    type?: 'text' | 'number' | 'boolean' | 'select'
    unit?: string | null
    source?: 'manual' | 'system' | 'ai'
    confidence?: number
    isStandard?: boolean
  },
  productId: string,
  variantId?: string | null
): CreateProductAttributeInput {
  return {
    product_id: productId,
    variant_id: variantId,
    field_key: canonical.fieldKey,
    label: canonical.label,
    value: canonical.value,
    value_type: canonical.type || 'text',
    unit: canonical.unit,
    source: canonical.source || 'manual',
    confidence: canonical.confidence ?? 1.0,
    is_standard: canonical.isStandard ?? true,
  }
}

/**
 * Converts ProductAttribute back to CanonicalProductAttribute format.
 * This helper function maintains compatibility with existing code that
 * expects the canonical format.
 */
export function productAttributeToCanonical(
  attr: ProductAttribute
): {
  fieldKey: string
  label: string | null
  value: string
  type: ProductAttributeValueType
  unit: string | null
  source: ProductAttributeSource
  confidence: number
  isStandard: boolean
} {
  return {
    fieldKey: attr.field_key,
    label: attr.label,
    value: attr.value,
    type: attr.value_type,
    unit: attr.unit,
    source: attr.source,
    confidence: attr.confidence,
    isStandard: attr.is_standard,
  }
}
