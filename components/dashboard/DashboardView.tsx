'use client'

import React, { useState, useEffect, useMemo } from 'react'
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
  Store,
  ShoppingBag,
  Globe,
  Bot,
  ArrowLeft,
  Truck,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Activity,
  Radio,
  Zap,
} from 'lucide-react'

// ===== 全球节点网络架构数据（精确对齐 2000x857 SVG 投影坐标） =====
const WORLD_VIEWBOX = { w: 2000, h: 857 }

export interface GlobalNode {
  code: string
  name: string
  zhName: string
  flag: string
  region: string
  zhRegion: string
  sales: number
  growth: string
  latency: string
  status: 'Optimal' | 'Active' | 'Surging'
  zhStatus: '最优' | '畅通' | '激增'
  cx: number
  cy: number
  isTop: boolean
  activeOrders: number
  fulfillRate: string
}

const GLOBAL_NODES: GlobalNode[] = [
  {
    code: 'us',
    name: 'United States',
    zhName: '美国',
    flag: '🇺🇸',
    region: 'North America',
    zhRegion: '北美核心枢纽',
    sales: 1245680,
    growth: '+18.4%',
    latency: '12ms',
    status: 'Optimal',
    zhStatus: '最优',
    cx: 475,
    cy: 275,
    isTop: true,
    activeOrders: 428,
    fulfillRate: '99.8%',
  },
  {
    code: 'br',
    name: 'Brazil',
    zhName: '巴西',
    flag: '🇧🇷',
    region: 'Latin America',
    zhRegion: '拉美分销中心',
    sales: 684320,
    growth: '+12.6%',
    latency: '45ms',
    status: 'Active',
    zhStatus: '畅通',
    cx: 690,
    cy: 620,
    isTop: true,
    activeOrders: 184,
    fulfillRate: '98.5%',
  },
  {
    code: 'fi',
    name: 'Finland',
    zhName: '芬兰',
    flag: '🇫🇮',
    region: 'Nordic & Europe',
    zhRegion: '北欧高算力节点',
    sales: 312450,
    growth: '+9.8%',
    latency: '18ms',
    status: 'Optimal',
    zhStatus: '最优',
    cx: 1105,
    cy: 110,
    isTop: true,
    activeOrders: 92,
    fulfillRate: '99.9%',
  },
  {
    code: 'bd',
    name: 'Bangladesh',
    zhName: '孟加拉国',
    flag: '🇧🇩',
    region: 'South Asia',
    zhRegion: '南亚物流干线',
    sales: 158970,
    growth: '+24.1%',
    latency: '36ms',
    status: 'Surging',
    zhStatus: '激增',
    cx: 1435,
    cy: 365,
    isTop: true,
    activeOrders: 67,
    fulfillRate: '97.6%',
  },
  {
    code: 'de',
    name: 'Germany',
    zhName: '德国',
    flag: '🇩🇪',
    region: 'Central Europe',
    zhRegion: '欧洲中转枢纽',
    sales: 478900,
    growth: '+11.0%',
    latency: '16ms',
    status: 'Optimal',
    zhStatus: '最优',
    cx: 1050,
    cy: 190,
    isTop: false,
    activeOrders: 215,
    fulfillRate: '99.7%',
  },
  {
    code: 'jp',
    name: 'Japan',
    zhName: '日本',
    flag: '🇯🇵',
    region: 'East Asia',
    zhRegion: '东亚仓储中心',
    sales: 540200,
    growth: '+15.2%',
    latency: '14ms',
    status: 'Optimal',
    zhStatus: '最优',
    cx: 1690,
    cy: 280,
    isTop: false,
    activeOrders: 310,
    fulfillRate: '99.9%',
  },
  {
    code: 'sg',
    name: 'Singapore',
    zhName: '新加坡',
    flag: '🇸🇬',
    region: 'Southeast Asia',
    zhRegion: '东南亚骨干路由',
    sales: 398600,
    growth: '+19.3%',
    latency: '15ms',
    status: 'Optimal',
    zhStatus: '最优',
    cx: 1515,
    cy: 485,
    isTop: false,
    activeOrders: 162,
    fulfillRate: '99.4%',
  },
  {
    code: 'ae',
    name: 'UAE',
    zhName: '阿联酋',
    flag: '🇦🇪',
    region: 'Middle East',
    zhRegion: '中东海湾分发',
    sales: 289400,
    growth: '+21.5%',
    latency: '28ms',
    status: 'Optimal',
    zhStatus: '最优',
    cx: 1295,
    cy: 345,
    isTop: false,
    activeOrders: 119,
    fulfillRate: '99.1%',
  },
  {
    code: 'au',
    name: 'Australia',
    zhName: '澳大利亚',
    flag: '🇦🇺',
    region: 'Oceania',
    zhRegion: '大洋洲干线节点',
    sales: 215300,
    growth: '+8.7%',
    latency: '32ms',
    status: 'Optimal',
    zhStatus: '最优',
    cx: 1720,
    cy: 670,
    isTop: false,
    activeOrders: 88,
    fulfillRate: '98.9%',
  },
  {
    code: 'za',
    name: 'South Africa',
    zhName: '南非',
    flag: '🇿🇦',
    region: 'Africa',
    zhRegion: '南部非洲边缘站',
    sales: 142000,
    growth: '+14.9%',
    latency: '52ms',
    status: 'Active',
    zhStatus: '畅通',
    cx: 1120,
    cy: 710,
    isTop: false,
    activeOrders: 54,
    fulfillRate: '98.1%',
  },
]

