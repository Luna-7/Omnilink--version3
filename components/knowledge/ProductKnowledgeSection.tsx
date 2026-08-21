'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Package,
  ChevronDown,
  FileText,
  Unlink,
  Plus,
  Sparkles,
  Search,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  Lock,
  Eye,
  FileCode,
  FileSpreadsheet,
  Globe,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react'
import { DEMO_PRODUCTS, DemoProduct } from '@/lib/products/demo-data'
import type {
  KnowledgeFileSource,
  KnowledgeProductBinding,
  AiSuggestedBindingMatch,
} from './types'

interface ProductKnowledgeSectionProps {
  sources: KnowledgeFileSource[]
  bindings: KnowledgeProductBinding[]
  aiSuggestions: AiSuggestedBindingMatch[]
  onRemoveBinding: (sourceId: string, productId: string) => void
  onAddBinding: (sourceId: string, productId: string) => void
  onConfirmAiSuggestion: (suggestionId: string) => void
  onIgnoreAiSuggestion: (suggestionId: string) => void
  isZh: boolean
}

export function ProductKnowledgeSection({
  sources,
  bindings,
  aiSuggestions,
  onRemoveBinding,
  onAddBinding,
  onConfirmAiSuggestion,
  onIgnoreAiSuggestion,
  isZh,
}: ProductKnowledgeSectionProps) {
  const [searchQuery, setSearchQuery] = useState('')
  // By default, expand the first product
  const [expandedProductIds, setExpandedProductIds] = useState<Set<string>>(
    new Set(['prod-101'])
  )
  const [bindingModalProduct, setBindingModalProduct] = useState<DemoProduct | null>(null)

  const toggleExpand = (productId: string) => {
    const next = new Set(expandedProductIds)
    if (next.has(productId)) {
      next.delete(productId)
    } else {
      next.add(productId)
    }
    setExpandedProductIds(next)
  }

  const filteredProducts = DEMO_PRODUCTS.filter((product) => {
    const q = searchQuery.toLowerCase()
    return (
      product.name.toLowerCase().includes(q) ||
      product.name_en.toLowerCase().includes(q) ||
      product.sku.toLowerCase().includes(q) ||
      product.category.toLowerCase().includes(q)
    )
  })

  // Get bound sources for a given product
  const getBoundSources = (productId: string) => {
    const sourceIds = bindings
      .filter((b) => b.productId === productId)
      .map((b) => b.sourceId)
    return sources.filter((s) => sourceIds.includes(s.id))
  }

  // Get available un-bound sources for a given product
  const getUnboundSources = (productId: string) => {
    const boundIds = new Set(
      bindings.filter((b) => b.productId === productId).map((b) => b.sourceId)
    )
    return sources.filter((s) => !boundIds.has(s.id))
  }

  // Helper for source type icons
  const renderSourceIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="text-red-500" size={16} />
      case 'markdown':
        return <FileCode className="text-blue-500" size={16} />
      case 'docx':
        return <FileText className="text-indigo-500" size={16} />
      case 'xlsx':
      case 'csv':
        return <FileSpreadsheet className="text-emerald-500" size={16} />
      case 'url':
        return <Globe className="text-purple-500" size={16} />
      default:
        return <FileText className="text-gray-500" size={16} />
    }
  }

  return (
    <div className="space-y-4">
      {/* Section Title */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
          <h3 className="text-sm font-extrabold text-[#111827] uppercase tracking-wider">
            {isZh ? '商品知识管理 (Product Knowledge)' : 'Product Knowledge'}
          </h3>
        </div>
        <span className="text-xs text-[#6B7280]">
          {isZh
            ? '按商品与 SKU 视图管理已挂载知识 · 支持智能推荐与单商品解绑'
            : 'Per-Product/SKU Accordions · AI Auto-Match & Granular Unlink'}
        </span>
      </div>

      {/* Search Filter for Products */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isZh ? '搜索商品名称、SKU 或类目...' : 'Search product name, SKU or category...'}
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-white border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#8B5CF6] shadow-2xs"
          />
        </div>

        <div className="text-xs text-[#6B7280]">
          {isZh
            ? `展示 ${filteredProducts.length} 个商品档案`
            : `Showing ${filteredProducts.length} Product Profiles`}
        </div>
      </div>

      {/* Products Accordion List */}
      <div className="space-y-3.5">
        {filteredProducts.map((product) => {
          const isExpanded = expandedProductIds.has(product.id)
          const boundSources = getBoundSources(product.id)
          const suggestions = aiSuggestions.filter((s) => s.productId === product.id)

          return (
            <div
              key={product.id}
              className="rounded-3xl bg-white border border-[#E5E7EB] shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden transition-all"
            >
              {/* Product Accordion Header */}
              <div
                onClick={() => toggleExpand(product.id)}
                className="p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#F9FAFB]/70 transition-colors select-none"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Thumbnail */}
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-[#E5E7EB] shrink-0"
                  />

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm sm:text-base font-bold text-[#111827]">
                        {isZh ? product.name : product.name_en}
                      </h4>
                      <span className="px-2 py-0.5 rounded-md bg-[#F4F5F7] border border-[#E5E7EB] font-mono text-[10px] font-bold text-[#6B7280]">
                        {product.sku}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[#6B7280] flex-wrap">
                      <span>{isZh ? product.category : product.category_en}</span>
                      <span>•</span>
                      <span className="font-mono font-semibold text-[#111827]">
                        ¥{product.price} / ${Math.round(product.price / 7)}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-[#8B5CF6]">
                        {boundSources.length} {isZh ? '份知识文档已挂载' : 'Files Bound'}
                      </span>
                      {suggestions.length > 0 && (
                        <span className="px-2 py-0.2 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold flex items-center gap-1 animate-pulse">
                          <Sparkles size={10} className="text-amber-500" />
                          <span>{isZh ? 'AI 匹配推荐' : 'AI Match Suggested'}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div
                    className={`w-8 h-8 rounded-full bg-[#F4F5F7] border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] transition-transform duration-200 ${
                      isExpanded ? 'rotate-180 text-[#111827]' : ''
                    }`}
                  >
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>

              {/* Product Accordion Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="border-t border-[#E5E7EB] bg-[#FAFAFC]"
                  >
                    <div className="p-6 sm:p-7 space-y-5">
                      {/* AI Auto-Match Recommendation UI */}
                      {suggestions.map((sug) => {
                        const sugSource = sources.find((s) => s.id === sug.sourceId)
                        if (!sugSource) return null

                        return (
                          <div
                            key={sug.id}
                            className="p-4 rounded-2xl bg-linear-to-r from-purple-50 via-indigo-50/50 to-white border border-[#8B5CF6]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-xl bg-[#8B5CF6] text-white flex items-center justify-center shrink-0">
                                <Sparkles size={16} />
                              </div>
                              <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-bold text-[#111827]">
                                    {isZh ? 'AI 智能匹配推荐 (AI Suggested Match)' : 'AI Suggested Match'}
                                  </span>
                                  <span className="px-2 py-0.2 rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6] text-[10px] font-extrabold">
                                    {Math.round(sug.confidence * 100)}% {isZh ? '置信度' : 'Confidence'}
                                  </span>
                                  <span className="text-xs font-bold text-[#111827] font-mono truncate">
                                    {sugSource.name}
                                  </span>
                                </div>
                                <p className="text-xs text-[#6B7280]">
                                  {isZh ? sug.reason : sug.reasonEn}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                              <button
                                type="button"
                                onClick={() => onIgnoreAiSuggestion(sug.id)}
                                className="px-3 py-1.5 rounded-full bg-white hover:bg-gray-100 text-[#6B7280] border border-[#E5E7EB] text-xs font-semibold transition-colors cursor-pointer"
                              >
                                {isZh ? '忽略 (Ignore)' : 'Ignore'}
                              </button>
                              <button
                                type="button"
                                onClick={() => onConfirmAiSuggestion(sug.id)}
                                className="px-4 py-1.5 rounded-full bg-[#8B5CF6] hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                              >
                                <Check size={13} />
                                <span>{isZh ? '采纳并关联 (Confirm)' : 'Confirm & Bind'}</span>
                              </button>
                            </div>
                          </div>
                        )
                      })}

                      {/* Bound Knowledge Files Header */}
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                          <FileText size={13} className="text-[#8B5CF6]" />
                          <span>
                            {isZh
                              ? `已挂载知识文档 (${boundSources.length})`
                              : `Bound Knowledge Files (${boundSources.length})`}
                          </span>
                        </h5>

                        <button
                          type="button"
                          onClick={() => setBindingModalProduct(product)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white hover:bg-[#F4F5F7] border border-[#E5E7EB] text-xs font-bold text-[#111827] shadow-2xs transition-all cursor-pointer"
                        >
                          <Plus size={13} className="text-[#8B5CF6]" />
                          <span>{isZh ? '关联现有知识源' : 'Associate File'}</span>
                        </button>
                      </div>

                      {/* Bound Files List */}
                      {boundSources.length === 0 ? (
                        <div className="p-8 rounded-2xl bg-white border border-dashed border-[#CBD5E1] text-center space-y-2">
                          <Package className="mx-auto text-gray-300" size={28} />
                          <p className="text-xs text-[#6B7280]">
                            {isZh
                              ? '当前商品暂未挂载任何知识源文件'
                              : 'No knowledge files currently bound to this product.'}
                          </p>
                          <button
                            type="button"
                            onClick={() => setBindingModalProduct(product)}
                            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#111827] hover:bg-black text-white text-xs font-bold transition-all cursor-pointer"
                          >
                            <Plus size={12} />
                            <span>{isZh ? '立即挂载文件' : 'Bind Knowledge File'}</span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {boundSources.map((source) => (
                            <div
                              key={source.id}
                              className="p-4 rounded-2xl bg-white border border-[#E5E7EB] hover:border-purple-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                            >
                              <div className="flex items-start gap-3 min-w-0 flex-1">
                                <div className="w-9 h-9 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] flex items-center justify-center shrink-0">
                                  {renderSourceIcon(source.type)}
                                </div>

                                <div className="min-w-0 space-y-0.5">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs sm:text-sm font-bold text-[#111827] break-all">
                                      {source.name}
                                    </span>
                                    <span className="px-2 py-0.2 rounded-md bg-[#F4F5F7] border border-[#E5E7EB] uppercase text-[10px] font-bold text-[#6B7280]">
                                      {source.type}
                                    </span>
                                    <span
                                      className={`px-2 py-0.2 rounded-md text-[10px] font-bold ${
                                        source.visibility === 'customer-facing'
                                          ? 'bg-blue-50 text-blue-700'
                                          : 'bg-gray-100 text-gray-700'
                                      }`}
                                    >
                                      {source.visibility === 'customer-facing'
                                        ? isZh
                                          ? '面向买家'
                                          : 'Public'
                                        : isZh
                                        ? '内部机密'
                                        : 'Private'}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 text-[11px] text-[#6B7280]">
                                    <span className="font-mono">{source.size}</span>
                                    {source.tokensCount && (
                                      <>
                                        <span>•</span>
                                        <span className="font-mono text-purple-600">
                                          {source.tokensCount.toLocaleString()} Tokens
                                        </span>
                                      </>
                                    )}
                                    {source.summary && (
                                      <>
                                        <span>•</span>
                                        <span className="truncate max-w-xs">{source.summary}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Remove from Product Action (Strictly distinct from Delete File) */}
                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                <button
                                  type="button"
                                  onClick={() => onRemoveBinding(source.id, product.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 border border-[#E5E7EB] hover:border-rose-200 text-xs font-semibold text-[#6B7280] hover:text-rose-600 transition-colors cursor-pointer shadow-2xs"
                                  title={
                                    isZh
                                      ? '仅解除该商品与此文件的关联，文件仍保留在全局知识库中'
                                      : 'Unlink from this product only'
                                  }
                                >
                                  <Unlink size={13} />
                                  <span>{isZh ? '解除商品关联' : 'Remove from Product'}</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* Modal: Bind Existing Knowledge Source to Product */}
      <AnimatePresence>
        {bindingModalProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBindingModalProduct(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-[#E5E7EB] z-10 space-y-4 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                <div className="space-y-0.5">
                  <h4 className="text-base font-bold text-[#111827]">
                    {isZh ? '选择要挂载的知识源文件' : 'Select Knowledge Source to Bind'}
                  </h4>
                  <p className="text-xs text-[#6B7280]">
                    {isZh ? '目标商品:' : 'Target Product:'}{' '}
                    <strong className="text-[#111827]">
                      {isZh ? bindingModalProduct.name : bindingModalProduct.name_en}
                    </strong>{' '}
                    <span className="font-mono text-[#8B5CF6]">[{bindingModalProduct.sku}]</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setBindingModalProduct(null)}
                  className="p-1.5 rounded-full bg-[#F4F5F7] hover:bg-[#E5E7EB] text-[#6B7280] hover:text-[#111827] transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* List of unbound sources */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scroll max-h-[360px]">
                {getUnboundSources(bindingModalProduct.id).length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#6B7280]">
                    {isZh ? '所有知识源文件均已挂载至该商品' : 'All available files are already bound'}
                  </div>
                ) : (
                  getUnboundSources(bindingModalProduct.id).map((src) => (
                    <div
                      key={src.id}
                      className="p-3 rounded-2xl bg-[#FAFAFC] hover:bg-white border border-[#E5E7EB] hover:border-[#8B5CF6]/50 transition-all flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center shrink-0">
                          {renderSourceIcon(src.type)}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-[#111827] truncate block">
                            {src.name}
                          </span>
                          <span className="text-[10px] text-[#6B7280] font-mono">
                            {src.size} • {src.type.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onAddBinding(src.id, bindingModalProduct.id)
                          setBindingModalProduct(null)
                        }}
                        className="px-3 py-1.5 rounded-full bg-[#111827] hover:bg-black text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      >
                        <Plus size={12} />
                        <span>{isZh ? '挂载此文件' : 'Bind File'}</span>
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-3 border-t border-[#E5E7EB] flex justify-end">
                <button
                  type="button"
                  onClick={() => setBindingModalProduct(null)}
                  className="px-4 py-2 rounded-full bg-[#F4F5F7] hover:bg-[#E5E7EB] text-[#111827] text-xs font-semibold transition-colors cursor-pointer"
                >
                  {isZh ? '关闭' : 'Close'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
