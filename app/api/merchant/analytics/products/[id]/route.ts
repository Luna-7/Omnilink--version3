import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

// GET /api/merchant/analytics/products/[id] - Get product analytics
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Query events where this product was matched
    const { data: events, error } = await supabase
      .from('semantic_query_events')
      .select('*')
      .contains('matched_product_ids', [id])
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Calculate concept frequency
    const conceptFrequency = calculateConceptFrequency(events || [])

    // Format recent queries
    const recentQueries = (events || []).slice(0, 10).map(event => ({
      query: event.query_text,
      created_at: event.created_at,
    }))

    return NextResponse.json({
      product_id: id,
      query_count: events?.length || 0,
      top_concepts: conceptFrequency,
      recent_queries: recentQueries,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    )
  }
}

function calculateConceptFrequency(events: Array<{ matched_concepts: unknown }>): Array<{ concept: string; count: number }> {
  const conceptCount: Record<string, number> = {}

  events.forEach(event => {
    const concepts = event.matched_concepts as string[] | null
    if (concepts) {
      concepts.forEach(concept => {
        conceptCount[concept] = (conceptCount[concept] || 0) + 1
      })
    }
  })

  return Object.entries(conceptCount)
    .map(([concept, count]) => ({ concept, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
}
