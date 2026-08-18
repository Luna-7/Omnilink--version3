'use client'

import React, { useMemo } from 'react'
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  ShoppingBag, 
  Search,
  LayoutDashboard,
  Package,
  Cpu,
  Database,
  ArrowUpRight,
  MoreHorizontal,
  MapPin,
  Bell,
  User
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts'
import { motion } from 'motion/react'

const TREND_DATA = [
  { name: 'Jan', orders: 1200 },
  { name: 'Feb', orders: 1500 },
  { name: 'Mar', orders: 1100 },
  { name: 'Apr', orders: 1800 },
  { name: 'May', orders: 2100 },
  { name: 'Jun', orders: 1600 },
  { name: 'Jul', orders: 1900 },
  { name: 'Aug', orders: 2400 },
  { name: 'Sep', orders: 2000 },
  { name: 'Oct', orders: 2345 },
  { name: 'Nov', orders: 2100 },
  { name: 'Dec', orders: 2500 },
]

const BEST_SELLERS = [
  { id: 1, name: 'Premium Wireless Headphones', price: 299, image: 'https://picsum.photos/seed/audio/80/80', sales: 1205 },
  { id: 2, name: 'Ergonomic Mechanical Keyboard', price: 159, image: 'https://picsum.photos/seed/keyboard/80/80', sales: 850 },
  { id: 3, name: 'Ultra-wide 4K Monitor', price: 599, image: 'https://picsum.photos/seed/display/80/80', sales: 420 },
  { id: 4, name: 'Minimalist Desk Lamp', price: 79, image: 'https://picsum.photos/seed/lamp/80/80', sales: 2100 },
]

