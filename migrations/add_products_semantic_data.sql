-- Add semantic_data column to products table for storing AI-extracted semantic attributes
-- This migration is idempotent and can be run multiple times safely

ALTER TABLE products
ADD COLUMN IF NOT EXISTS semantic_data jsonb;
