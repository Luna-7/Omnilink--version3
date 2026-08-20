/**
 * ProductCard —— Theme System 核心展示组件（Electric Violet · acrylic 变体）。
 *
 * 纯展示：唯一数据源是 `product`（StorefrontProduct）。
 * 不 fetch、不查库、不读 registry、不读路由参数、不自拼 URL（用 product.href）。
 * 视觉全部消费 --th-* 令牌（由 ThemeRoot 作用域提供），无硬编码主题值。
 *
 * Server Component：无交互需求，不加 "use client"。
 */

import Image from 'next/image'
import Link from 'next/link'
import { ImageOff } from 'lucide-react'
import type { StorefrontProduct } from '@/lib/storefront/types'
import { cn } from '@/lib/utils'

/** 最小局部价格格式化（沿用项目惯例：货币码 + 两位小数），不建 currency 系统。 */
function formatPrice(price: number, currency: string): string {
  const amount = Number.isFinite(price)
    ? price.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : '0.00'
  const symbol = currency === 'CNY' || currency === '¥' ? '¥' : '$'
  return `${symbol}${amount}`
}

type ProductCardProps = {
  product: StorefrontProduct
  /** 是否展示价格（编辑器 featured_products 的 showPrice 开关）。默认 true，向后兼容。 */
  showPrice?: boolean
}

export default function ProductCard({ product, showPrice = true }: ProductCardProps) {
  const attributes = Object.entries(product.attributes)
  const badges = product.badges ?? []

  return (
    <Link
      href={product.href}
      className={cn(
        'group block overflow-hidden',
        'rounded-[var(--th-radius-card)]',
        'border border-[var(--th-color-border)]',
        'bg-[var(--th-color-surface)]',
        'shadow-[var(--th-shadow-card)]',
        'transition-all [transition-duration:var(--th-motion-duration)] [transition-timing-function:var(--th-motion-easing)]',
        'hover:-translate-y-0.5 hover:border-[var(--th-color-primary)]/40 hover:shadow-[var(--th-shadow-floating)]'
      )}
    >
      {/* 图片区：固定比例容器，无图时优雅占位，绝不出现破图 */}
      <div className="relative aspect-square w-full overflow-hidden bg-[var(--th-color-surface)]">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            unoptimized
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform [transition-duration:var(--th-motion-duration)] [transition-timing-function:var(--th-motion-easing)] group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[var(--th-color-muted)]">
            <ImageOff size={28} strokeWidth={1.5} aria-hidden />
            <span className="sr-only">No image available</span>
          </div>
        )}

        {/* 徽章：仅在有数据时渲染（badge 推导属数据层，组件不发明） */}
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
      <div className="flex flex-col gap-1.5 p-4">
        <h3 className="line-clamp-2 [font-family:var(--th-font-heading)] text-sm [font-weight:var(--th-font-heading-weight)] leading-snug text-[var(--th-color-text)]">
          {product.name}
        </h3>

        {product.description && (
          <p className="line-clamp-1 text-xs text-[var(--th-color-muted)]">
            {product.description}
          </p>
        )}

        {/* 属性：仅在有数据时渲染，最多 3 枚 */}
        {attributes.length > 0 && (
          <div className="mt-0.5 flex flex-wrap gap-1">
            {attributes.slice(0, 3).map(([key, value]) => (
              <span
                key={key}
                className="rounded-[var(--th-radius-input)] border border-[var(--th-color-border)] px-1.5 py-0.5 text-[10px] text-[var(--th-color-muted)]"
              >
                {value}
              </span>
            ))}
          </div>
        )}

        {showPrice && (
          <p className="mt-1 [font-family:var(--th-font-heading)] text-sm font-semibold text-[var(--th-color-primary)]">
            {formatPrice(product.price, product.currency)}
          </p>
        )}
      </div>
    </Link>
  )
}
