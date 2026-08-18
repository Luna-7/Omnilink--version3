'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Folder,
  Package,
  Plus,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Search,
} from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export interface CategoryItem {
  name: string
  name_en: string
  count: number
  color: string
  iconText: string
  description: string
  description_en: string
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    name: '声学音频',
    name_en: 'Audio & Acoustics',
    count: 24,
    color: '#8B5CF6',
    iconText: '🎧',
    description: '无线降噪耳机、高保真音响及车载音频设备',
    description_en: 'Wireless ANC headphones, Hi-Fi sound systems & audio gear',
  },
  {
    name: '智能穿戴',
    name_en: 'Smart Wearables',
    count: 18,
    color: '#edbc40',
    iconText: '⌚',
    description: '钛合金健康手表、运动手环及健康生物监测设备',
    description_en: 'Titanium smartwatches, fitness bands and biometric trackers',
  },
  {
    name: '智能眼镜',
    name_en: 'Smart Glasses',
    count: 8,
    color: '#06B6D4',
    iconText: '👓',
    description: '双目 AR 显示眼镜、同传翻译眼镜及第一视角摄像设备',
    description_en: 'AR glasses, live translation eyewear & POV camera devices',
  },
  {
    name: '数码配件',
    name_en: 'Accessories & Power',
    count: 36,
    color: '#e0652b',
    iconText: '⚡',
    description: 'GaN 快充坞、磁吸无线充及高规格扩展坞',
    description_en: 'GaN fast charging docks, MagSafe stations and USB-C hubs',
  },
  {
    name: '电脑外设',
    name_en: 'Computer Peripherals',
    count: 15,
    color: '#10B981',
    iconText: '⌨️',
    description: '三模客制化机械键盘、人体工学无线鼠标及拾音麦克风',
    description_en: 'Custom mechanical keyboards, wireless ergonomic mice & mics',
  },
  {
    name: '智能家居',
    name_en: 'Smart Home',
    count: 12,
    color: '#F59E0B',
    iconText: '🏠',
    description: 'Matter 协议智能网关、环境监测传感器及智能开关',
    description_en: 'Matter-enabled smart hubs, air sensors and ambient lighting',
  },
]

