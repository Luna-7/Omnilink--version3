import { NextRequest, NextResponse } from 'next/server'
import { requireUser, ownsProduct } from '@/lib/api/auth'
import { createClientServer } from '@/lib/supabase/server'

/**
 * GET /api/merchant/analytics/products/[id]
 *
 * Authority chain (correct ordering — auth BEFORE query):
 *   1. requireUser()                                   → 401 if not signed in
 *   2. ownsProduct(supabase, user, productId)          → 404 cross-tenant
 *   3. (only after 1+2) query semantic_query_events     via SSR client
 *
 * The previous implementation used the anon/browser Supabase client with
 * no authentication and no ownership check, so any anonymous caller could
 * retrieve analytics for any product by id. This rewrite enforces the
 * auth → ownership → query ordering even though the table is queried via
 * the cookie-scoped SSR client.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser()
  if (!auth.ok) return auth.response
  const { supabase, user } = auth

  const { id } = await params

  const { owned } = await ownsProduct(supabase, user, id)
  if (!owned) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Authorization complete; safe to query the analytics table.
  // The SSR client is scoped to the cookie session; RLS provides a
  // second line of defense but is not relied upon here.
  const ssr = await createClientServer()
  const { data: events, error } = await ssr
    .from('semantic_query_events')
    .select('id, query_text, matched_product_ids, matched_concepts, created_at')
    .contains('matched_product_ids', [id])
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const conceptFrequency = calculateConceptFrequency(events ?? [])
  const recentQueries = (events ?? []).slice(0, 10).map((event) => ({
    query: event.query_text,
    created_at: event.created_at,
  }))

  return NextResponse.json({
    product_id: id,
    query_count: events?.length ?? 0,
    top_concepts: conceptFrequency,
    recent_queries: recentQueries,
  })
}

function calculateConceptFrequency(
  events: Array<{ matched_concepts: unknown }>
): Array<{ concept: string; count: number }> {
  const conceptCount: Record<string, number> = {}

  for (const event of events) {
    const concepts = event.matched_concepts as string[] | null
    if (concepts) {
      for (const concept of concepts) {
        conceptCount[concept] = (conceptCount[concept] || 0) + 1
      }
    }
  }

  return Object.entries(conceptCount)
    .map(([concept, count]) => ({ concept, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
}