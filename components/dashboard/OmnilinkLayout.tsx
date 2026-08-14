'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home, Package, User, Store, Bot, Brain, Puzzle, Settings,
  Plus, Sparkles, Globe, ShieldCheck, Activity, Database, Image,
  Folder, LayoutDashboard, ChevronRight, Search, Bell, type LucideIcon,
} from 'lucide-react'

/* ============================================================
   Omnilink Dashboard Shell —— White Acrylic / Sharp Geometry
   顶部：52px 悬浮式亚克力导航栏（品牌 / 搜索 / 通知 / 头像）
   左侧：56px 白色图标导轨（全局模块切换）
   左二：224px 上下文子导航（模块内操作）
   主内容：12 栏网格业务页面（200ms 轻滑入）
   95% 中性色 · 5% 受控强调色 · radius ≤ 8px
   ============================================================ */

type SubItem = { label: string; href: string; icon: LucideIcon; badge?: string }

type Module = {
  key: string
  label: string
  icon: LucideIcon
  href: string
  match: (pathname: string) => boolean
  sub: {
    description: string
    groups: { title?: string; items: SubItem[] }[]
  }
}

const MODULES: Module[] = [
  {
    key: 'overview',
    label: '概览',
    icon: Home,
    href: '/dashboard',
    match: (p) => p === '/dashboard',
    sub: {
      description: '店铺指挥中心，一眼看清店铺状态。',
      groups: [
        {
          items: [{ label: '店铺总览', href: '/dashboard', icon: LayoutDashboard }],
        },
        {
          title: '快捷操作',
          items: [
            { label: '添加产品', href: '/dashboard/products/new', icon: Plus },
            { label: 'AI 智能导入', href: '/dashboard/products/import', icon: Sparkles },
            { label: '编辑线上商店', href: '/dashboard/storefront', icon: Globe },
          ],
        },
      ],
    },
  },
  {
    key: 'products',
    label: '产品',
    icon: Package,
    href: '/dashboard/products',
    match: (p) => p.startsWith('/dashboard/products'),
    sub: {
      description: '创建并管理可被 AI 理解的结构化商品数据。',
      groups: [
        {
          items: [
            { label: '产品列表', href: '/dashboard/products', icon: Package },
            { label: '分类', href: '/dashboard/products/categories', icon: Folder },
            { label: 'AI 智能导入', href: '/dashboard/products/import', icon: Sparkles, badge: 'AI' },
          ],
        },
      ],
    },
  },
  {
    key: 'account',
    label: '账号管理',
    icon: User,
    href: '/dashboard/account',
    match: (p) => p.startsWith('/dashboard/account'),
    sub: {
      description: '个人资料、订阅方案与团队协作。',
      groups: [
        {
          items: [
            { label: '个人资料', href: '/dashboard/account', icon: User },
            { label: '订阅计划', href: '/dashboard/account/subscription', icon: ShieldCheck },
            { label: '协作权限', href: '/dashboard/account/team', icon: User, badge: '即将推出' },
          ],
        },
      ],
    },
  },
  {
    key: 'storefront',
    label: '线上商店',
    icon: Store,
    href: '/dashboard/storefront',
    match: (p) => p.startsWith('/dashboard/storefront') || p.startsWith('/dashboard/store'),
    sub: {
      description: '面向顾客的品牌门店与页面。',
      groups: [
        {
          items: [
            { label: '模板编辑器', href: '/dashboard/storefront', icon: Store },
            { label: '页面管理', href: '/dashboard/storefront/pages', icon: Globe },
          ],
        },
      ],
    },
  },
  {
    key: 'agent-api',
    label: 'AI Agent',
    icon: Bot,
    href: '/dashboard/agent-api',
    match: (p) => p.startsWith('/dashboard/agent-api'),
    sub: {
      description: '让 AI Agent 连接你的商品数据。',
      groups: [
        {
          items: [
            { label: '连接', href: '/dashboard/agent-api', icon: Bot },
            { label: 'API 密钥', href: '/dashboard/agent-api/keys', icon: ShieldCheck },
            { label: '访问统计', href: '/dashboard/agent-api/stats', icon: Activity },
          ],
        },
      ],
    },
  },
  {
    key: 'knowledge',
    label: 'AI 知识库',
    icon: Brain,
    href: '/dashboard/knowledge',
    match: (p) => p.startsWith('/dashboard/knowledge'),
    sub: {
      description: 'AI 理解你业务的语义记忆。',
      groups: [
        {
          items: [{ label: '知识总览', href: '/dashboard/knowledge', icon: Brain }],
        },
        {
          title: '知识分类',
          items: [
            { label: '品牌信息', href: '/dashboard/knowledge?cat=brand', icon: Sparkles },
            { label: '商品知识', href: '/dashboard/knowledge?cat=product', icon: Package },
            { label: '常见问题', href: '/dashboard/knowledge?cat=faq', icon: Folder },
            { label: '售后政策', href: '/dashboard/knowledge?cat=policy', icon: ShieldCheck },
          ],
        },
      ],
    },
  },
  {
    key: 'plugins',
    label: '插件中心',
    icon: Puzzle,
    href: '/dashboard/plugins',
    match: (p) => p.startsWith('/dashboard/plugins'),
    sub: {
      description: '为店铺安装能力扩展。',
      groups: [
        {
          items: [{ label: '全部插件', href: '/dashboard/plugins', icon: Puzzle }],
        },
        {
          title: '分类',
          items: [
            { label: '数据导入', href: '/dashboard/plugins?cat=import', icon: Database },
            { label: 'AI', href: '/dashboard/plugins?cat=ai', icon: Sparkles },
            { label: '图片', href: '/dashboard/plugins?cat=image', icon: Image },
          ],
        },
      ],
    },
  },
  {
    key: 'settings',
    label: '设置',
    icon: Settings,
    href: '/dashboard/settings',
    match: (p) => p.startsWith('/dashboard/settings'),
    sub: {
      description: '店铺级基础设施配置。',
      groups: [
        {
          items: [
            { label: '店铺设置', href: '/dashboard/settings', icon: Settings },
            { label: '商品与数据', href: '/dashboard/settings/data', icon: Database },
            { label: '货币', href: '/dashboard/settings/currency', icon: Globe },
            { label: '水印策略', href: '/dashboard/settings/watermark', icon: Image },
          ],
        },
      ],
    },
  },
]

