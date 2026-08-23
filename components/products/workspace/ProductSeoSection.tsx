'use client'

import React, { useState } from 'react'
import { Search, ChevronDown, ChevronUp, Bot, CheckCircle, Sparkles } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

/**
 * BACKEND CONTRACT REQUEST (Optional):
 * 
 * If dedicated custom SEO title/meta description override endpoint is required:
 * PATCH /api/v1/merchant/products/:id/seo
 */

interface ProductSeoSectionProps {
  seoTitle: string
  setSeoTitle: (val: string) => void
  seoDescription: string
  setSeoDescription: (val: string) => void
  productName?: string
  productDescription?: string
  disabled?: boolean
}

export function ProductSeoSection({
  seoTitle,
  setSeoTitle,
  seoDescription,
  setSeoDescription,
  productName,
  productDescription,
  disabled = false,
}: ProductSeoSectionProps) {
  const { isZh } = useLanguage()
  const [isExpanded, setIsExpanded] = useState(false)

  const handleAutoGenerateSEO = () => {
    const title = productName?.trim()
      ? `${productName.trim()} | Official Store`
      : isZh
      ? '精选高品质商品 | 官方旗舰店'
      : 'Premium Product | Official Store'
    
    const desc = productDescription?.trim()
      ? productDescription.trim().slice(0, 150)
      : isZh
      ? '探索最新发布的智能创新商品，享受官方品质保证、快速物流配送与全方位 AI 导购售后支持。'
      : 'Discover high quality products with official warranty, fast shipping, and smart AI support.'

    setSeoTitle(title)
    setSeoDescription(desc)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[4px] bg-blue-50 text-[#024AD8] flex items-center justify-center font-mono font-bold text-xs">
            09
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {isZh ? '搜索引擎优化与 AI 可发现性 (AI / SEO)' : 'AI / SEO Discoverability'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isZh
                ? '优化搜索引擎 TDK 元数据，提升 AI Agent 大模型语义索引推荐概率'
                : 'Optimize TDK metadata and enhance LLM AI Agent semantic searchability'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
            <CheckCircle size={12} />
            <span>{isZh ? 'Semantic Ready' : 'Semantic Ready'}</span>
          </span>

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4 pt-1 transition-all">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAutoGenerateSEO}
              disabled={disabled}
              className="px-3 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-semibold border border-violet-200 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Sparkles size={13} />
              <span>{isZh ? '一键生成 SEO TDK' : 'Auto Generate SEO'}</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              {isZh ? 'SEO 页面标题 (Meta Title)' : 'SEO Title'}
            </label>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              disabled={disabled}
              placeholder={isZh ? '例如: OmniVibe Max 降噪耳机 | 官方商店' : 'e.g. OmniVibe Max Headphones | Official Store'}
              className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              {isZh ? 'SEO 页面描述 (Meta Description)' : 'SEO Meta Description'}
            </label>
            <textarea
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              rows={3}
              disabled={disabled}
              placeholder={isZh ? '针对 Google / 百度搜索引擎展示的提炼摘要...' : 'Snippet displayed in search engine results...'}
              className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 leading-relaxed disabled:opacity-50"
            />
          </div>

          {/* AI Discoverability Preview */}
          <div className="p-3.5 rounded-xl bg-slate-900 text-white space-y-2 text-xs">
            <div className="flex items-center gap-2 text-violet-300 font-bold">
              <Bot size={15} />
              <span>{isZh ? '大模型语义理解与 Agent 导购概览' : 'LLM Agent Semantic Summary'}</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {isZh
                ? '商品提交后将自动注入分布式向量数据库，允许 ChatGPT、Gemini 及独立站 AI 导购准确识别商品属性与库存变体。'
                : 'Injected into vector index upon publish, allowing LLM agents to perform accurate semantic reasoning for customer queries.'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
