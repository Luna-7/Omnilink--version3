-- ============================================================================
-- Migration: 20260815_000003_rls_access_matrix.sql
--
-- Purpose: Repair the Omnilink RLS / access-policy foundation (Task #53).
--          Establishes the MINIMUM policy matrix so that:
--            * the public storefront can read ACTIVE stores / PUBLISHED pages
--              / ACTIVE products / ACTIVE templates / PUBLIC assets / industries;
--            * a merchant can only read & mutate rows belonging to stores they
--              own (store_settings / store_pages / products / product_assets /
--              imports / ai_jobs / store_plugins / agent_api_keys);
--            * all 14 semantic_* tables are SERVICE_ROLE_ONLY (no anon /
--              authenticated access — internal process/semantic data);
--            * internal product columns (sku, inventory, raw_data) are NOT
--              directly selectable by anon or authenticated (row RLS cannot
--              hide columns; this is the real DB boundary).
--
-- Idempotency / safety:
--   * ENABLE ROW LEVEL SECURITY is a no-op if already on.
--   * Every policy is wrapped in DROP POLICY IF EXISTS + CREATE POLICY.
--   * REVOKE column privileges are no-ops if already revoked.
--   * No DROP TABLE, no destructive schema recreation, no data modification.
--   * Explicit, documented policy names and purpose per policy.
--
-- Dependencies / supersedes:
--   * Builds on 20260812_000001_stores_rls.sql (owner policies for stores /
--     store_settings are re-asserted here so this migration is self-contained).
--   * SUPERSEDES 20260815_000002_public_read_rls.sql. If that file was ever
--     applied, its policy names are dropped below; do NOT apply 000002 — this
--     migration is the canonical replacement.
--
-- NOTE on semantic_* tables (VERIFIED live drift, 2026-08-15):
--   lib/database.types.ts / supabase-schema.sql declare 14 semantic-layer tables,
--   but only 2 of them actually EXIST in the live database:
--       EXISTS  : semantic_schemas, product_semantics
--       MISSING : semantic_fields, semantic_processing_logs, semantic_ontology,
--                 semantic_relations, semantic_rules, semantic_candidates,
--                 semantic_change_logs, semantic_memory, semantic_queries,
--                 semantic_query_events, semantic_evidence,
--                 semantic_unknown_fields          (12 tables)
--   Verified against the live PostgREST OpenAPI document (13 exposed tables) and
--   confirmed by a direct SQL error (42P01 on semantic_fields). NOTE: a PostgREST
--   PGRST205 alone does NOT prove absence — it cannot distinguish "not cached"
--   from "does not exist"; only SQL / the OpenAPI table list is authoritative.
--   The 12 tables were never created because supabase-schema.sql (their only DDL
--   source) is a destructive bootstrap script that must NOT be used as a
--   migration (rules #1/#4). Section D therefore guards on existence.
--   If the semantic subsystem is enabled later, create those tables via a
--   SEPARATE additive `CREATE TABLE IF NOT EXISTS` migration, then re-run this
--   file — RLS will be enabled on them automatically.
--   After any table creation, reload the PostgREST schema cache:
--     - Supabase dashboard: Database → API Docs → "Reload schema cache", or
--     - SQL: NOTIFY pgrst, 'reload schema';
--   This is NOT a migration step; it does not change schema or data.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 0. Supersede 000002 (drop its policy names if present, so this file is the
--    single source of truth regardless of apply order).
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS templates_active_select              ON templates;
DROP POLICY IF EXISTS stores_public_active_select         ON stores;
DROP POLICY IF EXISTS store_settings_public_select         ON store_settings;
DROP POLICY IF EXISTS store_pages_public_published_select ON store_pages;
DROP POLICY IF EXISTS products_public_active_select        ON products;
DROP POLICY IF EXISTS product_assets_public_select         ON product_assets;


-- ===========================================================================
-- A. OWNER policies for stores / store_settings (re-assert 20260812, self-contained)
--    Ownership derives directly from stores.owner_id = auth.uid().
-- ===========================================================================

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS stores_owner_select ON stores;
CREATE POLICY stores_owner_select ON stores
  FOR SELECT TO authenticated
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS stores_owner_insert ON stores;
CREATE POLICY stores_owner_insert ON stores
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS stores_owner_update ON stores;
CREATE POLICY stores_owner_update ON stores
  FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS stores_owner_delete ON stores;
CREATE POLICY stores_owner_delete ON stores
  FOR DELETE TO authenticated
  USING (auth.uid() = owner_id);

-- store_settings ownership is INDIRECT: store_id -> stores.owner_id.
DROP POLICY IF EXISTS store_settings_owner_select ON store_settings;
CREATE POLICY store_settings_owner_select ON store_settings
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores s
      WHERE s.id = store_settings.store_id
        AND s.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS store_settings_owner_insert ON store_settings;
CREATE POLICY store_settings_owner_insert ON store_settings
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores s
      WHERE s.id = store_settings.store_id
        AND s.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS store_settings_owner_update ON store_settings;
CREATE POLICY store_settings_owner_update ON store_settings
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores s
      WHERE s.id = store_settings.store_id
        AND s.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores s
      WHERE s.id = store_settings.store_id
        AND s.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS store_settings_owner_delete ON store_settings;
CREATE POLICY store_settings_owner_delete ON store_settings
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores s
      WHERE s.id = store_settings.store_id
        AND s.owner_id = auth.uid()
    )
  );


