// ============================================================================
// Product Input Domain Types
// ============================================================================
// This file defines clear, stable TypeScript contracts for product/variant
// input boundaries. These types separate merchant/AI input from system-derived
// data and establish clear ownership boundaries.
//
// Type Ownership:
// - ProductFacts: Merchant fact data (what the product is)
// - ProductSalesInput: Merchant sales configuration (how it sells without variants)
// - VariantOptionInput: Merchant variant configuration (what dimensions exist)
// - ProductAssetDraft: Merchant asset input (upload or URL)
// - ProductInput: Unified human/AI input contract
// - VariantCombination: System-derived variant identity/configuration
// - VariantDraft: Editable variant state (combination + merchant edits)
// ============================================================================

// ============================================================================
// ProductFacts
// ============================================================================
// Represents "what the product is" - core factual data provided by merchant/AI.
// Does NOT include semantic_data, schema_id, confidence, generated_by, or
// canonical attributes (those are system-derived).
// ============================================================================

export interface ProductFacts {
  name: string
  categoryId: string
  description?: string
  brand?: string
  material?: string
  dimensions?: string
  weight?: string
  package?: string
  origin?: string
}

// ============================================================================
// ProductSalesInput
// ============================================================================
// Represents "how this product sells when it has no variants".
// These are merchant-configurable sales parameters for single-SKU products.
// Note: This does not delete existing product.price/inventory database fields;
// it defines the TypeScript semantic boundary for input contracts.
// ============================================================================

export interface ProductSalesInput {
  sku?: string
  price?: number
  inventory?: number
}

// ============================================================================
// VariantOptionInput
// ============================================================================
// Represents "what variant dimensions this product has".
// This is merchant configuration for option dimensions (e.g., color, size).
// Does NOT include 'code' - option.code is a system-derived field, not
// merchant input.
// ============================================================================

export interface VariantOptionInput {
  name: string
  values: string[]
}

// ============================================================================
// ProductAssetDraft
// ============================================================================
// Discriminated union for asset input - either file upload or URL reference.
// This replaces the ambiguous (File | string)[] pattern with explicit
// type discrimination.
// ============================================================================

export type ProductAssetDraft =
  | {
      source: 'upload'
      file: File
    }
  | {
      source: 'url'
      url: string
    }

// ============================================================================
// ProductInput
// ============================================================================
// Unified input contract for both merchant and AI product creation.
// This is the single source of truth for product input boundaries.
//
// Explicitly EXCLUDED (not merchant/AI input):
// - owner_id (derived from auth)
// - store_id (derived from auth)
// - product_id (system-generated)
// - schema_id (system-derived)
// - semantic_data (system-derived)
// - canonical attributes (system-derived)
// - confidence (system-derived)
// - generated_by (system-derived)
// - option.code (system-derived)
// - variant key (system-derived)
// ============================================================================

export interface ProductInput {
  product: ProductFacts
  sales: ProductSalesInput
  variantOptions: VariantOptionInput[]
  assets: ProductAssetDraft[]
}

// ============================================================================
// VariantCombination
// ============================================================================
// Represents a system-derived variant identity/configuration.
// This is computed by the system from VariantOptionInput (Cartesian product).
//
// Example:
//   {
//     key: 'color:red_size:m',
//     optionValues: { color: 'Red', size: 'M' }
//   }
//
// Note: This type only defines the structure. Key generation logic is
// implemented separately (not in this phase).
// ============================================================================

export interface VariantCombination {
  key: string
  optionValues: Record<string, string>
}

// ============================================================================
// VariantDraft
// ============================================================================
// Represents an editable variant state: system-derived combination plus
// merchant-configurable sales parameters.
//
// Does NOT include:
// - schema_id (system-derived)
// - semantic_data (system-derived)
// - canonical attributes (system-derived)
// ============================================================================

export interface VariantDraft extends VariantCombination {
  sku?: string
  price?: number
  inventory?: number
  skuSource?: 'generated' | 'manual'
}

// ============================================================================
// Backward Compatibility
// ============================================================================
// These aliases bridge existing type names to the new domain types.
// They allow gradual migration without breaking existing code.
// TODO: Migrate callers to use the new domain types directly.
// ============================================================================

/**
 * @deprecated Use VariantOptionInput instead.
 * This alias maintains compatibility with existing code.
 */
export type VariantOptionDraft = VariantOptionInput
