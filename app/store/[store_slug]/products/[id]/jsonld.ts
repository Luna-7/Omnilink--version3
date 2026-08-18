/**
 * Product JSON-LD —— 公开商品页的结构化数据（route-local helper）。
 *
 * 只基于 StorefrontProduct DTO 重建，不读 semantic_data / DB row。
 * 保留旧公开商品页已有的 JSON-LD 行为（Product + Offer），缺失字段省略而非伪造。
 */

import type { StorefrontProduct } from '@/lib/storefront/types'

export function buildProductJsonLd(
  product: StorefrontProduct
): Record<string, unknown> {
  const attributes = Object.entries(product.attributes)

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    ...(product.description ? { description: product.description } : {}),
    ...(product.imageUrl ? { image: product.imageUrl } : {}),
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability: 'https://schema.org/InStock',
    },
    ...(attributes.length > 0
      ? {
          additionalProperty: attributes.map(([name, value]) => ({
            '@type': 'PropertyValue',
            name,
            value,
          })),
        }
      : {}),
  }
}

/** 序列化为 <script> 安全内容（转义 `<` 防 script 逃逸）。 */
export function serializeJsonLd(jsonLd: Record<string, unknown>): string {
  return JSON.stringify(jsonLd).replace(/</g, '\\u003c')
}
