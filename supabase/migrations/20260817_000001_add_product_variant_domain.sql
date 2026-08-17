-- ============================================================================
-- Migration: 20260817_000001_add_product_variant_domain.sql
--
-- Purpose: Add minimal variant domain to support AI-native product ingestion.
--   This migration introduces product_options and product_variants tables to
--   enable SKU-level granularity while maintaining backward compatibility with
--   existing products without variants.
--
-- Design Principles:
--   * Minimal migration: Only 2 new tables + 1 optional column
--   * Backward compatible: Existing products without variants continue to work
--   * No changes to existing products table fields
--   * JSONB for flexibility: option_values and values use JSONB
--   * Store-scoped SKU uniqueness: Enforced at service layer, not DB constraint
--   * RLS enabled: Ownership chain auth.uid() → stores.owner_id → products.store_id
--
-- Data Sovereignty Rules:
--   * Products without variants: products.sku/price/inventory = source of truth
--   * Products with variants: product_variants.sku/price/inventory = SKU-level truth
--   * products fields remain as fallback/display values
--   * Business code must not treat both as independent inventory sources
--
-- Safety:
--   * ADD COLUMN IF NOT EXISTS on product_assets (idempotent)
--   * CREATE TABLE IF NOT EXISTS (idempotent)
--   * No DROP, no TRUNCATE, no CASCADE on existing data
--   * Preserves all existing rows/columns
--   * Fully reversible with rollback migration
--
-- Rollback: 20260817_000002_rollback_product_variant_domain.sql
-- ============================================================================

-- ============================================================================
-- 1. Create product_options table
-- ============================================================================
CREATE TABLE IF NOT EXISTS product_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL,
  position integer DEFAULT 0,
  values jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, code)
);

-- ============================================================================
-- 2. Create product_variants table
-- ============================================================================
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku text,
  price numeric,
  currency text DEFAULT 'USD',
  inventory integer,
  status text DEFAULT 'draft',
  option_values jsonb NOT NULL DEFAULT '{}',
  raw_data jsonb,
  semantic_data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 3. Add variant_id to product_assets (optional, nullable)
-- ============================================================================
ALTER TABLE product_assets ADD COLUMN IF NOT EXISTS variant_id uuid REFERENCES product_variants(id) ON DELETE CASCADE;

-- ============================================================================
-- 4. Create indexes for performance
-- ============================================================================
-- Note: idx_product_options_code is NOT created because UNIQUE(product_id, code) 
-- already provides the necessary index for this combination.

CREATE INDEX IF NOT EXISTS idx_product_options_product_id ON product_options(product_id);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_product_variants_status ON product_variants(status);
CREATE INDEX IF NOT EXISTS idx_product_variants_option_values ON product_variants USING GIN(option_values);

CREATE INDEX IF NOT EXISTS idx_product_assets_variant_id ON product_assets(variant_id) WHERE variant_id IS NOT NULL;

-- ============================================================================
-- 5. Enable Row Level Security
-- ============================================================================
ALTER TABLE product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6. RLS Policies for product_options
-- ============================================================================
-- Merchants can view their own product options
CREATE POLICY IF NOT EXISTS "merchants_can_view_product_options"
  ON product_options
  FOR SELECT
  USING (
    product_id IN (
      SELECT id FROM products WHERE store_id IN (
        SELECT id FROM stores WHERE owner_id = auth.uid()
      )
    )
  );

-- Merchants can insert their own product options
CREATE POLICY IF NOT EXISTS "merchants_can_insert_product_options"
  ON product_options
  FOR INSERT
  WITH CHECK (
    product_id IN (
      SELECT id FROM products WHERE store_id IN (
        SELECT id FROM stores WHERE owner_id = auth.uid()
      )
    )
  );

