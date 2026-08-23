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

// PATCH /api/merchant/products/[id] - Update a product the caller owns.
// (Previously: anon client, updated non-existent columns title/category.)
export async function PATCH(
  request: NextRequest,
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

  try {
    const update = pickUpdate(await request.json())
    const { data, error } = await supabase
      .from('products')
      .update(update)
      .eq('id', id)
      .select()
      .single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ product: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    )
  }
}

// DELETE /api/merchant/products/[id] - Delete a product the caller owns.
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
