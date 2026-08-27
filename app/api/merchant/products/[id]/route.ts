import { NextRequest, NextResponse } from 'next/server'
import { requireUser, ownsProduct } from '@/lib/api/auth'
import type { Database } from '@/lib/database.types'

import { isUuid, toValidUuid } from '@/lib/utils/uuid'

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
  const targetId = isUuid(id) ? id : toValidUuid(id)
  const auth = await requireUser()
  if (!auth.ok) return auth.response
  const { supabase, user } = auth

  const { owned, storeId } = await ownsProduct(supabase, user, id)
  if (!owned) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const update = pickUpdate(await request.json())
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('id', targetId)
      .maybeSingle()

    let data
    let error
    if (existing) {
      const res = await supabase
        .from('products')
        .update(update)
        .eq('id', targetId)
        .select()
        .single()
      data = res.data
      error = res.error
    } else {
      const insertPayload = {
        id: targetId,
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
      data = res.data
      error = res.error
    }

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
  const targetId = isUuid(id) ? id : toValidUuid(id)
  const auth = await requireUser()
  if (!auth.ok) return auth.response
  const { supabase, user } = auth

  const { owned } = await ownsProduct(supabase, user, id)
  if (!owned) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { error } = await supabase.from('products').delete().eq('id', targetId)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
