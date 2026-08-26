-- ============================================================================
-- Migration: 20260826_000001_store_settings_store_id_unique.sql
--
-- Fixes: "there is no unique or exclusion constraint matching the ON CONFLICT
-- specification" thrown by saveStorefrontSchemaAction / publishStorefrontAction,
-- which upsert store_settings with { onConflict: 'store_id' }.
--
-- Root cause
-- -----------
-- public.store_settings.store_id has a FK to stores(id) but NO UNIQUE /
-- PRIMARY KEY / exclusion constraint. Postgres therefore cannot resolve the
-- conflict target for the upsert, and rejects it with the error above.
--
-- This migration
-- --------------
--   1. Guard: if the LIVE table already contains duplicate store_id rows,
--      RAISE (fail loudly) instead of silently applying a constraint that
--      would reject the data. Nothing is deleted by this migration.
--   2. Idempotently add a UNIQUE constraint on store_id so that:
--         - one store has at most one store_settings row (1:1, enforced at DB),
--         - upsert(..., { onConflict: 'store_id' }) resolves correctly.
--
-- Idempotency
-- -----------
--   - The duplicate guard is a no-op when there are no duplicates.
--   - The constraint is added only when no equivalent single-column unique
--     index on (store_id) already exists (detected via pg_index), so
--     re-running this migration is safe.
--
-- Live data
-- ---------
-- The sandbox cannot reach supabase.co, so duplicates could not be verified
-- here. Run the diagnostic query (bottom of this file) where the database is
-- reachable; if duplicates are reported, run the dedupe query (also below),
-- THEN re-apply this migration. Do not blindly delete.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Duplicate guard — fail loudly if store_settings already has duplicate
--    store_id rows. No data is modified here.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_dup_store_ids text;
BEGIN
  SELECT string_agg(s.store_id::text, ', ')
  INTO v_dup_store_ids
  FROM (
    SELECT store_id
    FROM public.store_settings
    GROUP BY store_id
    HAVING count(*) > 1
  ) s;

  IF v_dup_store_ids IS NOT NULL THEN
    RAISE EXCEPTION
      'store_settings contains duplicate store_id rows for: %. '
      'Resolve duplicates (keep the latest row per store_id) before applying '
      'the UNIQUE constraint. See 20260826_000001 migration notes for the '
      'dedupe query.', v_dup_store_ids;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 2. Add the UNIQUE constraint on store_id (idempotent).
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM pg_index i
    WHERE i.indrelid = 'public.store_settings'::regclass
      AND i.indisunique
      AND i.indnkeyatts = 1
      AND i.indkey[0] = (
        SELECT attnum
        FROM pg_attribute
        WHERE attrelid = 'public.store_settings'::regclass
          AND attname = 'store_id'
      )
  ) INTO v_exists;

  IF NOT v_exists THEN
    ALTER TABLE public.store_settings
      ADD CONSTRAINT store_settings_store_id_unique
      UNIQUE (store_id);
  END IF;
END $$;

-- ============================================================================
-- Diagnostic query (run manually where the database is reachable):
--
--   SELECT store_id, COUNT(*) AS rows
--   FROM public.store_settings
--   GROUP BY store_id
--   HAVING COUNT(*) > 1;
--
-- Dedupe query (run ONLY after reviewing the diagnostic output; keeps the row
-- with the greatest updated_at per store_id, falling back to created_at, then
-- id — i.e. the most recently modified row wins):
--
--   DELETE FROM public.store_settings
--   WHERE id NOT IN (
--     SELECT id FROM (
--       SELECT id,
--              row_number() OVER (
--                PARTITION BY store_id
--                ORDER BY updated_at DESC NULLS LAST,
--                         created_at DESC NULLS LAST,
--                         id DESC
--              ) AS rn
--       FROM public.store_settings
--     ) ranked
--     WHERE rn = 1
--   )
--   AND store_id IN (
--     SELECT store_id
--     FROM public.store_settings
--     GROUP BY store_id
--     HAVING count(*) > 1
--   );
-- ============================================================================
