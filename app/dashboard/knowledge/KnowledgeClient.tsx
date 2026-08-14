'use client'

import React, { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { PageHeader, GlassCard, FloatCard, SectionTitle, ReadinessBar } from '@/components/dashboard/kit'
import { Brain, Sparkles, Plus, Network } from 'lucide-react'

const CATEGORIES = [
  { key: 'brand', label: '品牌信息' },
  { key: 'company', label: '企业介绍' },
  { key: 'product', label: '商品知识' },
  { key: 'faq', label: '常见问题' },
  { key: 'aftersale', label: '售后政策' },
  { key: 'shipping', label: '配送政策' },
  { key: 'contact', label: '联系方式' },
  { key: 'tone', label: '品牌语气' },
] as const

const VALID_KEYS = new Set(CATEGORIES.map((c) => c.key))

export function KnowledgeClient() {
  const searchParams = useSearchParams()
  const initial = searchParams.get('cat')
  const [active, setActive] = useState<string>(
    initial && VALID_KEYS.has(initial as (typeof CATEGORIES)[number]['key']) ? initial : 'brand'
  )

  const activeCategory = CATEGORIES.find((c) => c.key === active) ?? CATEGORIES[0]

  return (
    <div>
      <PageHeader
        title="AI 知识库"
        description="管理 AI Agent 理解你业务所需的语义记忆——品牌、商品、政策与语气。"
      />

      <div className="grid gap-4 lg:grid-cols-[200px_1fr_260px]">
        {/* 左：知识分类节点列表 */}
        <GlassCard className="p-2.5 h-fit">
          <ul className="space-y-0.5">
            {CATEGORIES.map((c) => (
              <li key={c.key}>
                <button
                  onClick={() => setActive(c.key)}
                  aria-pressed={active === c.key}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-md text-[13px] font-medium transition-colors duration-200 flex items-center gap-2.5',
                    active === c.key
                      ? 'bg-white text-gray-900 shadow-[0_0_18px_rgba(139,92,246,0.12)] border border-black/[0.06]'
                      : 'text-gray-500 hover:bg-white border border-transparent'
                  )}
                >
                  <span
                    className={cn(
                      'w-1.5 h-1.5 rounded-full shrink-0',
                      active === c.key ? 'bg-[#8b5cf6]' : 'bg-gray-300'
                    )}
                  />
                  {c.label}
                </button>
              </li>
            ))}
          </ul>
        </GlassCard>

        {/* 中：知识条目（当前无后端表 → 诚实空态；切换时轻滑入） */}
        <GlassCard key={active} className="page-enter min-h-[320px] flex flex-col items-center justify-center text-center px-8 py-12">
          <div className="w-11 h-11 rounded-md flex items-center justify-center mb-4 bg-[#8b5cf6]/[0.08] border border-[#8b5cf6]/15">
            <Network size={20} className="text-[#8b5cf6]" strokeWidth={1.75} />
          </div>
          <h3 className="text-sm font-semibold text-gray-900">「{activeCategory.label}」还没有内容</h3>
          <p className="text-xs text-gray-500 mt-2 max-w-xs leading-relaxed">
            知识条目的创建与管理功能即将上线。完善这些信息后，AI Agent 就能准确回答与你的业务相关的问题。
          </p>
          <button
            disabled
            className="btn-primary-omni mt-5 inline-flex items-center gap-1.5 px-4 h-9 text-sm opacity-50 cursor-not-allowed"
            title="即将上线"
          >
            <Plus size={14} />
            添加知识（即将上线）
          </button>
        </GlassCard>

        {/* 右：AI 知识完整度 */}
        <FloatCard className="h-fit">
          <SectionTitle title="AI 知识完整度" description="AI 理解你业务所需信息的覆盖程度" />
          <div className="flex items-end justify-between mb-3">
            <span className="text-2xl font-bold tracking-tight text-gray-900 tnum">0%</span>
            <Brain size={15} className="text-[#8b5cf6]" strokeWidth={1.75} />
          </div>
          <ReadinessBar percent={0} />
          <div className="mt-5">
            <h4 className="text-xs font-semibold text-gray-500 mb-2">建议补充</h4>
            <ul className="space-y-1.5">
              {['品牌信息', '联系方式', '售后政策'].map((s) => (
                <li
                  key={s}
                  className="text-xs text-gray-600 bg-white border border-gray-200 rounded-md px-3 py-2 flex items-center gap-2"
                >
                  <Sparkles size={11} className="text-[#8b5cf6] shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </FloatCard>
      </div>
    </div>
  )
}
