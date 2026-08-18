import { NextResponse } from 'next/server'
import { createClientServer } from '@/lib/supabase/server'

// GET /api/products/[id]/ai-json — Public AI-readable product data (Demo #56).
//
// Source of truth = products.semantic_data. Row-level RLS filters to
// status='active' (anon/public reads only published products). This endpoint
// deliberately returns ONLY public commerce fields and NEVER raw_data /
// inventory / sku / internal management fields. The legacy semantic_* tables
// are not used here (DEFERRED — see #56 P4/P9).
const AI_PRODUCT_SELECT =
  'id, name, description, price, currency, status, store_id, semantic_data'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClientServer()

  const { data: product, error } = await supabase
    .from('products')
    .select(AI_PRODUCT_SELECT)
    .eq('id', id)
    .eq('status', 'active')
    .maybeSingle()

  if (error || !product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  // Resolve store slug separately (robust regardless of FK embed support).
  let storeSlug: string | null = null
  if (product.store_id) {
    const { data: store } = await supabase
      .from('stores')
      .select('store_slug')
      .eq('id', product.store_id)
      .maybeSingle()
    storeSlug = store?.store_slug ?? null
  }

  const semantic =
    product.semantic_data && typeof product.semantic_data === 'object'
      ? (product.semantic_data as Record<string, unknown>)
      : {}
  const category = typeof semantic.category === 'string' ? semantic.category : null

  return NextResponse.json({
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    currency: product.currency,
    status: product.status,
    category,
    semantic_data: semantic,
    url: storeSlug ? `/store/${storeSlug}/products/${product.id}` : null,
  })
}
