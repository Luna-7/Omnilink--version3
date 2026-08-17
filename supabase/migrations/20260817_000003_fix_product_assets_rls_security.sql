-- ============================================================================
-- Migration: 20260817_000003_fix_product_assets_rls_security.sql
--
-- Purpose: Fix product_assets RLS security issue caused by conflicting policies
--   between old owner policies and new variant-aware policies.
--
-- Security Issue:
--   The original variant migration added permissive OR-based policies that could
--   allow bypassing ownership checks when combined with existing owner policies.
--   This migration consolidates into a single, secure set of policies.
--
-- Design Principles:
--   * Strict ownership enforcement: variant_id must match product_id
--   * No permissive OR conditions that could allow bypassing
--   * Maintain public storefront access for active products
--   * Single source of truth for asset ownership checks
--
-- Safety:
--   * DROP POLICY IF EXISTS - idempotent, safe to run multiple times
--   * Preserves all existing data
--   * Fully reversible with rollback migration
--
-- Rollback: 20260817_000004_rollback_product_assets_rls_security.sql
-- ============================================================================

-- ============================================================================
-- 1. Drop conflicting old owner policies
-- ============================================================================
DROP POLICY IF EXISTS product_assets_owner_select ON product_assets;
DROP POLICY IF EXISTS product_assets_owner_insert ON product_assets;
DROP POLICY IF EXISTS product_assets_owner_update ON product_assets;
DROP POLICY IF EXISTS product_assets_owner_delete ON product_assets;

-- ============================================================================
-- 2. Drop conflicting new variant-aware policies
-- ============================================================================
DROP POLICY IF EXISTS merchants_can_view_product_assets_with_variants ON product_assets;
DROP POLICY IF EXISTS merchants_can_insert_product_assets_with_variants ON product_assets;
DROP POLICY IF EXISTS merchants_can_update_product_assets_with_variants ON product_assets;
DROP POLICY IF EXISTS merchants_can_delete_product_assets_with_variants ON product_assets;

-- ============================================================================
-- 3. Create unified, secure product_assets policies
-- ============================================================================

-- Merchants can view their own product assets
-- Logic: If variant_id IS NULL, product_id must belong to user
--        If variant_id IS NOT NULL, variant must belong to user AND variant.product_id = product_id
CREATE POLICY "merchants_can_view_product_assets"
  ON product_assets
  FOR SELECT TO authenticated
  USING (
    -- Case 1: Product-level asset (no variant association)
    (variant_id IS NULL AND EXISTS (
      SELECT 1 FROM products p
      JOIN stores s ON s.id = p.store_id
      WHERE p.id = product_assets.product_id
        AND s.owner_id = auth.uid()
    ))
    OR
    -- Case 2: Variant-level asset (strict ownership chain)
    (variant_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM product_variants v
      JOIN products p ON p.id = v.product_id
      JOIN stores s ON s.id = p.store_id
      WHERE v.id = product_assets.variant_id
        AND p.id = product_assets.product_id
        AND s.owner_id = auth.uid()
    ))
  );

-- Merchants can insert their own product assets
-- Logic: Same strict ownership enforcement as SELECT
CREATE POLICY "merchants_can_insert_product_assets"
  ON product_assets
  FOR INSERT TO authenticated
  WITH CHECK (
    -- Case 1: Product-level asset (no variant association)
    (variant_id IS NULL AND EXISTS (
      SELECT 1 FROM products p
      JOIN stores s ON s.id = p.store_id
      WHERE p.id = product_assets.product_id
        AND s.owner_id = auth.uid()
    ))
    OR
    -- Case 2: Variant-level asset (strict ownership chain)
    (variant_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM product_variants v
      JOIN products p ON p.id = v.product_id
      JOIN stores s ON s.id = p.store_id
      WHERE v.id = product_assets.variant_id
        AND p.id = product_assets.product_id
        AND s.owner_id = auth.uid()
    ))
  );

-- Merchants can update their own product assets
-- Logic: Same strict ownership enforcement as SELECT
CREATE POLICY "merchants_can_update_product_assets"
  ON product_assets
  FOR UPDATE TO authenticated
  USING (
    -- Case 1: Product-level asset (no variant association)
    (variant_id IS NULL AND EXISTS (
      SELECT 1 FROM products p
      JOIN stores s ON s.id = p.store_id
      WHERE p.id = product_assets.product_id
        AND s.owner_id = auth.uid()
    ))
    OR
    -- Case 2: Variant-level asset (strict ownership chain)
    (variant_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM product_variants v
      JOIN products p ON p.id = v.product_id
      JOIN stores s ON s.id = p.store_id
      WHERE v.id = product_assets.variant_id
        AND p.id = product_assets.product_id
        AND s.owner_id = auth.uid()
    ))
  )
  WITH CHECK (
    -- Case 1: Product-level asset (no variant association)
    (variant_id IS NULL AND EXISTS (
      SELECT 1 FROM products p
      JOIN stores s ON s.id = p.store_id
      WHERE p.id = product_assets.product_id
        AND s.owner_id = auth.uid()
    ))
    OR
    -- Case 2: Variant-level asset (strict ownership chain)
    (variant_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM product_variants v
      JOIN products p ON p.id = v.product_id
      JOIN stores s ON s.id = p.store_id
      WHERE v.id = product_assets.variant_id
        AND p.id = product_assets.product_id
        AND s.owner_id = auth.uid()
    ))
  );

-- Merchants can delete their own product assets
-- Logic: Same strict ownership enforcement as SELECT
CREATE POLICY "merchants_can_delete_product_assets"
  ON product_assets
  FOR DELETE TO authenticated
  USING (
    -- Case 1: Product-level asset (no variant association)
    (variant_id IS NULL AND EXISTS (
      SELECT 1 FROM products p
      JOIN stores s ON s.id = p.store_id
      WHERE p.id = product_assets.product_id
        AND s.owner_id = auth.uid()
    ))
    OR
    -- Case 2: Variant-level asset (strict ownership chain)
    (variant_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM product_variants v
      JOIN products p ON p.id = v.product_id
      JOIN stores s ON s.id = p.store_id
      WHERE v.id = product_assets.variant_id
        AND p.id = product_assets.product_id
        AND s.owner_id = auth.uid()
    ))
  );

-- ============================================================================
-- 4. Public policy for storefront access (unchanged)
-- ============================================================================
-- This policy allows public read access to assets of active products
-- for storefront display. This is critical for e-commerce functionality.
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

-- ============================================================================
-- End of migration 20260817_000003_fix_product_assets_rls_security.sql
-- ============================================================================
