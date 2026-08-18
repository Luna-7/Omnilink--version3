-- 20260815_000006_demo_simplify_products_access.sql
--
-- Demo simplification (#56): drop the column-level REVOKE design from the live DB
-- foundation. For the Demo, products access control lives at the APPLICATION
-- LAYER (explicit SELECT whitelists in API routes + DTOs), not in Postgres
-- column grants. This additive migration simply (re)grants normal table access
-- so the authenticated merchant can read/write their own products and anon can
-- read active products (row-level RLS still filters by status/ownership).
--
-- Status: the 000003 §E / 000004 REVOKE was verified NOT effective in #55
-- (anon could still SELECT products.sku/inventory/raw_data), so the live DB
-- already grants full products access. This migration makes that explicit and
-- idempotent. Apply in the Supabase SQL Editor if you want it on record.
--
-- No RLS policies are changed. No tables are dropped.

GRANT SELECT, INSERT, UPDATE, DELETE ON products TO authenticated;
GRANT SELECT ON products TO anon;
