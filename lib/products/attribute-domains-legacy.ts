// ============================================================================
// Product Attribute Domains - Legacy Compatibility Layer
// ============================================================================
// This file provides compatibility functions to bridge the gap between the old
// canonical attribute system (stored in raw_data/semantic_data) and the new
// domain-specific tables (product_attributes, product_composition, product_content).
//
// Functions:
// - migrateLegacyAttributes: Migrates data from raw_data to new tables
// - syncToLegacy: Syncs new domain data back to raw_data for compatibility
// - getUnifiedAttributes: Returns attributes from both old and new systems
// ============================================================================

import { createClientServer } from '@/lib/supabase/server'
import type { Database } from '@/lib/database.types'
import type {
  CanonicalProductAttribute,
} from './canonical-attributes'
import type {
  ProductAttribute,
  ProductComposition,
  ProductContent,
  LegacyProductRawData,
  canonicalToProductAttribute,
  productAttributeToCanonical,
  CreateProductAttributeInput,
} from './product-attribute-domains'
import {
  getProductAttributes,
  getProductCompositions,
  getProductContents,
  batchCreateProductAttributes,
  createProductComposition,
  createProductContent,
} from './attribute-domains-service'

// ============================================================================
// Legacy Data Migration
// ============================================================================

/**
 * Migrates legacy attribute data from products.raw_data to the new domain tables.
 * This function should be called once per product during the migration process.
 */
