import type {
  CanonicalProductAttribute,
} from '@/lib/products/canonical-attributes'

export type ProductStatus =
  | 'active'
  | 'draft'
  | 'archived'

export interface ProductManagementModel {
  id: string

  name: string
  sku: string | null
  description: string | null

  price: number
  currency: string
  inventory: number

  status: ProductStatus

  categoryId?: string | null
  category: string | null

  attributes: CanonicalProductAttribute[]

  packaging: Record<string, unknown> | null
  seo: {
    title?: string
    description?: string
  } | null

  metadata: Record<string, unknown>

  updatedAt: string | null
}

export interface ProductManagementPatch {
  name?: string
  sku?: string | null
  description?: string | null

  price?: number
  currency?: string
  inventory?: number

  status?: ProductStatus

  categoryId?: string | null
  category?: string | null

  attributes?: CanonicalProductAttribute[]

  packaging?: Record<string, unknown> | null

  seo?: {
    title?: string
    description?: string
  } | null
}

export function createEmptyProductManagementModel(): ProductManagementModel {
  return {
    id: '',
    name: '',
    sku: null,
    description: null,
    price: 0,
    currency: 'CNY',
    inventory: 0,
    status: 'draft',
    categoryId: null,
    category: null,
    attributes: [],
    packaging: null,
    seo: null,
    metadata: {},
    updatedAt: null,
  }
}
