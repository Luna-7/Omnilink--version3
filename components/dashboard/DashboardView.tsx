'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { useLanguage } from '@/context/LanguageContext'
import { motion, AnimatePresence } from 'motion/react'
import {
  TrendingUp,
  Users,
  DollarSign,
  Receipt,
  ArrowUpRight,
  MoreHorizontal,
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
  Package,
  Box,
  Train,
  FileText,
  Star,
  Sparkles,
  ChevronRight,
  SlidersHorizontal,
  Clock,
  Trophy,
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
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<'Weekly' | 'Monthly' | 'Yearly'>('Weekly')
  const [stockTimeframe, setStockTimeframe] = useState<'Weekly' | 'Monthly'>('Weekly')
  const [activeCountryFilter, setActiveCountryFilter] = useState<'all' | 'top'>('all')

  // ===== 全球市场与节点分布真实状态驱动系统 =====
  const [worldPaths, setWorldPaths] = useState<WorldPath[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)
  const [hoveredNode, setHoveredNode] = useState<GlobalNode | null>(null)
  const [selectedNode, setSelectedNode] = useState<GlobalNode | null>(null)
  const [zoomScale, setZoomScale] = useState<number>(1)
  const [zoomOrigin, setZoomOrigin] = useState<string>('50% 50%')

  // ===== Stock Heatmap Matrix Data =====
  const stockCategories = [
    { name: 'Fashion', zhName: '服饰鞋包' },
    { name: 'Electronics', zhName: '数码电子' },
    { name: 'Food', zhName: '食品生鲜' },
    { name: 'Cosmetics', zhName: '美妆护肤' },
  ]
  const stockDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  // Heatmap values Matrix (4 categories x 7 days)
  const stockMatrix = [
    [120, 240, 310, 290, 420, 180, 90],  // Fashion
    [320, 190, 280, 450, 310, 150, 210], // Electronics
    [80,  210, 380, 290, 410, 260, 490], // Food
    [230, 340, 160, 280, 120, 480, 320], // Cosmetics
  ]

  // Hover state for heatmap tile
  const [hoveredTile, setHoveredTile] = useState<{ row: number; col: number; value: number } | null>(null)

  // ===== 全球实时交易流 (Live Real-time Transactions Stream) =====
  interface LiveTransaction {
    id: string
    buyerName: string
    avatar: string
    flag: string
    countryName: string
    productName: string
    productImage: string
    amount: string
    timestamp: number
    isNew?: boolean
  }

  const INITIAL_TRANSACTIONS: LiveTransaction[] = [
    {
      id: 'tx-1',
      buyerName: 'Sarah Jenkins',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80',
      flag: '🇺🇸',
      countryName: '美国 纽约',
      productName: 'Adidas Ultraboost 22',
      productImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&auto=format&fit=crop&q=80',
      amount: '$180',
      timestamp: Date.now() - 1000,
      isNew: true,
    },
    {
      id: 'tx-2',
      buyerName: 'Kenji Sato',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
      flag: '🇯🇵',
      countryName: '日本 东京',
      productName: 'Sony WH-1000XM5',
      productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&auto=format&fit=crop&q=80',
      amount: '$399',
      timestamp: Date.now() - 12000,
    },
    {
      id: 'tx-3',
      buyerName: 'Max Mueller',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80',
      flag: '🇩🇪',
      countryName: '德国 柏林',
      productName: 'Samsung Watch 6',
      productImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&auto=format&fit=crop&q=80',
      amount: '$299',
      timestamp: Date.now() - 35000,
    },
    {
      id: 'tx-4',
      buyerName: 'Emma Watson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&auto=format&fit=crop&q=80',
      flag: '🇬🇧',
      countryName: '英国 伦敦',
      productName: 'AirPods Pro 2',
      productImage: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=80&auto=format&fit=crop&q=80',
      amount: '$249',
      timestamp: Date.now() - 61000,
    },
  ]

  const [liveTransactions, setLiveTransactions] = useState<LiveTransaction[]>(INITIAL_TRANSACTIONS)
  const [tick, setTick] = useState(0)

  // Ticking effect to refresh dynamic "timeAgo" every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTimeAgo = (ts: number) => {
    const seconds = Math.max(1, Math.floor((Date.now() - ts) / 1000))
    if (seconds < 5) return '1s ago'
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    return `${minutes}m ago`
  }

  // 实时模拟交易流轮播
  useEffect(() => {
    const POOL = [
      { name: 'Lucas Rossi', flag: '🇧🇷', country: '巴西 圣保罗', product: 'Nike Tech Fleece', img: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=80&auto=format&fit=crop&q=80', amount: '$130', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80' },
      { name: 'Amina Al-Mansoor', flag: '🇦🇪', country: '阿联酋 迪拜', product: 'Sony Headphones', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&auto=format&fit=crop&q=80', amount: '$399', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80' },
      { name: 'Liam O\'Connor', flag: '🇦🇺', country: '澳大利亚 悉尼', product: 'Ultraboost Sneakers', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&auto=format&fit=crop&q=80', amount: '$180', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&auto=format&fit=crop&q=80' },
      { name: 'Sofia Korhonen', flag: '🇫🇮', country: '芬兰 赫尔辛基', product: 'Galaxy Watch 6', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&auto=format&fit=crop&q=80', amount: '$299', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&auto=format&fit=crop&q=80' },
    ]

    let poolIdx = 0
    const interval = setInterval(() => {
      const item = POOL[poolIdx % POOL.length]
      poolIdx++
      const newTx: LiveTransaction = {
        id: `tx-${Date.now()}`,
        buyerName: item.name,
        avatar: item.avatar,
        flag: item.flag,
        countryName: item.country,
        productName: item.product,
        productImage: item.img,
        amount: item.amount,
        timestamp: Date.now(),
        isNew: true,
      }
      setLiveTransactions((prev) => [newTx, ...prev.slice(0, 3).map((t) => ({ ...t, isNew: false }))])
    }, 3200)

    return () => clearInterval(interval)
  }, [])

  // ===== 点击国家显示当地时间计算时钟 =====
  const TIMEZONE_MAP: Record<string, { timeZone: string; label: string }> = {
    us: { timeZone: 'America/New_York', label: '纽约 (UTC-4)' },
    br: { timeZone: 'America/Sao_Paulo', label: '圣保罗 (UTC-3)' },
    fi: { timeZone: 'Europe/Helsinki', label: '赫尔辛基 (UTC+3)' },
    bd: { timeZone: 'Asia/Dhaka', label: '达卡 (UTC+6)' },
    de: { timeZone: 'Europe/Berlin', label: '柏林 (UTC+2)' },
    jp: { timeZone: 'Asia/Tokyo', label: '东京 (UTC+9)' },
    sg: { timeZone: 'Asia/Singapore', label: '新加坡 (UTC+8)' },
    ae: { timeZone: 'Asia/Dubai', label: '迪拜 (UTC+4)' },
    au: { timeZone: 'Australia/Sydney', label: '悉尼 (UTC+10)' },
    za: { timeZone: 'Africa/Johannesburg', label: '约翰内斯堡 (UTC+2)' },
  }

  const [selectedCountryTime, setSelectedCountryTime] = useState<string>('')

  useEffect(() => {
    const node = selectedNode || hoveredNode
    if (!node) {
      setSelectedCountryTime('')
      return
    }
    const tzInfo = TIMEZONE_MAP[node.code] || { timeZone: 'UTC', label: 'UTC' }
    const updateClock = () => {
      try {
        const nowStr = new Date().toLocaleTimeString('zh-CN', {
          timeZone: tzInfo.timeZone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
        setSelectedCountryTime(`${nowStr} (${tzInfo.label})`)
      } catch {
        setSelectedCountryTime('12:00:00 (UTC)')
      }
    }
    updateClock()
    const interval = setInterval(updateClock, 1000)
    return () => clearInterval(interval)
  }, [selectedNode, hoveredNode])

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
              el.getAttribute('title') ||
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

  // Top Products 数据 (Top 5 畅销商品)
  const topProducts = [
    {
      id: 'p-1',
      rank: 1,
      name: 'Adidas Ultraboost 22',
      category: '服饰鞋包 / 跑步运动鞋',
      salesCount: '1,840 件',
      price: '$180',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'p-2',
      rank: 2,
      name: 'Samsung Galaxy Watch 6',
      category: '数码电子 / 智能手表',
      salesCount: '1,420 件',
      price: '$299',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'p-3',
      rank: 3,
      name: 'Sony WH-1000XM5',
      category: '数码电子 / 头戴式降噪耳机',
      salesCount: '1,190 件',
      price: '$399',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'p-4',
      rank: 4,
      name: 'Apple AirPods Pro (2nd Gen)',
      category: '数码电子 / 真无线降噪耳机',
      salesCount: '980 件',
      price: '$249',
      image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'p-5',
      rank: 5,
      name: 'Nike Tech Fleece Hoodie',
      category: '服饰鞋包 / 运动连帽拉链衫',
      salesCount: '860 件',
      price: '$130',
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=120&auto=format&fit=crop&q=80',
    },
  ]

  // Color helper for heatmap tiles
  const getTileBgClass = (value: number) => {
    if (value <= 100) return 'bg-[#EFF6FF] border-[#DBEAFE]'
    if (value <= 200) return 'bg-[#BFDBFE] border-[#93C5FD]'
    if (value <= 300) return 'bg-[#60A5FA] border-[#3B82F6] text-white'
    if (value <= 400) return 'bg-[#024AD8] border-[#003198] text-white'
    return 'bg-[#00226B] border-[#001D6E] text-white'
  }

  // 订单履约管道节点数据
  const fulfillmentPipeline = [
    {
      step: 1,
      id: 'ordered',
      name: '已下单',
      value: '4,210',
      unit: '单',
      statusText: '实时转化中',
      icon: ShoppingBag,
    },
    {
      step: 2,
      id: 'packed',
      name: '已打包',
      value: '3,047',
      unit: '单',
      statusText: '仓储出库完成',
      icon: Box,
    },
    {
      step: 3,
      id: 'shipped',
      name: '已发货',
      value: '753',
      unit: '单',
      statusText: '物流干线运输中',
      icon: Truck,
    },
    {
      step: 4,
      id: 'delivered',
      name: '已送达',
      value: '1,855',
      unit: '单',
      statusText: '买家签收就绪',
      icon: CheckCircle2,
    },
    {
      step: 5,
      id: 'invoiced',
      name: '已开票',
      value: '$6.34',
      unit: '万',
      statusText: '财税结算完成',
      icon: FileText,
    },
  ]

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* ============================================================
          ROW 1: 顶部 Header —— 全球地图平铺充当 Header (无缝顶部与两侧羽化 + 渐变至实色底部Overlay: 利润统计 + 全球实时交易 + 核心销售榜单)
          ============================================================ */}
      <div className="relative w-full aspect-[2000/850] min-h-[500px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0] border-t-0 border-x-0 border-b border-slate-200/30 select-none">
        {/* 顶部与两侧羽化渐变遮罩 (与背景无缝相融) */}
        <div className="absolute inset-y-0 left-0 w-12 sm:w-20 bg-gradient-to-r from-[#F8FAFC] via-[#F8FAFC]/70 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-12 sm:w-20 bg-gradient-to-l from-[#F8FAFC] via-[#F8FAFC]/70 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-10 sm:h-12 bg-gradient-to-b from-[#F8FAFC] via-[#F8FAFC]/70 to-transparent z-10 pointer-events-none" />

        {/* 右上角浮动缩放控制胶囊 */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2.5">
          <div className="flex items-center gap-1 bg-white/80 backdrop-blur-md p-1 rounded-xl border border-slate-200/60 shadow-xs">
            <button
              type="button"
              onClick={handleZoomIn}
              title="放大"
              className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-800 transition-colors cursor-pointer"
            >
              <ZoomIn size={14} />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              title="缩小"
              className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-800 transition-colors cursor-pointer"
            >
              <ZoomOut size={14} />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              title="重置视图"
              className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>

        {/* ---------------- 点击/悬浮国家后显示的详情浮窗 (Focus Glass Card: 无边框毛玻璃 + 极细主题色微光边框) ---------------- */}
        {(selectedNode || hoveredNode) && (
          <div className="absolute top-16 left-4 z-40 w-72 sm:w-80 bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-[#024AD8]/20 shadow-2xl text-xs space-y-2.5 animate-fadeIn">
            {(() => {
              const target = selectedNode || hoveredNode!
              return (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <span className="text-lg">{target.flag}</span>
                      <span className="text-base font-extrabold">{target.zhName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-[#024AD8] font-bold border border-[#024AD8]/15">
                        {target.zhRegion}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedNode(null)
                        setHoveredNode(null)
                      }}
                      className="w-6 h-6 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 flex items-center justify-center font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  {/* 所点击的国家当地时间 (Live Clock) */}
                  <div className="px-3 py-2 rounded-xl bg-slate-50/90 border border-slate-200/70 flex items-center justify-between text-[11px] font-bold text-slate-800">
                    <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                      <Clock size={13} className="text-[#024AD8]" />
                      <span>当地时间</span>
                    </span>
                    <span className="text-[#024AD8] font-black tnum">
                      {selectedCountryTime || '计算中...'}
                    </span>
                  </div>

                  {/* 指标卡片网格 */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-2 rounded-lg bg-slate-50/80 border border-slate-200/60">
                      <span className="text-[9px] text-slate-400 block font-medium">实时销售总额</span>
                      <span className="font-black text-slate-900 text-sm tnum">${target.sales.toLocaleString()}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50/80 border border-slate-200/60">
                      <span className="text-[9px] text-slate-400 block font-medium">同比增长</span>
                      <span className="font-black text-emerald-600 text-sm tnum">{target.growth}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50/80 border border-slate-200/60">
                      <span className="text-[9px] text-slate-400 block font-medium">在途活跃订单</span>
                      <span className="font-bold text-slate-700 text-xs tnum">{target.activeOrders} 单</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50/80 border border-slate-200/60">
                      <span className="text-[9px] text-slate-400 block font-medium">履约妥投率</span>
                      <span className="font-bold text-blue-600 text-xs tnum">{target.fulfillRate}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setModalTitle(`${target.flag} ${target.zhName} 地区销售深度分析`)
                      setActiveModal('details')
                    }}
                    className="w-full py-2 rounded-[4px] bg-[#024AD8] hover:bg-[#003198] text-white text-xs font-bold transition-all cursor-pointer text-center shadow-2xs"
                  >
                    查看该地区销售深度分析
                  </button>
                </div>
              )
            })()}
          </div>
        )}

        {/* 核心 SVG 世界地图绘制 (无边界点阵 Dot-Matrix Command Center) */}
        <svg
          viewBox={`0 0 ${WORLD_VIEWBOX.w} ${WORLD_VIEWBOX.h}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full transition-transform duration-500 ease-out"
          style={{
            transform: selectedNode ? 'scale(1.8)' : `scale(${zoomScale})`,
            transformOrigin: selectedNode ? `${selectedNode.cx}px ${selectedNode.cy}px` : zoomOrigin,
            maskImage: 'radial-gradient(ellipse at center, black 70%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 70%, transparent 100%)',
          }}
        >
          <defs>
            {/* 微光点阵颗粒 */}
            <circle id="dot" r="1.5" fill="#024AD8" opacity="0.32" />
            <circle id="glow-dot" r="2.0" fill="#3B82F6" opacity="0.85" />

            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#024AD8" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#10B981" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#00226B" stopOpacity="0.75" />
            </linearGradient>

            <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="1" stdDeviation="4" floodColor="#024AD8" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* 全点阵网格底层 (Dot-Matrix Overlay) */}
          <g id="matrix-map-overlay" className="pointer-events-none">
            {/* 北美洲点阵群 */}
            <g transform="translate(380, 180)">
              <use href="#dot" x="20" y="20"/><use href="#dot" x="40" y="20"/><use href="#dot" x="60" y="20"/><use href="#glow-dot" x="80" y="20"/><use href="#dot" x="100" y="20"/>
              <use href="#dot" x="10" y="40"/><use href="#glow-dot" x="30" y="40"/><use href="#dot" x="50" y="40"/><use href="#dot" x="70" y="40"/><use href="#dot" x="90" y="40"/>
              <use href="#dot" x="20" y="60"/><use href="#dot" x="40" y="60"/><use href="#glow-dot" x="60" y="60"/><use href="#dot" x="80" y="60"/><use href="#dot" x="100" y="60"/>
              <use href="#dot" x="30" y="80"/><use href="#dot" x="50" y="80"/><use href="#dot" x="70" y="80"/>
            </g>

            {/* 南美洲点阵群 */}
            <g transform="translate(620, 520)">
              <use href="#dot" x="20" y="20"/><use href="#dot" x="40" y="20"/><use href="#dot" x="60" y="20"/>
              <use href="#dot" x="30" y="40"/><use href="#glow-dot" x="50" y="40"/><use href="#dot" x="70" y="40"/>
              <use href="#dot" x="40" y="60"/><use href="#dot" x="60" y="60"/>
              <use href="#glow-dot" x="45" y="80"/>
            </g>

            {/* 欧洲与非洲点阵群 */}
            <g transform="translate(980, 120)">
              <use href="#glow-dot" x="20" y="0"/><use href="#dot" x="40" y="0"/><use href="#dot" x="60" y="0"/>
              <use href="#dot" x="10" y="20"/><use href="#dot" x="30" y="20"/><use href="#glow-dot" x="50" y="20"/>
              <use href="#dot" x="20" y="160"/><use href="#dot" x="40" y="160"/><use href="#dot" x="60" y="160"/>
              <use href="#dot" x="30" y="220"/><use href="#glow-dot" x="50" y="220"/>
            </g>

            {/* 亚洲点阵群 */}
            <g transform="translate(1350, 160)">
              <use href="#dot" x="40" y="20"/><use href="#dot" x="60" y="20"/><use href="#dot" x="80" y="20"/><use href="#dot" x="100" y="20"/><use href="#dot" x="120" y="20"/>
              <use href="#dot" x="20" y="40"/><use href="#glow-dot" x="40" y="40"/><use href="#dot" x="60" y="40"/><use href="#dot" x="80" y="40"/><use href="#dot" x="100" y="40"/>
              <use href="#dot" x="0" y="60"/><use href="#dot" x="20" y="60"/><use href="#dot" x="40" y="60"/><use href="#glow-dot" x="60" y="60"/><use href="#dot" x="80" y="60"/>
            </g>

            {/* 大洋洲点阵群 */}
            <g transform="translate(1620, 580)">
              <use href="#dot" x="20" y="20"/><use href="#glow-dot" x="40" y="20"/><use href="#dot" x="60" y="20"/>
              <use href="#dot" x="10" y="40"/><use href="#dot" x="30" y="40"/><use href="#dot" x="50" y="40"/>
            </g>
          </g>

          {/* 世界矢量线条轮廓 (极淡无边界 Contour Line Only) */}
          <g className="world-base-map">
            {worldPaths.map((p, idx) => {
              const pName = p.name.toLowerCase()
              const pId = p.id.toLowerCase()
              const isActive = activeCountryNames.has(pId) || activeCountryNames.has(pName)
              const isSelected =
                selectedNode &&
                (pName.includes(selectedNode.name.toLowerCase()) ||
                  pId === selectedNode.code.toLowerCase() ||
                  p.name === selectedNode.zhName)

              return (
                <path
                  key={idx}
                  d={p.d}
                  fill={isSelected ? '#024AD8' : isActive ? '#024AD8' : 'none'}
                  fillOpacity={isSelected ? 0.25 : isActive ? 0.14 : 0}
                  stroke="#024AD8"
                  strokeWidth={isSelected ? 1.2 : isActive ? 0.7 : 0.45}
                  strokeOpacity={isSelected ? 0.8 : isActive ? 0.5 : 0.2}
                  className="transition-all duration-300 cursor-pointer hover:stroke-opacity-60"
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

          {/* 干线路由弧线 */}
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
                    strokeOpacity="0.75"
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

          {/* 节点雷达脉冲与单色主题发光波纹 */}
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
                  {/* 同色系多层半透明光环扩散 */}
                  <circle
                    cx={node.cx}
                    cy={node.cy}
                    r={isFocused ? 32 : 22}
                    fill="none"
                    stroke="#024AD8"
                    strokeWidth="1"
                    strokeOpacity={isFocused ? 0.8 : 0.35}
                    className="animate-ping"
                    style={{ transformOrigin: `${node.cx}px ${node.cy}px` }}
                  />
                  <circle
                    cx={node.cx}
                    cy={node.cy}
                    r={isFocused ? 20 : 14}
                    fill="#024AD8"
                    fillOpacity={isFocused ? 0.45 : 0.2}
                  />
                  <circle
                    cx={node.cx}
                    cy={node.cy}
                    r={isFocused ? 8 : 5}
                    fill="#024AD8"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    filter="url(#nodeGlow)"
                  />
                  <circle
                    cx={node.cx}
                    cy={node.cy}
                    r={2.5}
                    fill="#3B82F6"
                  />

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
                      stroke={isFocused ? '#024AD8' : '#E2E8F0'}
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
                      {node.flag} {node.zhName}
                    </text>
                    <text
                      x="8"
                      y="28"
                      fontSize="10"
                      fontWeight="bold"
                      fill="#024AD8"
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

        {/* ---------------- 底部横向排版 Overlay: 上边缘渐变羽化透明，下边缘逐渐过渡为实色 ---------------- */}
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-b from-white/30 via-white/70 to-white/95 backdrop-blur-md border-t border-white/30 p-5 sm:p-6 pt-9 sm:pt-11 pb-5 sm:pb-6 rounded-b-2xl before:absolute before:-top-8 before:inset-x-0 before:h-8 before:bg-gradient-to-t before:from-white/30 before:to-transparent before:pointer-events-none">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* 1. 利润统计 (加宽占 5 cols: 大数字 KPI + 7天平滑面积趋势图) */}
            <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-slate-200/50 pb-3 lg:pb-0 lg:pr-5 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-[#024AD8]" />
                  <span>利润统计</span>
                </h4>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-[#024AD8] border border-blue-200/80 text-[11px] font-black animate-pulse shadow-2xs">
                  ↑ +24% <span className="text-[10px] font-bold text-blue-500">较昨日</span>
                </span>
              </div>

              {/* 35% KPI 数据区 + 65% 趋势可视化区 */}
              <div className="flex flex-col sm:flex-row items-stretch gap-3 pt-1">
                {/* 左侧 KPI 核心数据区 (35%) */}
                <div className="sm:w-[38%] flex flex-col justify-center border-r sm:border-r-slate-200/60 sm:pr-3 shrink-0">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">当前总利润</span>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tnum tracking-tight mt-0.5">
                    $12,850
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 mt-1 flex items-center gap-1">
                    <span>周利润增长</span>
                    <span className="font-extrabold text-[#024AD8]">36%</span>
                  </div>
                </div>

                {/* 右侧 趋势可视化区 (65%): 平滑渐变面积图 */}
                <div className="sm:w-[62%] flex flex-col justify-between pt-0.5 min-w-0">
                  <div className="relative w-full h-[58px]">
                    <svg viewBox="0 0 200 60" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="profitTrendGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#024AD8" stopOpacity="0.45" />
                          <stop offset="100%" stopColor="#024AD8" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* 平滑渐变面积填充 */}
                      <path
                        d="M 0 45 C 20 42, 35 30, 55 22 C 75 14, 90 32, 110 18 C 130 4, 150 25, 170 12 C 185 2, 195 10, 200 8 L 200 55 L 0 55 Z"
                        fill="url(#profitTrendGrad)"
                      />

                      {/* 平滑趋势主线 */}
                      <path
                        d="M 0 45 C 20 42, 35 30, 55 22 C 75 14, 90 32, 110 18 C 130 4, 150 25, 170 12 C 185 2, 195 10, 200 8"
                        fill="none"
                        stroke="#024AD8"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />

                      {/* 最高点 Label 与高亮节点 */}
                      <g transform="translate(130, 4)">
                        <circle r="3.5" fill="#024AD8" stroke="#FFFFFF" strokeWidth="1.5" />
                        <text x="0" y="-5" fontSize="8" fontWeight="900" fill="#003198" textAnchor="middle">
                          高 $2,150
                        </text>
                      </g>

                      {/* 最低点 Label 与节点 */}
                      <g transform="translate(0, 45)">
                        <circle r="3" fill="#93C5FD" stroke="#FFFFFF" strokeWidth="1.5" />
                        <text x="10" y="10" fontSize="7" fontWeight="800" fill="#00226B" textAnchor="start">
                          低 $1,200
                        </text>
                      </g>
                    </svg>
                  </div>

                  {/* 极简 X 轴时间 */}
                  <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 pt-1 border-t border-slate-100/80">
                    <span>一</span>
                    <span>二</span>
                    <span>三</span>
                    <span>四</span>
                    <span>五</span>
                    <span>六</span>
                    <span>日</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. 全球实时交易 (缩窄占 4 cols) */}
            <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-200/50 pb-3 lg:pb-0 lg:pr-5 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 font-extrabold text-slate-900 text-xs sm:text-sm">
                  <Zap size={14} className="text-[#024AD8]" />
                  <span>全球实时交易</span>
                </div>
                <span className="text-[10px] text-slate-400 font-bold">实时同步</span>
              </div>

              {/* 实时流水弹幕 (Feed Stream) */}
              <div className="relative h-[115px] overflow-hidden flex flex-col gap-2 pt-1">
                <AnimatePresence initial={false}>
                  {liveTransactions.slice(0, 2).map((tx) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 20, scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                      className="p-2 px-3 rounded-lg flex items-center justify-between gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.01)] backdrop-blur-md"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        {/* 第一行：头像 + 姓名 + 国旗图标 + 时间 */}
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                          <div className="w-5 h-5 rounded-full overflow-hidden border border-slate-100 shrink-0 relative">
                            <Image
                              src={tx.avatar}
                              alt={tx.buyerName}
                              fill
                              className="object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <span className="font-extrabold text-slate-800 truncate max-w-[85px]">
                            {tx.buyerName}
                          </span>
                          <span className="text-[11px] shrink-0" title={tx.countryName}>
                            {tx.flag}
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal ml-auto shrink-0 flex items-center gap-1">
                            <Clock size={9} className="text-slate-300" />
                            {formatTimeAgo(tx.timestamp)}
                          </span>
                        </div>

                        {/* 第二行：商品名称 */}
                        <div className="text-[11px] font-bold text-slate-600 truncate mt-1 pl-6.5">
                          {tx.productName}
                        </div>
                      </div>

                      {/* 右侧/突出：高亮金额，带有高亮蓝色的微光 */}
                      <div className="text-xs font-black text-[#024AD8] bg-[#EFF4FF] px-2.5 py-1 rounded-[4px] shadow-[0_0_8px_rgba(2,74,216,0.18)] shrink-0 font-mono">
                        +{tx.amount}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* 3. 核心销售榜单 (3 cols) —— 去除标题，仅展示 3 个国家排行卡片，与左侧视觉平行 */}
            <div className="lg:col-span-3 flex flex-col justify-center gap-2 h-full">
              {[
                { rank: 1, flag: '🇺🇸', name: '美国', sales: '$8.42M', trophyColor: 'text-amber-500 fill-amber-400' },
                { rank: 2, flag: '🇯🇵', name: '日本', sales: '$5.16M', trophyColor: 'text-slate-400 fill-slate-300' },
                { rank: 3, flag: '🇩🇪', name: '德国', sales: '$3.85M', trophyColor: 'text-amber-700 fill-amber-600' },
              ].map((country) => (
                <div
                  key={country.rank}
                  className="flex items-center justify-between p-2 px-3 rounded-xl bg-white/85 border border-slate-200/70 hover:bg-white transition-all text-xs shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <Trophy size={14} className={`${country.trophyColor} shrink-0`} />
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{country.flag}</span>
                      <span>{country.name}</span>
                    </span>
                  </div>
                  <span className="font-black text-[#024AD8] text-xs sm:text-sm tnum animate-pulse inline-block transition-transform transform hover:scale-105">
                    {country.sales}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          ROW 2: 订单履约管道全流程进度条卡片
          ============================================================ */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-slate-300 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Truck size={18} className="text-[#024AD8]" />
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center">
              订单履约管道全流程
              <span className="text-xs text-slate-400 font-normal ml-1.5">(演示)</span>
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setActiveModal('fulfill')}
            className="px-3.5 py-1.5 rounded-[4px] bg-[#024AD8] hover:bg-[#003198] text-white text-xs font-bold transition-all cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
          >
            <Truck size={14} />
            <span>批量发货与履约中心</span>
          </button>
        </div>

        {/* Flow Pipeline Steps */}
        <div className="relative pt-2 pb-1">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-[28px] left-[8%] right-[8%] h-1 bg-slate-200 z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 relative z-10">
            {fulfillmentPipeline.map((item, idx) => {
              const IconComp = item.icon
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveModal(item.id === 'invoiced' ? 'export' : 'fulfill')}
                  className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/70 hover:bg-white hover:border-[#024AD8]/50 hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-extrabold text-slate-600 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-[#024AD8] text-white text-[10px] font-bold flex items-center justify-center shadow-2xs">
                        {item.step}
                      </span>
                      <span>{item.name}</span>
                    </span>

                    <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-[#024AD8] flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform">
                      <IconComp size={15} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-900 group-hover:text-[#024AD8] transition-colors tnum">
                        {item.value}
                      </span>
                      <span className="text-xs font-bold text-slate-500">{item.unit}</span>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 font-medium">{item.statusText}</span>
                      {idx < fulfillmentPipeline.length - 1 && (
                        <ArrowRight size={12} className="text-slate-400 hidden md:inline-block group-hover:translate-x-1 transition-transform" />
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ============================================================
          ROW 3: 商品与库存综合看板 (Left: 畅销 Top 5 | Right 一列: 数据分析折线图 + 品类库存热力图)
          ============================================================ */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-[#024AD8]" />
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center">
              商品与库存综合看板
              <span className="text-xs text-slate-400 font-normal ml-1.5">(演示)</span>
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setActiveModal('products')}
            className="px-3 py-1.5 rounded-[4px] bg-[#024AD8] hover:bg-[#003198] text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
          >
            <span>查看全部商品</span>
            <ExternalLink size={12} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Top 5 畅销商品 (6 cols) —— 纵向拉伸与右侧列对齐 */}
          <div className="lg:col-span-6 flex flex-col justify-between h-full">
            <div className="flex flex-col h-full justify-between">
              <div className="flex items-center justify-between mb-3 shrink-0">
                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  畅销 Top 5 榜单
                </h4>
                <span className="text-[11px] text-slate-400 font-medium">按销量与营收实时更新</span>
              </div>

              <div className="flex-1 flex flex-col justify-between gap-3">
                {topProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => setActiveModal('products')}
                    className="flex-1 min-h-[72px] sm:min-h-[76px] p-3 rounded-xl bg-slate-50/80 hover:bg-white border border-slate-200/80 hover:border-[#024AD8]/40 hover:shadow-2xs transition-all group cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center text-white shrink-0 shadow-2xs ${
                        product.rank === 1 ? 'bg-amber-500' : product.rank === 2 ? 'bg-slate-400' : product.rank === 3 ? 'bg-amber-700' : 'bg-slate-600'
                      }`}>
                        #{product.rank}
                      </span>

                      <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 overflow-hidden relative shrink-0">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-slate-900 truncate group-hover:text-[#024AD8] transition-colors">
                          {product.name}
                        </h5>
                        <p className="text-[10px] text-slate-500 truncate">
                          {product.category}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-[#024AD8] block tnum">{product.price}</span>
                      <span className="text-[10px] text-slate-500 font-semibold tnum">{product.salesCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧一列 (6 cols): 1. 数据分析折线图 (上方) + 2. 品类库存分布热力图 (下方) */}
          <div className="lg:col-span-6 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6 space-y-6">
            {/* 1. 数据分析折线图卡片 (移动至此) */}
            <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/80">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-[#024AD8]" />
                  <span>数据分析</span>
                  <span className="text-[10px] text-slate-400 font-normal ml-0.5">(演示)</span>
                </h4>

                <div className="flex items-center gap-2">
                  <select
                    value={analyticsTimeframe}
                    onChange={(e) => setAnalyticsTimeframe(e.target.value as any)}
                    className="h-6 px-2 rounded-full bg-white text-slate-700 text-[11px] font-semibold border border-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="Weekly">按周</option>
                    <option value="Monthly">按月</option>
                    <option value="Yearly">按年</option>
                  </select>

                  <button
                    type="button"
                    className="h-6 px-2.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200 flex items-center gap-1 cursor-pointer"
                  >
                    <span>订单维度</span>
                    <ChevronDown size={12} />
                  </button>

                  <button
                    type="button"
                    className="w-6 h-6 rounded-lg hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    <MoreHorizontal size={14} />
                  </button>
                </div>
              </div>

              {/* 转化率 & 销售额 */}
              <div className="flex items-center gap-5 my-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-medium text-[11px]">转化率</span>
                  <span className="text-sm font-black text-slate-900 tnum">0.75%</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-[#82E600] text-slate-900 text-[9px] font-extrabold flex items-center gap-0.5">
                    <ArrowUpRight size={10} /> 13%
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-medium text-[11px]">销售额</span>
                  <span className="text-sm font-black text-slate-900 tnum">-$2,480</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-bold shrink-0">
                    -0.4%
                  </span>
                </div>
              </div>

              {/* 折线图 */}
              <div className="relative pt-3 pb-1">
                <div className="relative w-full h-28">
                  <div className="absolute left-[63%] top-[10%] -translate-x-1/2 bg-[#024AD8] text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow-xs border border-white/40 z-10 animate-bounce">
                    +34%
                  </div>

                  <svg viewBox="0 0 500 120" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                    <defs>
                      <pattern id="diagonalHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                        <line x1="0" y1="0" x2="0" y2="8" stroke="#024AD8" strokeWidth="1.5" strokeOpacity="0.18" />
                      </pattern>
                    </defs>

                    <line x1="0" y1="25" x2="500" y2="25" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="0" y1="60" x2="500" y2="60" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="0" y1="95" x2="500" y2="95" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3,3" />

                    <path
                      d="M 0 80 Q 80 60, 165 75 T 315 30 T 415 50 T 500 65 L 500 110 L 0 110 Z"
                      fill="url(#diagonalHatch)"
                    />

                    <path
                      d="M 0 80 Q 80 60, 165 75 T 315 30 T 415 50 T 500 65"
                      fill="none"
                      stroke="#024AD8"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    <circle cx="80" cy="65" r="3" fill="#024AD8" stroke="#FFFFFF" strokeWidth="1.5" />
                    <circle cx="165" cy="75" r="3" fill="#024AD8" stroke="#FFFFFF" strokeWidth="1.5" />
                    <circle cx="240" cy="50" r="3" fill="#024AD8" stroke="#FFFFFF" strokeWidth="1.5" />
                    <circle cx="315" cy="30" r="4.5" fill="#024AD8" stroke="#FFFFFF" strokeWidth="2" />
                    <circle cx="415" cy="50" r="3" fill="#024AD8" stroke="#FFFFFF" strokeWidth="1.5" />
                    <circle cx="490" cy="65" r="3" fill="#024AD8" stroke="#FFFFFF" strokeWidth="1.5" />
                  </svg>
                </div>

                <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-1 mt-1">
                  <span>1月</span>
                  <span>2月</span>
                  <span>3月</span>
                  <span className="text-[#024AD8] font-bold">4月</span>
                  <span>5月</span>
                  <span>6月</span>
                </div>
              </div>
            </div>

            {/* 2. 品类库存分布热力图 (下方) */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <Box size={14} className="text-[#024AD8]" />
                  <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                    品类库存分布热力图
                  </h4>
                </div>

                <select
                  value={stockTimeframe}
                  onChange={(e) => setStockTimeframe(e.target.value as any)}
                  className="h-6 px-2 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="Weekly">按周</option>
                  <option value="Monthly">按月</option>
                </select>
              </div>

              <div className="my-1">
                <div className="grid grid-cols-8 gap-1.5 items-center text-[11px] font-bold text-slate-600 mb-1.5">
                  <span>品类</span>
                  {['周日', '周一', '周二', '周三', '周四', '周五', '周六'].map((day, idx) => (
                    <span key={idx} className="text-center text-slate-400">{day}</span>
                  ))}
                </div>

                <div className="space-y-1.5">
                  {stockCategories.map((cat, rIdx) => (
                    <div key={cat.name} className="grid grid-cols-8 gap-1.5 items-center">
                      <span className="text-[11px] font-bold text-slate-700 truncate" title={cat.zhName}>
                        {cat.zhName}
                      </span>

                      {stockMatrix[rIdx].map((val, cIdx) => (
                        <div
                          key={cIdx}
                          onMouseEnter={() => setHoveredTile({ row: rIdx, col: cIdx, value: val })}
                          onMouseLeave={() => setHoveredTile(null)}
                          className={`h-8 rounded-md border transition-all cursor-pointer flex items-center justify-center text-[9px] font-bold ${getTileBgClass(
                            val
                          )} hover:scale-105 shadow-2xs`}
                          title={`${cat.zhName} (${stockDays[cIdx]}): ${val} 件`}
                        >
                          {val}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 mt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1 text-[10px] text-slate-500 font-semibold">
                <span>库存分布（件）:</span>
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-[#EFF6FF] border border-[#DBEAFE]" /> 0-100</div>
                  <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-[#BFDBFE]" /> 101-200</div>
                  <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-[#60A5FA]" /> 201-300</div>
                  <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-[#024AD8]" /> 301-400</div>
                  <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-[#00226B]" /> 401+</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 交互式模态框与 Toast 通知 ===== */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 overflow-hidden relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-extrabold text-slate-900">
                {activeModal === 'export' && (isZh ? '导出店铺经营报表' : 'Export Store Analytics')}
                {activeModal === 'fulfill' && (isZh ? '订单批量履约与发货中心' : 'Order Fulfillment & Shipping Hub')}
                {activeModal === 'products' && (isZh ? '全渠道在售精选商品库存' : 'Active Products Inventory')}
                {activeModal === 'details' && (modalTitle || (isZh ? '指标数据深度分析' : 'Metric Deep Dive'))}
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {activeModal === 'export' && (
              <div className="space-y-4 text-xs text-slate-600">
                <p>{isZh ? '请选择您要导出的报表格式与时间跨度，系统将生成加密 CSV/Excel 结算明细：' : 'Select format and date range for your secure export:'}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl border-2 border-[#024AD8] bg-blue-50/40 font-bold text-slate-900 cursor-pointer text-center">
                    CSV 详细账单
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 font-semibold text-slate-600 cursor-pointer text-center">
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
                    className="w-full py-2.5 rounded-[4px] bg-[#024AD8] hover:bg-[#003198] text-white font-bold shadow-2xs transition-all cursor-pointer text-xs"
                  >
                    {isZh ? '确认生成下载链接' : 'Confirm & Download'}
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'fulfill' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-600">{isZh ? '当前共有 12 笔待发货订单等待智能路由分发：' : '12 unfulfilled orders ready for AI routing:'}</p>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <span className="font-bold text-slate-900">#ORD-2026-88{i}</span>
                        <span className="text-[10px] text-slate-400 block">{isZh ? 'Adidas Ultraboost 22 · 1件' : 'Adidas Ultraboost 22 · 1pc'}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
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
                    className="w-full py-2.5 rounded-[4px] bg-[#024AD8] hover:bg-[#003198] text-white font-bold shadow-2xs transition-all cursor-pointer text-xs flex items-center justify-center gap-1.5"
                  >
                    <Truck size={14} />
                    <span>{isZh ? '立即一键批量发货 (12)' : 'Execute Batch Fulfill (12)'}</span>
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'products' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-600">{isZh ? '当前店铺在售精选商品库存及实时销量：' : 'Active store inventory and sales velocity:'}</p>
                <div className="space-y-2">
                  {topProducts.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{p.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">{p.category}</span>
                      </div>
                      <span className="font-extrabold text-[#024AD8]">{p.price}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 rounded-[4px] bg-slate-900 text-white font-bold text-xs cursor-pointer"
                  >
                    {isZh ? '关闭' : 'Close'}
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'details' && (
              <div className="space-y-3 text-xs text-slate-600">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-900 block mb-1">{isZh ? '核心指标多维拆解' : 'Multidimensional Breakdown'}</span>
                  <p>{isZh ? '基于 AI 实时监测的归因模型，该指标在过去 7 天内保持稳健增长，环比提升 +14.2%，履约时效达到行业前 5%。' : 'Real-time AI monitored attribution model shows steady 14.2% week-over-week growth.'}</p>
                </div>
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 rounded-[4px] bg-[#024AD8] text-white font-bold text-xs cursor-pointer hover:bg-[#003198]"
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
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-bounce">
          <CheckCircle2 size={16} className="text-[#82E600] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
