/**
 * 公开店铺首页 —— /store/[store_slug]
 *
 * 架构（唯一渲染闭环，与编辑器预览共享同一渲染器）：
 *   Route
 *     → getPublicStorefront(slug)   // store_settings.theme_config → canonical StorefrontSchema
 *     → notFound 守卫（未发布/店铺非 active）
 *     → getStorefrontProducts(store) // 真实商品白名单 DTO
 *     → ThemeRoot(theme.themeId)     // 现有 Theme System 注入 --th-*
 *       → 内联 overrides（accent/radius）
 *         → DynamicSectionRenderer × sections // 与 Editor Preview 共用
 *
 * Route 不访问 Supabase、不解析 semantic_data、不拼商品 URL、不做主题策略。
 * store_pages 仅作 legacy 发布位兜底（service 层处理），不是内容事实源。
 */

import type { CSSProperties } from 'react'
import { notFound } from 'next/navigation'
import ThemeRoot from '@/components/theme/ThemeRoot'
import DynamicSectionRenderer from '@/components/storefront/DynamicSectionRenderer'
import { getPublicStorefront, getStorefrontProducts } from '@/lib/storefront/service'
import { storefrontThemeOverrides } from '@/lib/storefront/theme-overrides'

export default async function PublicStorePage({
  params,
}: {
  params: Promise<{ store_slug: string }>
}) {
  const { store_slug } = await params

  const data = await getPublicStorefront(store_slug)
  if (!data) {
    notFound()
  }

  const { store, schema } = data
  const products = await getStorefrontProducts(store)
  const overrides = storefrontThemeOverrides(schema.theme)
  const orderedSections = [...schema.sections].sort((a, b) => a.order - b.order)

  return (
    <ThemeRoot themeId={schema.theme.themeId}>
      <div
        className="min-h-screen bg-[var(--th-color-background)] text-[var(--th-color-text)] [font-family:var(--th-font-body)]"
        style={overrides as CSSProperties}
      >
        {orderedSections.map((section) => (
          <DynamicSectionRenderer
            key={section.id}
            section={section}
            storeSlug={store.slug}
            products={products}
          />
        ))}
      </div>
    </ThemeRoot>
  )
}
