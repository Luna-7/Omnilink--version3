'use client'

import React, { useState } from 'react'
import {
  Search,
  Check,
  Plus,
  Star,
  Globe,
  BarChart3,
  Image as ImageIcon,
  Truck,
  Users2,
  FileSearch,
  Wrench,
  Trash2,
} from 'lucide-react'
import { INITIAL_PLUGINS } from './mockData'
import type { PluginItem } from './types'

interface PluginsPageProps {
  addedPluginIds: Set<string>
  onToggleAddPlugin: (pluginId: string) => void
  isZh: boolean
}

const CATEGORIES_ZH = ['全部', '商业', '数据', '营销', '设计', '开发', '物流', '分析', '自动化']
const CATEGORIES_EN = ['All', 'Commerce', 'Data', 'Marketing', 'Design', 'Development', 'Logistics', 'Analytics', 'Automation']

const CATEGORY_MAP: Record<string, string> = {
  全部: 'All',
  商业: 'Commerce',
  数据: 'Data',
  营销: 'Marketing',
  设计: 'Design',
  开发: 'Development',
  物流: 'Logistics',
  分析: 'Analytics',
  自动化: 'Automation',
}

export function PluginsPage({
  addedPluginIds,
  onToggleAddPlugin,
  isZh,
}: PluginsPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(isZh ? '全部' : 'All')

  const categories = isZh ? CATEGORIES_ZH : CATEGORIES_EN

  const filteredPlugins = INITIAL_PLUGINS.filter((plugin) => {
    const matchesSearch =
      !searchQuery.trim() ||
      plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.nameZh.includes(searchQuery) ||
      plugin.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.descriptionZh.includes(searchQuery)

    const matchesCategory =
      selectedCategory === '全部' ||
      selectedCategory === 'All' ||
      plugin.categoryZh === selectedCategory ||
      plugin.category === selectedCategory ||
      (selectedCategory === '商业' && plugin.tagsZh.includes('商业')) ||
      (selectedCategory === 'Commerce' && plugin.tags.includes('Commerce')) ||
      (selectedCategory === '数据' && (plugin.categoryZh === '数据' || plugin.tagsZh.includes('集成'))) ||
      (selectedCategory === 'Data' && (plugin.category === 'Data' || plugin.tags.includes('Integration'))) ||
      (selectedCategory === '营销' && plugin.categoryZh === '营销') ||
      (selectedCategory === 'Marketing' && plugin.category === 'Marketing') ||
      (selectedCategory === '设计' && plugin.categoryZh === '设计') ||
      (selectedCategory === 'Design' && plugin.category === 'Design') ||
      (selectedCategory === '物流' && plugin.categoryZh === '物流') ||
      (selectedCategory === 'Logistics' && plugin.category === 'Logistics') ||
      (selectedCategory === '分析' && plugin.categoryZh === '分析') ||
      (selectedCategory === 'Analytics' && plugin.category === 'Analytics')

    return matchesSearch && matchesCategory
  })

  // Installed Plugins List
  const installedPlugins = INITIAL_PLUGINS.filter((p) => addedPluginIds.has(p.id))

  const renderPluginIcon = (type: PluginItem['iconType']) => {
    switch (type) {
      case 'translate':
        return <Globe size={18} className="text-[#024AD8]" />
      case 'seo':
        return <FileSearch size={18} className="text-[#024AD8]" />
      case 'analytics':
        return <BarChart3 size={18} className="text-[#024AD8]" />
      case 'image':
        return <ImageIcon size={18} className="text-[#024AD8]" />
      case 'shipping':
        return <Truck size={18} className="text-[#024AD8]" />
      case 'crm':
        return <Users2 size={18} className="text-[#024AD8]" />
      default:
        return <Wrench size={18} className="text-[#024AD8]" />
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto py-6 sm:py-8 px-4 space-y-10">
      {/* ============================================================
          1. HEADER & SEARCH
          ============================================================ */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#024AD8]" />
            <span className="text-[11px] font-bold text-[#024AD8] uppercase tracking-wider">
              Omnilink Tools & Connectors
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">
            {isZh ? '插件' : 'Plugins'}
          </h1>
          <p className="text-sm text-[#6B7280]">
            {isZh
              ? '为你的 Omnilink 工作流增加工具、连接器与专业功能。'
              : 'Add tools, connectors, and specialized capabilities to your Omnilink workflow.'}
          </p>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Search Input */}
          <div className="relative w-full sm:max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isZh ? '搜索插件...' : 'Search plugins...'}
              className="w-full h-10 pl-9 pr-4 bg-white rounded-[6px] border border-[#D1D5DB] hover:border-[#9CA3AF] focus:border-[#024AD8] focus:ring-1 focus:ring-[#024AD8] text-xs sm:text-sm text-[#111827] focus:outline-none shadow-2xs"
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const active = selectedCategory === cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`h-8 px-3 rounded-[4px] text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? 'bg-[#024AD8] text-white shadow-xs'
                      : 'bg-white hover:bg-[#F7F7F7] border border-[#D1D1D1] text-[#4B5563] hover:text-[#111827]'
                  }`}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ============================================================
          2. FEATURED PLUGINS GRID
          ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlugins.map((plugin) => {
          const isAdded = addedPluginIds.has(plugin.id)
          return (
            <div
              key={plugin.id}
              id={`plugin-card-${plugin.id}`}
              className="bg-white rounded-xl border border-[#E5E7EB] hover:border-[#024AD8]/60 p-5 flex flex-col justify-between transition-all duration-150 shadow-2xs hover:shadow-xs group"
            >
              <div className="space-y-3.5">
                {/* Top Row: Icon, Title, Rating */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[6px] bg-[#EFF4FF] border border-[#D0E0FC] flex items-center justify-center shrink-0">
                      {renderPluginIcon(plugin.iconType)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#111827] group-hover:text-[#024AD8] transition-colors">
                        {isZh ? plugin.nameZh : plugin.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#6B7280]">
                        <span>{plugin.developer}</span>
                        <span>·</span>
                        <span>{plugin.usesCount} {isZh ? '次使用' : 'uses'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center text-amber-500 text-[11px] font-bold">
                    <Star size={12} className="fill-amber-400 text-amber-400 mr-0.5" />
                    <span>5.0</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-[#4B5563] leading-relaxed line-clamp-2">
                  {isZh ? plugin.descriptionZh : plugin.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {(isZh ? plugin.tagsZh : plugin.tags).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-[4px] bg-[#F3F4F6] text-[#4B5563] text-[11px] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Action Row */}
              <div className="pt-4 mt-4 border-t border-[#F3F4F6] flex items-center justify-between">
                <span className="text-[11px] text-[#9CA3AF]">
                  {isZh ? '支持自动同步' : 'Auto-sync ready'}
                </span>

                <button
                  type="button"
                  id={`btn-toggle-plugin-${plugin.id}`}
                  onClick={() => onToggleAddPlugin(plugin.id)}
                  className={`h-8 px-3.5 rounded-[4px] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isAdded
                      ? 'bg-white hover:bg-[#F7F7F7] border border-[#D1D1D1] text-[#1C1C1C]'
                      : 'bg-[#024AD8] hover:bg-[#003198] active:bg-[#00226B] text-white shadow-xs'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check size={13} className="text-emerald-600" />
                      <span>{isZh ? '已添加' : 'Added'}</span>
                    </>
                  ) : (
                    <>
                      <Plus size={13} />
                      <span>{isZh ? '添加' : 'Add'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* ============================================================
          3. BOTTOM SECTION: MY PLUGINS (我的插件)
          ============================================================ */}
      <div className="pt-8 border-t border-[#E5E7EB] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#111827]">
              {isZh ? '我的插件' : 'My Active Plugins'}
            </h2>
            <p className="text-xs text-[#6B7280]">
              {isZh
                ? '已连接到你当前店铺与工作流的插件。'
                : 'Plugins currently connected to your store and workflows.'}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-[4px] bg-[#EFF4FF] text-[#024AD8] text-xs font-bold">
            {installedPlugins.length} {isZh ? '个启用中' : 'Active'}
          </span>
        </div>

        {installedPlugins.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-dashed border-[#D1D5DB] text-xs text-[#6B7280]">
            {isZh ? '尚未添加任何插件。点击上方卡片快速启用。' : 'No active plugins. Click Add on any card above to enable.'}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#E5E7EB] divide-y divide-[#F3F4F6] overflow-hidden shadow-2xs">
            {installedPlugins.map((plugin) => (
              <div
                key={plugin.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAFAFA] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[4px] bg-[#EFF4FF] border border-[#D0E0FC] flex items-center justify-center shrink-0">
                    {renderPluginIcon(plugin.iconType)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#111827]">
                      {isZh ? plugin.nameZh : plugin.name}
                    </h4>
                    <p className="text-[11px] text-[#6B7280]">
                      {isZh ? plugin.descriptionZh : plugin.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {isZh ? '正常运行' : 'Active'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onToggleAddPlugin(plugin.id)}
                    className="p-1.5 rounded-[4px] text-[#9CA3AF] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title={isZh ? '移除插件' : 'Remove Plugin'}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
