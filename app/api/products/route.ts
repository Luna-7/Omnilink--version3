import { NextRequest, NextResponse } from 'next/server'
import { requireUser, ownsStore } from '@/lib/api/auth'
import type { Database } from '@/lib/database.types'

type ProductInsert = Database['public']['Tables']['products']['Insert']

// Columns a merchant may set when creating a product (mass-assignment guard).
const PRODUCT_INSERT_KEYS: (keyof ProductInsert)[] = [
  'store_id', 'sku', 'name', 'description', 'price', 'currency',
  'inventory', 'status', 'raw_data', 'semantic_data',
]

function pickInsert(body: unknown): ProductInsert {
  if (!body || typeof body !== 'object') return {} as ProductInsert
  const src = body as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const k of PRODUCT_INSERT_KEYS) {
    if (k in src) out[k] = src[k]
  }
  return out as ProductInsert
}

// GET /api/products - List products for a store the caller owns.
export async function GET(request: NextRequest) {
  const auth = await requireUser()
  if (!auth.ok) return auth.response
  const { supabase, user } = auth

  try {
    const storeId = new URL(request.url).searchParams.get('store_id')
    if (!storeId) {
      return NextResponse.json({ error: 'store_id is required' }, { status: 400 })
    }
    if (!(await ownsStore(supabase, user, storeId))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: products, error } = await supabase
      .from('products')
      .select('id, store_id, sku, name, description, price, currency, inventory, status, raw_data, semantic_data, created_at, updated_at')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ products })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/products - Create a product in a store the caller owns.
export async function POST(request: NextRequest) {
  const auth = await requireUser()
  if (!auth.ok) return auth.response
  const { supabase, user } = auth

  try {
    const body = await request.json()
    const insert = pickInsert(body)
    const storeId = insert.store_id
    if (!storeId) {
      return NextResponse.json({ error: 'store_id is required' }, { status: 400 })
    }
    if (!(await ownsStore(supabase, user, storeId))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: product, error } = await supabase
      .from('products')
      .insert(insert)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ product }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
