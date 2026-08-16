/**
 * Theme Preview —— Electric Violet（仅开发环境）。
 *
 * 用途：设计/开发验收。把 ThemeRoot + 三个真实 Template + mock Storefront DTO
 * 完整组合，验证主题系统的可视化与可迭代性。
 *
 * 边界：
 *   - 生产环境直接 notFound()（本页永不发布）。
 *   - 数据全部来自 ./mock-data（本地 mock，严格真实 DTO），不接 Supabase /
 *     service / 真实商家数据。
 *   - 不 import registry（themeId 只交给 ThemeRoot）；不做主题判断分支；
 *     不引入 StoreRenderer / legacy blocks；不写任何预览专属全局 CSS。
 *   - 页面只提供数据 + 预览分隔条（preview-only chrome）；页面结构编排
 *     完全由真实 Template 负责，此处不复制任何 Template JSX。
 *
 * Server Component：无交互需求。
 */

import { notFound } from 'next/navigation'
import ThemeRoot from '@/components/theme/ThemeRoot'
import Homepage from '@/components/theme/templates/Homepage'
import ProductPage from '@/components/theme/templates/ProductPage'
import CollectionPage from '@/components/theme/templates/CollectionPage'
import {
  previewCta,
  previewCollection,
  previewHero,
  previewProduct,
  previewProductAction,
  previewProducts,
  previewRelatedProducts,
  previewStore,
} from './mock-data'

export const metadata = {
  title: 'Theme Preview — Electric Violet',
  robots: 'noindex, nofollow',
}

/** 预览专属分隔条：仅开发预览 chrome，用 Tailwind 基础中性色，不建设计系统。 */
function PreviewDivider({ label }: { label: string }) {
  return (
    <div className="border-y border-dashed border-neutral-300 bg-neutral-100 px-4 py-2 text-center font-mono text-[11px] uppercase tracking-[0.3em] text-neutral-500">
      {label}
    </div>
  )
}

export default function ElectricVioletPreviewPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }

  return (
    <main className="bg-white">
      <PreviewDivider label="Electric Violet — Homepage" />
      <ThemeRoot themeId="electric-violet">
        <Homepage
          store={previewStore}
          hero={previewHero}
          featuredProducts={previewProducts}
          collection={previewCollection}
          cta={previewCta}
        />
      </ThemeRoot>

      <PreviewDivider label="Electric Violet — Product Page" />
      <ThemeRoot themeId="electric-violet">
        <ProductPage
          store={previewStore}
          product={previewProduct}
          relatedProducts={previewRelatedProducts}
          action={previewProductAction}
          cta={previewCta}
        />
      </ThemeRoot>

      <PreviewDivider label="Electric Violet — Collection Page" />
      <ThemeRoot themeId="electric-violet">
        <CollectionPage
          store={previewStore}
          collection={previewCollection}
          cta={previewCta}
        />
      </ThemeRoot>
    </main>
  )
}