-- ===========================================================================
-- B. PUBLIC_READ policies — anon + authenticated SELECT, ROW-FILTERED.
--    These expose ONLY the data the public storefront / catalog needs, and
--    never a blanket USING (true) on merchant/private tables.
-- ===========================================================================

ALTER TABLE industries    ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates      ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_pages    ENABLE ROW LEVEL SECURITY;
ALTER TABLE products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_assets ENABLE ROW LEVEL SECURITY;

-- industries: public reference data (no PII, no merchant ownership). Safe to
-- expose fully to anon + authenticated.
DROP POLICY IF EXISTS industries_public_select ON industries;
CREATE POLICY industries_public_select ON industries
  FOR SELECT TO anon, authenticated
  USING (true);

-- stores: public reads are limited to ACTIVE stores only.
DROP POLICY IF EXISTS stores_public_active_select ON stores;
CREATE POLICY stores_public_active_select ON stores
  FOR SELECT TO anon, authenticated
  USING (status = 'active');

-- store_settings: public read gated to settings of ACTIVE stores (avoids
-- leaking theme/seo config of inactive/unpublished stores). Contains only
-- theme_config + seo_config (public by design).
DROP POLICY IF EXISTS store_settings_public_select ON store_settings;
CREATE POLICY store_settings_public_select ON store_settings
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores s
      WHERE s.id = store_settings.store_id
        AND s.status = 'active'
    )
  );

-- templates: only ACTIVE templates are public (theme registry metadata).
DROP POLICY IF EXISTS templates_public_active_select ON templates;
CREATE POLICY templates_public_active_select ON templates
  FOR SELECT TO anon, authenticated
  USING (status = 'active');

-- store_pages: public reads limited to PUBLISHED pages (drafts stay private).
DROP POLICY IF EXISTS store_pages_public_published_select ON store_pages;
CREATE POLICY store_pages_public_published_select ON store_pages
  FOR SELECT TO anon, authenticated
  USING (published = true);

-- products: public reads limited to ACTIVE products (draft/archived private).
-- Column exposure of sku/inventory/raw_data is handled by the REVOKE in
-- section E — row RLS alone cannot hide columns.
DROP POLICY IF EXISTS products_public_active_select ON products;
CREATE POLICY products_public_active_select ON products
  FOR SELECT TO anon, authenticated
  USING (status = 'active');

-- product_assets: public images, but gated to assets of ACTIVE products so
-- assets of draft/inactive products are not exposed.
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


-- ===========================================================================
-- C. OWNER_READ_WRITE policies — authenticated, ownership via
--    store_id -> stores.owner_id (or via products for product_assets).
--    Cross-store access is denied by construction of the EXISTS predicate.
-- ===========================================================================

ALTER TABLE imports        ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_jobs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_plugins  ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_api_keys ENABLE ROW LEVEL SECURITY;

-- products (owner, direct store_id)
DROP POLICY IF EXISTS products_owner_select ON products;
CREATE POLICY products_owner_select ON products
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = products.store_id AND s.owner_id = auth.uid())
  );
DROP POLICY IF EXISTS products_owner_insert ON products;
CREATE POLICY products_owner_insert ON products
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = products.store_id AND s.owner_id = auth.uid())
  );