export function CategoriesView({
  initialCategories,
}: {
  initialCategories?: Array<{ name: string; count: number }>
}) {
  const { isZh } = useLanguage()
  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    if (initialCategories && initialCategories.length > 0) {
      return initialCategories.map((c, i) => {
        const found = DEFAULT_CATEGORIES.find((d) => d.name === c.name)
        return (
          found || {
            name: c.name,
            name_en: c.name,
            count: c.count,
            color: '#111827',
            iconText: '📦',
            description: '通用商品分类',
            description_en: 'General merchandise category',
          }
        )
      })
    }
    return DEFAULT_CATEGORIES
  })

  const [query, setQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatDesc, setNewCatDesc] = useState('')
  const [newCatIcon, setNewCatIcon] = useState('✨')

  const totalProducts = categories.reduce((sum, c) => sum + c.count, 0)

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.name_en.toLowerCase().includes(query.toLowerCase()) ||
      c.description.toLowerCase().includes(query.toLowerCase())
  )

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName.trim()) return

    const newCat: CategoryItem = {
      name: newCatName.trim(),
      name_en: newCatName.trim(),
      count: 0,
      color: '#edbc40',
      iconText: newCatIcon || '📦',
      description: newCatDesc.trim() || (isZh ? '新创建分类' : 'New category'),
      description_en: newCatDesc.trim() || 'New category',
    }

    setCategories([...categories, newCat])
    setNewCatName('')
    setNewCatDesc('')
    setShowAddModal(false)
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 顶部导航与创建按钮 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/products"
            className="w-9 h-9 rounded-full bg-white border border-[#E5E7EB] hover:bg-[#F4F5F7] flex items-center justify-center text-[#111827] transition-colors shadow-sm"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#6B7280]">
                {isZh ? '商品管理' : 'Products'} / {isZh ? '类目体系' : 'Taxonomy'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#111827] mt-0.5">
              {isZh ? '商品分类管理' : 'Product Categories'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-full bg-[#111827] hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Plus size={14} />
            <span>{isZh ? '新建分类' : 'New Category'}</span>
          </button>
        </div>
      </div>

      {/* 统计指标行 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="crextio-card p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F4F5F7] border border-[#E5E7EB] text-[#111827] flex items-center justify-center shrink-0">
              <Folder size={18} />
            </div>
            <div>
              <span className="text-xs text-[#6B7280] font-medium">{isZh ? '已建立类目数' : 'Total Categories'}</span>
              <div className="text-xl font-bold text-[#111827] mt-0.5 tnum">{categories.length} 个</div>
            </div>
          </div>
        </div>

        <div className="crextio-card p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F4F5F7] border border-[#E5E7EB] text-[#111827] flex items-center justify-center shrink-0">
              <Package size={18} />
            </div>
            <div>
              <span className="text-xs text-[#6B7280] font-medium">{isZh ? '覆盖商品总数' : 'Total Items'}</span>
              <div className="text-xl font-bold text-[#111827] mt-0.5 tnum">{totalProducts} 件</div>
            </div>
          </div>
        </div>

        <div className="crextio-card p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#edbc40]/20 text-[#111827] flex items-center justify-center shrink-0">
              <Sparkles size={18} />
            </div>
            <div>
              <span className="text-xs text-[#6B7280] font-medium">{isZh ? 'AI 语义映射率' : 'AI Semantic Rate'}</span>
              <div className="text-xl font-bold text-[#111827] mt-0.5 tnum">100%</div>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#edbc40] text-[#111827] text-xs font-bold shadow-sm">
            Optimal
          </span>
        </div>
      </div>

      {/* 搜索与卡片网格 */}
      <div className="crextio-card p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-heading text-lg font-bold text-[#111827]">
              {isZh ? '全品类分类矩阵' : 'Category Matrix'}
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5">
              {isZh
                ? '商品分类作为一级语义槽位，将直接引导大模型推理出推荐意图。'
                : 'Primary semantic slot guiding LLMs during shopping intent retrieval.'}
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isZh ? '搜索分类名称...' : 'Search categories...'}
              className="w-full h-9 pl-9 pr-4 rounded-full bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
            />
          </div>
        </div>

        {/* 分类网格 */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => {
            const pct = totalProducts > 0 ? ((c.count / totalProducts) * 100).toFixed(0) : 0
            return (
              <div
                key={c.name}
                className="group p-5 rounded-2xl bg-[#F4F5F7]/70 hover:bg-white border border-[#E5E7EB] hover:border-[#111827]/20 transition-all duration-200 hover:shadow-md flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center text-lg shadow-2xs">
                        {c.iconText}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-[#111827] group-hover:text-[#111827]">
                          {isZh ? c.name : c.name_en}
                        </h4>
                        <span className="text-[11px] text-[#9CA3AF] block font-medium">
                          {c.count} {isZh ? '件在售商品' : 'items'}
                        </span>
                      </div>
                    </div>

                    <span
                      style={{ backgroundColor: `${c.color}18`, color: c.color }}
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    >
                      {pct}% 占比
                    </span>
                  </div>

                  <p className="text-xs text-[#6B7280] mt-3 leading-relaxed">
                    {isZh ? c.description : c.description_en}
                  </p>
                </div>

                {/* 底部进度条与操作 */}
                <div className="space-y-2 pt-2 border-t border-[#E5E7EB]/80">
                  <div className="w-full h-1.5 rounded-full bg-[#E5E7EB] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: c.color }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[11px] text-[#9CA3AF]">{isZh ? 'AI 语义索引就绪' : 'Semantic Indexed'}</span>
                    <Link
                      href="/dashboard/products"
                      className="text-xs font-semibold text-[#111827] hover:underline flex items-center gap-0.5"
                    >
                      <span>{isZh ? '查看商品' : 'View'}</span>
                      <ChevronRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 新建分类弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-[#E5E7EB] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <h3 className="text-base font-bold text-[#111827]">{isZh ? '创建新商品分类' : 'Create Category'}</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[#9CA3AF] hover:text-[#111827] text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">
                  {isZh ? '分类图标 Emoji' : 'Icon Emoji'}
                </label>
                <div className="flex gap-2">
                  {['📦', '🎧', '⌚', '👓', '⚡', '⌨️', '🏠', '✨'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewCatIcon(emoji)}
                      className={`w-9 h-9 rounded-xl text-base flex items-center justify-center border transition-all ${
                        newCatIcon === emoji
                          ? 'border-[#111827] bg-[#F4F5F7] scale-105'
                          : 'border-[#E5E7EB] hover:bg-gray-50'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">
                  {isZh ? '分类名称 *' : 'Category Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder={isZh ? '例如：户外露营装备' : 'e.g. Outdoor Gear'}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs font-medium text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">
                  {isZh ? '分类描述与语义说明' : 'Category Description'}
                </label>
                <textarea
                  rows={3}
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder={isZh ? '说明该分类包含的产品品类及使用场景...' : 'Describe category scopes...'}
                  className="w-full p-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-full bg-[#F4F5F7] text-[#6B7280] text-xs font-semibold hover:bg-[#E5E7EB]"
                >
                  {isZh ? '取消' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#111827] text-white text-xs font-semibold hover:bg-black shadow-sm"
                >
                  {isZh ? '确认创建' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
