// DEFERRED (Demo #56 · P4/P9): legacy semantic / evidence / reasoning layer.
// Depends on semantic_* tables that were NEVER created in the live DB
// (12/14 missing → PGRST205). Not part of the Demo storefront/agent flow.
// Semantic Source of Truth = products.semantic_data. Do not wire into Demo.
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

// GET /api/semantic/candidates - Query AI-generated semantic candidates
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')

    let query = supabase.from('semantic_candidates').select('*')

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      data,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    )
  }
}
