// DEFERRED (Demo #56 · P4/P9): legacy semantic / evidence / reasoning layer.
// Depends on semantic_* tables that were NEVER created in the live DB
// (12/14 missing → PGRST205). Not part of the Demo storefront/agent flow.
// Semantic Source of Truth = products.semantic_data. Do not wire into Demo.
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

// GET /api/semantic/ontology - Get all ontology concepts
export async function GET() {
  try {
    const { data: ontology } = await supabase
      .from('semantic_ontology')
      .select('*')
      .order('canonical_name')

    return NextResponse.json({
      data: ontology,
      version: 'ontology-v1',
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    )
  }
}
