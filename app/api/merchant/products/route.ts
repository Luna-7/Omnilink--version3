import { NextRequest, NextResponse } from 'next/server'
import { requireUser, getOwnedStoreId } from '@/lib/api/auth'
import type { Database } from '@/lib/database.types'

type ProductInsert = Database['public']['Tables']['products']['Insert']

const PRODUCT_INSERT_KEYS: (keyof ProductInsert)[] = [
  'sku', 'name', 'description', 'price', 'currency', 'inventory', 'status',
  'raw_data', 'semantic_data',
]

function pickInsert(body: unknown): Partial<ProductInsert> {
  if (!body || typeof body !== 'object') return {}
  const src = body as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const k of PRODUCT_INSERT_KEYS) {
    if (k in src) out[k] = src[k]
  }
  return out as Partial<ProductInsert>
}

// GET /api/merchant/products - List the caller's own products.
export async function GET() {
  const auth = await requireUser()
  if (!auth.ok) return auth.response
  const { supabase, user } = auth

  try {
    const storeId = await getOwnedStoreId(supabase, user)
    if (!storeId) {
      return NextResponse.json({ products: [] })
    }
    const { data: products, error } = await supabase
      .from('products')
      .select('id, store_id, sku, name, description, price, currency, inventory, status, raw_data, semantic_data, created_at, updated_at')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ products: products || [] })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/merchant/products - Create a product in the caller's own store.
// (Previously used the anon client + createMerchantProduct which inserted
// non-existent columns; now server-side, ownership-scoped, whitelisted.)
export async function POST(request: NextRequest) {
  const auth = await requireUser()
  if (!auth.ok) return auth.response
  const { supabase, user } = auth

  try {
    const storeId = await getOwnedStoreId(supabase, user)
    if (!storeId) {
      return NextResponse.json({ error: 'No store for this merchant' }, { status: 404 })
    }
    const body = await request.json()
    if (!body?.name || body?.price == null) {
      return NextResponse.json(
        { error: 'name and price are required' },
        { status: 400 },
      )
    }
    const insert: ProductInsert = {
      store_id: storeId,
      ...pickInsert(body),
      // Demo fallback (#60 P1): when the caller omits semantic_data we
      // still write a minimal valid JSON so the storefront AI JSON,
      // storefront product card, and agent-query pipelines all have
      // structured data to show. Source of truth remains
      // products.semantic_data. This is explicitly a Demo fallback.
      semantic_data:
        (body as Record<string, unknown>)?.semantic_data && typeof (body as Record<string, unknown>).semantic_data === 'object'
          ? ((body as Record<string, unknown>).semantic_data as Record<string, unknown>)
          : { category: null, attributes: {}, confidence: 1 },
    } as ProductInsert

    const { data: product, error } = await supabase
      .from('products')
      .insert(insert)
      .select()
      .single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ product, ai_ready: false }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    )
  }
}
