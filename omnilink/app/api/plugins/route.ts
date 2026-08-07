import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type StorePluginInsert = Database['public']['Tables']['store_plugins']['Insert']

// GET /api/plugins - Get plugins for a store
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('store_id')

    if (!storeId) {
      return NextResponse.json({ error: 'store_id is required' }, { status: 400 })
    }

    const { data: plugins, error } = await supabase
      .from('store_plugins')
      .select('*')
      .eq('store_id', storeId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ plugins })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/plugins - Create or update a plugin
export async function POST(request: NextRequest) {
  try {
    const body: StorePluginInsert = await request.json()

    const { data: plugin, error } = await supabase
      .from('store_plugins')
      .upsert(body)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ plugin }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
