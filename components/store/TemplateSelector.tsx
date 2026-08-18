'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, Layout, CheckCircle2, Eye, Sparkles, RefreshCw } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { applyTemplateToStoreAction } from '@/app/actions/template'

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
    id: 'minimal',
    name: 'Minimal · 极简',
    name_en: 'Minimal Studio',
    description: '极致留白与精细排版，注重内容高效传达与高定质感',
    description_en: 'Spacious negative space & high-contrast clean typography.',
    preview_url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80',
    accent_color: '#18181B',
    industry: '极简白底',
    industry_en: 'Clean Light',
  },
  {
    id: 'glass',
    name: 'Glass · 玻璃拟态',
    name_en: 'Glass Surface',
    description: '半透明通透质感、柔和模糊反射与多层卡片悬浮，呈现拟玻美感',
    description_en: 'Translucent acrylic surface with subtle backdrop blur reflections.',
    preview_url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
    accent_color: '#6366F1',
    industry: '半透明拟玻',
    industry_en: 'Translucent',
  },
  {
    id: 'diffuse',
    name: 'Diffuse · 弥散氛围',
    name_en: 'Diffuse Glow',
    description: '柔和弥散渐变、微光氛围场与大圆角舒适包裹，具空间张力',
    description_en: 'Soft ambient glow gradients with gentle rounded contours.',
    preview_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    accent_color: '#EC4899',
    industry: '弥散微光',
    industry_en: 'Ambient Glow',
  },
  {
    id: 'tech',
    name: 'Tech · 电光科技',
    name_en: 'Cyber Tech',
    description: '高反差曜黑底色、电光青/紫霓虹线条与硬朗方正轮廓，适配先锋极客',
    description_en: 'Monochrome dark canvas with electric cyan & violet accents.',
    preview_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    accent_color: '#00F0FF',
    industry: '电光先锋',
    industry_en: 'Cyber Neon',
  },
]

interface TemplateSelectorProps {
  storeId: string
  currentTemplateId?: string | null
  onTemplateSelect?: (templateId: string) => void
}

export function TemplateSelector({ storeId, currentTemplateId, onTemplateSelect }: TemplateSelectorProps) {
  const router = useRouter()
  const { isZh } = useLanguage()
  const [templates, setTemplates] = useState<StoreTemplate[]>(PRESET_TEMPLATES)
  const [selectedTemplate, setSelectedTemplate] = useState<string>(currentTemplateId || 'minimal')
  const [applyingId, setApplyingId] = useState<string | null>(null)
  const [appliedSuccess, setAppliedSuccess] = useState(false)

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const response = await fetch('/api/templates')
        if (response.ok) {
          const { templates: apiTemplates } = await response.json()
          if (Array.isArray(apiTemplates) && apiTemplates.length > 0) {
            setTemplates((prev) => {
              const merged = [
                ...prev,
                ...apiTemplates.filter((a: { id: string }) => !prev.some((p) => p.id === a.id)),
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

  // 1. 预览模板：纯路由跳转，绝对不改变真实 Store
  const handlePreview = (templateId: string) => {
    router.push(`/dashboard/storefront/templates/${templateId}/preview`)
  }

  // 2. 使用此风格：调用 Server Action 将模板覆盖套用到真实 Store 实例
  const handleApply = async (templateId: string) => {
    setApplyingId(templateId)
    setAppliedSuccess(false)

    try {
      const res = await applyTemplateToStoreAction(storeId, templateId)
      if (res.success) {
        setSelectedTemplate(templateId)
        setAppliedSuccess(true)
        if (onTemplateSelect) {
          onTemplateSelect(templateId)
        }
        router.refresh()
        setTimeout(() => setAppliedSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Failed to apply template:', error)
    } finally {
      setApplyingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border border-purple-200/80 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-gray-900">
              {isZh ? 'AI 商业模板工厂' : 'AI Template Factory'}
            </h3>
            <p className="text-[11px] text-gray-600">
              {isZh
                ? '根据您的品牌定位与品类，一键智能生成 10-Module 架构的定制商业模板'
                : 'Generate a custom 10-Module commerce template matching your brand identity'}
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/storefront/templates/create"
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all shrink-0"
        >
          <Sparkles size={13} />
          <span>{isZh ? '创建 AI 模板' : 'Create AI Template'}</span>
        </Link>
      </div>

      {appliedSuccess && (
        <div className="flex justify-end">
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-1.5 border border-emerald-200 shadow-sm animate-fade-in">
            <CheckCircle2 size={14} className="text-emerald-600" />
            <span>{isZh ? '视觉风格已成功应用至店铺！' : 'Style successfully applied to store!'}</span>
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {templates.map((template) => {
          const isSelected = selectedTemplate === template.id
          const isApplying = applyingId === template.id

          return (
            <div
              key={template.id}
              className={`rounded-2xl border transition-all overflow-hidden flex flex-col justify-between bg-white ${
                isSelected
                  ? 'border-gray-900 ring-2 ring-gray-900 shadow-md'
                  : 'border-gray-200 hover:border-gray-400 hover:shadow-sm'
              }`}
            >
              {/* 顶部预览图（点击打开预览） */}
              <div
                onClick={() => handlePreview(template.id)}
                className="h-36 w-full bg-gray-100 relative overflow-hidden cursor-pointer group"
                title={isZh ? '点击全屏预览模板' : 'Click to preview template'}
              >
                {template.preview_url ? (
                  <Image
                    src={template.preview_url}
                    alt={template.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Layout size={24} />
                  </div>
                )}

                {/* 遮罩及悬浮提示 */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="px-3 py-1.5 rounded-full bg-white/95 text-gray-900 text-xs font-bold flex items-center gap-1.5 shadow-lg">
                    <Eye size={13} />
                    <span>{isZh ? '预览模板' : 'Preview'}</span>
                  </span>
                </div>

                {/* 行业分类标签 */}
                <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-gray-900/80 backdrop-blur-md text-white text-[10px] font-semibold">
                  {isZh ? template.industry || '综合' : template.industry_en || 'General'}
                </div>

                {/* 选中指示标记 */}
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-amber-400 text-gray-900 flex items-center justify-center shadow-md">
                    <Check size={14} className="stroke-[3]" />
                  </div>
                )}
              </div>

              {/* 模板信息 */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-bold text-gray-900">
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
                  <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                    {isZh ? template.description : template.description_en || template.description}
                  </p>
                </div>

                {/* 底部功能按钮拆分：[预览模板] 与 [使用此风格] */}
                <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handlePreview(template.id)}
                    className="flex-1 py-1.5 px-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Eye size={12} />
                    <span>{isZh ? '预览' : 'Preview'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApply(template.id)}
                    disabled={isApplying}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gray-900 text-white'
                        : 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm'
                    } disabled:opacity-50`}
                  >
                    {isApplying ? (
                      <RefreshCw size={12} className="animate-spin" />
                    ) : isSelected ? (
                      <Check size={12} />
                    ) : (
                      <Sparkles size={12} />
                    )}
                    <span>
                      {isApplying
                        ? isZh
                          ? '应用中…'
                          : 'Applying...'
                        : isSelected
                        ? isZh
                          ? '已套用'
                          : 'Active'
                        : isZh
                        ? '使用此风格'
                        : 'Apply'}
                    </span>
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