DROP POLICY IF EXISTS products_owner_update ON products;
CREATE POLICY products_owner_update ON products
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = products.store_id AND s.owner_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = products.store_id AND s.owner_id = auth.uid())
  );
DROP POLICY IF EXISTS products_owner_delete ON products;
CREATE POLICY products_owner_delete ON products
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = products.store_id AND s.owner_id = auth.uid())
  );

-- store_pages (owner, direct store_id)
DROP POLICY IF EXISTS store_pages_owner_select ON store_pages;
CREATE POLICY store_pages_owner_select ON store_pages
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = store_pages.store_id AND s.owner_id = auth.uid())
  );
DROP POLICY IF EXISTS store_pages_owner_insert ON store_pages;
CREATE POLICY store_pages_owner_insert ON store_pages
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = store_pages.store_id AND s.owner_id = auth.uid())
  );
DROP POLICY IF EXISTS store_pages_owner_update ON store_pages;
CREATE POLICY store_pages_owner_update ON store_pages
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = store_pages.store_id AND s.owner_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = store_pages.store_id AND s.owner_id = auth.uid())
  );
DROP POLICY IF EXISTS store_pages_owner_delete ON store_pages;
CREATE POLICY store_pages_owner_delete ON store_pages
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = store_pages.store_id AND s.owner_id = auth.uid())
  );

-- product_assets (owner, indirect: product_id -> products.store_id -> stores.owner_id)
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

-- imports (owner, direct store_id)
DROP POLICY IF EXISTS imports_owner_select ON imports;
CREATE POLICY imports_owner_select ON imports
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = imports.store_id AND s.owner_id = auth.uid())
  );
DROP POLICY IF EXISTS imports_owner_insert ON imports;
CREATE POLICY imports_owner_insert ON imports
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = imports.store_id AND s.owner_id = auth.uid())
  );
DROP POLICY IF EXISTS imports_owner_update ON imports;
CREATE POLICY imports_owner_update ON imports
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = imports.store_id AND s.owner_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = imports.store_id AND s.owner_id = auth.uid())
  );
DROP POLICY IF EXISTS imports_owner_delete ON imports;
CREATE POLICY imports_owner_delete ON imports
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = imports.store_id AND s.owner_id = auth.uid())
  );

-- ai_jobs (owner, direct store_id)
DROP POLICY IF EXISTS ai_jobs_owner_select ON ai_jobs;
CREATE POLICY ai_jobs_owner_select ON ai_jobs
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = ai_jobs.store_id AND s.owner_id = auth.uid())
  );
DROP POLICY IF EXISTS ai_jobs_owner_insert ON ai_jobs;
CREATE POLICY ai_jobs_owner_insert ON ai_jobs
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = ai_jobs.store_id AND s.owner_id = auth.uid())
  );
DROP POLICY IF EXISTS ai_jobs_owner_update ON ai_jobs;
CREATE POLICY ai_jobs_owner_update ON ai_jobs
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = ai_jobs.store_id AND s.owner_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = ai_jobs.store_id AND s.owner_id = auth.uid())
  );
DROP POLICY IF EXISTS ai_jobs_owner_delete ON ai_jobs;
CREATE POLICY ai_jobs_owner_delete ON ai_jobs
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = ai_jobs.store_id AND s.owner_id = auth.uid())
  );

-- store_plugins (owner, direct store_id)
DROP POLICY IF EXISTS store_plugins_owner_select ON store_plugins;
CREATE POLICY store_plugins_owner_select ON store_plugins
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = store_plugins.store_id AND s.owner_id = auth.uid())
  );
DROP POLICY IF EXISTS store_plugins_owner_insert ON store_plugins;
CREATE POLICY store_plugins_owner_insert ON store_plugins
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = store_plugins.store_id AND s.owner_id = auth.uid())
  );
DROP POLICY IF EXISTS store_plugins_owner_update ON store_plugins;
CREATE POLICY store_plugins_owner_update ON store_plugins
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = store_plugins.store_id AND s.owner_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = store_plugins.store_id AND s.owner_id = auth.uid())
  );
DROP POLICY IF EXISTS store_plugins_owner_delete ON store_plugins;
CREATE POLICY store_plugins_owner_delete ON store_plugins
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = store_plugins.store_id AND s.owner_id = auth.uid())
  );

