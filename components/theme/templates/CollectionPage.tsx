/**
 * CollectionPage —— Theme System 固定模板（Template Composition Layer）。
 *
 * 集合页结构编排：Navbar → Collection Header → ProductGrid → CTA → Footer。
 *
 * Collection header 说明（P9）：真实 StorefrontCollection DTO 仅
 * { id, title, products } —— 无 description 字段。header 因此只做
 * 最小 JSX（标题），不伪造描述文案；商品来自 collection.products，
 * 不另建 products 数据通道。该 header 是本模板私有的最小呈现，
 * 若未来 DTO/设计扩展再评估是否抽组件。
 *
 * 严格边界：
 *   - 不 fetch、不查库、不 import service/supabase/registry、不读 route params。
 *   - Theme-agnostic：只消费 var(--th-*)。
 *   - 静态页面结构：无 switch/block map/dynamic registry。
 *
 * Server Component：无交互需求，不加 "use client"。
 */

import type { StorefrontCollection, StorefrontStore } from '@/lib/storefront/types'
import Navbar from '../core/Navbar'
import ProductGrid from '../core/ProductGrid'
import CTA from '../core/CTA'
import Footer from '../core/Footer'

/** 可选页尾 CTA 区块内容。 */
export type CollectionPageCtaContent = {
  title: string
  subtitle?: string
  action?: { label: string; href: string }
}

type CollectionPageProps = {
  store: StorefrontStore
  /** 集合（真实 DTO：id/title/products；products 即本页商品）。 */
  collection: StorefrontCollection
  /** 可选页尾 CTA；缺省不渲染。 */
  cta?: CollectionPageCtaContent | null
}

export default function CollectionPage({
  store,
  collection,
  cta,
}: CollectionPageProps) {
  return (
    <>
      <Navbar store={store} />

      {/* Collection header：最小 JSX（DTO 无 description 字段） */}
      <section className="bg-[var(--th-color-background)] px-4 pt-[calc(var(--th-spacing-section)/2)]">
        <div className="mx-auto max-w-[var(--th-spacing-container)]">
          <h1 className="[font-family:var(--th-font-heading)] text-3xl [font-weight:var(--th-font-heading-weight)] tracking-tight text-[var(--th-color-text)] sm:text-4xl">
            {collection.title}
          </h1>
        </div>
      </section>

      <section className="bg-[var(--th-color-background)] px-4 py-[calc(var(--th-spacing-section)/2)]">
        <div className="mx-auto max-w-[var(--th-spacing-container)]">
          <ProductGrid products={collection.products} />
        </div>
      </section>

      {cta && <CTA title={cta.title} subtitle={cta.subtitle} action={cta.action} />}

      <Footer store={store} />
    </>
  )
}
