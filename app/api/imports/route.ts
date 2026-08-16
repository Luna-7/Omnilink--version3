import { NextRequest, NextResponse } from 'next/server'
import { requireUser, ownsStore } from '@/lib/api/auth'
import type { Database } from '@/lib/database.types'

type ImportInsert = Database['public']['Tables']['imports']['Insert']

const IMPORT_INSERT_KEYS: (keyof ImportInsert)[] = ['store_id', 'file_url', 'status', 'total_rows']

function pickInsert(body: unknown): ImportInsert {
  if (!body || typeof body !== 'object') return {} as ImportInsert
  const src = body as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const k of IMPORT_INSERT_KEYS) {
    if (k in src) out[k] = src[k]
  }
  return out as ImportInsert
}

// GET /api/imports - List import jobs for a store the caller owns.
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

    const { data: imports, error } = await supabase
      .from('imports')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ imports })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/imports - Create an import job in a store the caller owns.
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

    const { data: importJob, error } = await supabase
      .from('imports')
      .insert(insert)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ importJob }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
