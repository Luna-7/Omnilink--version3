-- ============================================================================
-- Migration: 20260822_000001_add_product_attribute_domain.sql
--
-- Purpose: Add structured product attribute domain to replace scattered raw_data.
--   This migration introduces three domain-specific tables for product attributes:
--   - product_attributes: General physical/measurable attributes
--   - product_composition: Material/component composition data
--   - product_content: Marketing content, features, SEO data
--
-- Design Principles:
--   * Domain separation: Each table serves a specific attribute category
--   * Type safety: Structured columns instead of JSONB where possible
--   * Backward compatible: Existing raw_data/semantic_data preserved
--   * RLS enabled: Ownership chain auth.uid() → stores.owner_id → products.store_id
--   * Minimal disruption: No changes to existing products table structure
--
-- Data Sovereignty Rules:
--   * New tables are the authoritative source for their domains
--   * Legacy raw_data remains for backward compatibility during transition
--   * Business code should migrate to new tables incrementally
--
-- Safety:
--   * CREATE TABLE IF NOT EXISTS (idempotent)
--   * No DROP, no TRUNCATE, no CASCADE on existing data
--   * Preserves all existing rows/columns
--   * Fully reversible with rollback migration
--
-- Rollback: 20260822_000002_rollback_product_attribute_domain.sql
-- ============================================================================

-- ============================================================================
-- 1. Create product_attributes table (General Physical Attributes)
-- ============================================================================
CREATE TABLE IF NOT EXISTS product_attributes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES product_variants(id) ON DELETE CASCADE,
  
  -- Attribute identification
  field_key text NOT NULL,
  label text,
  
  -- Attribute value
  value text NOT NULL,
  value_type text NOT NULL DEFAULT 'text', -- 'text', 'number', 'boolean', 'select'
  unit text,
  
  -- Metadata
  source text NOT NULL DEFAULT 'manual', -- 'manual', 'system', 'ai'
  confidence numeric DEFAULT 1.0,
  is_standard boolean DEFAULT true,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CHECK (value_type IN ('text', 'number', 'boolean', 'select')),
  CHECK (confidence >= 0 AND confidence <= 1),
  UNIQUE(product_id, variant_id, field_key)
);

-- ============================================================================
-- 2. Create product_composition table (Material/Component Composition)
-- ============================================================================
CREATE TABLE IF NOT EXISTS product_composition (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES product_variants(id) ON DELETE CASCADE,
  
  -- Component identification
  component_name text NOT NULL,
  component_type text NOT NULL, -- 'material', 'part', 'ingredient', 'assembly'
  material_code text,
  
  -- Composition data
  percentage numeric, -- For materials/ingredients (0-100)
  quantity numeric,
  quantity_unit text,
  
  -- Supplier/origin
  supplier_name text,
  origin_country text,
  
  -- Metadata
  is_primary boolean DEFAULT false,
  notes text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CHECK (percentage IS NULL OR (percentage >= 0 AND percentage <= 100)),
  CHECK (component_type IN ('material', 'part', 'ingredient', 'assembly'))
);

-- ============================================================================
-- 3. Create product_content table (Marketing Content & SEO)
-- ============================================================================
CREATE TABLE IF NOT EXISTS product_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- Content type
  content_type text NOT NULL, -- 'feature', 'benefit', 'description', 'seo_title', 'seo_description', 'seo_keywords'
  language text DEFAULT 'zh',
  
  -- Content data
  title text,
  body text,
  position integer DEFAULT 0,
  
  -- SEO-specific fields
  meta_title text,
  meta_description text,
  keywords text[], -- Array of keywords
  
  -- Display settings
  is_visible boolean DEFAULT true,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CHECK (content_type IN ('feature', 'benefit', 'description', 'seo_title', 'seo_description', 'seo_keywords')),
  CHECK (language IS NOT NULL)
);

-- ============================================================================
-- 4. Create indexes for performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_product_attributes_product_id ON product_attributes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_attributes_variant_id ON product_attributes(variant_id) WHERE variant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_product_attributes_field_key ON product_attributes(field_key);
CREATE INDEX IF NOT EXISTS idx_product_attributes_source ON product_attributes(source);
CREATE INDEX IF NOT EXISTS idx_product_attributes_is_standard ON product_attributes(is_standard);