// 跨洲全球路由互联干线贝塞尔航线
const GLOBAL_ROUTES = [
  { from: 'us', to: 'de', d: 'M 475 275 Q 760 140 1050 190' },
  { from: 'de', to: 'fi', d: 'M 1050 190 Q 1070 145 1105 110' },
  { from: 'de', to: 'ae', d: 'M 1050 190 Q 1180 240 1295 345' },
  { from: 'ae', to: 'bd', d: 'M 1295 345 Q 1365 330 1435 365' },
  { from: 'bd', to: 'sg', d: 'M 1435 365 Q 1485 410 1515 485' },
  { from: 'sg', to: 'jp', d: 'M 1515 485 Q 1630 390 1690 280' },
  { from: 'sg', to: 'au', d: 'M 1515 485 Q 1610 590 1720 670' },
  { from: 'us', to: 'br', d: 'M 475 275 Q 540 460 690 620' },
  { from: 'br', to: 'za', d: 'M 690 620 Q 905 730 1120 710' },
]

type WorldPath = { d: string; name: string; id: string }

export function DashboardView({
  displayName,
}: {
  displayName?: string
}) {
  const { isZh } = useLanguage()
  const [expensePeriod, setExpensePeriod] = useState<'day' | 'week' | 'month' | 'year'>('day')
  const [activeCountryFilter, setActiveCountryFilter] = useState<'all' | 'top'>('all')

  // ===== 全球市场与节点分布真实状态驱动系统 =====
  const [worldPaths, setWorldPaths] = useState<WorldPath[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)
  const [hoveredNode, setHoveredNode] = useState<GlobalNode | null>(null)
  const [selectedNode, setSelectedNode] = useState<GlobalNode | null>(null)
  const [zoomScale, setZoomScale] = useState<number>(1)
  const [zoomOrigin, setZoomOrigin] = useState<string>('50% 50%')

  // ===== 交互状态与模态框 =====
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [activeModal, setActiveModal] = useState<'export' | 'fulfill' | 'products' | 'details' | null>(null)
  const [modalTitle, setModalTitle] = useState('')

  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(null), 3500)
      return () => clearTimeout(t)
    }
  }, [toastMessage])

  // 加载真实世界地图（public/world.svg）
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
            name:
              el.getAttribute('name') ||
              el.getAttribute('class') ||
              el.getAttribute('id') ||
              '',
            id: el.getAttribute('id') || '',
          }))
          .filter((p) => p.d)
        setWorldPaths(arr)
        setMapLoaded(true)
      })
      .catch(() => {
        if (alive) setMapLoaded(true)
      })
    return () => {
      alive = false
    }
  }, [])

  // 过滤当前展示节点
  const displayNodes = useMemo(() => {
    if (activeCountryFilter === 'top') {
      return GLOBAL_NODES.filter((n) => n.isTop)
    }
    return GLOBAL_NODES
  }, [activeCountryFilter])

  // 当前高亮国家名称/代码集合（用于地图上染色）
  const activeCountryNames = useMemo(() => {
    const s = new Set<string>()
    displayNodes.forEach((n) => {
      s.add(n.name.toLowerCase())
      s.add(n.code.toLowerCase())
      s.add(n.zhName)
    })
    return s
  }, [displayNodes])

  // 节点聚焦与下钻放大
  const handleFocusNode = (node: GlobalNode) => {
    if (selectedNode?.code === node.code && zoomScale > 1) {
      // 再次点击取消聚焦
      setZoomScale(1)
      setZoomOrigin('50% 50%')
      setSelectedNode(null)
      return
    }
    setSelectedNode(node)
    const originX = ((node.cx / WORLD_VIEWBOX.w) * 100).toFixed(1)
    const originY = ((node.cy / WORLD_VIEWBOX.h) * 100).toFixed(1)
    setZoomOrigin(`${originX}% ${originY}%`)
    setZoomScale(1.8)
    setToastMessage(
      isZh
        ? `已定位至 [${node.flag} ${node.zhName} ${node.zhRegion}] - 实时时延 ${node.latency}`
        : `Focused on [${node.flag} ${node.name}] - Latency ${node.latency}`
    )
  }

  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(prev + 0.4, 2.5))
  }

  const handleZoomOut = () => {
    setZoomScale((prev) => {
      const next = Math.max(prev - 0.4, 1)
      if (next === 1) {
        setZoomOrigin('50% 50%')
        setSelectedNode(null)
      }
      return next
    })
  }

  const handleResetZoom = () => {
    setZoomScale(1)
    setZoomOrigin('50% 50%')
    setSelectedNode(null)
    setHoveredNode(null)
  }

  // Top Products 数据
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
    <div className="space-y-6">
      {/* ============================================================
          顶部欢迎子头部 (Sub-header)
          Back Button + Dashboard Title + Greeting + Action Pills
          ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-[#111827]">
            {isZh ? '店铺仪表盘' : 'Store Analytics'}
          </h1>
          <p className="text-xs text-[#6B7280] font-medium flex items-center gap-1.5 mt-0.5">
            <span>{isZh ? `你好，${displayName ?? 'Aya'}` : `Hello ${displayName ?? 'Aya'}`}</span>
            <span className="text-amber-500">👋</span>
          </p>
        </div>

        {/* 顶部右侧操作胶囊群 */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* 导出报表 */}
          <button
            type="button"
            onClick={() => setActiveModal('export')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/90 backdrop-blur-md border border-gray-200/70 text-xs font-semibold text-[#111827] shadow-2xs hover:bg-white transition-all cursor-pointer"
          >
            <Download size={13} className="text-[#111827]" />
            <span>{isZh ? '导出' : 'Export'}</span>
          </button>
        </div>
      </div>

      {/* ============================================================
          Row 1: 左侧 2*2 卡片矩阵 (6 cols) + 右侧客户订单量数据图 (6 cols)
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ---------------- 左侧: 2*2 卡片矩阵 (6 cols) ---------------- */}
        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3 self-start">
          {/* 1. 总销售量卡片 (Total Sales) */}
          <div className="crextio-card p-4 flex flex-col justify-between h-[150px] bg-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#6B7280]">
                {isZh ? '总销售量' : 'Total Sales'}
              </span>
              <div className="w-7 h-7 rounded-full bg-[#F3F4F8] border border-gray-100 flex items-center justify-center text-[#111827]">
                <TrendingUp size={14} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#111827] tracking-tight tnum">
                12,485
              </div>
              <span className="text-[10px] text-[#9CA3AF] block mt-0.5">{isZh ? '全渠道实时同步' : 'Real-time sync'}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-gray-100">
              <span className="text-[#FB7185] font-semibold flex items-center gap-1">
                <span>▲ +3.1%</span>
                <span className="text-[#9CA3AF] font-normal">{isZh ? '较上周' : 'vs Last Week'}</span>
              </span>
              <button
                type="button"
                onClick={() => { setModalTitle(isZh ? '总销售量深度分析' : 'Total Sales Analytics'); setActiveModal('details'); }}
                className="text-[#6B7280] hover:text-[#111827] font-medium flex items-center gap-0.5 transition-colors cursor-pointer text-[10px]"
              >
                <span>{isZh ? '详情' : 'Details'}</span>
                <ArrowUpRight size={11} />
              </button>
            </div>
          </div>

          {/* 2. 活跃客户卡片 (Active Customers) */}
          <div className="crextio-card p-4 flex flex-col justify-between h-[150px] bg-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#6B7280]">
                {isZh ? '活跃客户' : 'Active Customers'}
              </span>
              <div className="w-7 h-7 rounded-full bg-[#F3F4F8] border border-gray-100 flex items-center justify-center text-[#111827]">
                <Users size={14} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#111827] tracking-tight tnum">
                4,263
              </div>
              <span className="text-[10px] text-[#9CA3AF] block mt-0.5">{isZh ? '高价值留存客户' : 'High retention'}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-gray-100">
              <span className="text-[#FB7185] font-semibold flex items-center gap-1">
                <span>▲ +1.8%</span>
                <span className="text-[#9CA3AF] font-normal">{isZh ? '新增客户' : 'New'}</span>
              </span>
              <button
                type="button"
                onClick={() => { setModalTitle(isZh ? '活跃客户与留存画像' : 'Customer LTV & Retention Analysis'); setActiveModal('details'); }}
                className="text-[#6B7280] hover:text-[#111827] font-medium flex items-center gap-0.5 transition-colors cursor-pointer text-[10px]"
              >
                <span>{isZh ? '详情' : 'Details'}</span>
                <ArrowUpRight size={11} />
              </button>
            </div>
          </div>

          {/* 3. 总营收卡片 (Total Revenue) */}
          <div className="crextio-card p-4 flex flex-col justify-between h-[150px] bg-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#6B7280]">
                {isZh ? '总营收' : 'Total Revenue'}
              </span>
              <div className="w-7 h-7 rounded-full bg-[#F3F4F8] border border-gray-100 flex items-center justify-center text-[#111827]">
                <DollarSign size={14} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#111827] tracking-tight tnum">
                $68,837
              </div>
              <span className="text-[10px] text-[#9CA3AF] block mt-0.5">{isZh ? '已完成结算总额' : 'Settled Payouts'}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-gray-100">
              <span className="text-[#FB7185] font-semibold flex items-center gap-1">
                <span>▲ +2.4%</span>
                <span className="text-[#9CA3AF] font-normal">{isZh ? '较上周' : 'vs Last Week'}</span>
              </span>
              <button
                type="button"
                onClick={() => { setModalTitle(isZh ? '全渠道营收对账与结算' : 'Revenue Reconciliation & Payouts'); setActiveModal('details'); }}
                className="text-[#6B7280] hover:text-[#111827] font-medium flex items-center gap-0.5 transition-colors cursor-pointer text-[10px]"
              >
                <span>{isZh ? '详情' : 'Details'}</span>
                <ArrowUpRight size={11} />
              </button>
            </div>
          </div>

          {/* 4. 平均客单价卡片 (Average Order Value - AOV) */}
          <div className="crextio-card p-4 flex flex-col justify-between h-[150px] bg-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#6B7280]">
                {isZh ? '平均客单价 (AOV)' : 'Average Order Value'}
              </span>
              <div className="w-7 h-7 rounded-full bg-[#F3F4F8] border border-gray-100 flex items-center justify-center text-[#111827]">
                <DollarSign size={14} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#111827] tracking-tight tnum">
                $148.50
              </div>
              <span className="text-[10px] text-[#9CA3AF] block mt-0.5">{isZh ? '每单平均交易额' : 'Per transaction'}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-gray-100">
              <span className="text-[#FB7185] font-semibold flex items-center gap-1">
                <span>▲ +5.2%</span>
                <span className="text-[#9CA3AF] font-normal">{isZh ? '较上月' : 'vs Last Mo'}</span>
              </span>
              <button
                type="button"
                onClick={() => { setModalTitle(isZh ? '客单价与商品组合分析' : 'AOV & Bundle Analytics'); setActiveModal('details'); }}
                className="text-[#6B7280] hover:text-[#111827] font-medium flex items-center gap-0.5 transition-colors cursor-pointer text-[10px]"
              >
                <span>{isZh ? '详情' : 'Details'}</span>
                <ArrowUpRight size={11} />
              </button>
            </div>
          </div>
        </div>

        {/* ---------------- 右侧: 客户订单量数据图 (6 cols) ---------------- */}
        <div className="lg:col-span-6">
          <div className="crextio-card p-5 h-full flex flex-col justify-between bg-white">
            <div>
              {/* 头部 */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-heading text-sm sm:text-base font-bold text-[#111827] flex items-center gap-1.5">
                    {isZh ? '客户订单量趋势与数据图' : 'Customer Orders Trend Data Chart'}
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-50 text-[#E11D48] font-bold border border-rose-200">
                      Live Wave
                    </span>
                  </h3>
                  <span className="text-[10px] text-[#9CA3AF]">
                    {isZh ? '2026年1月1日 - 12月12日 全年订单曲线' : '1 Jan - 12 Dec 2026 Order Curve'}
                  </span>
                </div>
                <button
                  type="button"
                  className="w-7 h-7 rounded-full hover:bg-[#F3F4F8] flex items-center justify-center text-[#9CA3AF] hover:text-[#111827] transition-colors"
                  aria-label="Options"
                >
                  <MoreHorizontal size={15} />
                </button>
              </div>

              {/* 大数字与标签 */}
              <div className="my-1.5">
                <div className="text-xl sm:text-2xl font-bold tracking-tight text-[#111827] tnum">
                  45,637 <span className="text-xs font-normal text-[#6B7280]">{isZh ? '总订单' : 'total orders'}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="px-2 py-0.5 rounded-full bg-[#FB7185] text-white text-[10px] font-bold">
                    +9.4% ↗
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#F3F4F8] text-[#6B7280] text-[10px] font-medium">
                    {isZh ? '今日新增 +245 单' : '+245 today'}
                  </span>
                </div>
              </div>
            </div>

            {/* 平滑粉色波浪图 */}
            <div className="relative pt-3 pb-1">
              <div className="relative w-full h-36">
                {/* 峰值高亮 Tooltip */}
                <div className="absolute left-[64%] -top-3.5 -translate-x-1/2 bg-white/95 backdrop-blur-md border border-rose-200 shadow-sm rounded-md px-2 py-0.5 text-[9px] font-bold text-[#E11D48] z-10">
                  2,345 {isZh ? '单/日峰值' : 'peak'}
                </div>

                {/* 峰值浅粉色垂直投影柱 */}
                <div className="absolute left-[64%] top-1 bottom-0 w-6 -translate-x-1/2 bg-[#FB7185]/15 rounded-t-lg pointer-events-none" />

                {/* SVG 柔和波浪曲线 */}
                <svg viewBox="0 0 300 120" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="orderPinkGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FB7185" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#FB7185" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 95 C 40 90, 70 105, 110 85 C 150 65, 180 90, 210 30 C 240 70, 270 50, 300 75 L 300 120 L 0 120 Z"
                    fill="url(#orderPinkGradient)"
                  />
                  <path
                    d="M 0 95 C 40 90, 70 105, 110 85 C 150 65, 180 90, 210 30 C 240 70, 270 50, 300 75"
                    fill="none"
                    stroke="#FB7185"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle cx="210" cy="30" r="4.5" fill="#FFFFFF" stroke="#FB7185" strokeWidth="2.5" />
                </svg>
              </div>

              {/* 月份轴 */}
              <div className="flex justify-between text-[10px] text-[#9CA3AF] mt-2 px-1">
                <span>{isZh ? '5月' : 'May'}</span>
                <span>{isZh ? '6月' : 'Jun'}</span>
                <span>{isZh ? '7月' : 'Jul'}</span>
                <span>{isZh ? '8月' : 'Aug'}</span>
                <span>{isZh ? '9月' : 'Sep'}</span>
                <span className="font-bold text-[#E11D48]">{isZh ? '10月' : 'Oct'}</span>
                <span>{isZh ? '11月' : 'Nov'}</span>
                <span>{isZh ? '12月' : 'Dec'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          Row 2 (Analytical Depth & Geographic Heatmap): Global Sales Heatmap (8 cols) + Customer Orders Wave (4 cols)
          ============================================================ */}




      {/* ============================================================
          3. 底部卡片区 (Customer Orders 4 cols + Sales by Countries 8 cols)
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 左侧卡片: 畅销商品 (4 cols) */}
        <div className="lg:col-span-4">
          <div className="crextio-card p-4 sm:p-5 h-full flex flex-col justify-between bg-white">
            <div>
              {/* 头部 */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading text-sm sm:text-base font-bold text-[#111827]">
                  {isZh ? '畅销商品' : 'Top Products'}
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveModal('products')}
                  className="w-7 h-7 rounded-full hover:bg-[#F3F4F8] flex items-center justify-center text-[#9CA3AF] hover:text-[#111827] transition-colors cursor-pointer"
                  aria-label="Options"
                >
                  <MoreHorizontal size={15} />
                </button>
              </div>

              {/* 产品垂直列表 */}
              <div className="space-y-2.5">
                {topProducts.slice(0, 4).map((product) => (
                  <div
                    key={product.id}
                    onClick={() => setActiveModal('products')}
                    className="flex items-center justify-between p-2 rounded-xl bg-gray-50/60 hover:bg-white transition-all group cursor-pointer border border-gray-100 hover:border-[#FB7185]/30 hover:shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-white border border-gray-100 overflow-hidden relative shrink-0">
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
                        <p className="text-[10px] text-[#9CA3AF] truncate mt-0.5">
                          {product.category}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-[#E11D48] shrink-0 pl-2 tnum">
                      {product.price}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal('products')}
                className="px-3 py-1 rounded-full bg-[#F3F4F8] hover:bg-[#111827] hover:text-white text-[#111827] text-[11px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <span>{isZh ? '查看全部商品' : 'View All'}</span>
                <ExternalLink size={11} />
              </button>
            </div>
          </div>
        </div>

        {/* 右侧卡片: 全球市场与热销热力图 (8 cols) */}
        <div className="lg:col-span-8">
          <div className="crextio-card p-4 sm:p-5 h-full flex flex-col justify-between relative overflow-hidden">
            {/* 1. 顶部标题栏与筛选器 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#FB7185] animate-pulse" />
                  <h3 className="font-heading text-sm sm:text-base font-bold text-[#111827] flex items-center gap-1.5">
                    {isZh ? '全球市场实时热销热力图' : 'Global Sales Heatmap'}
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-rose-50 text-[#E11D48] border border-rose-200">
                      {isZh ? '实时销售' : 'Live Sales'}
                    </span>
                  </h3>
                </div>
                <p className="text-[11px] text-[#6B7280] mt-0.5">
                  {isZh
                    ? '全球各国家与地区实时销售额分布热力追踪（点击节点查看地区销售）'
                    : 'Real-time sales distribution heatmap across international markets'}
                </p>
              </div>

              {/* 筛选与视图胶囊 */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <div className="flex items-center gap-0.5 bg-[#F3F4F8] p-0.5 rounded-full text-xs shrink-0 border border-gray-200/60">
                  <button
                    type="button"
                    onClick={() => setActiveCountryFilter('all')}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                      activeCountryFilter === 'all'
                        ? 'bg-[#111827] text-white shadow-2xs'
                        : 'text-[#6B7280] hover:text-[#111827]'
                    }`}
                  >
                    {isZh ? '全部地区 (10)' : 'All (10)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCountryFilter('top')}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                      activeCountryFilter === 'top'
                        ? 'bg-[#111827] text-white shadow-2xs'
                        : 'text-[#6B7280] hover:text-[#111827]'
                    }`}
                  >
                    {isZh ? '核心 Top 4' : 'Top 4'}
                  </button>
                </div>
              </div>
            </div>

            {/* 2. 真实 SVG 世界地图与热力分布容器 */}
            <div className="relative w-full aspect-[2000/860] my-2 rounded-2xl bg-gradient-to-b from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0] overflow-hidden select-none border border-slate-200/80 shadow-inner">
              {/* 地图悬浮控制条 (Zoom In / Out / Reset) */}
              <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 bg-white/90 backdrop-blur-md p-1 rounded-xl shadow-xs border border-gray-200/80">
                <button
                  type="button"
                  onClick={handleZoomIn}
                  title={isZh ? '放大' : 'Zoom In'}
                  className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-[#111827] transition-colors cursor-pointer"
                >
                  <ZoomIn size={14} />
                </button>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  title={isZh ? '缩小' : 'Zoom Out'}
                  className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-[#111827] transition-colors cursor-pointer"
                >
                  <ZoomOut size={14} />
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  title={isZh ? '重置视图' : 'Reset View'}
                  className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-[#6B7280] hover:text-[#111827] transition-colors cursor-pointer"
                >
                  <RotateCcw size={13} />
                </button>
              </div>

              {/* 左上角当前聚焦指示器 */}
              <div className="absolute top-3 left-3 z-30 pointer-events-none">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md border border-gray-200/70 text-[10px] font-semibold text-[#111827] shadow-2xs">
                  <Radio size={12} className="text-[#FB7185] animate-pulse" />
                  <span>
                    {selectedNode
                      ? `${selectedNode.flag} ${isZh ? selectedNode.zhName : selectedNode.name} ($${selectedNode.sales.toLocaleString()})`
                      : (isZh ? '全球热销热力追踪中 · 数据实时同步' : 'Global Sales Heatmap Active')}
                  </span>
                </div>
              </div>

              {/* 核心 SVG 画布 */}
              <svg
                viewBox={`0 0 ${WORLD_VIEWBOX.w} ${WORLD_VIEWBOX.h}`}
                preserveAspectRatio="xMidYMid meet"
                className="w-full h-full transition-transform duration-500 ease-out"
                style={{
                  transform: `scale(${zoomScale})`,
                  transformOrigin: zoomOrigin,
                }}
              >
                <defs>
                  {/* 航线渐变 */}
                  <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FB7185" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#F43F5E" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#A855F7" stopOpacity="0.7" />
                  </linearGradient>

                  {/* 节点外发光 */}
                  <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="1" stdDeviation="3" floodColor="#FB7185" floodOpacity="0.6" />
                  </filter>
                </defs>

                {/* 1. 世界陆地轮廓 */}
                <g className="world-base-map">
                  {worldPaths.map((p, idx) => {
                    const pName = p.name.toLowerCase()
                    const pId = p.id.toLowerCase()
                    const isCountryActive =
                      activeCountryNames.has(pName) ||
                      activeCountryNames.has(pId)
                    const isSelected =
                      selectedNode &&
                      (pName.includes(selectedNode.name.toLowerCase()) ||
                        pId === selectedNode.code.toLowerCase() ||
                        p.name === selectedNode.zhName)

                    return (
                      <path
                        key={idx}
                        d={p.d}
                        className={`transition-colors duration-200 cursor-pointer ${
                          isSelected
                            ? 'fill-[#E11D48] stroke-[#FFFFFF] stroke-[1]'
                            : isCountryActive
                            ? 'fill-[#FDA4AF] hover:fill-[#FB7185] stroke-[#FFFFFF] stroke-[0.8]'
                            : 'fill-[#CBD5E1] hover:fill-[#94A3B8] stroke-[#FFFFFF] stroke-[0.5]'
                        }`}
                        onClick={() => {
                          const matched = GLOBAL_NODES.find(
                            (n) =>
                              n.name.toLowerCase() === pName ||
                              n.code.toLowerCase() === pId ||
                              p.name.includes(n.zhName)
                          )
                          if (matched) handleFocusNode(matched)
                        }}
                      />
                    )
                  })}
                </g>

                {/* 2. 跨洲跨洋智能干线路由连接弧线 */}
                <g className="global-routing-arcs pointer-events-none">
                  {GLOBAL_ROUTES.map((route, idx) => {
                    const fromNode = GLOBAL_NODES.find((n) => n.code === route.from)
                    const toNode = GLOBAL_NODES.find((n) => n.code === route.to)
                    const isVisible =
                      displayNodes.some((n) => n.code === route.from) ||
                      displayNodes.some((n) => n.code === route.to)

                    if (!isVisible || !fromNode || !toNode) return null

                    return (
                      <g key={`route-${idx}`}>
                        <path
                          d={route.d}
                          fill="none"
                          stroke="url(#routeGradient)"
                          strokeWidth="2.2"
                          strokeDasharray="4,5"
                          strokeOpacity="0.7"
                        />
                        <path
                          d={route.d}
                          fill="none"
                          stroke="#FFFFFF"
                          strokeWidth="3.5"
                          strokeDasharray="12,180"
                          strokeLinecap="round"
                          className="opacity-90 animate-pulse"
                        />
                      </g>
                    )
                  })}
                </g>

                {/* 3. 活跃节点动态脉冲雷达圆点 */}
                <g className="node-beacons">
                  {displayNodes.map((node) => {
                    const isFocused = selectedNode?.code === node.code
                    const isHover = hoveredNode?.code === node.code

                    return (
                      <g
                        key={`node-${node.code}`}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredNode(node)}
                        onMouseLeave={() => setHoveredNode(null)}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleFocusNode(node)
                        }}
                      >
                        <circle
                          cx={node.cx}
                          cy={node.cy}
                          r={isFocused ? 26 : 18}
                          fill="#FB7185"
                          fillOpacity="0.25"
                          className="animate-ping"
                          style={{ transformOrigin: `${node.cx}px ${node.cy}px` }}
                        />
                        <circle
                          cx={node.cx}
                          cy={node.cy}
                          r={isFocused ? 16 : 11}
                          fill="#E11D48"
                          fillOpacity="0.35"
                        />
                        <circle
                          cx={node.cx}
                          cy={node.cy}
                          r={isFocused ? 7 : 5}
                          fill="#E11D48"
                          stroke="#FFFFFF"
                          strokeWidth="2"
                          filter="url(#nodeGlow)"
                        />
                        <circle
                          cx={node.cx}
                          cy={node.cy}
                          r={2}
                          fill="#FFFFFF"
                        />

                        {/* 节点悬浮标签徽章 (仅显示国家名与销售额，无延迟等干扰信息) */}
                        <g
                          transform={`translate(${node.cx - 50}, ${node.cy - 48})`}
                          className="transition-transform duration-300 pointer-events-none"
                        >
                          <rect
                            x="0"
                            y="0"
                            width="100"
                            height="34"
                            rx="8"
                            fill="#FFFFFF"
                            fillOpacity={isFocused || isHover ? '0.98' : '0.92'}
                            stroke={isFocused ? '#FB7185' : '#E2E8F0'}
                            strokeWidth={isFocused ? '2' : '1'}
                            filter="url(#nodeGlow)"
                          />
                          <text
                            x="8"
                            y="15"
                            fontSize="11"
                            fontWeight="bold"
                            fill="#111827"
                          >
                            {node.flag} {isZh ? node.zhName : node.name}
                          </text>
                          <text
                            x="8"
                            y="28"
                            fontSize="10"
                            fontWeight="bold"
                            fill="#FB7185"
                          >
                            ${(node.sales / 1000).toFixed(0)}k
                            <tspan
                              dx="4"
                              fontSize="8"
                              fontWeight="normal"
                              fill="#10B981"
                            >
                              {node.growth}
                            </tspan>
                          </text>
                        </g>
                      </g>
                    )
                  })}
                </g>
              </svg>

              {/* 4. 选中国家/悬浮时的高级销售热力诊断浮窗 (HUD Popover) */}
              {(selectedNode || hoveredNode) && (
                <div className="absolute bottom-3 left-3 z-40 bg-white/95 backdrop-blur-md rounded-xl p-3 border border-slate-200/90 shadow-lg text-xs max-w-[280px] animate-fadeIn">
                  {(() => {
                    const target = selectedNode || hoveredNode!
                    return (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-[#111827]">
                            <span className="text-base">{target.flag}</span>
                            <span>{isZh ? target.zhName : target.name}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-50 text-[#E11D48] font-semibold">
                              {isZh ? target.zhRegion : target.region}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedNode(null)
                              setHoveredNode(null)
                            }}
                            className="text-[#9CA3AF] hover:text-[#111827] text-xs font-bold cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
                          <div>
                            <span className="text-[9px] text-[#9CA3AF] block">{isZh ? '实时销售总额' : 'Sales Volume'}</span>
                            <span className="font-bold text-[#111827] text-xs tnum">${target.sales.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-[#9CA3AF] block">{isZh ? '同比增长' : 'YoY Growth'}</span>
                            <span className="font-bold text-emerald-600 text-xs tnum">{target.growth}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-[#9CA3AF] block">{isZh ? '活跃订单数' : 'Active Orders'}</span>
                            <span className="font-semibold text-[#111827] text-[11px] tnum">
                              {target.activeOrders} {isZh ? '单' : 'orders'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] text-[#9CA3AF] block">{isZh ? '订单妥投率' : 'Fulfillment Rate'}</span>
                            <span className="font-semibold text-emerald-600 text-[11px] tnum">{target.fulfillRate}</span>
                          </div>
                        </div>

                        <div className="pt-1.5 flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setModalTitle(`${target.flag} ${isZh ? target.zhName : target.name} ${isZh ? '地区销售深度分析' : 'Regional Sales Analytics'}`)
                              setActiveModal('details')
                            }}
                            className="w-full py-1.5 rounded-lg bg-[#111827] hover:bg-black text-white text-[10px] font-semibold transition-all cursor-pointer text-center"
                          >
                            {isZh ? '查看该地区销售分析' : 'View Regional Sales Analytics'}
                          </button>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>

            {/* 3. 底部各地区实时销售数据速览网格 */}
            <div className="pt-2 border-t border-gray-100 mt-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#111827] flex items-center gap-1">
                  <Activity size={12} className="text-[#FB7185]" />
                  {isZh ? '各主要市场销售业绩速览 (点击地图或卡片查看)' : 'Regional Markets Performance'}
                </span>
                <span className="text-[10px] text-[#6B7280]">
                  {isZh ? `已接入 ${displayNodes.length} 个重点国家/地区` : `${displayNodes.length} Markets Tracked`}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 max-h-36 overflow-y-auto pr-0.5">
                {displayNodes.map((node) => {
                  const isSelected = selectedNode?.code === node.code
                  return (
                    <div
                      key={node.code}
                      onClick={() => handleFocusNode(node)}
                      className={`p-2 rounded-xl transition-all cursor-pointer group border ${
                        isSelected
                          ? 'bg-rose-50/80 border-[#FB7185] shadow-xs'
                          : 'bg-white/90 hover:bg-white border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1 min-w-0">
                          <span className="text-xs shrink-0">{node.flag}</span>
                          <span className="text-[11px] font-bold text-[#111827] truncate">
                            {isZh ? node.zhName : node.name}
                          </span>
                        </div>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-50 font-semibold text-emerald-600 shrink-0 tnum">
                          {node.growth}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[11px]">
                        <span className="font-semibold text-[#111827] tnum">
                          ${(node.sales / 1000).toFixed(0)}k
                        </span>
                        <span className="text-[9px] text-[#6B7280] tnum">
                          {node.activeOrders} {isZh ? '单' : 'orders'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 交互式模态框与 Toast 通知 ===== */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-100 overflow-hidden relative">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-heading text-base font-bold text-[#111827]">
                {activeModal === 'export' && (isZh ? '导出店铺经营报表' : 'Export Store Analytics')}
                {activeModal === 'fulfill' && (isZh ? '订单批量履约与发货中心' : 'Order Fulfillment & Shipping Hub')}
                {activeModal === 'products' && (isZh ? '全渠道在售精选商品库存' : 'Active Products Inventory')}
                {activeModal === 'details' && (modalTitle || (isZh ? '指标数据深度分析' : 'Metric Deep Dive'))}
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-[#6B7280] flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {activeModal === 'export' && (
              <div className="space-y-4 text-xs text-[#6B7280]">
                <p>{isZh ? '请选择您要导出的报表格式与时间跨度，系统将生成加密 CSV/Excel 结算明细：' : 'Select format and date range for your secure export:'}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl border-2 border-[#FB7185] bg-rose-50/40 font-bold text-[#111827] cursor-pointer text-center">
                    CSV 详细账单
                  </div>
                  <div className="p-3 rounded-xl border border-gray-200 hover:border-gray-300 font-semibold text-[#6B7280] cursor-pointer text-center">
                    Excel 财务汇总
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveModal(null)
                      setToastMessage(isZh ? '报表已成功生成并推送到您的下载队列' : 'Report generated and queued for download')
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#111827] hover:bg-black text-white font-semibold shadow-2xs transition-all cursor-pointer text-xs"
                  >
                    {isZh ? '确认生成下载链接' : 'Confirm & Download'}
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'fulfill' && (
              <div className="space-y-3 text-xs">
                <p className="text-[#6B7280]">{isZh ? '当前共有 12 笔待发货订单等待智能路由分发：' : '12 unfulfilled orders ready for AI routing:'}</p>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100">
                      <div>
                        <span className="font-bold text-[#111827]">#ORD-2026-88{i}</span>
                        <span className="text-[10px] text-[#9CA3AF] block">{isZh ? 'Adidas Ultraboost 22 · 1件' : 'Adidas Ultraboost 22 · 1pc'}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {isZh ? '就绪' : 'Ready'}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveModal(null)
                      setToastMessage(isZh ? '成功执行 12 笔订单一键批量履约发货！' : 'Successfully batch fulfilled 12 orders!')
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#FB7185] hover:bg-[#E11D48] text-white font-semibold shadow-2xs transition-all cursor-pointer text-xs flex items-center justify-center gap-1.5"
                  >
                    <Truck size={14} />
                    <span>{isZh ? '立即一键批量发货 (12)' : 'Execute Batch Fulfill (12)'}</span>
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'products' && (
              <div className="space-y-3 text-xs">
                <p className="text-[#6B7280]">{isZh ? '当前店铺在售精选商品库存及实时销量：' : 'Active store inventory and sales velocity:'}</p>
                <div className="space-y-2">
                  {topProducts.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#111827]">{p.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 text-[#6B7280]">{p.category}</span>
                      </div>
                      <span className="font-bold text-[#E11D48]">{p.price}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 rounded-xl bg-[#111827] text-white font-semibold text-xs cursor-pointer"
                  >
                    {isZh ? '关闭' : 'Close'}
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'details' && (
              <div className="space-y-3 text-xs text-[#6B7280]">
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-gray-100">
                  <span className="font-bold text-[#111827] block mb-1">{isZh ? '核心指标多维拆解' : 'Multidimensional Breakdown'}</span>
                  <p>{isZh ? '基于 AI 实时监测的归因模型，该指标在过去 7 天内保持稳健增长，环比提升 +14.2%，履约时效达到行业前 5%。' : 'Real-time AI monitored attribution model shows steady 14.2% week-over-week growth.'}</p>
                </div>
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 rounded-xl bg-[#111827] text-white font-semibold text-xs cursor-pointer"
                  >
                    {isZh ? '知道了' : 'Got it'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== 浮动 Toast 提示通知 ===== */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111827] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-bounce">
          <CheckCircle2 size={16} className="text-[#FB7185] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
