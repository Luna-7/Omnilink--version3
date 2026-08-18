'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/context/LanguageContext'
import {
  Database,
  Sparkles,
  Image as ImageIcon,
  Search,
  BarChart3,
  Megaphone,
  Truck,
  ScanFace,
  Blocks,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react'

type PluginItem = {
  id: string
  nameEn: string
  nameZh: string
  descEn: string
  descZh: string
  categoryEn: string
  categoryZh: string
  icon: LucideIcon
}

const PLUGINS: PluginItem[] = [
  {
    id: 'import',
    nameEn: 'Smart Excel/CSV Import',
    nameZh: '智能表格 / CSV 导入',
    descEn: 'AI automatically identifies headers and creates structured product nodes.',
    descZh: 'AI 自动识别表头属性并创建结构化商品语义节点。',
    categoryEn: 'Data Import',
    categoryZh: '数据导入',
    icon: Database,
  },
  {
    id: 'copy',
    nameEn: 'AI Copy Optimizer',
    nameZh: 'AI 文案润色与扩写',
    descEn: 'Rewrites product descriptions into high-converting, search-ready semantic copy.',
    descZh: '重构商品描述为高转化率、搜索就绪的语义文案。',
    categoryEn: 'AI Intelligence',
    categoryZh: 'AI 智能',
    icon: Sparkles,
  },
  {
    id: 'ar',
    nameEn: 'Virtual AR Try-on',
    nameZh: 'AR 实景试戴预览',
    descEn: 'Allows customers to preview jewelry and fashion items in real-time AR.',
    descZh: '允许顾客在真实空间中实时 AR 试戴珠宝与时尚服饰。',
    categoryEn: 'Media',
    categoryZh: '媒体视觉',
    icon: ScanFace,
  },
  {
    id: 'watermark',
    nameEn: 'Dynamic Watermark',
    nameZh: '动态防盗水印',
    descEn: 'Applies automated brand logos and protection stamps to product images.',
    descZh: '自动为商品主图与详情图叠加品牌标识与防盗印记。',
    categoryEn: 'Media',
    categoryZh: '媒体视觉',
    icon: ImageIcon,
  },
  {
    id: 'seo',
    nameEn: 'SEO & Schema Auditing',
    nameZh: 'SEO 与 Schema 结构化质检',
    descEn: 'Scans titles and JSON-LD schema metadata for maximum search rankings.',
    descZh: '自动扫描标题与 JSON-LD 元数据，确保搜索引擎极速收录。',
    categoryEn: 'SEO',
    categoryZh: 'SEO 优化',
    icon: Search,
  },
  {
    id: 'analytics',
    nameEn: 'Omnichannel Analytics',
    nameZh: '全渠道数据追踪看板',
    descEn: 'Interactive traffic, customer conversions, and AI purchase funnel metrics.',
    descZh: '交互式流量、顾客转化率与 AI 导购转化漏斗看板。',
    categoryEn: 'Analytics',
    categoryZh: '数据分析',
    icon: BarChart3,
  },
  {
    id: 'marketing',
    nameEn: 'Multi-platform Marketing',
    nameZh: '多平台营销素材生成',
    descEn: 'Generates campaign copy and social media templates directly from specs.',
    descZh: '直接根据商品参数生成营销文案与社交媒体分发模板。',
    categoryEn: 'Marketing',
    categoryZh: '营销推广',
    icon: Megaphone,
  },
  {
    id: 'logistics',
    nameEn: 'Real-time Logistics Sync',
    nameZh: '实时物流与运力对接',
    descEn: 'Synchronizes order tracking numbers with major carriers seamlessly.',
    descZh: '无缝同步主流快递承运商单号与实时运单状态。',
    categoryEn: 'Logistics',
    categoryZh: '物流履约',
    icon: Truck,
  },
]

export default function PluginsPage() {
  const { t, isZh } = useLanguage()
  const [selectedCat, setSelectedCat] = useState<string>('all')
  const [enabled, setEnabled] = useState<Set<string>>(new Set(['import', 'copy']))

  const CATEGORIES = [
    { key: 'all', label: t.plugins.all },
    { key: 'data', label: isZh ? '数据导入' : 'Data Import' },
    { key: 'ai', label: isZh ? 'AI 智能' : 'AI Intelligence' },
    { key: 'media', label: isZh ? '媒体视觉' : 'Media' },
    { key: 'seo', label: isZh ? 'SEO 优化' : 'SEO' },
    { key: 'analytics', label: isZh ? '数据分析' : 'Analytics' },
    { key: 'marketing', label: isZh ? '营销推广' : 'Marketing' },
    { key: 'logistics', label: isZh ? '物流履约' : 'Logistics' },
  ]

  const list =
    selectedCat === 'all'
      ? PLUGINS
      : PLUGINS.filter((p) => {
          if (selectedCat === 'data') return p.categoryEn === 'Data Import'
          if (selectedCat === 'ai') return p.categoryEn === 'AI Intelligence'
          if (selectedCat === 'media') return p.categoryEn === 'Media'
          if (selectedCat === 'seo') return p.categoryEn === 'SEO'
          if (selectedCat === 'analytics') return p.categoryEn === 'Analytics'
          if (selectedCat === 'marketing') return p.categoryEn === 'Marketing'
          if (selectedCat === 'logistics') return p.categoryEn === 'Logistics'
          return true
        })

  const toggle = (id: string) =>
    setEnabled((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <div className="space-y-5">
      {/* 顶部指标卡行 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="crextio-card p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F4F5F7] border border-[#E5E7EB] text-[#111827] flex items-center justify-center shrink-0">
              <Blocks size={18} />
            </div>
            <div>
              <span className="text-xs text-[#6B7280] block font-medium">{t.plugins.installedExtensions}</span>
              <div className="text-xl font-bold text-[#111827] mt-0.5 tnum">
                {enabled.size} {t.plugins.active}
              </div>
            </div>
          </div>
        </div>

        <div className="crextio-card p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F4F5F7] border border-[#E5E7EB] text-[#111827] flex items-center justify-center shrink-0">
              <Sparkles size={18} />
            </div>
            <div>
              <span className="text-xs text-[#6B7280] block font-medium">{t.plugins.marketplaceCatalog}</span>
              <div className="text-xl font-bold text-[#111827] mt-0.5 tnum">
                {PLUGINS.length} {t.plugins.plugins}
              </div>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#edbc40] text-[#111827] text-xs font-bold shadow-sm">
            Catalog
          </span>
        </div>

        <div className="crextio-dark-card p-5 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs text-white/80 block font-medium">{t.plugins.extensionEngine}</span>
            <div className="text-sm font-bold text-white">{t.plugins.edgeRuntime}</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/10 text-[#edbc40] flex items-center justify-center">
            <CheckCircle2 size={15} />
          </div>
        </div>
      </div>

      {/* 分类筛选胶囊 */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setSelectedCat(c.key)}
            className={cn(
              'px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer',
              selectedCat === c.key
                ? 'bg-[#111827] text-white shadow-sm'
                : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] hover:bg-[#F4F5F7]'
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* 插件卡片网格 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((p) => {
          const Icon = p.icon
          const on = enabled.has(p.id)
          const name = isZh ? p.nameZh : p.nameEn
          const desc = isZh ? p.descZh : p.descEn
          const cat = isZh ? p.categoryZh : p.categoryEn

          return (
            <div
              key={p.id}
              className={cn(
                'crextio-card p-5 flex flex-col justify-between transition-all group',
                on ? 'ring-2 ring-[#edbc40] bg-white' : ''
              )}
            >
              <div>
                <div className="flex items-start justify-between mb-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#F4F5F7] border border-[#E5E7EB] flex items-center justify-center text-[#111827] group-hover:scale-105 transition-transform">
                    <Icon size={18} />
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F4F5F7] text-[#6B7280] border border-[#E5E7EB]">
                    {cat}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#111827] mb-1.5">{name}</h3>
                <p className="text-xs text-[#6B7280] leading-relaxed line-clamp-2">{desc}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#F3F4F6] flex items-center justify-between">
                <span className="text-[11px] font-medium text-[#6B7280]">
                  {on ? t.plugins.activated : t.plugins.available}
                </span>
                <button
                  onClick={() => toggle(p.id)}
                  className={cn(
                    'text-xs font-semibold px-4 py-1.5 rounded-full transition-all cursor-pointer',
                    on
                      ? 'bg-[#edbc40] text-[#111827] font-bold shadow-sm'
                      : 'bg-[#111827] text-white hover:bg-black'
                  )}
                >
                  {on ? t.plugins.enabled : t.plugins.enable}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