export async function migrateLegacyAttributes(
  productId: string
): Promise<{
  attributesMigrated: number
  compositionsMigrated: number
  contentsMigrated: number
  errors: string[]
}> {
  const supabase = await createClientServer()
  
  const errors: string[] = []
  let attributesMigrated = 0
  let compositionsMigrated = 0
  let contentsMigrated = 0
  
  try {
    // Fetch the product's raw_data
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, raw_data, semantic_data')
      .eq('id', productId)
      .single()
    
    if (productError || !product) {
      throw new Error('Product not found')
    }
    
    const rawData = product.raw_data as Record<string, unknown> | null
    const semanticData = product.semantic_data as Record<string, unknown> | null
    
    // 1. Migrate general attributes from raw_data.attributes
    if (rawData && typeof rawData === 'object') {
      const legacyAttributes = rawData.attributes as Record<string, unknown> | null
      
      if (legacyAttributes && typeof legacyAttributes === 'object') {
        const attributesToCreate: Array<{
          field_key: string
          value: string
          value_type: 'text' | 'number' | 'boolean' | 'select'
          unit?: string | null
          source: 'manual' | 'system' | 'ai'
          confidence: number
          is_standard: boolean
        }> = []
        
        for (const [key, value] of Object.entries(legacyAttributes)) {
          if (value === null || value === undefined) continue
          if (typeof value === 'object') continue // Skip nested objects
          
          attributesToCreate.push({
            field_key: key,
            value: String(value),
            value_type: typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : 'text',
            unit: null,
            source: 'manual',
            confidence: 1.0,
            is_standard: true,
          })
        }
        
        if (attributesToCreate.length > 0) {
          try {
            await batchCreateProductAttributes(productId, attributesToCreate)
            attributesMigrated = attributesToCreate.length
          } catch (err) {
            errors.push(`Failed to migrate attributes: ${err instanceof Error ? err.message : 'Unknown error'}`)
          }
        }
      }
      
      // 2. Migrate composition data from raw_data.composition
      const legacyComposition = rawData.composition as Array<Record<string, unknown>> | null
      
      if (legacyComposition && Array.isArray(legacyComposition)) {
        for (const comp of legacyComposition) {
          if (!comp || typeof comp !== 'object') continue
          
          try {
            await createProductComposition({
              product_id: productId,
              component_name: String(comp.name || comp.component_name || 'Unknown'),
              component_type: (comp.type === 'material' || comp.type === 'part' || comp.type === 'ingredient' || comp.type === 'assembly')
                ? comp.type as 'material' | 'part' | 'ingredient' | 'assembly'
                : 'material',
              material_code: comp.material_code ? String(comp.material_code) : null,
              percentage: comp.percentage ? Number(comp.percentage) : null,
              quantity: comp.quantity ? Number(comp.quantity) : null,
              quantity_unit: comp.quantity_unit ? String(comp.quantity_unit) : null,
              supplier_name: comp.supplier_name ? String(comp.supplier_name) : null,
              origin_country: comp.origin_country ? String(comp.origin_country) : null,
              is_primary: comp.is_primary === true,
              notes: comp.notes ? String(comp.notes) : null,
            })
            compositionsMigrated++
          } catch (err) {
            errors.push(`Failed to migrate composition: ${err instanceof Error ? err.message : 'Unknown error'}`)
          }
        }
      }
      
      // 3. Migrate SEO data from raw_data.seo
      const legacySeo = rawData.seo as Record<string, unknown> | null
      
      if (legacySeo && typeof legacySeo === 'object') {
        // Migrate SEO title
        if (legacySeo.title) {
          try {
            await createProductContent({
              product_id: productId,
              content_type: 'seo_title',
              language: 'zh',
              meta_title: String(legacySeo.title),
              is_visible: true,
            })
            contentsMigrated++
          } catch (err) {
            errors.push(`Failed to migrate SEO title: ${err instanceof Error ? err.message : 'Unknown error'}`)
          }
        }
        
        // Migrate SEO description
        if (legacySeo.description) {
          try {
            await createProductContent({
              product_id: productId,
              content_type: 'seo_description',
              language: 'zh',
              meta_description: String(legacySeo.description),
              is_visible: true,
            })
            contentsMigrated++
          } catch (err) {
            errors.push(`Failed to migrate SEO description: ${err instanceof Error ? err.message : 'Unknown error'}`)
          }
        }
        
        // Migrate SEO keywords
        if (legacySeo.keywords && Array.isArray(legacySeo.keywords)) {
          try {
            await createProductContent({
              product_id: productId,
              content_type: 'seo_keywords',
              language: 'zh',
              keywords: legacySeo.keywords.map(k => String(k)),
              is_visible: true,
            })
            contentsMigrated++
          } catch (err) {
            errors.push(`Failed to migrate SEO keywords: ${err instanceof Error ? err.message : 'Unknown error'}`)
          }
        }
      }
    }
    
    // 4. Migrate semantic data attributes
    if (semanticData && typeof semanticData === 'object') {
      const semanticAttributes = semanticData.attributes as Record<string, unknown> | null
      
      if (semanticAttributes && typeof semanticAttributes === 'object') {
        const attributesToCreate: Array<{
          field_key: string
          value: string
          value_type: 'text' | 'number' | 'boolean' | 'select'
          unit?: string | null
          source: 'manual' | 'system' | 'ai'
          confidence: number
          is_standard: boolean
        }> = []
        
        for (const [key, value] of Object.entries(semanticAttributes)) {
          if (value === null || value === undefined) continue
          if (typeof value === 'object') continue
          
          attributesToCreate.push({
            field_key: key,
            value: String(value),
            value_type: typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : 'text',
            unit: null,
            source: 'ai',
            confidence: semanticData.confidence ? Number(semanticData.confidence) : 0.85,
            is_standard: true,
          })
        }
        
        if (attributesToCreate.length > 0) {
          try {
            await batchCreateProductAttributes(productId, attributesToCreate)
            attributesMigrated += attributesToCreate.length
          } catch (err) {
            errors.push(`Failed to migrate semantic attributes: ${err instanceof Error ? err.message : 'Unknown error'}`)
          }
        }
      }
    }
    
    return {
      attributesMigrated,
      compositionsMigrated,
      contentsMigrated,
      errors,
    }
  } catch (error) {
    throw new Error(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// ============================================================================
// Legacy Sync (New → Old)
// ============================================================================

/**
 * Syncs data from new domain tables back to raw_data for backward compatibility.
 * This ensures that legacy code that reads from raw_data continues to work.
 */
export async function syncToLegacy(
  productId: string
): Promise<void> {
  const supabase = await createClientServer()
  
  try {
    // Fetch data from new domain tables
    const [attributes, compositions, contents] = await Promise.all([
      getProductAttributes(productId),
      getProductCompositions(productId),
      getProductContents(productId),
    ])
    
    // Build legacy raw_data structure
    const legacyRawData: {
      attributes: Record<string, unknown>
      composition: Array<Record<string, unknown>>
      seo: Record<string, unknown>
    } = {
      attributes: {},
      composition: [],
      seo: {},
    }
    
    // 1. Sync attributes
    for (const attr of attributes) {
      legacyRawData.attributes![attr.field_key] = attr.value_type === 'number'
        ? Number(attr.value)
        : attr.value_type === 'boolean'
        ? attr.value === 'true'
        : attr.value
    }
    
    // 2. Sync composition
    for (const comp of compositions) {
      legacyRawData.composition!.push({
        name: comp.component_name,
        type: comp.component_type,
        material_code: comp.material_code,
        percentage: comp.percentage,
        quantity: comp.quantity,
        quantity_unit: comp.quantity_unit,
        supplier_name: comp.supplier_name,
        origin_country: comp.origin_country,
        is_primary: comp.is_primary,
        notes: comp.notes,
      })
    }
    
    // 3. Sync SEO content
    for (const content of contents) {
      if (content.content_type === 'seo_title' && content.meta_title) {
        legacyRawData.seo!.title = content.meta_title
      } else if (content.content_type === 'seo_description' && content.meta_description) {
        legacyRawData.seo!.description = content.meta_description
      } else if (content.content_type === 'seo_keywords' && content.keywords) {
        legacyRawData.seo!.keywords = content.keywords
      }
    }
    
    // Update product's raw_data
    const { error: updateError } = await supabase
      .from('products')
      .update({ raw_data: legacyRawData })
      .eq('id', productId)
    
    if (updateError) {
      throw new Error(`Failed to sync to legacy: ${updateError.message}`)
    }
  } catch (error) {
    throw new Error(`Legacy sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// ============================================================================
// Unified Attribute Access
// ============================================================================

/**
 * Returns a unified view of product attributes from both the new domain tables
 * and the legacy raw_data. This function prioritizes new domain data but falls
 * back to legacy data if new data is missing.
 */
export async function getUnifiedAttributes(
  productId: string
): Promise<{
  attributes: ProductAttribute[]
  compositions: ProductComposition[]
  contents: ProductContent[]
  hasNewData: boolean
  hasLegacyData: boolean
}> {
  const supabase = await createClientServer()
  
  try {
    // Fetch from new domain tables
    const [newAttributes, newCompositions, newContents] = await Promise.all([
      getProductAttributes(productId).catch(() => []),
      getProductCompositions(productId).catch(() => []),
      getProductContents(productId).catch(() => []),
    ])
    
    // Check for legacy data
    const { data: product } = await supabase
      .from('products')
      .select('raw_data')
      .eq('id', productId)
      .single()
    
    const hasNewData = newAttributes.length > 0 || newCompositions.length > 0 || newContents.length > 0
    const hasLegacyData = Boolean(product && product.raw_data !== null && typeof product.raw_data === 'object')
    
    return {
      attributes: newAttributes,
      compositions: newCompositions,
      contents: newContents,
      hasNewData,
      hasLegacyData,
    }
  } catch (error) {
    throw new Error(`Failed to get unified attributes: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Converts new domain attributes to the legacy CanonicalProductAttribute format.
 * This allows existing code that expects CanonicalProductAttribute to work with
 * the new domain system.
 */
export function domainToCanonical(
  attributes: ProductAttribute[]
): CanonicalProductAttribute[] {
  return attributes.map(attr => ({
    fieldKey: attr.field_key,
    label: attr.label ?? undefined,
    value: attr.value,
    type: attr.value_type,
    unit: attr.unit,
    source: attr.source,
    confidence: attr.confidence,
    isStandard: attr.is_standard,
  }))
}

/**
 * Converts legacy CanonicalProductAttribute to new domain format.
 * This is the inverse of domainToCanonical.
 */
export function canonicalToDomain(
  canonical: CanonicalProductAttribute[],
  productId: string,
  variantId?: string | null
): Array<Omit<CreateProductAttributeInput, 'product_id'>> {
  return canonical.map(attr => ({
    variant_id: variantId,
    field_key: attr.fieldKey,
    label: attr.label,
    value: attr.value,
    value_type: attr.type,
    unit: attr.unit,
    source: attr.source,
    confidence: attr.confidence,
    is_standard: attr.isStandard,
  }))
}

// Re-export types for convenience
export type {
  ProductAttribute,
  ProductComposition,
  ProductContent,
  LegacyProductRawData,
}
