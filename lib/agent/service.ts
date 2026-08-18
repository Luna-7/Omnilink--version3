/**
 * Agent product query — PUBLIC commerce search.
 *
 * Contract (PUBLIC_AGENT): returns ONLY public commerce data for ACTIVE
 * products across stores. No sku / inventory / raw_data / semantic_data /
 * evidence / derived semantics. Row-limited. No `select(*)`.
 *
 * This is a deliberately constrained public path. A merchant-private Agent
 * (auth + ownership / API key) would be a separate, future contract.
 */

import { createClientServer } from '@/lib/supabase/server'
import type { AgentQueryResponse, AgentProductResponse } from './types'

const PUBLIC_PRODUCT_SELECT = 'id, name, description, price, currency, stores:stores(store_slug)'
const MAX_RESULTS = 20

export async function queryAgentProducts(query: string): Promise<AgentQueryResponse> {
  const supabase = await createClientServer()
  const term = (query || '').trim()

  let req = supabase
    .from('products')
    .select(PUBLIC_PRODUCT_SELECT)
    .eq('status', 'active')
    .limit(MAX_RESULTS)

  if (term) {
    // Simple public text search on public fields only.
    req = req.or(`name.ilike.%${escapeIlike(term)}%,description.ilike.%${escapeIlike(term)}%`)
  }

  const { data: products, error } = await req
  if (error) {
    throw error
  }

  const results: AgentProductResponse[] = (products ?? []).map((row) => {
    const r = row as unknown as {
      id: string
      name: string
      description: string | null
      price: number
      currency: string
      stores?: { store_slug?: string | null } | null
    }
    return {
      product_id: r.id,
      title: r.name,
      description: r.description,
      price: r.price,
      currency: r.currency,
      store_slug: r.stores?.store_slug ?? null,
    }
  })

  return {
    products: results,
    query,
    confidence: term ? 0.6 : 0.5,
  }
}

function escapeIlike(s: string): string {
  return s.replace(/[%_\\]/g, (m) => '\\' + m)
}
