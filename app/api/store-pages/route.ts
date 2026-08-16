import { NextRequest, NextResponse } from 'next/server'
import { requireUser, ownsStore } from '@/lib/api/auth'
import type { Database } from '@/lib/database.types'

type StorePageInsert = Database['public']['Tables']['store_pages']['Insert']

const PAGE_INSERT_KEYS: (keyof StorePageInsert)[] = [
  'store_id', 'template_id', 'sections', 'published',
]

function pickInsert(body: unknown): StorePageInsert {
  if (!body || typeof body !== 'object') return {} as StorePageInsert
  const src = body as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const k of PAGE_INSERT_KEYS) {
    if (k in src) out[k] = src[k]
  }
  return out as StorePageInsert
}

// GET /api/store-pages - List pages for a store the caller owns.
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

    const { data: pages, error } = await supabase
      .from('store_pages')
      .select('*')
      .eq('store_id', storeId)
      .order('updated_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ pages })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/store-pages - Create a page in a store the caller owns.
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

    const { data: page, error } = await supabase
      .from('store_pages')
      .insert(insert)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ page }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