-- Merchants can update their own product options
CREATE POLICY IF NOT EXISTS "merchants_can_update_product_options"
  ON product_options
  FOR UPDATE
  USING (
    product_id IN (
      SELECT id FROM products WHERE store_id IN (
        SELECT id FROM stores WHERE owner_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    product_id IN (
      SELECT id FROM products WHERE store_id IN (
        SELECT id FROM stores WHERE owner_id = auth.uid()
      )
    )
  );

-- Merchants can delete their own product options
CREATE POLICY IF NOT EXISTS "merchants_can_delete_product_options"
  ON product_options
  FOR DELETE
  USING (
    product_id IN (
      SELECT id FROM products WHERE store_id IN (
        SELECT id FROM stores WHERE owner_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- 7. RLS Policies for product_variants
-- ============================================================================
-- Merchants can view their own product variants
CREATE POLICY IF NOT EXISTS "merchants_can_view_product_variants"
  ON product_variants
  FOR SELECT
  USING (
    product_id IN (
      SELECT id FROM products WHERE store_id IN (
        SELECT id FROM stores WHERE owner_id = auth.uid()
      )
    )
  );

-- Merchants can insert their own product variants
CREATE POLICY IF NOT EXISTS "merchants_can_insert_product_variants"
  ON product_variants
  FOR INSERT
  WITH CHECK (
    product_id IN (
      SELECT id FROM products WHERE store_id IN (
        SELECT id FROM stores WHERE owner_id = auth.uid()
      )
    )
  );

-- Merchants can update their own product variants
CREATE POLICY IF NOT EXISTS "merchants_can_update_product_variants"
  ON product_variants
  FOR UPDATE
  USING (
    product_id IN (
      SELECT id FROM products WHERE store_id IN (
        SELECT id FROM stores WHERE owner_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    product_id IN (
      SELECT id FROM products WHERE store_id IN (
        SELECT id FROM stores WHERE owner_id = auth.uid()
      )
    )
  );

-- Merchants can delete their own product variants
CREATE POLICY IF NOT EXISTS "merchants_can_delete_product_variants"
  ON product_variants
  FOR DELETE
  USING (
    product_id IN (
      SELECT id FROM products WHERE store_id IN (
        SELECT id FROM stores WHERE owner_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- 8. RLS Policies for product_assets (variant_id extension)
-- ============================================================================
-- Merchants can view their own product assets (including variant-specific)
CREATE POLICY IF NOT EXISTS "merchants_can_view_product_assets_with_variants"
  ON product_assets
  FOR SELECT
  USING (
    product_id IN (
      SELECT id FROM products WHERE store_id IN (
        SELECT id FROM stores WHERE owner_id = auth.uid()
      )
    )
    OR
    variant_id IN (
      SELECT id FROM product_variants WHERE product_id IN (
        SELECT id FROM products WHERE store_id IN (
          SELECT id FROM stores WHERE owner_id = auth.uid()
        )
      )
    )
  );

-- Merchants can insert variant-specific assets
CREATE POLICY IF NOT EXISTS "merchants_can_insert_product_assets_with_variants"
  ON product_assets
  FOR INSERT
  WITH CHECK (
    product_id IN (
      SELECT id FROM products WHERE store_id IN (
        SELECT id FROM stores WHERE owner_id = auth.uid()
      )
    )
    OR
    variant_id IN (
      SELECT id FROM product_variants WHERE product_id IN (
        SELECT id FROM products WHERE store_id IN (
          SELECT id FROM stores WHERE owner_id = auth.uid()
        )
      )
    )
  );

-- Merchants can update variant-specific assets
CREATE POLICY IF NOT EXISTS "merchants_can_update_product_assets_with_variants"
  ON product_assets
  FOR UPDATE
  USING (
    product_id IN (
      SELECT id FROM products WHERE store_id IN (
        SELECT id FROM stores WHERE owner_id = auth.uid()
      )
    )
    OR
    variant_id IN (
      SELECT id FROM product_variants WHERE product_id IN (
        SELECT id FROM products WHERE store_id IN (
          SELECT id FROM stores WHERE owner_id = auth.uid()
        )
      )
    )
  )
  WITH CHECK (
    product_id IN (
      SELECT id FROM products WHERE store_id IN (
        SELECT id FROM stores WHERE owner_id = auth.uid()
      )
    )
    OR
    variant_id IN (
      SELECT id FROM product_variants WHERE product_id IN (
        SELECT id FROM products WHERE store_id IN (
          SELECT id FROM stores WHERE owner_id = auth.uid()
        )
      )
    )
  );

-- Merchants can delete variant-specific assets
CREATE POLICY IF NOT EXISTS "merchants_can_delete_product_assets_with_variants"
  ON product_assets
  FOR DELETE
  USING (
    product_id IN (
      SELECT id FROM products WHERE store_id IN (
        SELECT id FROM stores WHERE owner_id = auth.uid()
      )
    )
    OR
    variant_id IN (
      SELECT id FROM product_variants WHERE product_id IN (
        SELECT id FROM products WHERE store_id IN (
          SELECT id FROM stores WHERE owner_id = auth.uid()
        )
      )
    )
  );

-- ============================================================================
-- 9. Add comments for documentation
-- ============================================================================
COMMENT ON TABLE product_options IS 'Defines available options for a product (e.g., Color, Size). Values stored as JSONB array for flexibility.';
COMMENT ON COLUMN product_options.name IS 'Display name of the option (e.g., "Color", "Size")';
COMMENT ON COLUMN product_options.code IS 'Internal code for the option (e.g., "color", "size")';
COMMENT ON COLUMN product_options.values IS 'JSONB array of available values (e.g., ["Black", "Tortoise", "Red"])';

COMMENT ON TABLE product_variants IS 'Specific variant combinations with SKU-level pricing and inventory. Option values stored as JSONB object. Price and inventory are nullable to support draft workflow.';
COMMENT ON COLUMN product_variants.price IS 'Variant-specific price. Nullable to support draft creation. Service layer enforces non-null on publish.';
COMMENT ON COLUMN product_variants.inventory IS 'Variant-specific inventory. NULL = unknown/unprovided, 0 = out of stock, >0 = in stock.';
COMMENT ON COLUMN product_variants.status IS 'Variant status. Default "draft" requires merchant review before "active".';
COMMENT ON COLUMN product_variants.option_values IS 'JSONB object mapping option codes to values (e.g., {"color": "Black", "size": "52"})';
COMMENT ON COLUMN product_variants.semantic_data IS 'Variant-level semantic attributes extracted by AI (color, size, weight, etc.)';

COMMENT ON COLUMN product_assets.variant_id IS 'Optional reference to product_variants for variant-specific images. NULL means product-level asset.';

-- ============================================================================
-- End of migration 20260817_000001_add_product_variant_domain.sql
-- ============================================================================
