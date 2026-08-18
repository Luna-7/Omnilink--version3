// Agent public commerce-search contract.
//
// The Agent endpoint exposes ONLY public commerce data (active products,
// public fields). It MUST NOT return sku / inventory / raw_data / semantic_data
// or any merchant-private field. If a merchant-private Agent is later required,
// that is a separate contract requiring authentication + store ownership or an
// API key — NOT this one.

export interface AgentProductQuery {
  query: string
}

export interface AgentProductResponse {
  product_id: string
  title: string
  description: string | null
  price: number
  currency: string
  store_slug: string | null
}

export interface AgentQueryResponse {
  products: AgentProductResponse[]
  query: string
  confidence: number
}
