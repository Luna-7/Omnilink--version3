'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Sparkles, Check, Edit2, ArrowRight, Tag } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import {
  suggestProductCategory,
  ProductCategorySuggestion,
  COMMON_CATEGORY_OPTIONS,
} from '@/lib/product/category-suggester'

interface ProductIdentitySectionProps {
  name: string
  setName: (val: string) => void
  sku: string
  setSku: (val: string) => void
  category: string
  setCategory: (val: string) => void
  disabled?: boolean
}

export function ProductIdentitySection({
  name,
  setName,
  sku,
  setSku,
  category,
  setCategory,
  disabled = false,
}: ProductIdentitySectionProps) {
  const { isZh } = useLanguage()

  // Local suggestion state from deterministic rule engine
  const [suggestion, setSuggestion] = useState<ProductCategorySuggestion | null>(null)
  const categoryInputRef = useRef<HTMLInputElement>(null)

  // 150~250ms debounce for product name input -> category suggestion
  useEffect(() => {
    if (!name || name.trim().length === 0) {
      setSuggestion(null)
      return
    }

    const timer = setTimeout(() => {
      const result = suggestProductCategory(name)
      setSuggestion(result)
    }, 200)

    return () => clearTimeout(timer)
  }, [name])

  const handleApplySuggestion = () => {
    if (!suggestion) return
    setCategory(suggestion.category)
  }

  const handleFocusCategoryInput = () => {
    categoryInputRef.current?.focus()
  }

  const hasCategory = Boolean(category && category.trim())
  const isSuggestionApplied = suggestion && category.trim() === suggestion.category
  const isSuggestionDifferent = suggestion && hasCategory && !isSuggestionApplied

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold text-xs">
            1
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {isZh ? '商品基本标识 (Product Identity)' : 'Product Identity'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isZh
                ? '商品核心名称、全局唯一 SKU 与智能品类推荐'
                : 'Core product name, SKU identifier, and instant category suggestion'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Product Name */}
        <div className="md:col-span-2">
          <label htmlFor="workspace-name" className="block text-xs font-semibold text-slate-800 mb-1.5">
            {isZh ? '商品名称 *' : 'Product Name *'}
          </label>
          <input
            id="workspace-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={disabled}
            placeholder={
              isZh
                ? '例如：Ray-Ban Wayfarer Polarized Sunglasses 或 Sony WH-1000XM6'
                : 'e.g. Ray-Ban Wayfarer Polarized Sunglasses or Sony WH-1000XM6'
            }
            className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 disabled:opacity-50 transition-all"
          />
        </div>

        {/* Suggestion Notification Box (Interactive, non-intrusive) */}
        {suggestion && (
          <div className="md:col-span-2 p-3.5 rounded-xl bg-violet-50/60 border border-violet-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all">
            <div className="flex items-start sm:items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-violet-600 text-white flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                <Sparkles size={13} />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold text-violet-900">
                    {isZh ? '✨ 建议分类' : '✨ Suggested Category'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-violet-200 text-violet-800 text-xs font-bold shadow-2xs">
                    {suggestion.path.join(' → ')}
                  </span>
                  <span className="text-[10px] text-violet-600">
                    ({(suggestion.confidence * 100).toFixed(0)}% {isZh ? '匹配度' : 'confidence'})
                  </span>
                </div>
                {isSuggestionDifferent && (
                  <p className="text-[11px] text-slate-600">
                    {isZh
                      ? `当前分类:「${category}」| 系统规则建议:「${suggestion.path.join(' → ')}」`
                      : `Current: "${category}" | Rule engine suggests: "${suggestion.path.join(' → ')}"`}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
              {!isSuggestionApplied ? (
                <>
                  <button
                    type="button"
                    onClick={handleApplySuggestion}
                    disabled={disabled}
                    className="h-7 px-3 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                  >
                    <Check size={12} />
                    <span>{isZh ? '采用' : 'Apply'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleFocusCategoryInput}
                    disabled={disabled}
                    className="h-7 px-2.5 rounded-lg bg-white hover:bg-violet-100/60 border border-violet-200 text-violet-800 text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Edit2 size={11} />
                    <span>{isZh ? '修改' : 'Edit'}</span>
                  </button>
                </>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  <Check size={12} className="text-emerald-600" />
                  {isZh ? '已采用建议' : 'Applied'}
                </span>
              )}
            </div>
          </div>
        )}

        {/* SKU */}
        <div>
          <label htmlFor="workspace-sku" className="block text-xs font-semibold text-slate-800 mb-1.5">
            {isZh ? '商品 SKU / 货号' : 'Product SKU'}
          </label>
          <div className="relative">
            <input
              id="workspace-sku"
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              disabled={disabled}
              placeholder="e.g. OMNI-SKU-9021"
              className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 disabled:opacity-50 transition-all"
            />
          </div>
        </div>

        {/* Category Input & Search */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="workspace-category" className="block text-xs font-semibold text-slate-800">
              {isZh ? '商品分类 (Product Category)' : 'Product Category'}
            </label>
            <span className="text-[10px] text-slate-400">
              {isZh ? '可自由输入或从建议中选择' : 'Custom input / search'}
            </span>
          </div>
          <div className="relative">
            <input
              ref={categoryInputRef}
              id="workspace-category"
              type="text"
              list="category-search-list"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={disabled}
              placeholder={isZh ? '输入商品分类（如：太阳镜、耳机、智能手表）' : 'Type or search category...'}
              className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 disabled:opacity-50 transition-all"
            />
            <datalist id="category-search-list">
              {COMMON_CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>
        </div>
      </div>
    </div>
  )
}
