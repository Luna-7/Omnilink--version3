-- ============================================================================
-- Migration: 20260822_000002_rollback_product_attribute_domain.sql
--
-- Purpose: Rollback the product attribute domain migration.
--   This migration removes the three domain-specific tables created in
--   20260822_000001_add_product_attribute_domain.sql.
--
-- Safety:
--   * DROP TABLE IF EXISTS (idempotent)
--   * CASCADE to remove dependent objects (indexes, policies)
--   * Preserves products table and existing raw_data/semantic_data
--
-- Rollback of: 20260822_000001_add_product_attribute_domain.sql
-- ============================================================================

-- ============================================================================
-- 1. Drop product_attributes table
-- ============================================================================
DROP TABLE IF EXISTS product_attributes CASCADE;

-- ============================================================================
-- 2. Drop product_composition table
-- ============================================================================
DROP TABLE IF EXISTS product_composition CASCADE;

-- ============================================================================
-- 3. Drop product_content table
-- ============================================================================
DROP TABLE IF EXISTS product_content CASCADE;

-- ============================================================================
-- End of migration 20260822_000002_rollback_product_attribute_domain.sql
-- ============================================================================
