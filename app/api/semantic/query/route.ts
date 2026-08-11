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