-- agent_api_keys (owner, direct store_id). These hold api_key_hash secrets;
-- only the owning merchant may read/manage them. Never public.
DROP POLICY IF EXISTS agent_api_keys_owner_select ON agent_api_keys;
CREATE POLICY agent_api_keys_owner_select ON agent_api_keys
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = agent_api_keys.store_id AND s.owner_id = auth.uid())
  );
DROP POLICY IF EXISTS agent_api_keys_owner_insert ON agent_api_keys;
CREATE POLICY agent_api_keys_owner_insert ON agent_api_keys
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = agent_api_keys.store_id AND s.owner_id = auth.uid())
  );
DROP POLICY IF EXISTS agent_api_keys_owner_update ON agent_api_keys;
CREATE POLICY agent_api_keys_owner_update ON agent_api_keys
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = agent_api_keys.store_id AND s.owner_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = agent_api_keys.store_id AND s.owner_id = auth.uid())
  );
DROP POLICY IF EXISTS agent_api_keys_owner_delete ON agent_api_keys;
CREATE POLICY agent_api_keys_owner_delete ON agent_api_keys
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = agent_api_keys.store_id AND s.owner_id = auth.uid())
  );


-- ===========================================================================
-- D. SERVICE_ROLE_ONLY — 14 semantic_* tables + product_semantics.
--    These hold internal semantic/process data (ontology, rules, candidate
--    reviews, embeddings, logs). They must NOT be readable by anon or
--    authenticated. With RLS enabled and NO permissive policy, anon and
--    authenticated are denied; service_role bypasses RLS for backend jobs.
--    No blanket USING (true) is added.
--
--    DRIFT GUARD: these tables are repo-only objects and may not exist in the
--    live database yet (see header note). A bare ALTER TABLE on a missing table
--    throws 42P01 and would abort the whole migration, leaving stores/products
--    RLS unapplied. We therefore enable RLS ONLY for tables that actually exist;
--    missing tables are skipped (no table => nothing to protect). When the
--    tables are later created by a separate additive migration, re-run this
--    file and RLS will be enabled for them.
-- ===========================================================================
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'semantic_schemas',
    'semantic_fields',
    'semantic_processing_logs',
    'semantic_ontology',
    'semantic_relations',
    'semantic_rules',
    'semantic_candidates',
    'semantic_change_logs',
    'semantic_memory',
    'semantic_queries',
    'semantic_query_events',
    'semantic_evidence',
    'semantic_unknown_fields',
    'product_semantics'
  ] LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    END IF;
  END LOOP;
END $$;


-- ===========================================================================
-- E. Column safety (P4) — internal product columns are NOT directly
--    selectable by anon or authenticated. Row RLS gates WHICH rows; column
--    privileges gate WHICH columns. The storefront DTO (lib/storefront/
--    service.ts PRODUCT_SELECT) only requests safe columns, so it is
--    unaffected. Revoking here is the real DB boundary; the DTO whitelist is
--    defense-in-depth only and must not be relied upon as the sole control.
--    The merchant dashboard, when it is later reworked to read inventory/sku,
--    must use an OWNER-SCOPED server-side path (SECURITY DEFINER view or
--    service_role client) — not the public anon/authenticated API.
--
-- NOTE (live-DB drift): the LIVE products table currently lacks the
--    `raw_data` column (it exists in lib/database.types.ts /
--    supabase-schema.sql but was never applied to the live DB). The DO block
--    below revokes only columns that actually exist, so this migration is
--    safe to apply against the current live schema. When a separate schema
--    migration adds `raw_data` (and `semantic_data`), it MUST also add
--    `REVOKE SELECT (raw_data) ON products FROM anon, authenticated;`.
-- ===========================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'products' AND column_name = 'sku') THEN
    EXECUTE 'REVOKE SELECT (sku) ON products FROM anon, authenticated';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'products' AND column_name = 'inventory') THEN
    EXECUTE 'REVOKE SELECT (inventory) ON products FROM anon, authenticated';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'products' AND column_name = 'raw_data') THEN
    EXECUTE 'REVOKE SELECT (raw_data) ON products FROM anon, authenticated';
  END IF;
END $$;


-- ============================================================================
-- End of migration 20260815_000003_rls_access_matrix.sql
-- ============================================================================
