/**
 * Import Row Normalization
 * 
 * Converts raw parsed rows into structured normalized import rows
 * with separated product, variant, and option data
 */

import type { ParsedRow } from './parser'
import type { NormalizedImportRow, ExtendedFieldMapping } from './types'
import { detectOptionColumns, detectVariantCommercialFields, detectProductIdentityFields } from './variant-detection'

/**
 * Normalize option value for comparison
 * - trim whitespace
 * - preserve original for display
 * - return canonical form for comparison
 */
export function normalizeOptionValue(value: string): { display: string; canonical: string } {
  const display = value.trim()
  const canonical = display.toLowerCase()
  return { display, canonical }
}

/**
 * Convert string value to number, handling currency symbols and formatting
 */
function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const cleaned = value.replace(/[$€£¥,\s]/g, '').trim()
    const number = Number(cleaned)
    if (Number.isFinite(number)) {
      return number
    }
  }

  return null
}

/**
 * Normalize a single import row
 */
export function normalizeImportRow(
  row: ParsedRow,
  rowIndex: number,
  mapping: ExtendedFieldMapping
): NormalizedImportRow {
  const normalized: NormalizedImportRow = {
    rowIndex,
    raw: row,
    product: {
      name: extractStringValue(row, mapping.name) || '',
    },
    options: {},
  }

  // Extract product identity fields
  const identityFields = detectProductIdentityFields(Object.keys(row))
  
  if (mapping.brand || identityFields.brand) {
    const brandField = mapping.brand || identityFields.brand
    if (brandField) {
      normalized.product.brand = extractStringValue(row, brandField)
    }
  }
  if (mapping.model || identityFields.model) {
    const modelField = mapping.model || identityFields.model
    if (modelField) {
      normalized.product.model = extractStringValue(row, modelField)
    }
  }
  if (mapping.productKey || identityFields.productKey) {
    const productKeyField = mapping.productKey || identityFields.productKey
    if (productKeyField) {
      normalized.product.productKey = extractStringValue(row, productKeyField)
    }
  }
  if (mapping.description) {
    normalized.product.description = extractStringValue(row, mapping.description)
  }

  // Extract variant commercial fields if present
  const variantCommercialFields = detectVariantCommercialFields(Object.keys(row))
  
  if (variantCommercialFields.sku || mapping.variantSku) {
    const skuField = variantCommercialFields.sku || mapping.variantSku
    if (skuField) {
      const skuValue = extractStringValue(row, skuField)
      if (skuValue) {
        normalized.variant = normalized.variant || {}
        normalized.variant.sku = skuValue
      }
    }
  }

  if (variantCommercialFields.price || mapping.variantPrice) {
    const priceField = variantCommercialFields.price || mapping.variantPrice
    if (priceField) {
      const priceValue = toNumber(row[priceField])
      if (priceValue !== null) {
        normalized.variant = normalized.variant || {}
        normalized.variant.price = priceValue
      }
    }
  }

  if (variantCommercialFields.currency || mapping.variantCurrency) {
    const currencyField = variantCommercialFields.currency || mapping.variantCurrency
    if (currencyField) {
      const currencyValue = extractStringValue(row, currencyField)
      if (currencyValue) {
        normalized.variant = normalized.variant || {}
        normalized.variant.currency = currencyValue
      }
    }
  }

  if (variantCommercialFields.inventory || mapping.variantInventory) {
    const inventoryField = variantCommercialFields.inventory || mapping.variantInventory
    if (inventoryField) {
      const inventoryValue = toNumber(row[inventoryField])
      if (inventoryValue !== null) {
        normalized.variant = normalized.variant || {}
        normalized.variant.inventory = inventoryValue
      }
    }
  }

  // Extract option fields
  const optionColumns = detectOptionColumns(Object.keys(row))
  const explicitOptions = mapping.options || {}

  // Combine auto-detected and explicitly mapped options
  const allOptionFields = new Set([
    ...optionColumns.map(opt => opt.originalHeader),
    ...Object.keys(explicitOptions)
  ])

  for (const optionField of allOptionFields) {
    const optionCode = explicitOptions[optionField] || 
                     optionColumns.find(opt => opt.originalHeader === optionField)?.code

    if (optionCode && row[optionField]) {
      const value = extractStringValue(row, optionField)
      if (value) {
        normalized.options[optionCode] = value
      }
    }
  }

  // Legacy compatibility: if no variant fields but has commercial fields in stable mapping
  // treat them as product-level (for single SKU import)
  if (!normalized.variant) {
    if (mapping.sku) {
      const skuValue = extractStringValue(row, mapping.sku)
      if (skuValue) {
        // This will be handled at grouping level as product-level SKU
      }
    }
    if (mapping.price) {
      const priceValue = toNumber(row[mapping.price])
      if (priceValue !== null) {
        // This will be handled at grouping level as product-level price
      }
    }
  }

  return normalized
}

/**
 * Extract string value from unknown type
 */
function extractStringValue(row: ParsedRow, field: string): string {
  const value = row[field]
  if (value === null || value === undefined) {
    return ''
  }
  return String(value).trim()
}

/**
 * Normalize all rows in a sheet
 */
export function normalizeImportRows(
  rows: ParsedRow[],
  mapping: ExtendedFieldMapping
): NormalizedImportRow[] {
  return rows.map((row, index) => normalizeImportRow(row, index, mapping))
}
