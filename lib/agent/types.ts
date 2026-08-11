export interface AgentProductQuery {
  query: string
}

export interface AgentProductResponse {
  product_id: string
  title: string
  semantic_match_score: number
  semantic_data: Record<string, unknown>
  derived_semantics: Record<string, unknown>
  semantic_graph?: Record<string, unknown>
  evidence?: Array<{
    semantic_field: string
    evidence_type: string
    confidence: number
  }>
  purchase_url?: string
  store_slug?: string
}

export interface AgentQueryResponse {
  products: AgentProductResponse[]
  query: string
  confidence: number
}
