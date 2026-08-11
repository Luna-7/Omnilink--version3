-- Add raw_data column to products table for storing original Excel/CSV import data
-- This migration is idempotent and can be run multiple times safely

ALTER TABLE products
ADD COLUMN IF NOT EXISTS raw_data jsonb;
