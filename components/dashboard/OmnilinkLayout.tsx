'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/context/LanguageContext'
import { LanguageToggle } from '@/components/dashboard/LanguageToggle'
import { logoutAction } from '@/app/actions/auth'
import {
  LayoutGrid,
  Package,
  Brain,
  Globe,
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

/* 严格对应 app/dashboard 目录下的同名模块，由侧边栏承载 */
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
  const [currentTime, setCurrentTime] = useState<string>('')
  const [isScrolled, setIsScrolled] = useState<boolean>(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
      )
    }
    updateTime()
    const timer = setInterval(updateTime, 1000 * 20)
    return () => clearInterval(timer)
  }, [])

  // Real user from the auth session
  const displayName = profile.name || profile.email?.split('@')[0] || 'Thomas'
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
          顶部全局主导航栏 (Scroll-responsive Glassmorphism Top Bar)
          Top: Transparent and floating
          Scrolled: Frosted glass capsule card container with border & shadow
          ============================================================ */}
      <header
        className={cn(
          'w-full flex flex-wrap items-center justify-between gap-3 sticky top-3 z-40 text-[#111827] transition-all duration-300 ease-out',
          isScrolled
            ? 'bg-white/85 backdrop-blur-md rounded-2xl sm:rounded-full px-4 sm:px-6 py-2.5 border border-white/90 shadow-[0_10px_35px_rgba(0,0,0,0.05)]'
            : 'bg-transparent border border-transparent px-1 py-1.5 shadow-none'
        )}
      >
        {/* 左侧：你好商家与欢迎文案 */}
        <div className="flex flex-col justify-center shrink-0">
          <div className="flex items-center gap-1.5">
            <h2 className="font-heading font-extrabold text-lg sm:text-xl tracking-tight text-[#111827] leading-none">
              {isZh ? `你好，${displayName}` : `Hi ${displayName}`}
            </h2>
            <span className="text-lg sm:text-xl select-none leading-none">👋</span>
          </div>
          <p className="text-xs text-[#6B7280] font-normal leading-tight mt-1">
            {isZh ? '很高兴再次见到你！' : 'Glad to see you again!'}
          </p>
        </div>

        {/* 右侧：胶囊、文字交替的交互功能群 */}
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
          {/* 胶囊 1: 搜索框胶囊 (Search Capsule) */}
          <div className="relative hidden md:flex items-center">
            <input
              type="text"
              placeholder={isZh ? '搜索商品与数据…' : 'Search'}
              className={cn(
                'h-9 w-36 sm:w-48 pl-9 pr-3 rounded-full border text-xs text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#FB7185] transition-all',
                isScrolled
                  ? 'bg-[#F4F5F7]/90 border-gray-200/70 shadow-2xs'
                  : 'bg-white/90 backdrop-blur-md border-white/90 shadow-[0_4px_16px_rgba(0,0,0,0.03)]'
              )}
            />
            <Search size={13} className="absolute left-3.5 text-[#9CA3AF] pointer-events-none" />
          </div>

          {/* 胶囊 2: 通知铃铛按钮 (Bell Icon with Notification Dot) */}
          <button
            type="button"
            className={cn(
              'w-9 h-9 rounded-full hover:bg-white flex items-center justify-center text-[#111827] transition-all relative cursor-pointer',
              isScrolled
                ? 'bg-white border border-gray-200/70 shadow-2xs'
                : 'bg-white/90 backdrop-blur-md border border-white/90 shadow-[0_4px_16px_rgba(0,0,0,0.03)]'
            )}
            aria-label="Notifications"
          >
            <Bell size={14} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#F97316] ring-2 ring-white" />
          </button>

          {/* 文字 1: 实时本地时间 (10:37 AM) */}
          <div className="hidden sm:flex items-center text-xs font-bold text-[#111827] px-1.5 select-none whitespace-nowrap tracking-tight font-mono">
            {currentTime || '10:37 AM'}
          </div>

          {/* 胶囊 3: 语言切换胶囊 */}
          <LanguageToggle
            className={cn(
              'py-1.5 px-3 text-[11px] rounded-full transition-all',
              isScrolled
                ? 'bg-white border-gray-200/70 shadow-2xs hover:bg-[#F4F5F7]'
                : 'bg-white/90 backdrop-blur-md border-white/90 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:bg-white'
            )}
          />

          {/* 胶囊 4: 用户信息胶囊 */}
          <Link
            href="/dashboard/account"
            className={cn(
              'flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full hover:bg-white transition-all cursor-pointer',
              isScrolled
                ? 'bg-white border border-gray-200/70 shadow-2xs'
                : 'bg-white/90 backdrop-blur-md border border-white/90 shadow-[0_4px_16px_rgba(0,0,0,0.03)]'
            )}
          >
            <div className="w-6.5 h-6.5 rounded-full overflow-hidden bg-gradient-to-tr from-[#FED7AA] to-[#FB7185] relative shrink-0 flex items-center justify-center text-[10px] font-bold text-white shadow-2xs">
              {profile.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt={displayName}
                  width={26}
                  height={26}
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span aria-hidden>{initials || 'M'}</span>
              )}
            </div>
            <span className="hidden md:inline text-xs font-semibold text-[#111827] max-w-[80px] truncate">
              {displayName}
            </span>
            <ChevronDown size={11} className="text-[#9CA3AF]" />
          </Link>
        </div>
      </header>

      {/* ============================================================
          主工作区：左侧悬浮小巧侧边栏 + 右侧主内容卡片区
          ============================================================ */}
      <div className="flex-1 flex flex-col lg:flex-row gap-5">
        {/* 左侧悬浮胶囊侧边栏 (小巧玲珑极简设计) */}
        <aside className="hidden lg:flex flex-col items-center justify-between w-[58px] bg-white/75 backdrop-blur-md rounded-[30px] py-4 px-1.5 border border-white/90 shadow-[0_10px_35px_rgba(0,0,0,0.04)] shrink-0 sticky top-20 h-[calc(100vh-105px)] z-30">
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
        <main className="flex-1 w-full min-w-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}