-- Add industry_category text field for merchant free text input
-- This separates from industry_id which is a UUID foreign key to industries table
ALTER TABLE stores
ADD COLUMN IF NOT EXISTS industry_category text;
