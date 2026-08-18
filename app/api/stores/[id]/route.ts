import { NextRequest, NextResponse } from 'next/server'
import { requireUser, ownsStore } from '@/lib/api/auth'
import type { Database } from '@/lib/database.types'

type StoreUpdate = Database['public']['Tables']['stores']['Update']

// Columns a merchant may update on their own store (never owner_id / id).
const STORE_UPDATE_KEYS: (keyof StoreUpdate)[] = [
  'store_name', 'store_slug', 'industry_id', 'industry_category',
  'logo_url', 'description', 'currency', 'status',
]

function pickUpdate(body: unknown): StoreUpdate {
  if (!body || typeof body !== 'object') return {} as StoreUpdate
  const src = body as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const k of STORE_UPDATE_KEYS) {
    if (k in src) out[k] = src[k]
  }
  return out as StoreUpdate
}

// GET /api/stores/[id] - Get a store the caller owns.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await requireUser()
  if (!auth.ok) return auth.response
  const { supabase, user } = auth

  if (!(await ownsStore(supabase, user, id))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const { data: store, error } = await supabase
    .from('stores')
    .select('*')
    .eq('id', id)
    .single()
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }
  return NextResponse.json({ store })
}

// PATCH /api/stores/[id] - Update a store the caller owns.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await requireUser()
  if (!auth.ok) return auth.response
  const { supabase, user } = auth

  if (!(await ownsStore(supabase, user, id))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  try {
    const update = pickUpdate(await request.json())
    const { data: store, error } = await supabase
      .from('stores')
      .update(update)
      .eq('id', id)
      .select()
      .single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ store })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/stores/[id] - Delete a store the caller owns.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await requireUser()
  if (!auth.ok) return auth.response
  const { supabase, user } = auth

  if (!(await ownsStore(supabase, user, id))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const { error } = await supabase.from('stores').delete().eq('id', id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
