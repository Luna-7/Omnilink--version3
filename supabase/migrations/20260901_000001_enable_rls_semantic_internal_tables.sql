-- ============================================================================
-- Migration: 20260901_000001_enable_rls_semantic_internal_tables.sql
--
-- Purpose: Enable RLS on internal semantic tables (semantic_fields, 
--          semantic_rules, semantic_unknown_fields) to prevent public access.
--
-- Context:
--   These tables were created AFTER the initial RLS migration 
--   (20260815_000003_rls_access_matrix.sql) in migration 
--   20260821_000006_semantic_runtime_minimum.sql. The earlier migration's 
--   DO block skipped enabling RLS on them because they didn't exist yet.
--
--   These tables contain internal semantic/config/processing data that should
--   only be accessible by trusted server-side code (service_role), not by
--   anon or authenticated clients.
--
-- Target Access Model:
--   anon: DENIED (no policies)
--   authenticated: DENIED (no policies)
--   service_role: ALLOWED (bypasses RLS by default)
--
-- Idempotency / safety:
--   * ENABLE ROW LEVEL SECURITY is a no-op if already on.
--   * No policies created for anon/authenticated (default deny).
--   * No DROP TABLE, no destructive schema recreation, no data modification.
--   * No changes to existing product_semantics or semantic_schemas RLS.
-- ============================================================================

-- Enable RLS on semantic_fields (internal schema definition table)
ALTER TABLE public.semantic_fields ENABLE ROW LEVEL SECURITY;

-- Enable RLS on semantic_rules (internal reasoning rules table)
ALTER TABLE public.semantic_rules ENABLE ROW LEVEL SECURITY;

-- Enable RLS on semantic_unknown_fields (internal unknown fields tracking table)
ALTER TABLE public.semantic_unknown_fields ENABLE ROW LEVEL SECURITY;
