import { parseSemanticQuery } from '@/lib/semantic/parser'
import { applyRules } from '@/lib/semantic/reasoning'
import { supabase } from '@/lib/supabase/client'
import { recordSemanticQueryEvent } from '@/lib/analytics/events'
import { getProductEvidence } from '@/lib/evidence/service'
import type { AgentQueryResponse, AgentProductResponse } from './types'

export async function queryAgentProducts(query: string): Promise<AgentQueryResponse> {
  const semanticQuery = await parseSemanticQuery(query)

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*, stores(store_slug)')
    .limit(20)

  if (productsError) {
    throw productsError
  }

  // Fetch reasoning rules
  const { data: rules, error: rulesError } = await supabase
    .from('semantic_rules')
    .select('*')

  if (rulesError) {
    throw rulesError
  }

  const results = await Promise.all(
    products.map(async product => {
      const productData = product as any
      const semantic = (productData.semantic_data as Record<string, unknown>) || {}
      const storeSlug = productData.stores?.store_slug || ''

      const score = calculateMatch(semantic, semanticQuery.concepts)

      if (score === 0) {
        return null
      }

      const derived = applyRules(rules || [], semantic)
      const evidence = await getProductEvidence(productData.id)

      return {
        product_id: productData.id,
        title: productData.name,
        semantic_match_score: score,
        semantic_data: semantic,
        derived_semantics: derived,
        evidence,
        purchase_url: productData.url,
        store_slug: storeSlug,
      }
    })
  )

  const filteredResults = results.filter(Boolean) as AgentProductResponse[]

  // Record semantic query event for analytics
  await recordSemanticQueryEvent({
    query_text: query,
    parsed_intent: semanticQuery.intent,
    matched_product_ids: filteredResults.map(item => item.product_id),
    matched_concepts: semanticQuery.concepts,
    confidence: semanticQuery.confidence,
  })

  return {
    products: filteredResults,
    query,
    confidence: semanticQuery.confidence,
  }
}

function calculateMatch(semantic: Record<string, unknown>, concepts: string[]): number {
  let matched = 0

  for (const concept of concepts) {
    if (semantic[concept]) {
      matched++
    }
  }

  if (concepts.length === 0) {
    return 0
  }

  return matched / concepts.length
}
