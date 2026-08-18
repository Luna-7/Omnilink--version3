export interface ProductOption {
  id: string
  product_id: string
  name: string
  code: string
  position: number
  values: string[]
  created_at: string
}

export interface ProductVariant {
  id: string
  product_id: string
  sku: string | null
  price: number | null
  currency: string
  inventory: number | null
  status: 'draft' | 'active' | 'archived'
  option_values: Record<string, string>
  raw_data: Record<string, unknown> | null
  semantic_data: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface CreateProductOptionInput {
  name: string
  code: string
  position?: number
  values: string[]
}

export interface UpdateProductOptionInput {
  name?: string
  code?: string
  position?: number
  values?: string[]
}

export interface CreateProductVariantInput {
  sku?: string
  price?: number
  currency?: string
  inventory?: number
  status?: 'draft' | 'active' | 'archived'
  option_values: Record<string, string>
  raw_data?: Record<string, unknown>
  semantic_data?: Record<string, unknown>
}

export interface UpdateProductVariantInput {
  sku?: string
  price?: number
  currency?: string
  inventory?: number
  status?: 'draft' | 'active' | 'archived'
  option_values?: Record<string, string>
  raw_data?: Record<string, unknown>
  semantic_data?: Record<string, unknown>
}

export type VariantStatus = 'draft' | 'active' | 'archived'