/* 子项高亮：精确命中，或在「没有更精确兄弟命中」时允许前缀命中 */
function isItemActive(pathname: string, item: SubItem, siblings: SubItem[]) {
  const base = item.href.split('?')[0]
  if (item.href.includes('?')) return false
  if (pathname === base) return true
  if (pathname.startsWith(base + '/')) {
    const better = siblings.some(
      (s) => s !== item && !s.href.includes('?') && pathname.startsWith(s.href.split('?')[0])
    )
    return !better
  }
  return false
}

export default function OmnilinkLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const current = MODULES.find((m) => m.match(pathname)) ?? MODULES[0]

  return (
    <div className="flex h-screen w-full flex-col bg-white antialiased">
      {/* ===== 悬浮式亚克力顶栏 ===== */}
      <header className="z-20 shrink-0 px-4 pt-3 md:px-5">
        <div
          className="flex h-[52px] items-center gap-3 rounded-lg px-4"
          style={{
            background: 'rgba(255, 255, 255, 0.72)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
          }}
        >
          {/* 品牌 */}
          <Link href="/dashboard" className="flex items-center gap-2.5" aria-label="Omnilink 概览">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#8b5cf6] text-[13px] font-bold text-white">
              O
            </span>
            <span className="text-sm font-semibold tracking-tight text-gray-900">
              Omnilink
            </span>
          </Link>

          <span className="hidden h-4 w-px bg-gray-200 md:block" aria-hidden="true" />
          <span className="hidden text-xs text-gray-500 md:block">{current.label}</span>

          {/* 搜索（桌面） */}
          <div className="relative ml-auto hidden md:block">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="search"
              placeholder="搜索产品、页面、设置…"
              aria-label="全局搜索"
              className="h-8 w-56 rounded-md border border-gray-200 bg-gray-50 pl-8 pr-3 text-xs text-gray-800 placeholder:text-gray-400 transition-colors focus:border-[#8b5cf6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/15"
            />
          </div>

          {/* 通知 */}
          <button
            type="button"
            aria-label="通知"
            className="relative ml-auto flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 md:ml-0"
          >
            <Bell size={16} strokeWidth={1.75} />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#f59e0b]" />
          </button>

          {/* 头像 */}
          <button
            type="button"
            aria-label="账号"
            className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-900 text-[11px] font-semibold text-white"
          >
            L
          </button>
        </div>
      </header>

      {/* ===== 主体：图标导轨 + 上下文导航 + 主内容 ===== */}
      <div className="flex min-h-0 flex-1">
        {/* 图标导轨（md 及以上） */}
        <nav
          aria-label="全局模块导航"
          className="hidden w-14 shrink-0 flex-col items-center gap-1 border-r border-black/[0.06] bg-white py-4 md:flex"
        >
          <div className="flex flex-1 flex-col gap-1">
            {MODULES.filter((m) => m.key !== 'settings').map((m) => (
              <RailIcon key={m.key} module={m} active={current.key === m.key} />
            ))}
          </div>
          <RailIcon module={MODULES[7]} active={current.key === 'settings'} />
        </nav>

        {/* 上下文子导航（lg 及以上） */}
        <aside
          aria-label={`${current.label}子导航`}
          className="hidden w-56 shrink-0 flex-col border-r border-black/[0.06] bg-[#fafafa] p-4 lg:flex"
        >
          <div className="mb-5 px-1">
            <h2 className="text-sm font-semibold tracking-tight text-gray-900">
              {current.label}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">
              {current.sub.description}
            </p>
          </div>

          <div className="custom-scroll flex-1 space-y-5 overflow-y-auto pr-1">
            {current.sub.groups.map((group, gi) => (
              <div key={gi}>
                {group.title && (
                  <h3 className="mb-2 px-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                    {group.title}
                  </h3>
                )}
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <SubNavItem
                      key={item.href}
                      item={item}
                      active={isItemActive(
                        pathname,
                        item,
                        current.sub.groups.flatMap((g) => g.items)
                      )}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-black/[0.06] pt-3">
            <p className="px-1 text-[10px] leading-relaxed text-gray-400">
              Omnilink · AI 原生商业基础设施
            </p>
          </div>
        </aside>

        {/* 主内容区 */}
        <main className="custom-scroll min-w-0 flex-1 overflow-y-auto px-4 py-6 pb-24 md:px-8 md:pb-8">
          <div key={pathname} className="page-enter mx-auto max-w-[1400px]">
            {children}
          </div>
        </main>
      </div>

      {/* 移动端底部导航 */}
      <nav
        aria-label="全局模块导航（移动端）"
        className="fixed bottom-3 left-3 right-3 z-30 flex items-center justify-between rounded-lg px-2 py-2 md:hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.82)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
        }}
      >
        {MODULES.map((m) => {
          const Icon = m.icon
          const active = current.key === m.key
          return (
            <Link
              key={m.key}
              href={m.href}
              aria-label={m.label}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-md transition-colors',
                active ? 'bg-[#8b5cf6]/10 text-[#8b5cf6]' : 'text-gray-500'
              )}
            >
              <Icon size={17} strokeWidth={1.75} />
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

/* 导轨图标：中性灰线性图标；激活 = 紫色 + 微光 */
function RailIcon({ module, active }: { module: Module; active: boolean }) {
  const Icon = module.icon
  return (
    <Link
      href={module.href}
      aria-label={module.label}
      aria-current={active ? 'page' : undefined}
      data-tip={module.label}
      className={cn(
        'icon-tip flex h-10 w-10 items-center justify-center rounded-md transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]/30',
        active
          ? 'bg-[#8b5cf6]/10 text-[#8b5cf6]'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
      )}
      style={active ? { boxShadow: '0 0 18px rgba(139, 92, 246, 0.15)' } : undefined}
    >
      <Icon size={19} strokeWidth={active ? 2 : 1.75} />
    </Link>
  )
}

/* 子导航项 */
function SubNavItem({ item, active }: { item: SubItem; active: boolean }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group relative flex items-center justify-between rounded-md px-2.5 py-2 transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]/25',
        active ? 'nav-active-liquid text-gray-900' : 'text-gray-600 hover:bg-white'
      )}
    >
      {/* 激活指示条 */}
      {active && (
        <span
          className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-[#8b5cf6]"
          aria-hidden="true"
        />
      )}
      <span className="flex min-w-0 items-center gap-2.5">
        <Icon
          size={15}
          strokeWidth={1.75}
          className={cn(
            'shrink-0 transition-colors',
            active ? 'text-[#8b5cf6]' : 'text-gray-400 group-hover:text-gray-600'
          )}
        />
        <span className="truncate text-[13px] font-medium tracking-tight">{item.label}</span>
      </span>
      {item.badge ? (
        <span
          className={cn(
            'shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold',
            item.badge === 'AI'
              ? 'bg-[#8b5cf6]/10 text-[#8b5cf6]'
              : 'bg-gray-100 text-gray-500'
          )}
        >
          {item.badge}
        </span>
      ) : (
        active && <ChevronRight size={13} className="shrink-0 text-[#8b5cf6]/60" />
      )}
    </Link>
  )
}
