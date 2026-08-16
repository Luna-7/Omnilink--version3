/**
 * 公开店铺首页 —— /store/[store_slug]
 *
 * 架构：Route → Storefront Service → Storefront DTO → ThemeRoot → Template → Core。
 * Route 只做：参数解包 → service 取数 → notFound 守卫 → ThemeRoot+Template 渲染。
 * 不访问 Supabase、不查表、不解析 semantic_data、不拼商品 URL、不做主题策略
 * （themeId 透传给 ThemeRoot，未知/空 id 由 registry 回退）。
 *
 * Homepage 内容映射（最小可用，不伪造商业内容）：
 *   hero.title    ← store.name
 *   hero.subtitle ← store.description（缺省则省略）
 *   featured      ← getStorefrontProducts(store)
 *   collection/cta：当前无真实数据来源 → 不提供。
 */

import { notFound } from 'next/navigation'
import ThemeRoot from '@/components/theme/ThemeRoot'
import Homepage from '@/components/theme/templates/Homepage'
import { getPublishedStore, getStorefrontProducts } from '@/lib/storefront/service'

export default async function PublicStorePage({
  params,
}: {
  params: Promise<{ store_slug: string }>
}) {
  const { store_slug } = await params

  const store = await getPublishedStore(store_slug)
  if (!store) {
    notFound()
  }

  const products = await getStorefrontProducts(store)

  return (
    <ThemeRoot themeId={store.themeId}>
      <Homepage
        store={store}
        hero={{
          title: store.name,
          subtitle: store.description ?? undefined,
        }}
        featuredProducts={products}
      />
    </ThemeRoot>
  )
}
