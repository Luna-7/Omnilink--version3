-- ===========================================================================
-- product_semantics — scoped PUBLIC read policy
-- ---------------------------------------------------------------------------
-- Context
--   The Storefront public read model must read canonical product attributes
--   from `product_semantics.semantic_data` (NOT the dead `products.semantic_data`
--   column). Today `product_semantics` sits in the SERVICE_ROLE_ONLY RLS group:
--   RLS is enabled but there is NO anon / authenticated SELECT policy, so the
--   public/anon client cannot read it and the PostgREST JOIN returns an empty
--   array → canonical attributes never reach the storefront.
--
--   This migration adds a single, minimal, scoped SELECT policy:
--     * anon / authenticated may read a product_semantics row ONLY when its
--       parent product is `status = 'active'` (public catalogue semantics).
--     * authenticated merchants may ALSO read semantics of their OWN store's
--       products regardless of status (so they can preview draft attributes in
--       the editor, e.g. getEditorStorefrontProducts).
--     * No row is ever exposed for draft/inactive products to anonymous visitors.
--
--   This deliberately does NOT use `USING (true)` and does NOT broaden access to
--   any other semantic_* table. The other 13 semantic_* tables remain
--   SERVICE_ROLE_ONLY (internal process / ontology / rules / logs / embeddings).
--
--   `product_semantics.semantic_data` is the canonical merchandising attribute
--   payload (color / material / origin / …) that the public storefront is
--   designed to render — exposing it through this scoped policy is intentional,
--   not a leak.
--
-- Idempotency / safety
--   * ENABLE ROW LEVEL SECURITY is a no-op if already on.
--   * Wrapped in DROP POLICY IF EXISTS + CREATE POLICY.
--   * No DROP TABLE, no destructive schema recreation, no data modification.
-- ===========================================================================

ALTER TABLE product_semantics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS product_semantics_public_select ON product_semantics;
CREATE POLICY product_semantics_public_select ON product_semantics
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products p
      JOIN stores s ON s.id = p.store_id
      WHERE p.id = product_semantics.product_id
        AND (p.status = 'active' OR s.owner_id = auth.uid())
    )
  );
