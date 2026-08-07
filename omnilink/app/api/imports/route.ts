import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type ImportInsert = Database['public']['Tables']['imports']['Insert']

// POST /api/imports - Create a new import job
export async function POST(request: NextRequest) {
  try {
    const body: ImportInsert = await request.json()

    const { data: importJob, error } = await supabase
      .from('imports')
      .insert(body)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ importJob }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/imports - Get import jobs for a store
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('store_id')

    if (!storeId) {
      return NextResponse.json({ error: 'store_id is required' }, { status: 400 })
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
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
