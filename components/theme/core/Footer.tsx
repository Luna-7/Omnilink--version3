/**
 * Footer —— Theme System 核心展示组件（Electric Violet）。
 *
 * 纯展示：店铺身份（logo/名称）+ 导航链接 + 版权。不查库、不读 Supabase、
 * 不自动发现路由、不读 registry、不做 sitemap/SEO（P3 C / P3.8）。
 * 链接一律来自 props；缺省仅「首页」（最多 store homepage，不发明大量导航）。
 * 视觉全部消费 --th-* 令牌。
 *
 * Server Component：无交互需求，不加 "use client"。
 */

import Image from 'next/image'
import Link from 'next/link'
import type { StorefrontStore } from '@/lib/storefront/types'

export type FooterLink = {
  label: string
  href: string
}

type FooterProps = {
  store: StorefrontStore
  /** 缺省仅「首页」链接（不自动发现路由，P3.8）。 */
  links?: FooterLink[]
}

export default function Footer({ store, links }: FooterProps) {
  const navLinks: FooterLink[] = links ?? [
    { label: 'Home', href: `/store/${store.slug}` },
  ]
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-[var(--th-color-border)] bg-[var(--th-color-background)] px-4 py-10">
      <div className="mx-auto flex max-w-[var(--th-spacing-container)] flex-col gap-6 md:flex-row md:items-center md:justify-between">
        {/* 品牌区：logo 缺失时回退首字母圆标（与 Navbar 同语言） */}
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

        {/* 导航链接（props 驱动） */}
        <nav className="flex flex-wrap items-center gap-1" aria-label="Footer">
          {navLinks.map((link) => (
            <Link
              key={link.href + link.label}
              href={link.href}
              className="rounded-[var(--th-radius-button)] px-3 py-1.5 text-sm text-[var(--th-color-muted)] transition-colors [transition-duration:var(--th-motion-duration)] [transition-timing-function:var(--th-motion-easing)] hover:text-[var(--th-color-text)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* 基础版权 / 身份 */}
      <div className="mx-auto mt-6 max-w-[var(--th-spacing-container)] text-xs text-[var(--th-color-muted)]">
        © {year} {store.name}
      </div>
    </footer>
  )
}
