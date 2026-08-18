'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Check, Layout, CheckCircle2 } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export interface StoreTemplate {
  id: string
  name: string
  name_en?: string
  description?: string
  description_en?: string
  preview_url: string | null
  accent_color?: string
  industry?: string
  industry_en?: string
}

const PRESET_TEMPLATES: StoreTemplate[] = [
  {
    id: 'template-audio-luxe',
    name: '声学殿堂 · 极简暗金',
    name_en: 'Acoustic Luxe · Dark Gold',
    description: '针对高端音频、智能声学与数码单品设计，强化产品大图与声学曲线展示',
    description_en: 'Designed for luxury audio & smart wearables with spatial sound curves.',
    preview_url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
    accent_color: '#edbc40',
    industry: '音频数码',
    industry_en: 'Audio & Tech',
  },
  {
    id: 'template-minimal-tech',
    name: '极简科技 · 电光冷冽',
    name_en: 'Cyber Minimal · Electric Violet',
    description: '高反差黑白底色，搭配电光紫霓虹点缀，适配前沿科技与 AI 硬件',
    description_en: 'High contrast monochrome with electric violet accent for AI gadgets.',
    preview_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    accent_color: '#8B5CF6',
    industry: 'AI 硬件',
    industry_en: 'AI Hardware',
  },
  {
    id: 'template-nordic-studio',
    name: '北欧极简 · 温润原木',
    name_en: 'Nordic Clean · Warm Studio',
    description: '通透留白、精致衬线排版与大地色温，专为家居生活与设计美物定制',
    description_en: 'Spacious negative space & warm earth tones for design & lifestyle.',
    preview_url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80',
    accent_color: '#3D5A4C',
    industry: '生活美学',
    industry_en: 'Lifestyle',
  },
  {
    id: 'template-future-cyber',
    name: '未来潮流 · 霓虹矩阵',
    name_en: 'Future Street · Neon Matrix',
    description: '浓郁深色调、大字号排版与强视觉张力，适用于潮牌数码与联名周边',
    description_en: 'Bold typography & dynamic blocks for apparel & collaborations.',
    preview_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    accent_color: '#06B6D4',
    industry: '潮流潮品',
    industry_en: 'Streetwear',
  },
]

interface TemplateSelectorProps {
  storeId: string
  currentTemplateId?: string | null
  onTemplateSelect?: (templateId: string) => void
}

export function TemplateSelector({ storeId, currentTemplateId, onTemplateSelect }: TemplateSelectorProps) {
  const { isZh } = useLanguage()
  const [templates, setTemplates] = useState<StoreTemplate[]>(PRESET_TEMPLATES)
  const [selectedTemplate, setSelectedTemplate] = useState<string>(currentTemplateId || 'template-audio-luxe')
  const [isApplying, setIsApplying] = useState(false)
  const [appliedSuccess, setAppliedSuccess] = useState(false)

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const response = await fetch('/api/templates')
        if (response.ok) {
          const { templates: apiTemplates } = await response.json()
          if (Array.isArray(apiTemplates) && apiTemplates.length > 0) {
            // merge or fallback
            setTemplates((prev) => {
              const merged = [
                ...apiTemplates,
                ...prev.filter((p) => !apiTemplates.some((a: { id: string }) => a.id === p.id)),
              ]
              return merged
            })
          }
        }
      } catch (error) {
        console.error('Failed to fetch templates:', error)
      }
    }

    fetchTemplates()
  }, [])

  const handleSelect = async (template: StoreTemplate) => {
    setSelectedTemplate(template.id)
    setIsApplying(true)
    setAppliedSuccess(false)

    try {
      const response = await fetch(`/api/stores/${storeId}/template`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template_id: template.id,
        }),
      })

      if (response.ok) {
        setAppliedSuccess(true)
        if (onTemplateSelect) {
          onTemplateSelect(template.id)
        }
        setTimeout(() => setAppliedSuccess(false), 2000)
      }
    } catch (error) {
      console.error('Failed to select template:', error)
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#111827]">
            {isZh ? '精品行业模板库' : 'Curated Template Presets'}
          </h3>
          <p className="text-xs text-[#6B7280] mt-0.5">
            {isZh
              ? '一键套用精心调校的色彩体系、排版韵律与视觉区块布局'
              : 'One-click apply balanced typography, color tokens, and section rhythm.'}
          </p>
        </div>

        {appliedSuccess && (
          <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold flex items-center gap-1.5 border border-green-200">
            <CheckCircle2 size={13} />
            <span>{isZh ? '模板已成功套用！' : 'Theme applied!'}</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {templates.map((template) => {
          const isSelected = selectedTemplate === template.id
          return (
            <div
              key={template.id}
              onClick={() => handleSelect(template)}
              className={`rounded-2xl border transition-all overflow-hidden flex flex-col justify-between group cursor-pointer bg-white ${
                isSelected
                  ? 'border-[#111827] ring-2 ring-[#111827] shadow-md'
                  : 'border-[#E5E7EB] hover:border-[#111827]/40 hover:shadow-sm'
              }`}
            >
              {/* 顶部预览图 */}
              <div className="h-36 w-full bg-[#F4F5F7] relative overflow-hidden">
                {template.preview_url ? (
                  <Image
                    src={template.preview_url}
                    alt={template.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#9CA3AF]">
                    <Layout size={24} />
                  </div>
                )}

                {/* 行业分类标签 */}
                <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-[#111827]/80 backdrop-blur-md text-white text-[10px] font-semibold">
                  {isZh ? template.industry || '综合' : template.industry_en || 'General'}
                </div>

                {/* 选中指示标记 */}
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-[#edbc40] text-[#111827] flex items-center justify-center shadow-md">
                    <Check size={14} className="stroke-[3]" />
                  </div>
                )}
              </div>

              {/* 模板信息 */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-bold text-[#111827]">
                      {isZh ? template.name : template.name_en || template.name}
                    </h4>
                    {template.accent_color && (
                      <span
                        className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: template.accent_color }}
                        title="Accent Color"
                      />
                    )}
                  </div>
                  <p className="text-[11px] text-[#6B7280] line-clamp-2 leading-relaxed">
                    {isZh ? template.description : template.description_en || template.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-[#F3F4F6] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#9CA3AF]">
                    ID: {template.id.slice(0, 14)}
                  </span>
                  <button
                    type="button"
                    disabled={isApplying}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#111827] text-white'
                        : 'bg-[#F4F5F7] text-[#111827] hover:bg-[#111827] hover:text-white'
                    }`}
                  >
                    {isSelected ? (isZh ? '已套用' : 'Active') : isZh ? '套用此模板' : 'Apply'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
