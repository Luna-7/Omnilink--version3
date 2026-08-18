'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { useLanguage } from '@/context/LanguageContext'
import {
  TrendingUp,
  Users,
  DollarSign,
  Receipt,
  ArrowUpRight,
  MoreHorizontal,
  Download,
  ChevronDown,
  ExternalLink,
} from 'lucide-react'

// ===== 演示节点数据（mock，仅演示用）。真实坐标由前端 getBBox() 从 public/world.svg 动态计算，不写死 =====
const WORLD_VIEWBOX = { w: 2000, h: 857 } // simplemaps world.svg 的 viewBox
const DEMO_NODES = [
  { code: 'us', name: 'United States', flag: '🇺🇸', sales: 1245680 },
  { code: 'fi', name: 'Finland', flag: '🇫🇮', sales: 312450 },
  { code: 'br', name: 'Brazil', flag: '🇧🇷', sales: 684320 },
  { code: 'bd', name: 'Bangladesh', flag: '🇧🇩', sales: 158970 },
] as const

type WorldPath = { d: string; name: string }
type Pt = { cx: number; cy: number }

export function DashboardView({
  displayName,
}: {
  // #60 P2 fix: real merchant identity instead of hardcoded "Carlic / Sajibur".
  // Passed down by the server component in app/dashboard/page.tsx.
  displayName?: string
}) {
  const { isZh } = useLanguage()
  const [selectedMonth, setSelectedMonth] = useState<number>(7) // August (0-indexed 7)
  const [activeCountryFilter, setActiveCountryFilter] = useState<'all' | 'top'>('all')

  // ===== 演示层：真实世界地图动态视觉（数据为 mock，未接 API，仅演示） =====
  const mapWrapRef = useRef<HTMLDivElement>(null)
  const mapSvgRef = useRef<SVGSVGElement>(null)
  const [mapSize, setMapSize] = useState({ w: 800, h: 343 })
  const [zoomOrigin, setZoomOrigin] = useState<string | null>(null)
  const [worldPaths, setWorldPaths] = useState<WorldPath[]>([])
  const [radarCenters, setRadarCenters] = useState<Record<string, Pt>>({})

  const activeNames = useMemo(() => new Set<string>(DEMO_NODES.map((n) => n.name)), [])
  const nameToCode = useMemo(() => {
    const m: Record<string, string> = {}
    DEMO_NODES.forEach((n) => {
      m[n.name] = n.code
    })
    return m
  }, [])

  // 加载真实世界地图（public/world.svg），提取所有国家 path
  useEffect(() => {
    let alive = true
    fetch('/world.svg')
      .then((r) => r.text())
      .then((txt) => {
        if (!alive) return
        const doc = new DOMParser().parseFromString(txt, 'image/svg+xml')
        const arr = Array.from(doc.querySelectorAll('path'))
          .map((el) => ({
            d: el.getAttribute('d') || '',
            // US 用 class="United States"，BR/FI/BD 用 id；统一落到 name
            name:
              el.getAttribute('name') ||
              el.getAttribute('class') ||
              el.getAttribute('id') ||
              '',
          }))
          .filter((p) => p.d)
        setWorldPaths(arr)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  // 监听容器尺寸（把 viewBox 中心换算成像素，驱动防碰撞）
  useEffect(() => {
    const update = () => {
      if (mapWrapRef.current) {
        setMapSize({
          w: mapWrapRef.current.clientWidth,
          h: mapWrapRef.current.clientHeight,
        })
      }
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // 渲染后用 getBBox() 精准计算每个活跃国家中心（取面积最大的 path，避免美国被阿拉斯加带偏）
  useEffect(() => {
    if (!worldPaths.length || !mapSvgRef.current) return
    const svg = mapSvgRef.current
    const centers: Record<string, Pt> = {}
    DEMO_NODES.forEach((n) => {
      const els = svg.querySelectorAll(`[data-name="${n.name}"]`)
      let best: (Pt & { area: number }) | null = null
      els.forEach((el) => {
        const b = (el as SVGGraphicsElement).getBBox()
        const area = b.width * b.height
        if (!best || area > best.area) {
          best = { cx: b.x + b.width / 2, cy: b.y + b.height / 2, area }
        }
      })
      if (best) centers[n.code] = { cx: (best as Pt).cx, cy: (best as Pt).cy }
    })
    setRadarCenters(centers)
  }, [worldPaths])

  // 核心：浮动卡片防碰撞避让（两卡片像素距离 < 阈值时自动错开）
  const processedCards = useMemo(() => {
    const cards = DEMO_NODES.map((d) => {
      const c = radarCenters[d.code]
      return {
        ...d,
        // viewBox 中心 → 容器像素（SVG 与容器同尺寸，宽高比锁定 2000:857）
        pixelX: c ? (c.cx / WORLD_VIEWBOX.w) * mapSize.w : 0,
        pixelY: c ? (c.cy / WORLD_VIEWBOX.h) * mapSize.h : 0,
        offsetX: -50, // 默认水平居中于锚点
        offsetY: -115, // 默认浮于锚点上方
        formatted: d.sales.toLocaleString(),
        ready: Boolean(c),
      }
    })
    const THRESHOLD = 150
    for (let i = 0; i < cards.length; i++) {
      for (let j = i + 1; j < cards.length; j++) {
        const dx = cards[i].pixelX - cards[j].pixelX
        const dy = cards[i].pixelY - cards[j].pixelY
        if (Math.sqrt(dx * dx + dy * dy) < THRESHOLD) {
          cards[i].offsetX = -115 // 左飘
          cards[j].offsetX = 15 // 右飘
          cards[j].offsetY = -45 // 下移
        }
      }
    }
    return cards
  }, [radarCenters, mapSize])

  // 点击活跃国家 → 聚焦下钻 zoom（再次点击还原）
  const handleCountryZoom = (code: string) => {
    if (zoomOrigin) {
      setZoomOrigin(null)
      return
    }
    const c = radarCenters[code]
    if (!c) return
    setZoomOrigin(
      `${((c.cx / WORLD_VIEWBOX.w) * 100).toFixed(1)}% ${((c.cy / WORLD_VIEWBOX.h) * 100).toFixed(1)}%`
    )
  }

  // 12 个月份的柱状图数据
  const monthlyData = [
    { month: 'Jan', value: 45, sales: '42,120', rev: '$345,120' },
    { month: 'Feb', value: 68, sales: '58,400', rev: '$480,900' },
    { month: 'Mar', value: 38, sales: '35,800', rev: '$290,140' },
    { month: 'Apr', value: 82, sales: '69,200', rev: '$570,300' },
    { month: 'May', value: 92, sales: '78,400', rev: '$642,800' },
    { month: 'Jun', value: 55, sales: '49,100', rev: '$410,200' },
    { month: 'Jul', value: 70, sales: '61,300', rev: '$512,000' },
    { month: 'Aug', value: 88, sales: '73,940', rev: '$637,73.83' },
    { month: 'Sep', value: 40, sales: '38,200', rev: '$310,400' },
    { month: 'Oct', value: 76, sales: '64,800', rev: '$540,100' },
    { month: 'Nov', value: 32, sales: '29,500', rev: '$240,600' },
    { month: 'Dec', value: 65, sales: '56,200', rev: '$470,800' },
  ]

  // Top Products 数据 (如 reference image 中所示)
  const topProducts = [
    {
      id: 'p-1',
      name: 'Adidas Ultraboost 22',
      category: isZh ? '跑步运动鞋' : 'Running Shoes',
      price: '$180',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'p-2',
      name: 'Samsung Galaxy Watch 6',
      category: isZh ? '智能手表' : 'Smartwatch',
      price: '$299',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'p-3',
      name: 'Sony WH-1000XM5',
      category: isZh ? '头戴式降噪耳机' : 'Noise-Canceling Headphones',
      price: '$399',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'p-4',
      name: 'Apple AirPods Pro (2nd Gen)',
      category: isZh ? '真无线降噪耳机' : 'Wireless Earbuds',
      price: '$249',
      image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=120&auto=format&fit=crop&q=80',
    },
  ]

  return (
    <div className="space-y-5">
      {/* ============================================================
          顶部欢迎横幅 (Welcome + Export Report Action)
          ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#111827]">
              {isZh ? `欢迎，${displayName ?? '商家'} 👋` : `Welcome, ${displayName ?? 'Merchant'} 👋`}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1 font-normal">
            {isZh
              ? '今日客户画像、AI 语义节点、销售表现与营收分析概览。'
              : 'An overview of customer insights, sales performance, and revenue analytics.'}
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-[#F9FAFB] border border-[#D1D5DB] text-xs font-semibold text-[#111827] shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Download size={14} className="text-[#111827]" />
          <span>{isZh ? '导出报表' : 'Export Report'}</span>
        </button>
      </div>

      {/* ============================================================
          1. 顶部 4 联指标卡 (Top 4 Metric Cards Row)
          Total Sales / Active Customers / Total Revenue / Refund Requests
          ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* 指标卡 1: Total Sales */}
        <div className="crextio-card p-5 flex flex-col justify-between h-[155px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#6B7280]">
              {isZh ? '总销售量' : 'Total Sales'}
            </span>
            <div className="w-8 h-8 rounded-full bg-[#F4F5F7] border border-[#E5E7EB] flex items-center justify-center text-[#111827]">
              <TrendingUp size={15} />
            </div>
          </div>
          <div className="text-2xl sm:text-[28px] font-bold text-[#111827] tracking-tight tnum">
            12,485
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-[#F3F4F6]">
            <span className="text-[#e28c33] font-semibold flex items-center gap-1">
              <span>▲ +3.1%</span>
              <span className="text-[#9CA3AF] font-normal">{isZh ? '较上周' : 'vs Last Week'}</span>
            </span>
            <button
              type="button"
              className="text-[#6B7280] hover:text-[#111827] font-medium flex items-center gap-0.5 transition-colors cursor-pointer"
            >
              <span>{isZh ? '查看详情' : 'View Details'}</span>
              <ArrowUpRight size={12} />
            </button>
          </div>
        </div>

        {/* 指标卡 2: Active Customers */}
        <div className="crextio-card p-5 flex flex-col justify-between h-[155px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#6B7280]">
              {isZh ? '活跃客户' : 'Active Customers'}
            </span>
            <div className="w-8 h-8 rounded-full bg-[#F4F5F7] border border-[#E5E7EB] flex items-center justify-center text-[#111827]">
              <Users size={15} />
            </div>
          </div>
          <div className="text-2xl sm:text-[28px] font-bold text-[#111827] tracking-tight tnum">
            4,263
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-[#F3F4F6]">
            <span className="text-[#e28c33] font-semibold flex items-center gap-1">
              <span>▲ +1.8%</span>
              <span className="text-[#9CA3AF] font-normal">{isZh ? '新增客户' : 'New Customers'}</span>
            </span>
            <button
              type="button"
              className="text-[#6B7280] hover:text-[#111827] font-medium flex items-center gap-0.5 transition-colors cursor-pointer"
            >
              <span>{isZh ? '查看详情' : 'View Details'}</span>
              <ArrowUpRight size={12} />
            </button>
          </div>
        </div>

        {/* 指标卡 3: Total Revenue */}
        <div className="crextio-card p-5 flex flex-col justify-between h-[155px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#6B7280]">
              {isZh ? '总营收' : 'Total Revenue'}
            </span>
            <div className="w-8 h-8 rounded-full bg-[#F4F5F7] border border-[#E5E7EB] flex items-center justify-center text-[#111827]">
              <DollarSign size={15} />
            </div>
          </div>
          <div className="text-2xl sm:text-[28px] font-bold text-[#111827] tracking-tight tnum">
            $68,837
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-[#F3F4F6]">
            <span className="text-[#e28c33] font-semibold flex items-center gap-1">
              <span>▲ +2.4%</span>
              <span className="text-[#9CA3AF] font-normal">{isZh ? '较上周' : 'vs Last Week'}</span>
            </span>
            <button
              type="button"
              className="text-[#6B7280] hover:text-[#111827] font-medium flex items-center gap-0.5 transition-colors cursor-pointer"
            >
              <span>{isZh ? '查看详情' : 'View Details'}</span>
              <ArrowUpRight size={12} />
            </button>
          </div>
        </div>

        {/* 指标卡 4: Refund Requests */}
        <div className="crextio-card p-5 flex flex-col justify-between h-[155px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#6B7280]">
              {isZh ? '退款请求' : 'Refund Requests'}
            </span>
            <div className="w-8 h-8 rounded-full bg-[#F4F5F7] border border-[#E5E7EB] flex items-center justify-center text-[#111827]">
              <Receipt size={15} />
            </div>
          </div>
          <div className="text-2xl sm:text-[28px] font-bold text-[#111827] tracking-tight tnum">
            187
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-[#F3F4F6]">
            <span className="text-[#e28c33] font-semibold flex items-center gap-1">
              <span>▼ -0.6%</span>
              <span className="text-[#9CA3AF] font-normal">{isZh ? '较上周' : 'vs Last Week'}</span>
            </span>
            <button
              type="button"
              className="text-[#6B7280] hover:text-[#111827] font-medium flex items-center gap-0.5 transition-colors cursor-pointer"
            >
              <span>{isZh ? '查看详情' : 'View Details'}</span>
              <ArrowUpRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================
          2. 中间卡片区 (Total Profit Overview 8 cols + Top Products 4 cols)
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 左侧宽卡片: Total Profit Overview (8 cols) */}
        <div className="lg:col-span-8">
          <div className="crextio-card p-5 sm:p-6 h-full flex flex-col justify-between">
            <div>
              {/* 头部标题与更多按钮 */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-heading text-base font-bold text-[#111827]">
                  {isZh ? '总利润概览' : 'Total Profit Overview'}
                </h3>
                <button
                  type="button"
                  className="w-8 h-8 rounded-full hover:bg-[#F4F5F7] flex items-center justify-center text-[#9CA3AF] hover:text-[#111827] transition-colors"
                  aria-label="Options"
                >
                  <MoreHorizontal size={16} />
                </button>
              </div>

              {/* 利润数值 + 亮绿 Badge + Shopify / Amazon 状态指标 */}
              <div className="flex flex-wrap items-center justify-between gap-4 my-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827] tnum">
                    $98,643.24
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#edbc40] text-[#111827] text-xs font-bold inline-flex items-center gap-1 shadow-sm">
                    +8.4% ↗
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  {/* Shopify */}
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-[#95BF47]/15 flex items-center justify-center text-[#95BF47] font-bold text-[10px]">
                      S
                    </div>
                    <div>
                      <span className="text-[10px] text-[#9CA3AF] block leading-none">Shopify</span>
                      <span className="font-semibold text-[#111827]">206 Payment</span>
                    </div>
                  </div>

                  {/* Amazon */}
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-[#FF9900]/15 flex items-center justify-center text-[#FF9900] font-bold text-[10px]">
                      a
                    </div>
                    <div>
                      <span className="text-[10px] text-[#9CA3AF] block leading-none">Amazon</span>
                      <span className="font-semibold text-[#111827]">400 Payment</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 图例 */}
              <div className="flex items-center gap-4 text-xs text-[#9CA3AF] mb-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#E5E7EB]" />
                  <span>{isZh ? '总销售' : 'Total Sales'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#e0652b]" />
                  <span>{isZh ? '总营收' : 'Total Revenue'}</span>
                </div>
              </div>
            </div>

            {/* 12 月份柱状图 (带有 8 月的高亮橙色柱与浮动 Tooltip) */}
            <div className="relative pt-6 pb-2">
              <div className="flex items-end justify-between gap-1.5 sm:gap-3 h-48 sm:h-56 w-full">
                {monthlyData.map((item, idx) => {
                  const isSelected = selectedMonth === idx
                  return (
                    <div
                      key={item.month}
                      onClick={() => setSelectedMonth(idx)}
                      className="flex-1 flex flex-col items-center gap-2 group cursor-pointer relative h-full justify-end"
                    >
                      {/* 如果是高亮选中的月份，显示浮动 Tooltip 气泡 */}
                      {isSelected && (
                        <div className="absolute -top-12 z-20 whitespace-nowrap bg-white border border-[#E5E7EB] rounded-xl px-3 py-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.08)] text-left animate-in fade-in zoom-in-95 duration-150">
                          <div className="text-[10px] font-bold text-[#111827]">
                            {item.month} 2026
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-[#6B7280]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF]" />
                            <span className="font-semibold text-[#111827]">{item.sales}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-[#6B7280]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#e0652b]" />
                            <span className="font-semibold text-[#e0652b]">{item.rev}</span>
                          </div>
                        </div>
                      )}

                      {/* 柱形条 */}
                      <div className="w-full max-w-[28px] h-full flex items-end justify-center">
                        <div
                          style={{ height: `${item.value}%` }}
                          className={`w-full rounded-t-lg transition-all duration-300 ${
                            isSelected
                              ? 'bg-[#e0652b] shadow-[0_4px_12px_rgba(224, 101, 43,0.3)]'
                              : 'bg-[#F0F1F3] group-hover:bg-[#E2E4E8]'
                          }`}
                        />
                      </div>

                      {/* 月份标签 */}
                      <span
                        className={`text-[11px] transition-colors ${
                          isSelected ? 'font-bold text-[#111827]' : 'text-[#9CA3AF]'
                        }`}
                      >
                        {item.month}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 右侧窄卡片: Top Products (4 cols) */}
        <div className="lg:col-span-4">
          <div className="crextio-card p-5 sm:p-6 h-full flex flex-col justify-between">
            <div>
              {/* 头部 */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-base font-bold text-[#111827]">
                  {isZh ? '畅销商品与节点' : 'Top Products'}
                </h3>
                <button
                  type="button"
                  className="w-8 h-8 rounded-full hover:bg-[#F4F5F7] flex items-center justify-center text-[#9CA3AF] hover:text-[#111827] transition-colors"
                  aria-label="Options"
                >
                  <MoreHorizontal size={16} />
                </button>
              </div>

              {/* 产品列表 */}
              <div className="space-y-4">
                {topProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-2 rounded-2xl hover:bg-[#F9FAFB] transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] overflow-hidden relative shrink-0">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#111827] truncate">
                          {product.name}
                        </h4>
                        <p className="text-[11px] text-[#9CA3AF] truncate mt-0.5">
                          {product.category}
                        </p>
                      </div>
                    </div>

                    <div className="text-xs font-bold text-[#111827] shrink-0 pl-3 tnum">
                      {product.price}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#F3F4F6] mt-4">
              <button
                type="button"
                className="w-full py-2 rounded-full bg-[#F4F5F7] hover:bg-[#E5E7EB] text-[#111827] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>{isZh ? '查看全部商品' : 'View All Products'}</span>
                <ExternalLink size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          3. 底部卡片区 (Customer Orders 4 cols + Sales by Countries 8 cols)
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 左侧卡片: Customer Orders (4 cols) */}
        <div className="lg:col-span-4">
          <div className="crextio-card p-5 sm:p-6 h-full flex flex-col justify-between">
            <div>
              {/* 头部 */}
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h3 className="font-heading text-base font-bold text-[#111827]">
                    {isZh ? '客户订单量' : 'Customer Orders'}
                  </h3>
                  <span className="text-[11px] text-[#9CA3AF]">
                    1 Jan - 12 Dec 2026
                  </span>
                </div>
                <button
                  type="button"
                  className="w-8 h-8 rounded-full hover:bg-[#F4F5F7] flex items-center justify-center text-[#9CA3AF] hover:text-[#111827] transition-colors"
                  aria-label="Options"
                >
                  <MoreHorizontal size={16} />
                </button>
              </div>

              {/* 大数字与标签 */}
              <div className="my-4">
                <div className="text-3xl font-bold tracking-tight text-[#111827] tnum">
                  45,6370
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#edbc40] text-[#111827] text-xs font-bold">
                    +9.4% ↗
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#F4F5F7] text-[#6B7280] text-xs font-medium">
                    +245
                  </span>
                </div>
              </div>
            </div>

            {/* 平滑紫色波浪图 (带峰值 2,345 浮动 Tooltip) */}
            <div className="relative pt-6 pb-2">
              <div className="relative w-full h-36">
                {/* 峰值高亮 Tooltip */}
                <div className="absolute left-[64%] -top-4 -translate-x-1/2 bg-white border border-[#E5E7EB] shadow-sm rounded-md px-2 py-0.5 text-[10px] font-bold text-[#111827] z-10">
                  2,345
                </div>

                {/* 峰值浅紫色垂直投影柱 */}
                <div className="absolute left-[64%] top-2 bottom-0 w-8 -translate-x-1/2 bg-[#8B5CF6]/15 rounded-t-lg pointer-events-none" />

                {/* SVG 柔和波浪曲线 */}
                <svg viewBox="0 0 300 120" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="orderGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* 面积渐变填充 */}
                  <path
                    d="M 0 95 C 40 90, 70 105, 110 85 C 150 65, 180 90, 210 30 C 240 70, 270 50, 300 75 L 300 120 L 0 120 Z"
                    fill="url(#orderGradient)"
                  />
                  {/* 主折线 */}
                  <path
                    d="M 0 95 C 40 90, 70 105, 110 85 C 150 65, 180 90, 210 30 C 240 70, 270 50, 300 75"
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {/* 峰值节点圆圈 */}
                  <circle cx="210" cy="30" r="4.5" fill="#FFFFFF" stroke="#8B5CF6" strokeWidth="2.5" />
                </svg>
              </div>

              {/* 月份轴 */}
              <div className="flex justify-between text-[10px] text-[#9CA3AF] mt-2 px-1">
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
                <span>Sep</span>
                <span className="font-bold text-[#111827]">Oct</span>
                <span>Nov</span>
                <span>Dec</span>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧卡片: Sales by Countries (8 cols) */}
        <div className="lg:col-span-8">
          <div className="crextio-card p-5 sm:p-6 h-full flex flex-col justify-between">
            {/* 顶部标题与筛选标签 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-heading text-base font-bold text-[#111827] flex items-center gap-2">
                  {isZh ? '全球市场与节点分布' : 'Sales by Countries'}
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#E5E7EB] text-[#9CA3AF] tracking-wider">
                    {isZh ? '演示' : 'DEMO'}
                  </span>
                </h3>
                <p className="text-[11px] text-[#9CA3AF]">
                  {isZh ? '在此监控所有海外与多渠道订单分布' : 'Keep track of all orders here'}
                </p>
              </div>

              {/* 顶部下拉胶囊筛选 */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveCountryFilter('all')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer border ${
                    activeCountryFilter === 'all'
                      ? 'bg-[#111827] text-white border-[#111827]'
                      : 'bg-white border-[#E5E7EB] text-[#111827] hover:bg-[#F4F5F7]'
                  }`}
                >
                  <span>{isZh ? '全部产品' : 'All Products'}</span>
                  <ChevronDown size={12} className={activeCountryFilter === 'all' ? 'text-white' : 'text-[#9CA3AF]'} />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCountryFilter('top')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer border ${
                    activeCountryFilter === 'top'
                      ? 'bg-[#111827] text-white border-[#111827]'
                      : 'bg-white border-[#E5E7EB] text-[#111827] hover:bg-[#F4F5F7]'
                  }`}
                >
                  <span>{isZh ? '热门地区' : 'Top Countries'}</span>
                  <ChevronDown size={12} className={activeCountryFilter === 'top' ? 'text-white' : 'text-[#9CA3AF]'} />
                </button>
              </div>
            </div>

            {/* 内容区：左侧关键数据指标 + 右侧矢量世界地图 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center flex-1">
              {/* 左侧核心指标 (4 cols) */}
              <div className="md:col-span-4 space-y-4">
                <div>
                  <span className="text-[11px] text-[#9CA3AF] block font-medium">
                    {isZh ? '销售表现最优国家' : 'Top Performing Country'}
                  </span>
                  <div className="text-xl font-bold text-[#111827] mt-0.5 tnum">
                    $120,000
                  </div>
                  <span className="text-[11px] text-[#6B7280] block">
                    United States
                  </span>
                </div>

                <div className="pt-2 border-t border-[#F3F4F6]">
                  <span className="text-[11px] text-[#9CA3AF] block font-medium">
                    {isZh ? '营收增速' : 'Revenue Growth'}
                  </span>
                  <div className="text-xl font-bold text-[#e28c33] mt-0.5 tnum">
                    +34%
                  </div>
                  <span className="text-[11px] text-[#6B7280] block">
                    United States and Canada
                  </span>
                </div>

                <div className="pt-2 border-t border-[#F3F4F6]">
                  <span className="text-[11px] text-[#9CA3AF] block font-medium">
                    {isZh ? '统计周期' : 'Period'}
                  </span>
                  <div className="text-sm font-bold text-[#111827] mt-0.5">
                    12 Months
                  </div>
                </div>
              </div>

              {/* 右侧矢量世界地图 (8 cols) */}
              <div className="md:col-span-8 relative w-full aspect-[2000/857] bg-[#F9FAFB]/70 rounded-2xl border border-[#E5E7EB]/60 p-2 overflow-hidden select-none">
                {/* zoom 下钻提示 */}
                <div className="absolute right-3 top-3 z-20 text-[9px] font-medium text-[#9CA3AF] bg-white/85 backdrop-blur px-2 py-1 rounded-full border border-[#E5E7EB]">
                  {zoomOrigin
                    ? isZh ? '再次点击地图还原' : 'Click again to reset'
                    : isZh ? '点击高亮国家下钻' : 'Click a highlighted country'}
                </div>

                {/* 地图 + 浮动卡片 整体容器（zoom 时一并缩放，保持相对位置） */}
                <div
                  ref={mapWrapRef}
                  className="relative w-full h-full"
                  style={{
                    transformOrigin: zoomOrigin || 'center',
                    transform: zoomOrigin ? 'scale(2.4)' : 'scale(1)',
                    transition: 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)',
                  }}
                >
                  {/* 真实世界地图（simplemaps，React 渲染全部国家 path） */}
                  <svg
                    ref={mapSvgRef}
                    viewBox={`0 0 ${WORLD_VIEWBOX.w} ${WORLD_VIEWBOX.h}`}
                    className="geo-world w-full h-full"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {worldPaths.map((p, i) => {
                      const active = activeNames.has(p.name)
                      return (
                        <path
                          key={i}
                          d={p.d}
                          data-name={p.name}
                          className={active ? 'geo-active' : undefined}
                          onClick={active ? () => handleCountryZoom(nameToCode[p.name]) : undefined}
                        />
                      )
                    })}

                    {/* 脉冲雷达点（实时节点，随 SVG viewBox 缩放始终对齐国家） */}
                    {DEMO_NODES.map((n) => {
                      const c = radarCenters[n.code]
                      if (!c) return null
                      return (
                        <g key={n.code} pointerEvents="none">
                          <circle cx={c.cx} cy={c.cy} r="20" fill="#8B5CF6" opacity="0.18" className="animate-ping" />
                          <circle cx={c.cx} cy={c.cy} r="5.5" fill="#8B5CF6" stroke="#FFFFFF" strokeWidth="2.5" />
                        </g>
                      )
                    })}
                  </svg>

                  {/* 浮动数据卡片（防碰撞避让 + 进场 fade + 呼吸点，getBBox 就绪后才渲染） */}
                  {processedCards.map((c, i) =>
                    c.ready ? (
                      <div
                        key={c.code}
                        className="geo-card bg-[#8B5CF6] text-white rounded-xl px-2.5 sm:px-3 py-1.5 shadow-[0_8px_20px_rgba(139,92,246,0.3)] border border-white/10"
                        style={{
                          left: c.pixelX,
                          top: c.pixelY,
                          animationDelay: `${0.3 + i * 0.12}s`,
                          ...({ '--card-tx': `${c.offsetX}%`, '--card-ty': `${c.offsetY}%` } as React.CSSProperties),
                        }}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{c.flag}</span>
                          <span className="text-[9px] text-white/80 font-medium leading-none">{c.name}</span>
                          <span className="pulse-dot" />
                        </div>
                        <div className="font-bold text-white text-xs tnum mt-0.5">${c.formatted}</div>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
