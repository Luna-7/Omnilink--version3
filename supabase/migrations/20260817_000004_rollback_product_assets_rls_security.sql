-- ============================================================================
-- Rollback Migration: 20260817_000004_rollback_product_assets_rls_security.sql
--
-- Purpose: Rollback the product_assets RLS security fix by restoring the
--   original owner policies and variant-aware policies.
--
-- Warning: This rollback restores the security vulnerability. Only use if
--   absolutely necessary and with full understanding of the security implications.
--
-- Safety:
--   * DROP POLICY IF EXISTS - idempotent, safe to run multiple times
--   * Preserves all existing data
--   * Fully reversible by re-running the fix migration
-- ============================================================================

-- ============================================================================
-- 1. Drop unified secure policies
-- ============================================================================
DROP POLICY IF EXISTS "merchants_can_view_product_assets" ON product_assets;
DROP POLICY IF EXISTS "merchants_can_insert_product_assets" ON product_assets;
DROP POLICY IF EXISTS "merchants_can_update_product_assets" ON product_assets;
DROP POLICY IF EXISTS "merchants_can_delete_product_assets" ON product_assets;

-- ============================================================================
-- 2. Restore original owner policies
-- ============================================================================
DROP POLICY IF EXISTS product_assets_owner_select ON product_assets;
CREATE POLICY product_assets_owner_select ON product_assets
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products p
      JOIN stores s ON s.id = p.store_id
      WHERE p.id = product_assets.product_id
        AND s.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS product_assets_owner_insert ON product_assets;
CREATE POLICY product_assets_owner_insert ON product_assets
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products p
      JOIN stores s ON s.id = p.store_id
      WHERE p.id = product_assets.product_id
        AND s.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS product_assets_owner_update ON product_assets;
CREATE POLICY product_assets_owner_update ON product_assets
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products p
      JOIN stores s ON s.id = p.store_id
      WHERE p.id = product_assets.product_id
        AND s.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products p
      JOIN stores s ON s.id = p.store_id
      WHERE p.id = product_assets.product_id
        AND s.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS product_assets_owner_delete ON product_assets;
CREATE POLICY product_assets_owner_delete ON product_assets
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products p
      JOIN stores s ON s.id = p.store_id
      WHERE p.id = product_assets.product_id
        AND s.owner_id = auth.uid()
    )
  );

-- ============================================================================
-- 3. Restore variant-aware policies (with security vulnerability)
-- ============================================================================
DROP POLICY IF EXISTS merchants_can_view_product_assets_with_variants ON product_assets;
CREATE POLICY merchants_can_view_product_assets_with_variants
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

DROP POLICY IF EXISTS merchants_can_insert_product_assets_with_variants ON product_assets;
CREATE POLICY merchants_can_insert_product_assets_with_variants
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

DROP POLICY IF EXISTS merchants_can_update_product_assets_with_variants ON product_assets;
CREATE POLICY merchants_can_update_product_assets_with_variants
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

DROP POLICY IF EXISTS merchants_can_delete_product_assets_with_variants ON product_assets;
CREATE POLICY merchants_can_delete_product_assets_with_variants
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
-- 4. Restore public policy (unchanged)
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
-- End of rollback migration 20260817_000004_rollback_product_assets_rls_security.sql
-- ============================================================================