export default function AcrylicDashboard() {
  const activeTab = 'dashboard'

  return (
    <div className="min-h-screen crextio-canvas overflow-hidden relative selection:bg-rose-100 selection:text-rose-600">
      {/* Aurora Orbs */}
      <motion.div 
        animate={{ x: [0, 50, -30, 0], y: [0, -40, 20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="aurora-orb aurora-orb-rose w-[600px] h-[600px] top-[-10%] right-[-5%]" 
      />
      <motion.div 
        animate={{ x: [0, -60, 40, 0], y: [0, 30, -50, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="aurora-orb aurora-orb-blue w-[700px] h-[700px] bottom-[-20%] left-[-10%]" 
      />
      <motion.div 
        animate={{ x: [0, 40, -60, 0], y: [0, 20, 40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="aurora-orb aurora-orb-rose w-[400px] h-[400px] top-[30%] left-[20%]" 
      />

      {/* Header */}
      <header className="h-20 px-8 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md bg-white/50 border-b border-white/40">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center text-white font-bold shadow-lg shadow-rose-500/30">
              O
            </div>
            <span className="font-heading font-extrabold text-xl tracking-tight text-gray-900">Omnilink</span>
          </div>

          <nav className="flex items-center gap-1">
            {[
              { id: 'dashboard', label: '控制台', icon: LayoutDashboard },
              { id: 'products', label: '商品管理', icon: Package },
              { id: 'agents', label: 'Agent 接口', icon: Cpu },
              { id: 'knowledge', label: '知识库', icon: Database },
            ].map(tab => (
              <button
                key={tab.id}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                  tab.id === activeTab 
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <tab.icon size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-rose-500 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="搜索全站..." 
              className="pl-10 pr-4 py-2 bg-white/60 border border-white/80 rounded-full text-sm focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500/30 w-64 transition-all"
            />
          </div>
          <button className="p-2.5 rounded-full bg-white/80 border border-white hover:bg-white transition-all text-gray-600 hover:text-rose-500 shadow-sm">
            <Bell size={20} />
          </button>
          <button className="flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full bg-white/80 border border-white hover:bg-white transition-all shadow-sm">
            <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
              <User size={16} />
            </div>
            <span className="text-sm font-bold text-gray-900">Admin</span>
          </button>
        </div>
      </header>

      <div className="flex p-8 gap-8">
        {/* Sidebar */}
        <aside className="w-16 flex flex-col items-center gap-6 py-6 acrylic-card-premium shrink-0 h-[calc(100vh-160px)] sticky top-28">
          {[
            { icon: LayoutDashboard, label: '概览', active: true },
            { icon: ShoppingBag, label: '订单' },
            { icon: Users, label: '客户' },
            { icon: Package, label: '库存' },
            { icon: TrendingUp, label: '统计' },
          ].map((item, i) => (
            <button
              key={i}
              className={`p-3 rounded-2xl transition-all relative group ${
                item.active 
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' 
                  : 'text-gray-400 hover:text-rose-500 hover:bg-rose-50'
              }`}
            >
              <item.icon size={22} />
              <div className="absolute left-[calc(100%+16px)] top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap">
                {item.label}
              </div>
            </button>
          ))}
        </aside>

        {/* Main Content */}
        <main className="flex-1 space-y-8 pb-10">
          {/* Top KPI Section */}
          <div className="grid grid-cols-12 gap-8">
            {/* KPI Cards (5 cols) */}
            <div className="col-span-12 lg:col-span-5 grid grid-cols-2 gap-6">
              {[
                { label: '总销售量', value: '12,458', trend: '+3.1%', icon: ShoppingBag, color: 'rose' },
                { label: '活跃客户', value: '2,890', trend: '+1.5%', icon: Users, color: 'blue' },
                { label: '总营收', value: '$84.2K', trend: '+12.4%', icon: DollarSign, color: 'rose' },
                { label: '平均客单价', value: '$124', trend: '-0.8%', icon: TrendingUp, color: 'rose' },
              ].map((kpi, i) => (
                <div key={i} className="acrylic-card-premium p-6 flex flex-col justify-between h-44">
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl bg-gray-50 text-gray-500 border border-gray-100`}>
                      <kpi.icon size={20} />
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                      kpi.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {kpi.trend.startsWith('+') ? <TrendingUp size={10} /> : <TrendingUp size={10} className="rotate-180" />}
                      {kpi.trend}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{kpi.label}</p>
                    <h3 className="text-3xl font-heading font-black text-gray-900 mt-1">{kpi.value}</h3>
                  </div>
                </div>
              ))}
            </div>

            {/* Orders Trend Chart (7 cols) */}
            <div className="col-span-12 lg:col-span-7 acrylic-card-premium p-8 relative overflow-hidden h-[400px]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-heading font-black text-gray-900">客户订单量趋势图</h3>
                  <p className="text-xs text-gray-500 font-bold mt-0.5">实时更新 · 2026 年度统计</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="text-xs font-bold text-gray-600">订单量</span>
                  </div>
                  <button className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 transition-colors">
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              </div>

              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={TREND_DATA}>
                    <defs>
                      <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FB7185" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#FB7185" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                      dy={10}
                    />
                    <YAxis hide />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="px-3 py-2 rounded-xl bg-gray-900 text-white border border-white/10 shadow-xl backdrop-blur-md">
                              <p className="text-[10px] font-bold opacity-60 uppercase">{payload[0].payload.name}</p>
                              <p className="text-sm font-black flex items-center gap-1.5">
                                {payload[0].value.toLocaleString()} <span className="text-[10px] opacity-70">单</span>
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="orders" 
                      stroke="#FB7185" 
                      strokeWidth={4} 
                      fillOpacity={1} 
                      fill="url(#colorOrders)" 
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Peak Indicator Highlight */}
              <div className="absolute top-[180px] right-[100px] pointer-events-none">
                <div className="relative">
                  <div className="absolute inset-0 w-4 h-4 bg-rose-500/30 rounded-full animate-ping" />
                  <div className="relative w-4 h-4 bg-rose-500 rounded-full border-2 border-white shadow-lg shadow-rose-500/50" />
                  <div className="absolute top-[-45px] left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-gray-900 text-white text-[10px] font-black shadow-xl border border-white/10 whitespace-nowrap">
                    年度峰值: 2,345
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-12 gap-8">
            {/* Best Sellers (4 cols) */}
            <div className="col-span-12 lg:col-span-4 acrylic-card-premium p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-heading font-black text-gray-900">畅销商品</h3>
                <button className="text-xs font-bold text-rose-500 hover:text-rose-600 underline underline-offset-4">查看全部</button>
              </div>
              <div className="space-y-6">
                {BEST_SELLERS.map((product) => (
                  <div key={product.id} className="flex items-center gap-4 group cursor-pointer">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden relative shrink-0 border border-white/40 shadow-sm group-hover:scale-105 transition-transform">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-rose-500 transition-colors">{product.name}</h4>
                      <p className="text-[11px] font-bold text-gray-400 mt-0.5">{product.sales} 份已售</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-gray-900">${product.price}</p>
                      <p className="text-[10px] font-bold text-emerald-500 flex items-center justify-end gap-0.5">
                        <TrendingUp size={10} />
                        热销
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Global Market Heatmap (8 cols) */}
            <div className="col-span-12 lg:col-span-8 acrylic-card-premium p-8 relative overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-lg font-heading font-black text-gray-900">全球市场实时热销热力图</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-sm shadow-rose-500" />
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">实时数据同步中...</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-2">
                    <MapPin size={14} className="text-rose-500" />
                    <span className="text-[10px] font-bold text-gray-700">活跃地区: 124</span>
                  </div>
                </div>
              </div>

              {/* Map Placeholder with Glass Dots */}
              <div className="flex-1 relative mt-4 flex items-center justify-center opacity-80 group">
                <svg viewBox="0 0 800 400" className="w-full h-full text-gray-200">
                  <path 
                    fill="currentColor" 
                    d="M150,100 Q180,50 250,80 T400,120 T550,100 T700,150 L750,300 Q700,350 600,320 T400,350 T200,320 T50,280 Z" 
                    className="opacity-20"
                  />
                  <rect x="0" y="0" width="800" height="400" fill="transparent" />
                </svg>
                
                {/* Heat Nodes */}
                {[
                  { top: '20%', left: '30%', size: 'w-8 h-8', opacity: 'bg-rose-500/20' },
                  { top: '40%', left: '60%', size: 'w-12 h-12', opacity: 'bg-rose-500/30' },
                  { top: '65%', left: '25%', size: 'w-6 h-6', opacity: 'bg-rose-500/10' },
                  { top: '30%', left: '75%', size: 'w-10 h-10', opacity: 'bg-rose-500/25' },
                  { top: '55%', left: '45%', size: 'w-14 h-14', opacity: 'bg-rose-500/35' },
                ].map((node, i) => (
                  <div 
                    key={i} 
                    className={`absolute rounded-full blur-xl animate-pulse ${node.opacity} ${node.size}`}
                    style={{ top: node.top, left: node.left }}
                  />
                ))}

                {/* Specific Pulse Markers */}
                {[
                  { top: '38%', left: '59%', label: 'Tokyo (Hiring)' },
                  { top: '53%', left: '44%', label: 'Shanghai (Peak)' },
                  { top: '28%', left: '74%', label: 'New York' },
                  { top: '19%', left: '29%', label: 'London' },
                ].map((marker, i) => (
                  <div 
                    key={i} 
                    className="absolute group/marker"
                    style={{ top: marker.top, left: marker.left }}
                  >
                    <div className="w-3 h-3 bg-rose-500 rounded-full border-2 border-white shadow-lg relative">
                      <div className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-75" />
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900/90 text-white text-[9px] font-bold rounded opacity-0 group-hover/marker:opacity-100 transition-opacity whitespace-nowrap backdrop-blur-sm">
                      {marker.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Meta */}
              <div className="flex justify-between items-center pt-4 border-t border-white/20">
                <div className="flex gap-8">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">最大市场</p>
                    <p className="text-sm font-black text-gray-800">北美 (North America)</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">增长最快</p>
                    <p className="text-sm font-black text-gray-800">东南亚 (ASEAN)</p>
                  </div>
                </div>
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-7 h-7 rounded-full border-2 border-white acrylic-card-premium overflow-hidden">
                      <img src={`https://i.pravatar.cc/40?img=${i+10}`} alt="avatar" />
                    </div>
                  ))}
                  <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-900 text-white flex items-center justify-center text-[9px] font-black">
                    +12
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
