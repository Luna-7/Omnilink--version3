/**
 * Hero —— Theme System 核心展示组件（Electric Violet）。
 *
 * 纯展示：标题/副文案/最多两个行动点/可选配图，全部走 props。
 * 与商品、店铺、数据库、注册表完全无关（商品详情主视觉属于 #44 ProductHero）。
 * 视觉全部消费 --th-* 令牌。
 *
 * Server Component：无交互需求。
 */

import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export type HeroAction = {
  label: string
  href: string
}

type HeroProps = {
  title: string
  subtitle?: string
  primaryAction?: HeroAction
  secondaryAction?: HeroAction
  imageUrl?: string | null
  imageAlt?: string
}

const actionBase = cn(
  'inline-flex items-center justify-center rounded-[var(--th-radius-button)] px-5 py-2.5 text-sm font-semibold',
  'transition-colors [transition-duration:var(--th-motion-duration)] [transition-timing-function:var(--th-motion-easing)]'
)

export default function Hero({
  title,
  subtitle,
  primaryAction,
  secondaryAction,
  imageUrl,
  imageAlt,
}: HeroProps) {
  const hasImage = typeof imageUrl === 'string' && imageUrl.length > 0
  const hasActions = Boolean(primaryAction || secondaryAction)

  return (
    <section className="bg-[var(--th-color-background)] px-4 py-[calc(var(--th-spacing-section)/2)]">
      <div
        className={cn(
          'mx-auto max-w-[var(--th-spacing-container)]',
          hasImage
            ? 'grid items-center gap-10 lg:grid-cols-2 lg:gap-16'
            : 'flex flex-col items-center text-center'
        )}
      >
        {/* 文案区 */}
        <div className={cn(!hasImage && 'max-w-2xl')}>
          <h1 className="[font-family:var(--th-font-heading)] text-4xl [font-weight:var(--th-font-heading-weight)] leading-tight tracking-tight text-[var(--th-color-text)] sm:text-5xl">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-4 text-base leading-relaxed text-[var(--th-color-muted)] sm:text-lg">
              {subtitle}
            </p>
          )}

          {hasActions && (
            <div
              className={cn(
                'mt-8 flex flex-wrap gap-3',
                !hasImage && 'justify-center'
              )}
            >
              {primaryAction && (
                <Link
                  href={primaryAction.href}
                  className={cn(
                    actionBase,
                    'bg-[var(--th-color-primary)] text-white hover:bg-[var(--th-color-accent)]'
                  )}
                >
                  {primaryAction.label}
                </Link>
              )}
              {secondaryAction && (
                <Link
                  href={secondaryAction.href}
                  className={cn(
                    actionBase,
                    'border border-[var(--th-color-border)] text-[var(--th-color-text)] hover:border-[var(--th-color-primary)]/40 hover:text-[var(--th-color-primary)]'
                  )}
                >
                  {secondaryAction.label}
                </Link>
              )}
            </div>
          )}
        </div>

        {/* 配图区：仅在有图时渲染，无图不留空块 */}
        {hasImage && (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[var(--th-radius-card)] border border-[var(--th-color-border)] shadow-[var(--th-shadow-floating)]">
            <Image
              src={imageUrl}
              alt={imageAlt ?? title}
              fill
              unoptimized
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              priority
            />
          </div>
        )}
      </div>
    </section>
  )
}
