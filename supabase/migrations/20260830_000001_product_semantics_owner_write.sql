-- ===========================================================================
-- product_semantics — owner INSERT/UPDATE policies
-- ---------------------------------------------------------------------------
-- Context
--   The 20260815_000003_rls_access_matrix.sql migration set product_semantics
--   to SERVICE_ROLE_ONLY (RLS enabled, no anon/authenticated policies).
--   The 20260826_000002_product_semantics_public_read.sql migration added
--   SELECT policies for public active products and authenticated merchants.
--   
--   This migration adds the missing INSERT/UPDATE policies for authenticated
--   merchants so they can save canonical product attributes via the merchant
--   API. Ownership is enforced through the product -> store -> owner chain.
--
--   The final access matrix becomes:
--     * anon: SELECT only for active products (via public_select policy)
--     * authenticated merchant: SELECT own products (via public_select policy)
--     * authenticated merchant: INSERT own product_semantics (this migration)
--     * authenticated merchant: UPDATE own product_semantics (this migration)
--     * other merchants: NO ACCESS
--     * service_role: internal access (bypasses RLS)
--
-- Idempotency / safety
--   * ENABLE ROW LEVEL SECURITY is a no-op if already on.
--   * Wrapped in DROP POLICY IF EXISTS + CREATE POLICY.
--   * No DROP TABLE, no destructive schema recreation, no data modification.
--   * Ownership check uses EXISTS subquery through products -> stores chain.
-- ===========================================================================

ALTER TABLE product_semantics ENABLE ROW LEVEL SECURITY;

-- INSERT policy: authenticated merchants can insert semantics for products they own
DROP POLICY IF EXISTS product_semantics_owner_insert ON product_semantics;
CREATE POLICY product_semantics_owner_insert ON product_semantics
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM products p
      JOIN stores s ON s.id = p.store_id
      WHERE p.id = product_semantics.product_id
        AND s.owner_id = auth.uid()
    )
  );

-- UPDATE policy: authenticated merchants can update semantics for products they own
DROP POLICY IF EXISTS product_semantics_owner_update ON product_semantics;
CREATE POLICY product_semantics_owner_update ON product_semantics
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM products p
      JOIN stores s ON s.id = p.store_id
      WHERE p.id = product_semantics.product_id
        AND s.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM products p
      JOIN stores s ON s.id = p.store_id
      WHERE p.id = product_semantics.product_id
        AND s.owner_id = auth.uid()
    )
  );
