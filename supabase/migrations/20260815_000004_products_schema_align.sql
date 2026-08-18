-- ============================================================================
-- Migration: 20260815_000004_products_schema_align.sql
--
-- Purpose: Repair confirmed schema drift on the live `products` table.
--   The live `products` table is MISSING two columns that the application
--   contract requires (lib/database.types.ts + lib/storefront/service.ts +
--   lib/agent/service.ts all reference them):
--     - products.raw_data       (jsonb)  — raw import payload (PRIVATE)
--     - products.semantic_data  (jsonb)  — ACTIVE consolidated semantic store
--
-- Design decisions (NOT blindly copied from supabase-schema.sql):
--   * supabase-schema.sql defines `raw_data jsonb` on products but does NOT
--     define `semantic_data` on products (it instead has a separate, legacy
--     `product_semantics` table). Per the Phase-15 audit, the architecture has
--     CONSOLIDATED semantic storage into `products.semantic_data` (consumed by
--     the storefront DTO and the agent). This migration therefore adds
--     `products.semantic_data` as the single active store and does NOT
--     resurrect `product_semantics` as a competing primary store.
--   * Both columns are jsonb, NULLABLE, NO default — matching
--     lib/database.types.ts (`raw_data: Json | null`, `semantic_data: Json | null`)
--     and supabase-schema.sql (`raw_data jsonb`).
--
-- Safety:
--   * ADD COLUMN IF NOT EXISTS — idempotent, additive, non-destructive.
--   * No DROP, no TRUNCATE, no CASCADE, no data modification.
--   * Preserves all existing rows/columns.
--
-- Column-safety (order-independent with 20260815_000003):
--   000003 revokes sku/inventory/raw_data from anon/authenticated ONLY IF the
--   column exists at apply time. If 000003 is applied BEFORE this migration,
--   raw_data did not yet exist and was skipped — so this migration MUST re-run
--   the revoke after adding raw_data. The DO block below revokes all internal
--   columns that exist (idempotent), guaranteeing protection regardless of
--   apply order. semantic_data is intentionally PUBLIC (storefront attributes)
--   and is NOT revoked.
-- ============================================================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS raw_data jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS semantic_data jsonb;

-- Re-affirm column protection for internal product fields (idempotent).
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
-- End of migration 20260815_000004_products_schema_align.sql
-- ============================================================================
