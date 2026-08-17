-- ============================================================================
-- Rollback Migration: 20260817_000002_rollback_product_variant_domain.sql
--
-- Purpose: Rollback the variant domain migration by removing all added tables,
-- columns, indexes, and RLS policies. This migration is fully reversible and
-- restores the database to its pre-variant state.
--
-- Safety:
--   * DROP TABLE IF EXISTS - idempotent, safe to run multiple times
--   * DROP COLUMN IF EXISTS - idempotent, safe to run multiple times
--   * DROP INDEX IF EXISTS - idempotent, safe to run multiple times
--   * DROP POLICY IF EXISTS - idempotent, safe to run multiple times
--   * CASCADE on table drops to clean up dependent objects
--   * Preserves all existing products data (no changes to products table)
--
-- Warning: This will DELETE all variant data (product_options, product_variants)
-- and variant-specific asset references. Ensure data backup before rollback.
-- ============================================================================

-- ============================================================================
-- 1. Drop RLS Policies for product_assets (variant extension)
-- ============================================================================
DROP POLICY IF EXISTS "merchants_can_view_product_assets_with_variants" ON product_assets;
DROP POLICY IF EXISTS "merchants_can_insert_product_assets_with_variants" ON product_assets;
DROP POLICY IF EXISTS "merchants_can_update_product_assets_with_variants" ON product_assets;
DROP POLICY IF EXISTS "merchants_can_delete_product_assets_with_variants" ON product_assets;

-- ============================================================================
-- 2. Drop RLS Policies for product_variants
-- ============================================================================
DROP POLICY IF EXISTS "merchants_can_view_product_variants" ON product_variants;
DROP POLICY IF EXISTS "merchants_can_insert_product_variants" ON product_variants;
DROP POLICY IF EXISTS "merchants_can_update_product_variants" ON product_variants;
DROP POLICY IF EXISTS "merchants_can_delete_product_variants" ON product_variants;

-- ============================================================================
-- 3. Drop RLS Policies for product_options
-- ============================================================================
DROP POLICY IF EXISTS "merchants_can_view_product_options" ON product_options;
DROP POLICY IF EXISTS "merchants_can_insert_product_options" ON product_options;
DROP POLICY IF EXISTS "merchants_can_update_product_options" ON product_options;
DROP POLICY IF EXISTS "merchants_can_delete_product_options" ON product_options;

-- ============================================================================
-- 4. Disable RLS on variant tables
-- ============================================================================
ALTER TABLE product_options DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. Drop variant_id column from product_assets (must drop before tables due to FK)
-- ============================================================================
ALTER TABLE product_assets DROP COLUMN IF EXISTS variant_id;

-- ============================================================================
-- 6. Drop indexes
-- ============================================================================
DROP INDEX IF EXISTS idx_product_assets_variant_id;
DROP INDEX IF EXISTS idx_product_variants_option_values;
DROP INDEX IF EXISTS idx_product_variants_status;
DROP INDEX IF EXISTS idx_product_variants_sku;
DROP INDEX IF EXISTS idx_product_variants_product_id;
DROP INDEX IF EXISTS idx_product_options_product_id;

-- ============================================================================
-- 7. Drop variant tables (CASCADE to clean up foreign key references)
-- ============================================================================
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS product_options CASCADE;

-- ============================================================================
-- 8. Remove comments
-- ============================================================================
COMMENT ON TABLE product_options IS NULL;
COMMENT ON COLUMN product_options.name IS NULL;
COMMENT ON COLUMN product_options.code IS NULL;
COMMENT ON COLUMN product_options.values IS NULL;

COMMENT ON TABLE product_variants IS NULL;
COMMENT ON COLUMN product_variants.price IS NULL;
COMMENT ON COLUMN product_variants.inventory IS NULL;
COMMENT ON COLUMN product_variants.status IS NULL;
COMMENT ON COLUMN product_variants.option_values IS NULL;
COMMENT ON COLUMN product_variants.semantic_data IS NULL;

COMMENT ON COLUMN product_assets.variant_id IS NULL;

-- ============================================================================
-- End of rollback migration 20260817_000002_rollback_product_variant_domain.sql
-- ============================================================================
