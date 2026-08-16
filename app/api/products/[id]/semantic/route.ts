// DEFERRED (Demo #56 · P4/P9): legacy semantic / evidence / reasoning layer.
// Depends on semantic_* tables that were NEVER created in the live DB
// (12/14 missing → PGRST205). Not part of the Demo storefront/agent flow.
// Semantic Source of Truth = products.semantic_data. Do not wire into Demo.
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

// GET /api/products/[id]/semantic - Get semantic data for a product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: semantics, error } = await supabase
      .from('product_semantics')
      .select(`
        *,
        semantic_schemas(*)
      `)
      .eq('product_id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({
      product_id: id,
      schema: semantics.semantic_schemas,
      semantic_data: semantics.semantic_data,
      confidence: semantics.confidence,
      generated_by: semantics.generated_by,
      created_at: semantics.created_at,
      updated_at: semantics.updated_at,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
