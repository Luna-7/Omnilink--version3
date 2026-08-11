export interface CreateMerchantProduct {
  title: string
  description: string
  category: string
  images: string[]
}

export interface ProductSemanticData {
  [key: string]: unknown
}

export interface ProductWithSemantic {
  id: string
  name: string
  description: string | null
  category: string | null
  semantic_data: Record<string, unknown> | null
}
