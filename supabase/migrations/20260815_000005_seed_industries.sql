-- ============================================================================
-- Migration: 20260815_000005_seed_industries.sql
--
-- Purpose: Restore the canonical industry reference data required by onboarding
--          (components/onboarding/IndustrySelector). The live DB has industries
--          = 0 because supabase-schema.sql's seed block was never applied as a
--          baseline (Phase-15 drift R7). This migration-backed, idempotent seed
--          replaces that reliance.
--
-- Source of the canonical set: the 8 industries defined in supabase-schema.sql
-- are the only intended industry list in the repo. They are re-asserted here as
-- a migration (NOT by running the destructive bootstrap script).
--
-- Idempotency WITHOUT relying on a UNIQUE constraint:
--   An earlier draft used `ON CONFLICT (slug) DO UPDATE`. That requires a unique
--   index/constraint on industries.slug to exist in the LIVE database; if it is
--   absent, PostgreSQL raises 42P10 ("no unique or exclusion constraint matching
--   the ON CONFLICT specification") and aborts the migration. The live schema
--   could not be proven to carry that constraint from the available read-only
--   access, so this migration is written to be CONSTRAINT-INDEPENDENT:
--   each row is inserted only when its slug is not already present.
--   This is safe to replay, never updates or deletes existing rows, and never
--   touches merchant stores.industry_id FK references.
--
-- Safety: INSERT-only. No UPDATE, no DELETE, no DDL, no destructive operation.
-- ============================================================================

INSERT INTO industries (name, slug, description)
SELECT v.name, v.slug, v.description
FROM (VALUES
  ('Eyewear',         'eyewear',       'Glasses, sunglasses, and optical accessories'),
  ('Fashion',         'fashion',       'Clothing, apparel, and fashion accessories'),
  ('Jewelry',         'jewelry',       'Fine jewelry, watches, and accessories'),
  ('Electronics',     'electronics',   'Consumer electronics and gadgets'),
  ('Home & Garden',   'home-garden',   'Home decor, furniture, and garden supplies'),
  ('Sports',          'sports',        'Sports equipment and athletic wear'),
  ('Beauty',          'beauty',        'Cosmetics, skincare, and personal care'),
  ('Food & Beverage', 'food-beverage', 'Food products and beverages')
) AS v(name, slug, description)
WHERE NOT EXISTS (
  SELECT 1 FROM industries i WHERE i.slug = v.slug
);

-- ============================================================================
-- End of migration 20260815_000005_seed_industries.sql
-- ============================================================================
