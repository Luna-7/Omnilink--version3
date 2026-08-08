import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/database.types'

type ProductAssetInsert = Database['public']['Tables']['product_assets']['Insert']

// POST /api/assets - Create a new product asset
export async function POST(request: NextRequest) {
  try {
    const body: ProductAssetInsert = await request.json()

    const { data: asset, error } = await supabase
      .from('product_assets')
      .insert(body)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ asset }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/assets - Get assets for a product
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('product_id')
    const assetType = searchParams.get('asset_type')

    if (!productId) {
      return NextResponse.json({ error: 'product_id is required' }, { status: 400 })
    }

    let query = supabase
      .from('product_assets')
      .select('*')
      .eq('product_id', productId)

    if (assetType) {
      query = query.eq('asset_type', assetType)
    }

    const { data: assets, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ assets })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
