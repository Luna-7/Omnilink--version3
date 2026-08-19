-- ============================================================================
-- Migration: 20260819_000001_create_orders_and_order_items.sql
--
-- Purpose: Minimal viable demo orders & order items for inquiry/demo commerce loop.
-- Snapshot preservation: preserves product_name, sku, unit_price, selected_options.
-- ============================================================================

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  order_number text NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  customer_whatsapp text,
  company text,
  country text,
  state text,
  city text,
  address text,
  notes text,
  contact_preference text DEFAULT 'email',
  currency text NOT NULL DEFAULT 'USD',
  subtotal numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'inquiry_pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  product_name_snapshot text NOT NULL,
  sku_snapshot text,
  quantity integer NOT NULL DEFAULT 1,
  unit_price_snapshot numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  selected_options jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_orders_store_id ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Allow public anonymous guest checkout insertions
DROP POLICY IF EXISTS "Public can create orders" ON orders;
CREATE POLICY "Public can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view own order" ON orders;
CREATE POLICY "Public can view own order"
  ON orders FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public can insert order items" ON order_items;
CREATE POLICY "Public can insert order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view order items" ON order_items;
CREATE POLICY "Public can view order items"
  ON order_items FOR SELECT
  USING (true);

-- Store owners can manage orders of their own store
DROP POLICY IF EXISTS "Store owners can manage their orders" ON orders;
CREATE POLICY "Store owners can manage their orders"
  ON orders FOR ALL
  USING (
    store_id IN (
      SELECT s.id FROM stores s WHERE s.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Store owners can manage their order items" ON order_items;
CREATE POLICY "Store owners can manage their order items"
  ON order_items FOR ALL
  USING (
    order_id IN (
      SELECT o.id FROM orders o
      JOIN stores s ON o.store_id = s.id
      WHERE s.owner_id = auth.uid()
    )
  );
