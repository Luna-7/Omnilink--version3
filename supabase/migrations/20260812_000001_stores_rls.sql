-- ============================================================================
-- Migration: 20260812_000001_stores_rls.sql
--
-- Establishes minimal RLS on `stores` and `store_settings` keyed by
-- merchant ownership. Target security model:
--
--   - Merchant A (authenticated) → full CRUD on their own store(s)
--   - Merchant B (authenticated) → cannot read/modify/delete Merchant A's
--   - anon → cannot INSERT into stores
--   - service_role → unaffected (RLS only applies to non-service roles
--                       by default; supabase_auth_admin-style rescue paths
--                       are also bypassed; this migration intentionally does
--                       not touch service_role behavior)
--
-- Idempotency:
--   - ENABLE ROW LEVEL SECURITY is a no-op if already on
--   - DROP POLICY IF EXISTS is a no-op if a policy doesn't exist
--   - Safe to re-run with no schema/data damage
--
-- Out of scope (intentionally NOT done here):
--   - Public storefront read policy (anon SELECT on public stores)
--     is left for a separate migration per product decision
--   - Mutations to existing schema columns
--   - RLS for any other table
--   - Modifications to supabase-schema.sql
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. RLS on `stores`
-- ---------------------------------------------------------------------------
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS stores_owner_select ON stores;
CREATE POLICY stores_owner_select ON stores
  FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS stores_owner_insert ON stores;
CREATE POLICY stores_owner_insert ON stores
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS stores_owner_update ON stores;
CREATE POLICY stores_owner_update ON stores
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS stores_owner_delete ON stores;
CREATE POLICY stores_owner_delete ON stores
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- ---------------------------------------------------------------------------
-- 2. RLS on `store_settings` (joined ownership via stores.owner_id)
-- ---------------------------------------------------------------------------
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Helper predicate, expressed inline in each policy below for portability
-- (CREATE POLICY doesn't allow shared expressions across policies).

DROP POLICY IF EXISTS store_settings_owner_select ON store_settings;
CREATE POLICY store_settings_owner_select ON store_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM stores s
      WHERE s.id = store_settings.store_id
        AND s.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS store_settings_owner_insert ON store_settings;
CREATE POLICY store_settings_owner_insert ON store_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM stores s
      WHERE s.id = store_settings.store_id
        AND s.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS store_settings_owner_update ON store_settings;
CREATE POLICY store_settings_owner_update ON store_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM stores s
      WHERE s.id = store_settings.store_id
        AND s.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM stores s
      WHERE s.id = store_settings.store_id
        AND s.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS store_settings_owner_delete ON store_settings;
CREATE POLICY store_settings_owner_delete ON store_settings
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM stores s
      WHERE s.id = store_settings.store_id
        AND s.owner_id = auth.uid()
    )
  );

-- ============================================================================
-- End of migration
-- ============================================================================
