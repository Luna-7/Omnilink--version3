'use client'

import React, { useState } from 'react'
import { Sparkles, HelpCircle } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

interface ProductDescriptionSectionProps {
  description: string
  setDescription: (val: string) => void
  productName?: string
  category?: string
  disabled?: boolean
}

export function ProductDescriptionSection({
  description,
  setDescription,
  productName,
  category,
  disabled = false,
}: ProductDescriptionSectionProps) {
  const { isZh } = useLanguage()
  const [isAIAssisting, setIsAIAssisting] = useState(false)

  const handleAIAssist = () => {
    setIsAIAssisting(true)
    setTimeout(() => {
      const baseName = productName?.trim() || (isZh ? '高品质智能商品' : 'High Performance Product')
      const catText = category?.trim() ? ` [${category}]` : ''
      const generated = isZh
        ? `${baseName}${catText}，结合精湛工业设计与优质材质工艺，专为追求高体验标准的日常与专业场景打造。具备卓越性能表现、持久耐用度与人体工学舒适度，支持全流程数字化服务保障。`
        : `${baseName}${catText}, engineered with premium craftsmanship and advanced ergonomic materials. Built for reliability, optimal performance, and seamless user experience.`
      
      setDescription(generated)
      setIsAIAssisting(false)
    }, 400)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[4px] bg-blue-50 text-[#024AD8] flex items-center justify-center font-mono font-bold text-xs">
            04
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {isZh ? '商品详细描述 (Description)' : 'Description'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isZh
                ? '详细规格卖点、适用场景与使用说明'
                : 'Detailed specifications, selling points, and usage guidelines'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAIAssist}
          disabled={disabled || isAIAssisting}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-semibold border border-violet-200 transition-colors cursor-pointer disabled:opacity-50"
        >
          <Sparkles size={13} className="text-violet-600" />
          <span>{isAIAssisting ? (isZh ? 'AI 正在整理...' : 'AI Assisting...') : isZh ? 'AI Assist' : 'AI Assist'}</span>
        </button>
      </div>

      <div className="p-3 rounded-xl bg-violet-50/50 border border-violet-100/80 text-xs text-violet-900 flex items-start gap-2">
        <HelpCircle size={14} className="text-violet-600 shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          {isZh
            ? '说明：AI 可以根据已有商品名称与品类信息辅助整理结构化描述与关键卖点。'
            : 'Note: AI can assist in structuring descriptions and key highlights based on existing product identity.'}
        </span>
      </div>

      <div>
        <label htmlFor="workspace-description" className="block text-xs font-semibold text-slate-800 mb-1.5">
          {isZh ? '商品描述与核心功能' : 'Description & Highlights'}
        </label>
        <textarea
          id="workspace-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          disabled={disabled}
          placeholder={
            isZh
              ? '输入该商品的卖点、材质参数、适用人群及使用说明...'
              : 'Enter product selling points, parameters, target audience, and usage guides...'
          }
          className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 leading-relaxed disabled:opacity-50 transition-all"
        />
      </div>
    </div>
  )
}
