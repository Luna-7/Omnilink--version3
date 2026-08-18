/**
 * Import Analysis Types
 * 
 * Extended types for variant-aware import analysis without database persistence
 */

import type { ParsedRow, StableField } from './parser'

/**
 * Import mode classification
 */
export type ImportMode = 'single_sku' | 'variant_candidate' | 'needs_review'

/**
 * Normalized import row with structured product/variant/option data
 */
export interface NormalizedImportRow {
  rowIndex: number
  raw: ParsedRow

  product: {
    name: string
    description?: string
    brand?: string
    model?: string
    productKey?: string
  }

  variant?: {
    sku?: string
    price?: number
    currency?: string
    inventory?: number | null
  }

  options: Record<string, string>
}

/**
 * Field conflict detection result
 */
export interface FieldConflict {
  field: string
  rows: number[]
  values: unknown[]
}

/**
 * Variant candidate within a product group
 */
export interface VariantCandidate {
  sourceRows: number[]
  optionValues: Record<string, string>
  sku?: string
  price?: number
  currency?: string
  inventory?: number | null
}

/**
 * Option definition extracted from import data
 */
export interface OptionDefinition {
  code: string
  name: string
  values: string[]
}

/**
 * Product group candidate with variants and conflicts
 */
export interface ProductGroupCandidate {
  key: string
  sourceRows: number[]

  product: {
    name: string
    description?: string
    brand?: string
    model?: string
  }

  options: OptionDefinition[]

  variants: VariantCandidate[]

  conflicts: FieldConflict[]

  requiresReview: boolean
}

/**
 * Import analysis summary statistics
 */
export interface ImportAnalysisSummary {
  totalRows: number
  productGroups: number
  variantCount: number
  conflictCount: number
  reviewRequiredCount: number
}

/**
 * Complete import analysis result
 */
export interface ImportAnalysis {
  mode: ImportMode

  rows: NormalizedImportRow[]

  groups: ProductGroupCandidate[]

  summary: ImportAnalysisSummary
}

/**
 * Extended field mapping for variant-aware imports
 */
export interface ExtendedFieldMapping extends Partial<Record<StableField, string>> {
  // Variant-specific commercial fields
  variantSku?: string
  variantPrice?: string
  variantCurrency?: string
  variantInventory?: string

  // Product identity fields
  brand?: string
  model?: string
  productKey?: string

  // Option fields (detected dynamically)
  options?: Record<string, string>
}

/**
 * Option column detection result
 */
export interface OptionColumnDetection {
  code: string
  originalHeader: string
  displayName: string
}

/**
 * Duplicate detection result
 */
export interface DuplicateDetection {
  type: 'sku' | 'variant_combination'
  duplicateWithinImport: boolean
  conflictingRows: number[]
  values: string[]
}
