import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

// PATCH /api/merchant/products/[id] - Update product and semantic data
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const { data, error } = await supabase
      .from('products')
      .update({
        title: body.title,
        description: body.description,
        category: body.category,
        semantic_data: body.semantic_data,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      product: data,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
