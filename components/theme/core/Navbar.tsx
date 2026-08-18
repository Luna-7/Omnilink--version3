/**
 * Navbar —— Theme System 核心展示组件（Electric Violet · floating 变体）。
 *
 * store 驱动的品牌区 + props 驱动的导航/CTA。不鉴权、不查库、不读 registry。
 * 视觉全部消费 --th-* 令牌；移动端折叠隔离到 MobileMenu（唯一 client island）。
 *
 * Server Component。
 */

import Image from 'next/image'
import Link from 'next/link'
import type { StorefrontStore } from '@/lib/storefront/types'
import MobileMenu from './MobileMenu'

export type NavItem = {
  label: string
  href: string
}

export type NavbarCta = {
  label: string
  href: string
}

type NavbarProps = {
  store: StorefrontStore
  /** 缺省仅「首页」。真实导航由 Template/Route 层传入。 */
  navItems?: NavItem[]
  /** 缺省不渲染 CTA（组件不发明页面结构）。 */
  cta?: NavbarCta
}

export default function Navbar({ store, navItems, cta }: NavbarProps) {
  const items: NavItem[] = navItems ?? [
    { label: 'Home', href: `/store/${store.slug}` },
  ]

  return (
    <header className="sticky top-4 z-40 px-4">
      {/* floating 变体：悬浮胶囊条（surface + blur + border + floating shadow） */}
      <div className="relative mx-auto flex h-14 max-w-[var(--th-spacing-container)] items-center justify-between gap-4 rounded-[var(--th-radius-card)] border border-[var(--th-color-border)] bg-[var(--th-color-surface)]/80 px-4 shadow-[var(--th-shadow-floating)] backdrop-blur-md">
        {/* 品牌区 */}
        <Link
          href={`/store/${store.slug}`}
          className="flex min-w-0 items-center gap-2.5"
        >
          {store.logoUrl ? (
            <Image
              src={store.logoUrl}
              alt={store.name}
              width={28}
              height={28}
              unoptimized
              className="h-7 w-7 rounded-[var(--th-radius-input)] object-cover"
            />
          ) : (
            <span
              aria-hidden
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--th-radius-input)] bg-[var(--th-color-primary)] [font-family:var(--th-font-heading)] text-xs font-bold text-white"
            >
              {store.name.trim().charAt(0).toUpperCase() || 'S'}
            </span>
          )}
          <span className="truncate [font-family:var(--th-font-heading)] text-sm [font-weight:var(--th-font-heading-weight)] text-[var(--th-color-text)]">
            {store.name}
          </span>
        </Link>

        {/* 桌面端导航 */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {items.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              className="rounded-[var(--th-radius-button)] px-3 py-1.5 text-sm text-[var(--th-color-muted)] transition-colors [transition-duration:var(--th-motion-duration)] [transition-timing-function:var(--th-motion-easing)] hover:text-[var(--th-color-text)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* 桌面端 CTA（仅在调用方提供时渲染） */}
        {cta && (
          <Link
            href={cta.href}
            className="hidden shrink-0 rounded-[var(--th-radius-button)] bg-[var(--th-color-primary)] px-4 py-1.5 text-sm font-semibold text-white transition-colors [transition-duration:var(--th-motion-duration)] [transition-timing-function:var(--th-motion-easing)] hover:bg-[var(--th-color-accent)] md:inline-flex"
          >
            {cta.label}
          </Link>
        )}

        {/* 移动端折叠岛 */}
        <MobileMenu navItems={items} cta={cta} />
      </div>
    </header>
  )
}
