-- ============================================================================
-- Rollback Migration: 20260817_000006_rollback_product_assets_public_select.sql
--
-- Purpose: Rollback the product_assets_public_select fix by restoring the
--   original policy that only checks product status.
--
-- Warning: This rollback restores the security issue where variant-specific
--   assets could be exposed even when the variant is in draft status.
--
-- Safety:
--   * DROP POLICY IF EXISTS - idempotent, safe to run multiple times
--   * Preserves all existing data
--   * Fully reversible by re-running the fix migration
-- ============================================================================

-- ============================================================================
-- 1. Restore original public SELECT policy (product status only)
-- ============================================================================
DROP POLICY IF EXISTS product_assets_public_select ON product_assets;

CREATE POLICY product_assets_public_select ON product_assets
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_assets.product_id
        AND p.status = 'active'
    )
  );

-- ============================================================================
-- End of rollback migration 20260817_000006_rollback_product_assets_public_select.sql
-- ============================================================================
