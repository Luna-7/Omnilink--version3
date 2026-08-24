'use client'

import React from 'react'
import { Sparkles, Eye, ShieldCheck, Bot, Check, ArrowRight, Activity, FileCheck } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

interface FutureCardProps {
  onOpenPreview: (title: string) => void
}

/**
 * Card A: AI 商品智能 (AI Product Intelligence)
 * Positioned inside / adjacent to Product Specifications section (Core Workspace).
 */
export function AiProductIntelligenceCard({ onOpenPreview }: FutureCardProps) {
  const { isZh } = useLanguage()

  const features = isZh
    ? [
        { title: '自动识别', desc: '从文本/图片解析提取规范属性' },
        { title: '自动补全', desc: '关联品类知识智能预测缺省值' },
        { title: '冲突检测', desc: '校验数值范围与逻辑不兼容性' },
        { title: '结构化整理', desc: '自动校准为行业标准 Key/Value' },
      ]
    : [
        { title: 'Auto Extraction', desc: 'Extract canonical fields from media' },
        { title: 'Auto Fill', desc: 'Predict missing attributes by category' },
        { title: 'Conflict Detection', desc: 'Audit value ranges and incompatibility' },
        { title: 'Normalization', desc: 'Map to standard Industry Schema' },
      ]

  return (
    <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/40 border border-dashed border-indigo-200/90 shadow-2xs space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[4px] bg-indigo-100/80 text-[#024AD8] flex items-center justify-center">
            <Sparkles size={15} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-900">
                {isZh ? 'AI 商品智能 (AI Product Intelligence)' : 'AI Product Intelligence'}
              </h4>
              <span className="px-2 py-0.5 rounded-[4px] bg-indigo-100 text-indigo-800 text-[10px] font-bold border border-indigo-200">
                {isZh ? '即将支持' : 'Coming Soon'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isZh
                ? '基于 LLM 多模态的商品规格智能补全与属性拓扑校准'
                : 'LLM multimodal attribute auto-completion and conflict audit'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenPreview(isZh ? 'AI 商品智能' : 'AI Product Intelligence')}
          className="px-3 py-1 rounded-[4px] bg-white border border-indigo-200 text-[#024AD8] text-xs font-medium hover:bg-indigo-50 hover:border-indigo-300 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#024AD8] shrink-0"
        >
          {isZh ? '[预览]' : '[Preview]'}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {features.map((f, i) => (
          <div
            key={i}
            className="p-2.5 rounded-xl bg-white/80 border border-indigo-100/80 space-y-1 text-left"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
              <span>{f.title}</span>
            </div>
            <p className="text-[10px] text-slate-500 line-clamp-1">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Card B: AI Visibility (AI 可见性)
 */
export function AiVisibilityCard({ onOpenPreview }: FutureCardProps) {
  const { isZh } = useLanguage()

  const metrics = isZh
    ? [
        { label: '商品身份', score: '100%', status: '已索引' },
        { label: '标准属性', score: '92%', status: '完全匹配' },
        { label: '产品资料', score: '85%', status: '部分关联' },
        { label: '语义一致性', score: '96%', status: '高一致性' },
      ]
    : [
        { label: 'Identity', score: '100%', status: 'Indexed' },
        { label: 'Canonical Attributes', score: '92%', status: 'Mapped' },
        { label: 'Knowledge Docs', score: '85%', status: 'Linked' },
        { label: 'Semantic Consistency', score: '96%', status: 'High' },
      ]

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/30 via-white to-indigo-50/30 border border-dashed border-blue-200/90 shadow-2xs space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[4px] bg-blue-100 text-[#024AD8] flex items-center justify-center">
            <Eye size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                {isZh ? 'AI 可见性 (AI Visibility)' : 'AI Visibility Index'}
              </h3>
              <span className="px-2 py-0.5 rounded-[4px] bg-blue-100 text-[#024AD8] text-[10px] font-bold border border-blue-200">
                Preview
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isZh
                ? '评估大模型 Agent 在全域问答与推荐搜索中准确识别该商品的就绪度'
                : 'Audit how accurately LLM Agents index and recommend this product'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenPreview(isZh ? 'AI 可见性分析' : 'AI Visibility Analysis')}
          className="px-3 py-1.5 rounded-[4px] bg-white border border-[#D1D1D1] text-[#1C1C1C] text-xs font-medium hover:bg-[#F7F7F7] hover:border-[#B0B0B0] transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#024AD8] shrink-0"
        >
          {isZh ? '[查看分析]' : '[View Analytics]'}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        {metrics.map((m, idx) => (
          <div key={idx} className="p-3 rounded-xl bg-white border border-slate-100 space-y-1">
            <span className="text-[11px] text-slate-500 font-medium block">{m.label}</span>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold text-slate-900 font-mono">{m.score}</span>
              <span className="text-[10px] text-emerald-600 font-bold">{m.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Card C: Agent Ready Preview (For Product Knowledge)
 */
export function AgentReadyPreviewCard({ onOpenPreview }: FutureCardProps) {
  const { isZh } = useLanguage()

  return (
    <div className="p-4 rounded-xl bg-gradient-to-r from-violet-50/40 via-white to-purple-50/40 border border-dashed border-purple-200 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Bot size={16} className="text-purple-600" />
          <h4 className="text-xs font-bold text-slate-900">
            {isZh ? 'Agent Ready 智能知识引擎' : 'Agent Ready Knowledge Engine'}
          </h4>
          <span className="px-2 py-0.5 rounded-[4px] bg-purple-100 text-purple-800 text-[10px] font-bold border border-purple-200">
            {isZh ? '即将支持' : 'Coming Soon'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onOpenPreview(isZh ? 'Agent Ready 检索能力' : 'Agent Ready Search')}
          className="px-2.5 py-1 rounded-[4px] bg-white border border-purple-200 text-purple-700 text-[11px] font-medium hover:bg-purple-50 transition-all cursor-pointer"
        >
          {isZh ? '[查看 Agent 检索预览]' : '[Preview Search]'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600">
        <div className="p-2 rounded-lg bg-white/90 border border-purple-100/60">
          <span className="text-slate-400 block text-[10px]">{isZh ? '资料完整度' : 'Doc Completeness'}</span>
          <span className="font-bold text-slate-800">90%</span>
        </div>
        <div className="p-2 rounded-lg bg-white/90 border border-purple-100/60">
          <span className="text-slate-400 block text-[10px]">{isZh ? '知识关联' : 'Knowledge Graph'}</span>
          <span className="font-bold text-slate-800">{isZh ? '已与属性链接' : 'Linked'}</span>
        </div>
        <div className="p-2 rounded-lg bg-white/90 border border-purple-100/60">
          <span className="text-slate-400 block text-[10px]">{isZh ? 'Agent 检索' : 'Agent Retrieval'}</span>
          <span className="font-bold text-slate-800">{isZh ? '毫秒级响应' : '< 50ms'}</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Card D: Product Data Quality (商品数据质量)
 */
export function ProductDataQualityCard({ onOpenPreview }: FutureCardProps) {
  const { isZh } = useLanguage()

  const items = isZh
    ? [
        { title: '属性完整度', val: '92%', ok: true },
        { title: '语义一致性', val: '96%', ok: true },
        { title: '资料完整度', val: '88%', ok: true },
        { title: 'AI 可见性', val: '95%', ok: true },
      ]
    : [
        { title: 'Attribute Coverage', val: '92%', ok: true },
        { title: 'Semantic Consistency', val: '96%', ok: true },
        { title: 'Doc Completeness', val: '88%', ok: true },
        { title: 'AI Visibility', val: '95%', ok: true },
      ]

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/20 via-white to-indigo-50/20 border border-dashed border-emerald-200/90 shadow-2xs space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[4px] bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <FileCheck size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                {isZh ? '商品数据质量 (Product Data Quality)' : 'Product Data Quality Health'}
              </h3>
              <span className="px-2 py-0.5 rounded-[4px] bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                Preview
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isZh
                ? '多维度实时体检，确保商品主档数据合规、结构完整且具备高检索质量'
                : 'Multi-dimensional data quality audit for high search conversion'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenPreview(isZh ? '商品数据质量体检' : 'Data Quality Report')}
          className="px-3 py-1.5 rounded-[4px] bg-white border border-[#D1D1D1] text-[#1C1C1C] text-xs font-medium hover:bg-[#F7F7F7] hover:border-[#B0B0B0] transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#024AD8] shrink-0"
        >
          {isZh ? '[体检报告]' : '[Audit Report]'}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        {items.map((it, idx) => (
          <div key={idx} className="p-3 rounded-xl bg-white border border-slate-100 space-y-1">
            <span className="text-[11px] text-slate-500 font-medium block">{it.title}</span>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold text-slate-900 font-mono">{it.val}</span>
              <span className="inline-flex items-center text-[10px] text-emerald-600 font-bold gap-0.5">
                <Check size={10} /> {isZh ? '合规' : 'Pass'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
