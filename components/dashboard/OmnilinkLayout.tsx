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
  Blocks,
  User,
  Settings,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  Workflow,
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
    match: (p) => p.startsWith('/dashboard/storefront') || p.startsWith('/dashboard/store'),
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
    <div className="min-h-screen w-full crextio-canvas text-[#111827] antialiased flex flex-col p-3 sm:p-5 lg:p-6 gap-5">
      {/* ============================================================
          顶部全局主导航栏 (Minimalist Translucent Top Navbar)
          Logo + Center Pill Nav Items + Right Controls (Search, Bell, User Profile)
          ============================================================ */}
      <header className="w-full bg-white/85 backdrop-blur-2xl rounded-2xl sm:rounded-full px-4 sm:px-6 py-2.5 border border-white/90 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-wrap items-center justify-between gap-3 sticky top-3 z-40">
        {/* 左侧：品牌 Logo (Omnilink Product Icon & Title) */}
        <Link href="/dashboard" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-8.5 h-8.5 rounded-xl bg-[#111827] text-white border border-gray-800 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#FB7185]/30 via-transparent to-[#38BDF8]/30" />
            <Workflow size={17} className="text-[#FB7185] relative z-10" />
          </div>
          <span className="font-heading font-bold text-base sm:text-lg tracking-tight text-[#111827]">
            Omnilink
          </span>
        </Link>

        {/* 中间：顶部胶囊式导航标签栏 (Top Navigation Pills with Theme Color Active Pill) */}
        <nav className="hidden md:flex items-center gap-1 bg-[#EBECEF]/60 p-1 rounded-full border border-gray-200/50 backdrop-blur-md">
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
                    ? 'bg-[#FB7185] text-white shadow-xs'
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
              className="h-8.5 w-36 lg:w-44 pl-3.5 pr-8 rounded-full bg-[#F3F4F8] border border-gray-200/70 text-xs text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#111827] transition-all"
            />
            <Search size={13} className="absolute right-3 text-[#9CA3AF]" />
          </div>

          {/* 语言切换 */}
          <LanguageToggle className="py-1 px-2.5 text-[11px] rounded-full border-gray-200/80 bg-white/90" />

          {/* 通知按钮 (带有红/珊瑚色通知微标) */}
          <button
            type="button"
            className="w-8.5 h-8.5 rounded-full bg-white border border-gray-200/70 hover:bg-[#F3F4F8] flex items-center justify-center text-[#111827] transition-all shadow-xs relative cursor-pointer"
            aria-label="Notifications"
          >
            <Bell size={14} />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#FF4D6D] text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
              2
            </span>
          </button>

          {/* 用户信息胶囊 (Avatar + Name) */}
          <Link
            href="/dashboard/account"
            className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-white border border-gray-200/70 hover:border-gray-300 transition-all shadow-xs cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-tr from-[#FED7AA] to-[#F472B6] relative shrink-0 flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
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
            </div>
            <ChevronDown size={11} className="text-[#9CA3AF]" />
          </Link>
        </div>
      </header>

      {/* ============================================================
          主工作区：左侧悬浮小巧侧边栏 + 右侧主内容卡片区
          ============================================================ */}
      <div className="flex-1 flex flex-col lg:flex-row gap-5">
        {/* 左侧悬浮胶囊侧边栏 (小巧玲珑极简设计) */}
        <aside className="hidden lg:flex flex-col items-center justify-between w-[58px] bg-white/85 backdrop-blur-2xl rounded-[30px] py-4 px-1.5 border border-white/90 shadow-[0_10px_35px_rgba(0,0,0,0.035)] shrink-0 sticky top-20 h-[calc(100vh-105px)] z-30">
          {/* 上半部分：各模块核心图标 */}
          <div className="flex flex-col items-center gap-2.5 w-full">
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
                      'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150',
                      active
                        ? 'bg-[#FB7185] text-white shadow-md scale-105'
                        : 'text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F8]'
                    )}
                  >
                    <Icon size={17} />
                  </Link>

                  {/* 悬浮展示对应模块名 Tooltip */}
                  <div className="absolute left-[52px] top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap px-2.5 py-1 rounded-full bg-[#FB7185] text-white text-[11px] font-medium shadow-md">
                    {label}
                  </div>
                </div>
              )
            })}
          </div>

          {/* 下半部分：账户、设置与退出 */}
          <div className="flex flex-col items-center gap-2.5 w-full pt-2.5 border-t border-gray-100">
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
                      'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150',
                      active
                        ? 'bg-[#FB7185] text-white shadow-md scale-105'
                        : 'text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F8]'
                    )}
                  >
                    <Icon size={17} />
                  </Link>
                  <div className="absolute left-[52px] top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap px-2.5 py-1 rounded-full bg-[#FB7185] text-white text-[11px] font-medium shadow-md">
                    {label}
                  </div>
                </div>
              )
            })}

            <form action={logoutAction}>
              <button
                type="submit"
                aria-label={t.nav.logout}
                className="w-10 h-10 rounded-full flex items-center justify-center text-[#9CA3AF] hover:text-[#FF4D6D] hover:bg-rose-50 transition-all cursor-pointer"
              >
                <LogOut size={16} />
              </button>
            </form>
          </div>
        </aside>

        {/* 移动端导航抽屉 */}
        <div className="flex md:hidden flex-wrap items-center justify-center gap-1.5 p-2 bg-white/90 backdrop-blur-xl rounded-2xl border border-white/80 shadow-xs">
          {NAV_ITEMS.map((item) => {
            const active = item.match(pathname)
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-all',
                  active ? 'bg-[#FB7185] text-white font-semibold' : 'bg-[#F3F4F8] text-[#6B7280]'
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