CREATE INDEX IF NOT EXISTS idx_product_composition_product_id ON product_composition(product_id);
CREATE INDEX IF NOT EXISTS idx_product_composition_variant_id ON product_composition(variant_id) WHERE variant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_product_composition_component_type ON product_composition(component_type);
CREATE INDEX IF NOT EXISTS idx_product_composition_is_primary ON product_composition(is_primary);

CREATE INDEX IF NOT EXISTS idx_product_content_product_id ON product_content(product_id);
CREATE INDEX IF NOT EXISTS idx_product_content_content_type ON product_content(content_type);
CREATE INDEX IF NOT EXISTS idx_product_content_language ON product_content(language);
CREATE INDEX IF NOT EXISTS idx_product_content_is_visible ON product_content(is_visible);
CREATE INDEX IF NOT EXISTS idx_product_content_keywords ON product_content USING GIN(keywords);

-- ============================================================================
-- 5. Enable Row Level Security
-- ============================================================================
ALTER TABLE product_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_composition ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_content ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6. RLS Policies for product_attributes
-- ============================================================================
-- Merchants can view their own product attributes
DROP POLICY IF EXISTS "merchants_can_view_product_attributes" ON product_attributes;
CREATE POLICY "merchants_can_view_product_attributes"
  ON product_attributes
  FOR SELECT
  USING (
    product_id IN (
      SELECT id FROM products WHERE store_id IN (
        SELECT id FROM stores WHERE owner_id = auth.uid()
      )
    )
  );

-- Merchants can insert their own product attributes
DROP POLICY IF EXISTS "merchants_can_insert_product_attributes" ON product_attributes;
CREATE POLICY "merchants_can_insert_product_attributes"
  ON product_attributes
  FOR INSERT
  WITH CHECK (
    product_id IN (
      SELECT id FROM products WHERE store_id IN (
        SELECT id FROM stores WHERE owner_id = auth.uid()
      )
    )
  );

