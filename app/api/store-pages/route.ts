import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/database.types'

type StorePageInsert = Database['public']['Tables']['store_pages']['Insert']

// GET /api/store-pages - Get store pages for a store
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('store_id')

    if (!storeId) {
      return NextResponse.json({ error: 'store_id is required' }, { status: 400 })
    }

    const { data: pages, error } = await supabase
      .from('store_pages')
      .select('*')
      .eq('store_id', storeId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ pages })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/store-pages - Create a new store page
export async function POST(request: NextRequest) {
  try {
    const body: StorePageInsert = await request.json()

    const { data: page, error } = await supabase
      .from('store_pages')
      .insert(body)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ page }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
