/**
 * Import Grouping and Conflict Detection
 * 
 * Groups normalized import rows by product identity,
 * detects conflicts, and builds variant candidates
 */

import type { NormalizedImportRow, ProductGroupCandidate, VariantCandidate, FieldConflict, OptionDefinition } from './types'
import { canonicalizeOptionValues } from '../products/variants/validation'
import { normalizeOptionValue } from './variant-detection'

/**
 * Generate product identity key for grouping
 * Priority: productKey > model > normalized name
 */
function generateProductKey(row: NormalizedImportRow): string {
  if (row.product.productKey) {
    return `key:${normalizeKey(row.product.productKey)}`
  }
  if (row.product.model) {
    return `model:${normalizeKey(row.product.model)}`
  }
  return `name:${normalizeKey(row.product.name)}`
}

/**
 * Normalize a key for comparison
 */
function normalizeKey(key: string): string {
  return key.trim().toLowerCase().replace(/[\s_-]+/g, '')
}

/**
 * Detect conflicts in product-level fields within a group
 */
function detectProductConflicts(rows: NormalizedImportRow[]): FieldConflict[] {
  const conflicts: FieldConflict[] = []
  const fieldsToCheck: Array<keyof NormalizedImportRow['product']> = ['brand', 'model', 'description', 'productKey']

  for (const field of fieldsToCheck) {
    const valuesByRow = new Map<string | undefined, number[]>()
    
    rows.forEach(row => {
      const value = row.product[field]
      const valueKey = value === undefined ? '__undefined__' : String(value)
      
      if (!valuesByRow.has(valueKey)) {
        valuesByRow.set(valueKey, [])
      }
      valuesByRow.get(valueKey)!.push(row.rowIndex)
    })

    // Check if there are conflicting values
    if (valuesByRow.size > 1) {
      const conflictValues: unknown[] = []
      const conflictRows: number[] = []
      
      valuesByRow.forEach((rowIndices, valueKey) => {
        if (valueKey !== '__undefined__') {
          conflictValues.push(valueKey)
          conflictRows.push(...rowIndices)
        }
      })

      if (conflictValues.length > 1) {
        conflicts.push({
          field,
          rows: conflictRows,
          values: conflictValues
        })
      }
    }
  }

  return conflicts
}

/**
 * Extract option definitions from normalized rows
 */
function extractOptionDefinitions(rows: NormalizedImportRow[]): OptionDefinition[] {
  const optionMap = new Map<string, Set<string>>()

  rows.forEach(row => {
    Object.entries(row.options).forEach(([code, value]) => {
      if (!optionMap.has(code)) {
        optionMap.set(code, new Set())
      }
      const { canonical } = normalizeOptionValue(value)
      optionMap.get(code)!.add(canonical)
    })
  })

  return Array.from(optionMap.entries()).map(([code, values]) => ({
    code,
    name: code.charAt(0).toUpperCase() + code.slice(1), // Capitalize for display
    values: Array.from(values).sort()
  }))
}

/**
 * Build variant candidates from normalized rows
 */
function buildVariantCandidates(rows: NormalizedImportRow[]): VariantCandidate[] {
  const variantMap = new Map<string, VariantCandidate>()

  rows.forEach(row => {
    // Canonicalize option values for duplicate detection
    const canonicalCombination = canonicalizeOptionValues(row.options)
    
    if (variantMap.has(canonicalCombination)) {
      // Duplicate variant combination - add to existing
      const existing = variantMap.get(canonicalCombination)!
      existing.sourceRows.push(row.rowIndex)
    } else {
      // New variant candidate
      const candidate: VariantCandidate = {
        sourceRows: [row.rowIndex],
        optionValues: { ...row.options },
        sku: row.variant?.sku,
        price: row.variant?.price,
        currency: row.variant?.currency,
        inventory: row.variant?.inventory
      }
      variantMap.set(canonicalCombination, candidate)
    }
  })

  return Array.from(variantMap.values())
}

/**
 * Detect duplicate SKUs within import
 */
function detectDuplicateSKUs(variants: VariantCandidate[]): VariantCandidate[] {
  const skuMap = new Map<string, VariantCandidate[]>()
  const duplicates: VariantCandidate[] = []

  variants.forEach(variant => {
    if (variant.sku) {
      if (!skuMap.has(variant.sku)) {
        skuMap.set(variant.sku, [])
      }
      skuMap.get(variant.sku)!.push(variant)
    }
  })

  skuMap.forEach((variantsWithSameSKU) => {
    if (variantsWithSameSKU.length > 1) {
      duplicates.push(...variantsWithSameSKU)
    }
  })

  return duplicates
}

/**
 * Group normalized rows by product identity
 */
export function groupNormalizedRows(rows: NormalizedImportRow[]): ProductGroupCandidate[] {
  const groupsMap = new Map<string, NormalizedImportRow[]>()

  // Group rows by product key
  rows.forEach(row => {
    const key = generateProductKey(row)
    if (!groupsMap.has(key)) {
      groupsMap.set(key, [])
    }
    groupsMap.get(key)!.push(row)
  })

  // Build product group candidates
  const groups: ProductGroupCandidate[] = []

  groupsMap.forEach((groupRows, key) => {
    const conflicts = detectProductConflicts(groupRows)
    const options = extractOptionDefinitions(groupRows)
    const variants = options.length > 0 ? buildVariantCandidates(groupRows) : []
    const duplicateSKUs = detectDuplicateSKUs(variants)

    // Determine if review is required
    const requiresReview = conflicts.length > 0 || duplicateSKUs.length > 0

    // Use first row's product data as representative
    const representativeRow = groupRows[0]

    const group: ProductGroupCandidate = {
      key,
      sourceRows: groupRows.map(r => r.rowIndex),
      product: {
        name: representativeRow.product.name,
        description: representativeRow.product.description,
        brand: representativeRow.product.brand,
        model: representativeRow.product.model
      },
      options,
      variants,
      conflicts,
      requiresReview
    }

    groups.push(group)
  })

  return groups
}

/**
 * Determine import mode based on analysis
 */
export function determineImportMode(groups: ProductGroupCandidate[]): 'single_sku' | 'variant_candidate' | 'needs_review' {
  // Check if any group requires review
  if (groups.some(group => group.requiresReview)) {
    return 'needs_review'
  }

  // Check if any group has variants
  const hasVariants = groups.some(group => group.variants.length > 0)
  
  if (hasVariants) {
    return 'variant_candidate'
  }

  return 'single_sku'
}
