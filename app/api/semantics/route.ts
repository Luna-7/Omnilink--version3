import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/database.types'

type ProductSemanticsInsert = Database['public']['Tables']['product_semantics']['Insert']

// POST /api/semantics - Create semantic data for a product
export async function POST(request: NextRequest) {
  try {
    const body: ProductSemanticsInsert = await request.json()

    const { data: semantics, error } = await supabase
      .from('product_semantics')
      .insert(body)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ semantics }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/semantics - Get semantic data for a product
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('product_id')

    if (!productId) {
      return NextResponse.json({ error: 'product_id is required' }, { status: 400 })
    }

    const { data: semantics, error } = await supabase
      .from('product_semantics')
      .select('*')
      .eq('product_id', productId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ semantics })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
