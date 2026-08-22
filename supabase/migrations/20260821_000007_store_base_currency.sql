-- ============================================================================
-- Migration: 20260821_000007_store_base_currency.sql
--
-- Purpose: Add base_currency to stores table with CNY/USD check constraint
--          and backfill existing data from currency column.
-- ============================================================================

ALTER TABLE stores
ADD COLUMN IF NOT EXISTS base_currency TEXT NOT NULL DEFAULT 'CNY';

-- 约束：仅支持 CNY 与 USD（Demo Scope）
ALTER TABLE stores
DROP CONSTRAINT IF EXISTS check_store_base_currency;

ALTER TABLE stores
ADD CONSTRAINT check_store_base_currency
CHECK (base_currency IN ('CNY', 'USD'));

-- 数据回填：如果已有 currency 字段则同步
UPDATE stores
SET base_currency = CASE
  WHEN currency IN ('CNY', 'USD') THEN currency
  ELSE 'CNY'
END
WHERE base_currency IS NULL OR base_currency NOT IN ('CNY', 'USD');
