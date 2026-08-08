import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type AiJobInsert = Database['public']['Tables']['ai_jobs']['Insert']

// GET /api/ai-jobs - Get AI jobs for a store
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('store_id')
    const importId = searchParams.get('import_id')

    let query = supabase.from('ai_jobs').select('*')

    if (storeId) {
      query = query.eq('store_id', storeId)
    }

    if (importId) {
      query = query.eq('import_id', importId)
    }

    const { data: jobs, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ jobs })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/ai-jobs - Create a new AI job
export async function POST(request: NextRequest) {
  try {
    const body: AiJobInsert = await request.json()

    const { data: job, error } = await supabase
      .from('ai_jobs')
      .insert(body)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ job }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
