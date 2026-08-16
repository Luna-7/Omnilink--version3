'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/context/LanguageContext'
import { LanguageToggle } from '@/components/dashboard/LanguageToggle'
import { logoutAction } from '@/app/actions/auth'
import {
  LayoutGrid,
  Package,
  Bot,
  Brain,
  Globe,
  Store,
  Blocks,
  User,
  Settings,
  LogOut,
  Search,
  Bell,
  ChevronDown,
} from 'lucide-react'

export type Profile = {
  id: string
  email: string
  name: string
  avatarUrl: string | null
}

type NavItemKey =
  | 'dashboard'
  | 'products'
  | 'agentApi'
  | 'knowledge'
  | 'storefront'
  | 'store'
  | 'plugins'
  | 'account'
  | 'settings'

type NavItem = {
  key: NavItemKey
  href: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  match: (pathname: string) => boolean
}

/* 严格对应 app/dashboard 目录下的同名模块，内容与链接完全保留 */
const NAV_ITEMS: NavItem[] = [
  {
    key: 'dashboard',
    href: '/dashboard',
    icon: LayoutGrid,
    match: (p) => p === '/dashboard',
  },
  {
    key: 'products',
    href: '/dashboard/products',
    icon: Package,
    match: (p) => p.startsWith('/dashboard/products'),
  },
  {
    key: 'agentApi',
    href: '/dashboard/agent-api',
    icon: Bot,
    match: (p) => p.startsWith('/dashboard/agent-api'),
  },
  {
    key: 'knowledge',
    href: '/dashboard/knowledge',
    icon: Brain,
    match: (p) => p.startsWith('/dashboard/knowledge'),
  },
  {
    key: 'storefront',
    href: '/dashboard/storefront',
    icon: Globe,
    match: (p) => p.startsWith('/dashboard/storefront'),
  },
  {
    key: 'store',
    href: '/dashboard/store',
    icon: Store,
    match: (p) => p.startsWith('/dashboard/store') && !p.startsWith('/dashboard/storefront'),
  },
  {
    key: 'plugins',
    href: '/dashboard/plugins',
    icon: Blocks,
    match: (p) => p.startsWith('/dashboard/plugins'),
  },
]

const BOTTOM_ITEMS: NavItem[] = [
  {
    key: 'account',
    href: '/dashboard/account',
    icon: User,
    match: (p) => p.startsWith('/dashboard/account'),
  },
  {
    key: 'settings',
    href: '/dashboard/settings',
    icon: Settings,
    match: (p) => p.startsWith('/dashboard/settings'),
  },
]

