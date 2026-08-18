/**
 * MobileMenu —— Navbar 的移动端导航折叠岛（本主题系统唯一 client island）。
 *
 * 仅包含 hamburger 开合所需的最小 client state；桌面端结构与样式
 * 全部留在 Server Component Navbar 中。
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import type { NavItem, NavbarCta } from './Navbar'

type MobileMenuProps = {
  navItems: NavItem[]
  cta?: NavbarCta
}

export default function MobileMenu({ navItems, cta }: MobileMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-[var(--th-radius-button)] border border-[var(--th-color-border)] text-[var(--th-color-text)] transition-colors [transition-duration:var(--th-motion-duration)] [transition-timing-function:var(--th-motion-easing)] hover:border-[var(--th-color-primary)]/40"
      >
        {open ? <X size={16} /> : <Menu size={16} />}
      </button>

      {open && (
        <div
          id="mobile-nav-panel"
          className="absolute inset-x-0 top-full mt-2 flex flex-col gap-1 rounded-[var(--th-radius-card)] border border-[var(--th-color-border)] bg-[var(--th-color-surface)]/95 p-2 shadow-[var(--th-shadow-floating)] backdrop-blur-md"
        >
          {navItems.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-[var(--th-radius-button)] px-3 py-2 text-sm text-[var(--th-color-muted)] transition-colors [transition-duration:var(--th-motion-duration)] [transition-timing-function:var(--th-motion-easing)] hover:bg-[var(--th-color-primary)]/8 hover:text-[var(--th-color-text)]"
            >
              {item.label}
            </Link>
          ))}
          {cta && (
            <Link
              href={cta.href}
              onClick={() => setOpen(false)}
              className="mt-1 rounded-[var(--th-radius-button)] bg-[var(--th-color-primary)] px-3 py-2 text-center text-sm font-semibold text-white transition-colors [transition-duration:var(--th-motion-duration)] [transition-timing-function:var(--th-motion-easing)] hover:bg-[var(--th-color-accent)]"
            >
              {cta.label}
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
