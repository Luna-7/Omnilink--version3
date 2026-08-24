import type {
  ProductManagementModel,
} from './product-management-model'

import type {
  ProductMediaAsset,
} from './product-media'

import type {
  ProductRelation,
} from './product-relations'

export interface ProductDetailModel
  extends ProductManagementModel {
  media: ProductMediaAsset[]

  relations: ProductRelation[]

  primaryMedia?: ProductMediaAsset | null
}

export function buildProductDetailModel(
  product: ProductManagementModel,
  media: ProductMediaAsset[],
  relations: ProductRelation[],
): ProductDetailModel {
  const sortedMedia = [...media].sort(
    (a, b) => a.position - b.position,
  )

  return {
    ...product,

    media: sortedMedia,

    relations,

    primaryMedia: sortedMedia[0] ?? null,
  }
}
