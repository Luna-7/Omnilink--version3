export type ProductRelationType =
  | 'recommended'
  | 'complementary'
  | 'series'
  | 'accessory'
  | 'alternative'

export interface ProductRelation {
  id: string

  sourceProductId: string
  targetProductId: string

  relationType: ProductRelationType

  position: number

  createdAt?: string | null

  targetProduct: {
    id: string
    name: string
    sku?: string | null
    price?: number | null
    currency?: string | null
    status?: string | null
    thumbnailUrl?: string | null
  }
}

export interface ProductRelationInput {
  targetProductId: string
  relationType: ProductRelationType
  position?: number
}

export const PRODUCT_RELATION_LABELS: Record<
  ProductRelationType,
  string
> = {
  recommended: '推荐',
  complementary: '搭配',
  series: '同系列',
  accessory: '配件',
  alternative: '替代',
}
