/**
 * 公开商品页 —— /store/[store_slug]/products/[id]
 *
 * 架构：Route → Storefront Service → Storefront DTO → ThemeRoot → Template → Core。
 * Route 只做：参数解包 → service 取数 → notFound 守卫 → JSON-LD（基于 DTO，
 * 保留旧页行为）→ ThemeRoot+ProductPage 渲染。
 * 不访问 Supabase、不查表、不解析 semantic_data、不重算商品 URL、不做主题策略。
 * 跨店铺商品由 service 层 store_id 过滤阻止（返回 null → notFound）。
 */

import { notFound } from 'next/navigation'
import ThemeRoot from '@/components/theme/ThemeRoot'
import ProductPage from '@/components/theme/templates/ProductPage'
import {
  getPublishedStore,
  getRelatedProducts,
  getStorefrontProduct,
} from '@/lib/storefront/service'
import { buildProductJsonLd, serializeJsonLd } from './jsonld'

export default async function PublicProductPage({
  params,
}: {
  params: Promise<{ store_slug: string; id: string }>
}) {
  const { store_slug, id } = await params

  const store = await getPublishedStore(store_slug)
  if (!store) {
    notFound()
  }

  const product = await getStorefrontProduct(store, id)
  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedProducts(store, id)
  const jsonLd = buildProductJsonLd(product)

  return (
    <ThemeRoot themeId={store.themeId}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <ProductPage
        store={store}
        product={product}
        relatedProducts={relatedProducts}
      />
    </ThemeRoot>
  )
}
