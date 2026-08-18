/**
 * ProductPage —— Theme System 固定模板（Template Composition Layer）。
 *
 * 商品详情页结构编排：Navbar → ProductHero → Related Products → CTA → Footer。
 * 只组合 Core Components 与 Storefront DTO；商品视觉/价格/URL 全由
 * core/* 与 DTO 负责（不读 semantic_data、不拼 href、不格式化 price、
 * 不生成 badges）。
 *
 * 严格边界：
 *   - 不 fetch、不查库、不 import service/supabase/registry、不读 route params。
 *   - Theme-agnostic：只消费 var(--th-*)。
 *   - 静态页面结构：无 switch/block map/dynamic registry。
 *
 * Server Component：无交互需求，不加 "use client"。
 */

import type { StorefrontProduct, StorefrontStore } from '@/lib/storefront/types'
import Navbar from '../core/Navbar'
import ProductHero from '../core/ProductHero'
import ProductGrid from '../core/ProductGrid'
import CTA from '../core/CTA'
import Footer from '../core/Footer'

/** 可选页尾 CTA 区块内容。 */
export type ProductPageCtaContent = {
  title: string
  subtitle?: string
  action?: { label: string; href: string }
}

type ProductPageProps = {
  store: StorefrontStore
  product: StorefrontProduct
  /** 相关商品（可选）。缺省或空数组不渲染相关区块。 */
  relatedProducts?: StorefrontProduct[]
  /** 相关区块标题（页面结构文案）。 */
  relatedTitle?: string
  /** ProductHero 非交易型主行动点（可选，href 由 route/preview 层显式提供）。 */
  action?: { label: string; href: string }
  /** 可选页尾 CTA；缺省不渲染。 */
  cta?: ProductPageCtaContent | null
}

export default function ProductPage({
  store,
  product,
  relatedProducts,
  relatedTitle = 'Related Products',
  action,
  cta,
}: ProductPageProps) {
  const hasRelated = Boolean(relatedProducts && relatedProducts.length > 0)

  return (
    <>
      <Navbar store={store} />

      <ProductHero product={product} action={action} />

      {hasRelated && relatedProducts && (
        <section className="bg-[var(--th-color-background)] px-4 pb-[calc(var(--th-spacing-section)/2)]">
          <div className="mx-auto max-w-[var(--th-spacing-container)]">
            <h2 className="[font-family:var(--th-font-heading)] text-2xl [font-weight:var(--th-font-heading-weight)] tracking-tight text-[var(--th-color-text)] sm:text-3xl">
              {relatedTitle}
            </h2>
            <div className="mt-8">
              <ProductGrid products={relatedProducts} />
            </div>
          </div>
        </section>
      )}

      {cta && <CTA title={cta.title} subtitle={cta.subtitle} action={cta.action} />}

      <Footer store={store} />
    </>
  )
}
