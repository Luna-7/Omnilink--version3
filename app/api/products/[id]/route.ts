import { NextRequest, NextResponse } from 'next/server'
import { requireUser, ownsProduct } from '@/lib/api/auth'
import type { Database } from '@/lib/database.types'

type ProductUpdate = Database['public']['Tables']['products']['Update']

const PRODUCT_UPDATE_KEYS: (keyof ProductUpdate)[] = [
  'sku', 'name', 'description', 'price', 'currency', 'inventory',
  'status', 'raw_data',
]

function pickUpdate(body: unknown): ProductUpdate {
  if (!body || typeof body !== 'object') return {} as ProductUpdate
  const src = body as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const k of PRODUCT_UPDATE_KEYS) {
    if (k in src) out[k] = src[k]
  }
  return out as ProductUpdate
}

// GET /api/products/[id] - Get a product the caller owns.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await requireUser()
  if (!auth.ok) return auth.response
  const { supabase, user } = auth

  const { owned } = await ownsProduct(supabase, user, id)
  if (!owned) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { data: product, error } = await supabase
    .from('products')
    .select('id, store_id, sku, name, description, price, currency, inventory, status, raw_data, semantic_data, created_at, updated_at, product_assets(url, asset_type)')
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }
  return NextResponse.json({ product })
}

// PATCH /api/products/[id] - Update a product the caller owns.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await requireUser()
  if (!auth.ok) return auth.response
  const { supabase, user } = auth

  const { owned, storeId } = await ownsProduct(supabase, user, id)
  if (!owned) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const body = await request.json()
    const update = pickUpdate(body)
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .maybeSingle()

    let product
    let error
    if (existing) {
      const res = await supabase
        .from('products')
        .update(update)
        .eq('id', id)
        .select()
        .single()
      product = res.data
      error = res.error
    } else {
      const insertPayload = {
        id,
        store_id: storeId,
        name: update.name || 'Untitled Product',
        sku: update.sku || `SKU-${id}`,
        price: update.price ?? 0,
        currency: update.currency || 'CNY',
        inventory: update.inventory ?? 0,
        status: update.status || 'draft',
        description: update.description || '',
        raw_data: update.raw_data || {},
      }
      const res = await supabase
        .from('products')
        .upsert(insertPayload)
        .select()
        .single()
      product = res.data
      error = res.error
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ product })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/products/[id] - Delete a product the caller owns.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await requireUser()
  if (!auth.ok) return auth.response
  const { supabase, user } = auth

  const { owned } = await ownsProduct(supabase, user, id)
  if (!owned) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}

// POST /api/products/[id] - (semantic processing) guarded; semantic layer is
// non-functional pending schema/seed work — fail closed rather than open-write.
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await requireUser()
  if (!auth.ok) return auth.response
  const { owned } = await ownsProduct(auth.supabase, auth.user, id)
  if (!owned) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(
    { error: 'Semantic processing is currently disabled (pending DB foundation recovery).' },
    { status: 501 },
  )
}
