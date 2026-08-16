/**
 * ProductHero —— Theme System 核心展示组件（Electric Violet）。
 *
 * 商品详情页的主视觉展示区。唯一数据源是 `product`（StorefrontProduct）。
 * 不 fetch、不查库、不读 registry、不读路由参数、不自拼 URL（用 product.href / action.href）。
 * 视觉全部消费 --th-* 令牌（由 ThemeRoot 作用域提供），无硬编码主题值。
 *
 * 边界（严格）：
 *   - 与 Hero 无关：Hero 是首页营销首屏，ProductHero 是商品详情主视觉（P3.1）。
 *   - 不发明购买逻辑：无 cart/checkout/payment/inventory（P3.2）。
 *     action 仅来自 props（页面/模板显式传入 href），缺省不渲染交易按钮。
 *   - attributes / badges 只做 presentation，不读 semantic_data、不推导业务（P3.4/P3.5）。
 *
 * Server Component：无交互需求，不加 "use client"。
 */

import Image from 'next/image'
import Link from 'next/link'
import { ImageOff } from 'lucide-react'
import type { StorefrontProduct } from '@/lib/storefront/types'

/** 最小局部价格格式化（沿用 #42 惯例：货币码 + 两位小数），不建 currency 系统。 */
function formatPrice(price: number, currency: string): string {
  const amount = Number.isFinite(price)
    ? price.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : '0.00'
  return `${currency} ${amount}`
}

/** ProductHero 的主行动点。非交易型：纯展示导航，href 必须由调用方显式提供。 */
export type ProductHeroAction = {
  label: string
  href: string
}

type ProductHeroProps = {
  product: StorefrontProduct
  /** 可选主行动点。缺省不渲染（不伪造购买系统，P3.2）。 */
  action?: ProductHeroAction
}

export default function ProductHero({ product, action }: ProductHeroProps) {
  const attributes = Object.entries(product.attributes)
  const badges = product.badges ?? []

  return (
    <section className="bg-[var(--th-color-background)] px-4 py-[calc(var(--th-spacing-section)/2)]">
      <div className="mx-auto grid max-w-[var(--th-spacing-container)] items-start gap-10 lg:grid-cols-2 lg:gap-16">
        {/* 主图区：固定比例容器，无图优雅占位，绝不破图/塌陷 */}
        <div className="relative aspect-square w-full overflow-hidden rounded-[var(--th-radius-card)] border border-[var(--th-color-border)] bg-[var(--th-color-surface)] shadow-[var(--th-shadow-floating)]">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              unoptimized
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[var(--th-color-muted)]">
              <ImageOff size={32} strokeWidth={1.5} aria-hidden />
              <span className="sr-only">No image available</span>
            </div>
          )}

          {/* 徽章：仅在有数据时渲染（badge 推导属数据层，组件不发明，P3.5） */}
          {badges.length > 0 && (
            <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
              {badges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-[var(--th-radius-button)] bg-[var(--th-color-primary)] px-2 py-0.5 text-[11px] font-semibold text-white"
                >
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 信息区 */}
        <div className="flex flex-col">
          <h1 className="[font-family:var(--th-font-heading)] text-3xl [font-weight:var(--th-font-heading-weight)] leading-tight tracking-tight text-[var(--th-color-text)] sm:text-4xl">
            {product.name}
          </h1>

          <p className="mt-3 [font-family:var(--th-font-heading)] text-2xl font-semibold text-[var(--th-color-primary)]">
            {formatPrice(product.price, product.currency)}
          </p>

          {product.description && (
            <p className="mt-4 text-base leading-relaxed text-[var(--th-color-muted)]">
              {product.description}
            </p>
          )}

          {/* 属性：仅在有数据时渲染，逐条展示（不解释 schema，P3.4） */}
          {attributes.length > 0 && (
            <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              {attributes.map(([key, value]) => (
                <div
                  key={key}
                  className="flex flex-col gap-0.5 border-t border-[var(--th-color-border)] pt-2"
                >
                  <dt className="text-xs capitalize text-[var(--th-color-muted)]">
                    {key}
                  </dt>
                  <dd className="text-sm text-[var(--th-color-text)]">{value}</dd>
                </div>
              ))}
            </dl>
          )}

          {/* 主行动点：仅当调用方显式传入（非交易型，P3.2） */}
          {action && (
            <div className="mt-8">
              <Link
                href={action.href}
                className="inline-flex items-center justify-center rounded-[var(--th-radius-button)] bg-[var(--th-color-primary)] px-6 py-3 text-sm font-semibold text-white transition-colors [transition-duration:var(--th-motion-duration)] [transition-timing-function:var(--th-motion-easing)] hover:bg-[var(--th-color-accent)]"
              >
                {action.label}
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
