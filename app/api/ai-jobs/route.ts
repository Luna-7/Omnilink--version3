import { NextRequest, NextResponse } from 'next/server'
import { requireUser, ownsStore } from '@/lib/api/auth'
import type { Database } from '@/lib/database.types'

type AiJobInsert = Database['public']['Tables']['ai_jobs']['Insert']

const AI_JOB_INSERT_KEYS: (keyof AiJobInsert)[] = [
  'store_id', 'import_id', 'job_type', 'status', 'model', 'input', 'output',
]

function pickInsert(body: unknown): AiJobInsert {
  if (!body || typeof body !== 'object') return {} as AiJobInsert
  const src = body as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const k of AI_JOB_INSERT_KEYS) {
    if (k in src) out[k] = src[k]
  }
  return out as AiJobInsert
}

// GET /api/ai-jobs - List AI jobs for a store the caller owns.
export async function GET(request: NextRequest) {
  const auth = await requireUser()
  if (!auth.ok) return auth.response
  const { supabase, user } = auth

  try {
    const sp = new URL(request.url).searchParams
    const storeId = sp.get('store_id')
    const importId = sp.get('import_id')

    if (!storeId) {
      return NextResponse.json({ error: 'store_id is required' }, { status: 400 })
    }
    if (!(await ownsStore(supabase, user, storeId))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let query = supabase.from('ai_jobs').select('*').eq('store_id', storeId)
    if (importId) {
      query = query.eq('import_id', importId)
    }
    const { data: jobs, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ jobs })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/ai-jobs - Create an AI job in a store the caller owns.
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

    const { data: job, error } = await supabase
      .from('ai_jobs')
      .insert(insert)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ job }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
