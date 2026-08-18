-- ============================================================================
-- Migration: 20260817_000005_fix_product_assets_public_select.sql
--
-- Purpose: Fix product_assets_public_select to properly handle variant-level assets
--   by checking both product status and variant status for variant-specific assets.
--
-- Security Issue:
--   The original public policy only checked product.status = 'active', which could
--   expose variant-specific assets when the product is active but the variant is
--   still in draft status.
--
-- Design Principles:
--   * Product-level assets: require product.status = 'active'
--   * Variant-level assets: require both product.status = 'active' AND variant.status = 'active'
--   * Maintain storefront functionality for published products
--   * Strict consistency between product and variant status
--
-- Safety:
--   * DROP POLICY IF EXISTS - idempotent, safe to run multiple times
--   * Preserves all existing data
--   * Fully reversible with rollback migration
--
-- Rollback: 20260817_000006_rollback_product_assets_public_select.sql
-- ============================================================================

-- ============================================================================
-- 1. Replace public SELECT policy with variant-aware version
-- ============================================================================
DROP POLICY IF EXISTS product_assets_public_select ON product_assets;

CREATE POLICY product_assets_public_select ON product_assets
  FOR SELECT TO anon, authenticated
  USING (
    -- Case 1: Product-level asset (no variant association)
    -- Requires: product must be active
    (variant_id IS NULL AND EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_assets.product_id
        AND p.status = 'active'
    ))
    OR
    -- Case 2: Variant-level asset (variant-specific)
    -- Requires: both product AND variant must be active, with strict consistency
    (variant_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM product_variants v
      JOIN products p ON p.id = v.product_id
      WHERE v.id = product_assets.variant_id
        AND p.id = product_assets.product_id
        AND p.status = 'active'
        AND v.status = 'active'
    ))
  );

-- ============================================================================
-- End of migration 20260817_000005_fix_product_assets_public_select.sql
-- ============================================================================
