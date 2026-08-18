/**
 * Import Analysis Layer
 * 
 * Main analysis orchestration for variant-aware import detection
 * without database persistence or AI
 */

import type { ParsedRow, StableField } from './parser'
import type { 
  ImportAnalysis, 
  ImportAnalysisSummary,
  ImportMode,
  ExtendedFieldMapping 
} from './types'
import { normalizeImportRows } from './normalization'
import { groupNormalizedRows, determineImportMode } from './grouping'
import { detectOptionColumns, detectVariantCommercialFields, detectProductIdentityFields } from './variant-detection'

/**
 * Main import analysis function
 * Orchestrates the complete analysis pipeline
 */
export function analyzeImport(
  rows: ParsedRow[],
  headers: string[],
  mapping: Partial<Record<StableField, string>>
): ImportAnalysis {
  // Step 1: Detect variant-related columns
  const optionColumns = detectOptionColumns(headers)
  const variantCommercialFields = detectVariantCommercialFields(headers)
  const productIdentityFields = detectProductIdentityFields(headers)

  // Step 2: Build extended mapping
  const extendedMapping: ExtendedFieldMapping = {
    ...mapping,
    variantSku: variantCommercialFields.sku,
    variantPrice: variantCommercialFields.price,
    variantCurrency: variantCommercialFields.currency,
    variantInventory: variantCommercialFields.inventory,
    brand: productIdentityFields.brand,
    model: productIdentityFields.model,
    productKey: productIdentityFields.productKey,
    options: Object.fromEntries(
      optionColumns.map(col => [col.originalHeader, col.code])
    )
  }

  // Step 3: Normalize all rows
  const normalizedRows = normalizeImportRows(rows, extendedMapping)

  // Step 4: Group by product identity
  const productGroups = groupNormalizedRows(normalizedRows)

  // Step 5: Determine import mode
  const mode = determineImportMode(productGroups)

  // Step 6: Calculate summary statistics
  const summary: ImportAnalysisSummary = {
    totalRows: rows.length,
    productGroups: productGroups.length,
    variantCount: productGroups.reduce((sum, group) => sum + group.variants.length, 0),
    conflictCount: productGroups.reduce((sum, group) => sum + group.conflicts.length, 0),
    reviewRequiredCount: productGroups.filter(group => group.requiresReview).length
  }

  return {
    mode,
    rows: normalizedRows,
    groups: productGroups,
    summary
  }
}

/**
 * Quick detection for import mode without full analysis
 * Useful for early UI decisions
 */
export function detectImportMode(
  headers: string[]
): ImportMode {
  const optionColumns = detectOptionColumns(headers)

  // If no option columns detected, likely single SKU
  if (optionColumns.length === 0) {
    return 'single_sku'
  }

  // If option columns exist, might be variant_candidate or needs_review depending on data
  return 'variant_candidate'
}

/**
 * Validate that required fields are present for analysis
 */
export function validateAnalysisRequirements(
  headers: string[],
  mapping: Partial<Record<StableField, string>>
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!mapping.name) {
    errors.push('Product name field is required for analysis')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Extract analysis metadata for UI display
 */
export function getAnalysisMetadata(analysis: ImportAnalysis) {
  return {
    mode: analysis.mode,
    hasVariants: analysis.summary.variantCount > 0,
    hasConflicts: analysis.summary.conflictCount > 0,
    requiresReview: analysis.summary.reviewRequiredCount > 0,
    optionCount: analysis.groups.reduce((sum, group) => sum + group.options.length, 0),
    canAutoImport: analysis.mode !== 'needs_review'
  }
}