-- Merchants can update their own product attributes
DROP POLICY IF EXISTS "merchants_can_update_product_attributes" ON product_attributes;
CREATE POLICY "merchants_can_update_product_attributes"
  ON product_attributes
  FOR UPDATE
  USING (
    product_id IN (
      SELECT id FROM products WHERE store_id IN (
        SELECT id FROM stores WHERE owner_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    product_id IN (
      SELECT id FROM products WHERE store_id IN (
        SELECT id FROM stores WHERE owner_id = auth.uid()
      )
    )
  );

-- Merchants can delete their own product attributes
DROP POLICY IF EXISTS "merchants_can_delete_product_attributes" ON product_attributes;
CREATE POLICY "merchants_can_delete_product_attributes"
  ON product_attributes
  FOR DELETE
  USING (
    product_id IN (
      SELECT id FROM products WHERE store_id IN (
        SELECT id FROM stores WHERE owner_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- 7. RLS Policies for product_composition
-- ============================================================================
-- Merchants can view their own product composition
DROP POLICY IF EXISTS "merchants_can_view_product_composition" ON product_composition;
CREATE POLICY "merchants_can_view_product_composition"
  ON product_composition
  FOR SELECT
  USING (
    product_id IN (
      SELECT id FROM products WHERE store_id IN (
        SELECT id FROM stores WHERE owner_id = auth.uid()
      )
    )
  );

-- Merchants can insert their own product composition
DROP POLICY IF EXISTS "merchants_can_insert_product_composition" ON product_composition;
CREATE POLICY "merchants_can_insert_product_composition"
  ON product_composition
  FOR INSERT
  WITH CHECK (
    product_id IN (
      SELECT id FROM products WHERE store_id IN (
        SELECT id FROM stores WHERE owner_id = auth.uid()
      )
    )
  );

-- Merchants can update their own product composition
DROP POLICY IF EXISTS "merchants_can_update_product_composition" ON product_composition;
CREATE POLICY "merchants_can_update_product_composition"
  ON product_composition
  FOR UPDATE
  USING (
    product_id IN (
      SELECT id FROM products WHERE store_id IN (
        SELECT id FROM stores WHERE owner_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    product_id IN (
      SELECT id FROM products WHERE store_id IN (
        SELECT id FROM stores WHERE owner_id = auth.uid()
      )
    )
  );

-- Merchants can delete their own product composition
DROP POLICY IF EXISTS "merchants_can_delete_product_composition" ON product_composition;
CREATE POLICY "merchants_can_delete_product_composition"
  ON product_composition
  FOR DELETE
  USING (
    product_id IN (
      SELECT id FROM products WHERE store_id IN (
        SELECT id FROM stores WHERE owner_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- 8. RLS Policies for product_content
-- ============================================================================
-- Merchants can view their own product content
DROP POLICY IF EXISTS "merchants_can_view_product_content" ON product_content;
CREATE POLICY "merchants_can_view_product_content"
  ON product_content
  FOR SELECT
  USING (
    product_id IN (
      SELECT id FROM products WHERE store_id IN (
        SELECT id FROM stores WHERE owner_id = auth.uid()
      )
    )
  );

-- Merchants can insert their own product content
DROP POLICY IF EXISTS "merchants_can_insert_product_content" ON product_content;
CREATE POLICY "merchants_can_insert_product_content"
  ON product_content
  FOR INSERT
  WITH CHECK (
    product_id IN (
      SELECT id FROM products WHERE store_id IN (
        SELECT id FROM stores WHERE owner_id = auth.uid()
      )
    )
  );

-- Merchants can update their own product content
DROP POLICY IF EXISTS "merchants_can_update_product_content" ON product_content;
CREATE POLICY "merchants_can_update_product_content"
  ON product_content
  FOR UPDATE
  USING (
    product_id IN (
      SELECT id FROM products WHERE store_id IN (
        SELECT id FROM stores WHERE owner_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    product_id IN (
      SELECT id FROM products WHERE store_id IN (
        SELECT id FROM stores WHERE owner_id = auth.uid()
      )
    )
  );

-- Merchants can delete their own product content
DROP POLICY IF EXISTS "merchants_can_delete_product_content" ON product_content;
CREATE POLICY "merchants_can_delete_product_content"
  ON product_content
  FOR DELETE
  USING (
    product_id IN (
      SELECT id FROM products WHERE store_id IN (
        SELECT id FROM stores WHERE owner_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- 9. Add comments for documentation
-- ============================================================================
COMMENT ON TABLE product_attributes IS 'Structured storage for general product attributes (dimensions, weight, origin, etc.). Replaces scattered raw_data attributes.';
COMMENT ON COLUMN product_attributes.field_key IS 'Canonical field key (e.g., frame_material, lens_type, weight)';
COMMENT ON COLUMN product_attributes.value_type IS 'Data type: text, number, boolean, or select';
COMMENT ON COLUMN product_attributes.unit IS 'Unit of measurement (e.g., mm, g, kg)';
COMMENT ON COLUMN product_attributes.source IS 'Attribute source: manual (user input), system (calculated), or ai (extracted)';
COMMENT ON COLUMN product_attributes.confidence IS 'AI confidence score (0-1) for ai-sourced attributes';
COMMENT ON COLUMN product_attributes.is_standard IS 'Whether this is a standard attribute defined in category templates';

COMMENT ON TABLE product_composition IS 'Structured storage for product material/component composition data';
COMMENT ON COLUMN product_composition.component_type IS 'Type: material, part, ingredient, or assembly';
COMMENT ON COLUMN product_composition.percentage IS 'Percentage composition (0-100) for materials/ingredients';
COMMENT ON COLUMN product_composition.is_primary IS 'Whether this is the primary component/material';

COMMENT ON TABLE product_content IS 'Structured storage for marketing content, features, and SEO data';
COMMENT ON COLUMN product_content.content_type IS 'Type: feature, benefit, description, seo_title, seo_description, seo_keywords';
COMMENT ON COLUMN product_content.language IS 'Content language code (e.g., zh, en)';
COMMENT ON COLUMN product_content.keywords IS 'Array of SEO keywords for search optimization';

-- ============================================================================
-- End of migration 20260822_000001_add_product_attribute_domain.sql
-- ============================================================================
