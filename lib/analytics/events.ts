import { supabase } from '@/lib/supabase/client'

export async function recordSemanticQueryEvent(data: {
  query_text: string
  parsed_intent: string
  matched_product_ids: string[]
  matched_concepts: string[]
  confidence: number
  source?: string
}) {
  const { error } = await supabase.from('semantic_query_events').insert({
    query_text: data.query_text,
    parsed_intent: data.parsed_intent,
    matched_product_ids: data.matched_product_ids,
    matched_concepts: data.matched_concepts,
    confidence: data.confidence,
    source: data.source ?? 'agent_api',
  })

  if (error) {
    console.error('record query event failed', error)
  }
}
