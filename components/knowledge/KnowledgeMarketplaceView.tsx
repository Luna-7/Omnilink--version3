'use client'

import React, { useState } from 'react'
import { motion } from 'motion/react'
import {
  Compass,
  Search,
  Plus,
  Check,
  UploadCloud,
  Scale,
  Truck,
  TrendingUp,
  ShieldCheck,
  FileCheck2,
  Leaf,
  X,
  Layers,
} from 'lucide-react'
import { CENTER_KNOWLEDGE_BASES_DATA } from './mockData'

interface KnowledgeMarketplaceViewProps {
  isZh: boolean
  addedCenterBaseIds?: string[]
  onToggleAddCenterBase?: (id: string) => void
}

export function KnowledgeMarketplaceView({
  isZh,
  addedCenterBaseIds = ['hub-eu-reg'],
  onToggleAddCenterBase,
}: KnowledgeMarketplaceViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [shareBaseTitle, setShareBaseTitle] = useState('')
  const [justAddedId, setJustAddedId] = useState<string | null>(null)

  const filteredBases = CENTER_KNOWLEDGE_BASES_DATA.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleToggleAdd = (id: string) => {
    if (onToggleAddCenterBase) {
      onToggleAddCenterBase(id)
    }
    if (!addedCenterBaseIds.includes(id)) {
      setJustAddedId(id)
      setTimeout(() => setJustAddedId(null), 1200)
    }
  }

  return (
    <div className="space-y-5">
      {/* 1. Header Banner */}
      <div
        id="knowledge-center-header"
        className="p-5 sm:p-6 rounded-[24px] bg-white/65 backdrop-blur-[20px] backdrop-saturate-[180%] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex flex-wrap items-center justify-between gap-4"
      >
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-[#111827] tracking-tight">
              知识库中心
            </h2>
            <span className="px-2 py-0.5 rounded-[8px] bg-purple-50 text-purple-700 text-[10px] font-semibold flex items-center gap-1">
              <Compass size={11} />
              <span>发现 · 添加 · 共享</span>
            </span>
          </div>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            发现并一键添加权威行业知识库至您的<strong>私有云库</strong>；已添加的知识库将自动同步至私有云库列表中供联合研报检索。
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            id="share-knowledge-btn"
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[8px] bg-[#111827] hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <UploadCloud size={13} />
            <span>共享知识库</span>
          </button>
        </div>
      </div>

      {/* 2. Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#111827]">热门知识库</span>
          <span className="text-[11px] text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded-[6px] border border-purple-200/50">
            已同步至私有云库: {addedCenterBaseIds.length} / {CENTER_KNOWLEDGE_BASES_DATA.length} 个
          </span>
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索知识库名称或行业…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-8 pr-3 rounded-[8px] bg-white border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
          />
        </div>
      </div>

      {/* 3. Knowledge Base Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBases.map((item) => {
          const isAdded = addedCenterBaseIds.includes(item.id)
          const isJustAdded = justAddedId === item.id

          return (
            <motion.div
              key={item.id}
              whileHover={{ y: -2 }}
              id={`hub-card-${item.id}`}
              className={`p-4 rounded-[16px] border transition-all flex flex-col justify-between space-y-3 ${
                isAdded
                  ? 'bg-white/80 border-purple-300 shadow-[0_8px_32px_rgba(139,92,246,0.08)]'
                  : 'bg-white/65 backdrop-blur-[20px] backdrop-saturate-[180%] border-white/60 hover:border-purple-200 shadow-[0_8px_32px_rgba(0,0,0,0.04)]'
              }`}
            >
              <div className="space-y-2.5">
                {/* Top category & icon */}
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-[10px] bg-[#111827] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    {renderCategoryIcon(item.icon)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isAdded && (
                      <span className="px-1.5 py-0.5 rounded-[6px] bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                        ● 已入私有云库
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-[6px] bg-purple-50 text-purple-700 text-[10px] font-semibold">
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h4 className="text-xs font-bold text-[#111827] leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-[#6B7280] line-clamp-2 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Document count */}
                <div className="text-[10px] text-[#9CA3AF] pt-1.5 border-t border-[#E5E7EB]/60 flex items-center justify-between">
                  <span>{item.sourcesCount} 份权威文档</span>
                  <span className="text-gray-400">权威行业库</span>
                </div>
              </div>

              {/* Bottom Action Button */}
              <div className="pt-2 border-t border-[#E5E7EB]/60 flex items-center justify-between">
                <span className="text-[10px] text-[#6B7280]">
                  {isAdded ? '已加入检索范围' : '点击添加至工作区'}
                </span>
                <button
                  type="button"
                  id={`action-btn-${item.id}`}
                  onClick={() => handleToggleAdd(item.id)}
                  className={`px-3.5 py-1.5 rounded-[8px] text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    isAdded
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-rose-50 hover:text-rose-600 border border-emerald-200/60 shadow-2xs'
                      : 'bg-[#111827] hover:bg-black text-white shadow-2xs'
                  }`}
                  title={isAdded ? '点击自私有云库移除' : '点击添加到私有云库'}
                >
                  {isAdded ? (
                    <>
                      <Check size={12} />
                      <span>{isJustAdded ? '已添加' : '已添加'}</span>
                    </>
                  ) : (
                    <>
                      <Plus size={12} />
                      <span>添加</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Upload/Share Knowledge Base Modal (UI Placeholder) */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-xs"
            onClick={() => setIsShareModalOpen(false)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-[24px] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-[#E5E7EB] z-10 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
              <h3 className="text-sm font-bold text-[#111827]">共享知识库</h3>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-[#6B7280]">
              您可以将企业梳理的标准化合规或行业知识库共享至中心供团队使用。
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                setIsShareModalOpen(false)
                setShareBaseTitle('')
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">
                  知识库名称
                </label>
                <input
                  type="text"
                  placeholder="例如：东南亚跨境电商运营指引"
                  value={shareBaseTitle}
                  onChange={(e) => setShareBaseTitle(e.target.value)}
                  className="w-full h-9 px-3 rounded-[8px] bg-white border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-[8px] bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-[#111827]"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={!shareBaseTitle.trim()}
                  className="px-4 py-1.5 rounded-[8px] bg-[#111827] hover:bg-black disabled:bg-gray-200 text-white disabled:text-gray-400 text-xs font-bold shadow-xs cursor-pointer"
                >
                  提交
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function renderCategoryIcon(icon: string) {
  switch (icon) {
    case 'Scale':
      return <Scale size={14} />
    case 'Truck':
      return <Truck size={14} />
    case 'TrendingUp':
      return <TrendingUp size={14} />
    case 'ShieldCheck':
      return <ShieldCheck size={14} />
    case 'FileCheck2':
      return <FileCheck2 size={14} />
    case 'Leaf':
      return <Leaf size={14} />
    default:
      return <Compass size={14} />
  }
}