export default function OmnilinkLayout({
  children,
  profile,
}: {
  children: React.ReactNode
  profile: Profile
}) {
  const pathname = usePathname()
  const { t, isZh } = useLanguage()

  const currentItem =
    NAV_ITEMS.find((item) => item.match(pathname)) ||
    BOTTOM_ITEMS.find((item) => item.match(pathname)) ||
    NAV_ITEMS[0]

  // Real user from the auth session — no fake names or mock avatars.
  const displayName = profile.name || profile.email || 'Merchant'
  const initials = displayName
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="min-h-screen w-full bg-[#F4F5F7] text-[#111827] antialiased flex flex-col p-3 sm:p-5 lg:p-6 gap-5">
      {/* ============================================================
          顶部全局主导航栏 (Top Navbar as shown in reference design)
          Logo + Center Pill Nav Items + Right Controls (Search, Bell, User Profile)
          ============================================================ */}
      <header className="w-full bg-white rounded-2xl sm:rounded-full px-4 sm:px-6 py-3 border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-wrap items-center justify-between gap-3">
        {/* 左侧：品牌 Logo (Black stripe brand symbol + Rexora/Omnilink) */}
        <Link href="/dashboard" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#111827] flex flex-col justify-center items-center gap-[3px] px-1.5 shadow-sm group-hover:scale-105 transition-transform">
            <div className="w-full h-[2.5px] bg-[#edbc40] rounded-full" />
            <div className="w-3/4 self-start h-[2.5px] bg-white rounded-full" />
            <div className="w-full h-[2.5px] bg-white rounded-full" />
          </div>
          <span className="font-heading font-bold text-lg tracking-tight text-[#111827]">
            Omnilink
          </span>
        </Link>

        {/* 中间：顶部胶囊式导航标签栏 (Top Navigation Pills with Neon Lime Active Pill) */}
        <nav className="hidden md:flex items-center gap-1 bg-[#F4F5F7] p-1 rounded-full border border-[#E5E7EB]">
          {NAV_ITEMS.map((item) => {
            const active = item.match(pathname)
            const label = t.nav[item.key]
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  'px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 whitespace-nowrap',
                  active
                    ? 'bg-[#edbc40] text-[#111827] shadow-sm'
                    : 'text-[#6B7280] hover:text-[#111827] hover:bg-white/60'
                )}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        {/* 右侧：操作区 (Search + Language + Notifications + User Avatar Pill) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* 搜索框 */}
          <div className="relative hidden xl:flex items-center">
            <input
              type="text"
              placeholder={t.nav.searchPlaceholder}
              className="h-9 w-40 lg:w-48 pl-3.5 pr-8 rounded-full bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#111827] transition-all"
            />
            <Search size={13} className="absolute right-3 text-[#9CA3AF]" />
          </div>

          {/* 语言切换 */}
          <LanguageToggle className="py-1 px-2.5 text-[11px] rounded-full border-[#E5E7EB]" />

          {/* 通知按钮 */}
          <button
            type="button"
            className="w-9 h-9 rounded-full bg-white border border-[#E5E7EB] hover:bg-[#F4F5F7] flex items-center justify-center text-[#111827] transition-all shadow-sm cursor-pointer"
            aria-label="Notifications"
          >
            <Bell size={15} />
          </button>

          {/* 用户信息胶囊 (Avatar + Name + Email + Dropdown Chevron) */}
          <Link
            href="/dashboard/account"
            className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-white border border-[#E5E7EB] hover:border-[#D1D5DB] transition-all shadow-sm cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full overflow-hidden bg-[#E5E7EB] relative shrink-0 flex items-center justify-center text-[10px] font-semibold text-[#6B7280]">
              {profile.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt={displayName}
                  width={28}
                  height={28}
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span aria-hidden>{initials || 'M'}</span>
              )}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-[#111827] leading-none">
                {displayName}
              </span>
              <span className="text-[10px] text-[#9CA3AF] leading-tight font-medium truncate max-w-[140px]">
                {profile.email}
              </span>
            </div>
            <ChevronDown size={12} className="text-[#9CA3AF]" />
          </Link>
        </div>
      </header>

      {/* ============================================================
          主工作区：左侧悬浮快捷侧边栏 + 右侧主内容卡片区
          ============================================================ */}
      <div className="flex-1 flex flex-col lg:flex-row gap-5">
        {/* 左侧悬浮胶囊侧边栏 (保持侧边栏所有内容与链接完整，风格与新UI融合) */}
        <aside className="hidden lg:flex flex-col items-center justify-between w-[64px] bg-white rounded-[24px] py-4 px-1.5 border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.02)] shrink-0 sticky top-5 h-[calc(100vh-100px)] z-30">
          {/* 上半部分：各模块核心图标 */}
          <div className="flex flex-col items-center gap-2 w-full">
            {NAV_ITEMS.map((item) => {
              const active = item.match(pathname)
              const Icon = item.icon
              const label = t.nav[item.key]
              return (
                <div key={item.key} className="relative group">
                  <Link
                    href={item.href}
                    aria-label={label}
                    className={cn(
                      'w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-150',
                      active
                        ? 'bg-[#111827] text-[#edbc40] shadow-sm'
                        : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F4F5F7]'
                    )}
                  >
                    <Icon size={18} />
                  </Link>

                  {/* 悬浮展示对应模块名 Tooltip */}
                  <div className="absolute left-[54px] top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap px-2.5 py-1 rounded-md bg-[#111827] text-white text-[11px] font-medium shadow-md">
                    {label}
                  </div>
                </div>
              )
            })}
          </div>

          {/* 下半部分：账户、设置与退出 */}
          <div className="flex flex-col items-center gap-2 w-full pt-2 border-t border-[#E5E7EB]">
            {BOTTOM_ITEMS.map((item) => {
              const active = item.match(pathname)
              const Icon = item.icon
              const label = t.nav[item.key]
              return (
                <div key={item.key} className="relative group">
                  <Link
                    href={item.href}
                    aria-label={label}
                    className={cn(
                      'w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-150',
                      active
                        ? 'bg-[#111827] text-[#edbc40] shadow-sm'
                        : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F4F5F7]'
                    )}
                  >
                    <Icon size={18} />
                  </Link>
                  <div className="absolute left-[54px] top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap px-2.5 py-1 rounded-md bg-[#111827] text-white text-[11px] font-medium shadow-md">
                    {label}
                  </div>
                </div>
              )
            })}

            <form action={logoutAction}>
              <button
                type="submit"
                aria-label={t.nav.logout}
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#9CA3AF] hover:text-[#e28c33] hover:bg-[#FDF3D7] transition-all cursor-pointer"
              >
                <LogOut size={17} />
              </button>
            </form>
          </div>
        </aside>

        {/* 移动端导航抽屉 */}
        <div className="flex md:hidden flex-wrap items-center justify-center gap-1.5 p-2 bg-white rounded-2xl border border-[#E5E7EB]">
          {NAV_ITEMS.map((item) => {
            const active = item.match(pathname)
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-all',
                  active ? 'bg-[#edbc40] text-[#111827] font-semibold' : 'bg-[#F4F5F7] text-[#6B7280]'
                )}
              >
                {t.nav[item.key]}
              </Link>
            )
          })}
        </div>

        {/* 右侧主视图区 */}
        <main className="flex-1 w-full min-w-0">
          <div key={pathname} className="animate-in fade-in duration-200">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}