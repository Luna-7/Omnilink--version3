'use client'

import React, { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { SectionTitle, ReadinessBar } from '@/components/dashboard/kit'
import { useLanguage } from '@/context/LanguageContext'
import { Brain, Sparkles, Plus, Network, Layers, HelpCircle, FileText, CheckCircle2 } from 'lucide-react'

type CategoryKey = 'brand' | 'company' | 'product' | 'faq' | 'aftersale' | 'shipping'

export function KnowledgeClient() {
  const { t, isZh } = useLanguage()
  const searchParams = useSearchParams()
  const initial = searchParams.get('cat')

  const CATEGORIES: { key: CategoryKey; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { key: 'brand', label: t.knowledge.brandIdentity, icon: Sparkles },
    { key: 'company', label: t.knowledge.companyProfile, icon: Layers },
    { key: 'product', label: t.knowledge.productSpecs, icon: FileText },
    { key: 'faq', label: t.knowledge.faqGuidance, icon: HelpCircle },
    { key: 'aftersale', label: t.knowledge.aftersalePolicy, icon: CheckCircle2 },
    { key: 'shipping', label: t.knowledge.shippingRules, icon: Network },
  ]

  const VALID_KEYS = new Set(CATEGORIES.map((c) => c.key))

  const [active, setActive] = useState<string>(
    initial && VALID_KEYS.has(initial as CategoryKey) ? initial : 'brand'
  )

  const activeCategory = CATEGORIES.find((c) => c.key === active) ?? CATEGORIES[0]

  return (
    <div className="space-y-5">
      {/* 顶部指标卡行 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="crextio-card p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F4F5F7] border border-[#E5E7EB] text-[#111827] flex items-center justify-center shrink-0">
              <Brain size={18} />
            </div>
            <div>
              <span className="text-xs text-[#6B7280] block font-medium">{t.knowledge.semanticMemory}</span>
              <div className="text-base font-bold text-[#111827] mt-0.5">
                {t.knowledge.knowledgeHub}
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
              <span className="text-xs text-[#6B7280] block font-medium">{t.knowledge.vectorEmbeddings}</span>
              <div className="text-base font-bold text-[#111827] mt-0.5 tnum">
                {CATEGORIES.length} {t.knowledge.activeNodes}
              </div>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#edbc40] text-[#111827] text-xs font-bold shadow-sm">
            Active
          </span>
        </div>

        <div className="crextio-dark-card p-5 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs text-white/80 block font-medium">{t.knowledge.readiness}</span>
            <div className="text-sm font-bold text-white">45% {t.knowledge.coverage}</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/10 text-[#edbc40] flex items-center justify-center">
            <Brain size={15} />
          </div>
        </div>
      </div>

      {/* 知识主体网格 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 左侧：分类节点导航 (占 3 栏) */}
        <div className="lg:col-span-3">
          <div className="crextio-card p-4 h-full">
            <span className="text-xs font-bold text-[#6B7280] px-2 mb-2 block uppercase tracking-wider">
              {t.knowledge.knowledgeNodes}
            </span>
            <ul className="space-y-1.5">
              {CATEGORIES.map((c) => {
                const isSelected = active === c.key
                const Icon = c.icon
                return (
                  <li key={c.key}>
                    <button
                      onClick={() => setActive(c.key)}
                      aria-pressed={isSelected}
                      className={cn(
                        'w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer',
                        isSelected
                          ? 'bg-[#111827] text-white shadow-sm'
                          : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F4F5F7]'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={14} className={isSelected ? 'text-[#edbc40]' : 'text-[#6B7280]'} />
                        <span>{c.label}</span>
                      </div>
                      <span
                        className={cn(
                          'w-2 h-2 rounded-full',
                          isSelected ? 'bg-[#edbc40]' : 'bg-[#E5E7EB]'
                        )}
                      />
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        {/* 中间：知识卡片与编辑器 (占 6 栏) */}
        <div className="lg:col-span-6">
          <div className="crextio-card p-8 min-h-[380px] flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#F4F5F7] border border-[#E5E7EB] text-[#111827] flex items-center justify-center mb-4 shadow-sm">
              <Network size={24} />
            </div>

            <h3 className="font-heading text-lg font-bold text-[#111827]">
              {isZh ? `「${activeCategory.label}」知识节点待填充` : `${activeCategory.label} is ready for context`}
            </h3>
            <p className="text-xs text-[#6B7280] mt-2 max-w-sm leading-relaxed">
              {t.knowledge.emptyContextDesc}
            </p>

            <button
              type="button"
              className="mt-6 px-6 py-2.5 rounded-full bg-[#111827] hover:bg-black text-white text-xs font-semibold shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus size={14} className="text-[#edbc40]" />
              <span>{t.knowledge.addKnowledgeNode}</span>
            </button>
          </div>
        </div>

        {/* 右侧：完整度与智能建议 (占 3 栏) */}
        <div className="lg:col-span-3">
          <div className="crextio-card p-5 h-full flex flex-col justify-between">
            <div>
              <SectionTitle title={t.knowledge.readiness} description={t.knowledge.coverageDesc} />
              <div className="flex items-end justify-between mb-3 mt-4">
                <span className="text-2xl font-bold tracking-tight text-[#111827] tnum">45%</span>
                <Brain size={16} className="text-[#3b3686]" />
              </div>
              <ReadinessBar percent={45} />

              <div className="mt-6">
                <h4 className="text-xs font-semibold text-[#6B7280] mb-2.5">{t.knowledge.recommendedActions}</h4>
                <ul className="space-y-2">
                  {[t.knowledge.brandIdentity, t.knowledge.shippingRules, t.knowledge.aftersalePolicy].map((s) => (
                    <li
                      key={s}
                      className="text-xs text-[#111827] font-medium bg-[#F4F5F7] border border-[#E5E7EB] rounded-xl px-3 py-2 flex items-center gap-2"
                    >
                      <Sparkles size={12} className="text-[#111827] shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
