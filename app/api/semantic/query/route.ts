// DEFERRED (Demo #56 · P4/P9): legacy semantic / evidence / reasoning layer.
// Depends on semantic_* tables that were NEVER created in the live DB
// (12/14 missing → PGRST205). Not part of the Demo storefront/agent flow.
// Semantic Source of Truth = products.semantic_data. Do not wire into Demo.
import { NextRequest, NextResponse } from 'next/server'
import { parseSemanticQuery } from '@/lib/semantic/parser'
import { supabase } from '@/lib/supabase/client'

// POST /api/semantic/query - Parse natural language query into semantic query
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'query parameter is required and must be a string' },
        { status: 400 },
      )
    }

    // Parse semantic query
    const semanticQuery = await parseSemanticQuery(query)

    // Get ontology concepts to match
    const { data: ontology } = await supabase
      .from('semantic_ontology')
      .select('id, canonical_name, description, aliases')

    // Match concepts with ontology
    const matchedConcepts = (ontology || []).filter(o =>
      semanticQuery.concepts.includes(o.canonical_name),
    )

    // Save query to database
    await supabase.from('semantic_queries').insert({
      query_text: query,
      parsed_result: semanticQuery,
      confidence: semanticQuery.confidence,
    })

    return NextResponse.json({
      semantic_query: semanticQuery,
      matched_concepts: matchedConcepts,
      confidence: semanticQuery.confidence,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    )
  }
}
