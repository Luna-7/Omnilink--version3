/**
 * Homepage —— Theme System 固定模板（Template Composition Layer）。
 *
 * 职责仅限「编排」：决定哪些 Core Components 出现、顺序、以及哪些
 * Storefront DTO 数据传给哪个组件。页面 section 组合 = 本模板；
 * 商品/按钮视觉 = core/*；取数 = storefront service（route 层职责）；
 * 视觉规则 = themes（经 ThemeRoot 作用域注入）。
 *
 * 严格边界：
 *   - 不 fetch、不查库、不 import service/supabase/registry、不读 route params。
 *   - 不实现 ProductCard/按钮等组件视觉，不写 grid CSS，不格式化价格。
 *   - 不发明业务数据：collection/cta 缺省即不渲染对应区块。
 *   - Theme-agnostic：只消费 var(--th-*)，无主题 id 判断、无硬编码视觉值。
 *   - 静态页面结构：无 switch/block map/dynamic registry（不做 StoreRenderer v2）。
 *
 * Server Component：无交互需求，不加 "use client"。
 */

import type {
  StorefrontCollection,
  StorefrontProduct,
  StorefrontStore,
} from '@/lib/storefront/types'
import Navbar from '../core/Navbar'
import Hero from '../core/Hero'
import ProductGrid from '../core/ProductGrid'
import CTA from '../core/CTA'
import Footer from '../core/Footer'

/** 首页 Hero 内容（全部来自 route/preview 层 props，模板不发明文案）。 */
export type HomepageHeroContent = {
  title: string
  subtitle?: string
  imageUrl?: string | null
  imageAlt?: string
  primaryAction?: { label: string; href: string }
  secondaryAction?: { label: string; href: string }
}

/** 可选页尾 CTA 区块内容。 */
export type HomepageCtaContent = {
  title: string
  subtitle?: string
  action?: { label: string; href: string }
}

type HomepageProps = {
  store: StorefrontStore
  hero: HomepageHeroContent
  /** 精选商品（Storefront DTO）。空数组时展示 ProductGrid 空态。 */
  featuredProducts: StorefrontProduct[]
  /** 精选区块标题（页面结构文案）。 */
  featuredTitle?: string
  /** 可选集合区块（真实 DTO：id/title/products）。缺省或空集合不渲染。 */
  collection?: StorefrontCollection | null
  /** 可选页尾 CTA；缺省不渲染。 */
  cta?: HomepageCtaContent | null
}

/** 本模板私有的商品区块编排（标题 + ProductGrid），非可复用抽象。 */
function ProductsSection({
  title,
  products,
}: {
  title: string
  products: StorefrontProduct[]
}) {
  return (
    <section className="bg-[var(--th-color-background)] px-4 pb-[calc(var(--th-spacing-section)/2)]">
      <div className="mx-auto max-w-[var(--th-spacing-container)]">
        <h2 className="[font-family:var(--th-font-heading)] text-2xl [font-weight:var(--th-font-heading-weight)] tracking-tight text-[var(--th-color-text)] sm:text-3xl">
          {title}
        </h2>
        <div className="mt-8">
          <ProductGrid products={products} />
        </div>
      </div>
    </section>
  )
}

export default function Homepage({
  store,
  hero,
  featuredProducts,
  featuredTitle = 'Featured Products',
  collection,
  cta,
}: HomepageProps) {
  const hasCollection = Boolean(collection && collection.products.length > 0)

  return (
    <>
      <Navbar store={store} />

      <Hero
        title={hero.title}
        subtitle={hero.subtitle}
        primaryAction={hero.primaryAction}
        secondaryAction={hero.secondaryAction}
        imageUrl={hero.imageUrl}
        imageAlt={hero.imageAlt}
      />

      <ProductsSection title={featuredTitle} products={featuredProducts} />

      {hasCollection && collection && (
        <ProductsSection title={collection.title} products={collection.products} />
      )}

      {cta && <CTA title={cta.title} subtitle={cta.subtitle} action={cta.action} />}

      <Footer store={store} />
    </>
  )
}
