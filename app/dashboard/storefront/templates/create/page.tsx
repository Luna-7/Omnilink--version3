'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { generateAITemplateAction, type GenerateTemplateInput } from '@/app/actions/ai-template'
import {
  Sparkles,
  ArrowLeft,
  Wand2,
  CheckCircle2,
  AlertCircle,
  Building2,
  Tag,
  Palette,
  Globe,
  Loader2,
} from 'lucide-react'

export default function CreateAITemplatePage() {
  const router = useRouter()
  const { isZh } = useLanguage()

  const [form, setForm] = useState<GenerateTemplateInput>({
    brandName: '',
    brandPositioning: '',
    productCategory: 'Luxury Artisanal Goods',
    targetAudience: 'Discerning collectors & design lovers',
    visualDirection: 'minimal',
    language: 'zh',
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.brandName.trim()) {
      setErrorMsg(isZh ? '请输入品牌名称' : 'Brand name is required')
      return
    }

    setIsGenerating(true)
    setErrorMsg(null)

    try {
      const res = await generateAITemplateAction(form)
      if (res.success && res.templateId) {
        // AI 模版生成成功，一键重定向至 Template Preview
        router.push(`/dashboard/storefront/templates/${res.templateId}/preview`)
      } else {
        setErrorMsg(res.error || (isZh ? '生成 AI 模版失败，请稍后重试' : 'Failed to generate AI template'))
        setIsGenerating(false)
      }
    } catch (err) {
      console.error('Failed to generate template:', err)
      setErrorMsg(isZh ? '网络请求异常，请重试' : 'Network error, please retry')
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* 顶栏 */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/storefront/editor"
            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors text-gray-600"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
              <Sparkles size={16} className="text-purple-600" />
              <span>{isZh ? 'AI 商业模板工厂' : 'AI Template Factory'}</span>
            </h1>
            <p className="text-xs text-gray-500">
              {isZh
                ? '通过品牌调性一键生成符合 Canonical 10-Module 架构的电商品牌模板'
                : 'Generate a canonical 10-module template tailored to your brand identity'}
            </p>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-6 sm:p-10">
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
          <div className="space-y-2 border-b border-gray-100 pb-6">
            <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold inline-flex items-center gap-1">
              <Wand2 size={12} />
              <span>Omnilink Commerce Engine AI</span>
            </span>
            <h2 className="text-xl font-bold text-gray-900">
              {isZh ? '创建定制化 AI 商业模板' : 'Craft a Tailored Commerce Template'}
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              {isZh
                ? 'AI 将自动为您生成匹配品牌格调的顶栏公告、Hero 主视觉、精选系列、图文组合、富文本宣言、客户评价、FAQ 以及页脚全局联系方式。'
                : 'AI will create a complete 10-module commerce schema matching your brand positioning and contact details.'}
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: 品牌与定位 */}
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-600 flex items-center gap-1.5">
                <Building2 size={14} />
                <span>1. {isZh ? '品牌与定位' : 'Brand & Identity'}</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    {isZh ? '品牌名称 *' : 'Brand Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isZh ? '例如：AURA ACOUSTICS' : 'e.g. AURA ACOUSTICS'}
                    value={form.brandName}
                    onChange={(e) => setForm({ ...form, brandName: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    {isZh ? '品牌 Slogan / 定位' : 'Brand Positioning'}
                  </label>
                  <input
                    type="text"
                    placeholder={isZh ? '例如：极简声学与建筑美学音响' : 'e.g. Minimalist Acoustic Sculptures'}
                    value={form.brandPositioning}
                    onChange={(e) => setForm({ ...form, brandPositioning: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: 行业与目标受众 */}
            <div className="space-y-4 border-t border-gray-100 pt-6">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-600 flex items-center gap-1.5">
                <Tag size={14} />
                <span>2. {isZh ? '行业品类与受众' : 'Industry & Audience'}</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    {isZh ? '商品品类' : 'Product Category'}
                  </label>
                  <input
                    type="text"
                    placeholder={isZh ? '例如：高端设计师家饰 / 香氛' : 'e.g. Artisan Home Decor'}
                    value={form.productCategory}
                    onChange={(e) => setForm({ ...form, productCategory: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    {isZh ? '目标受众' : 'Target Audience'}
                  </label>
                  <input
                    type="text"
                    placeholder={isZh ? '例如：追求高品质生活的审美客群' : 'e.g. High-net-worth design enthusiasts'}
                    value={form.targetAudience}
                    onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: 视觉调性 */}
            <div className="space-y-4 border-t border-gray-100 pt-6">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-600 flex items-center gap-1.5">
                <Palette size={14} />
                <span>3. {isZh ? '视觉风格调性 (Style Library Alignment)' : 'Visual Direction'}</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    id: 'minimal',
                    title: 'Minimal',
                    desc: isZh ? '极致留白 / 高定质感' : 'Spacious & Clean',
                    color: 'bg-zinc-900',
                  },
                  {
                    id: 'glass',
                    title: 'Glass',
                    desc: isZh ? '通透玻璃 / 悬浮折射' : 'Translucent Surface',
                    color: 'bg-indigo-600',
                  },
                  {
                    id: 'diffuse',
                    title: 'Diffuse',
                    desc: isZh ? '柔和微光 / 渐变包裹' : 'Ambient Glow',
                    color: 'bg-pink-500',
                  },
                  {
                    id: 'tech',
                    title: 'Tech',
                    desc: isZh ? '曜黑底色 / 电光先锋' : 'Cyber Neon',
                    color: 'bg-cyan-400',
                  },
                ].map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        visualDirection: style.id as any,
                      })
                    }
                    className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                      form.visualDirection === style.id
                        ? 'border-purple-600 ring-2 ring-purple-600 bg-purple-50/50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-gray-900">{style.title}</span>
                      <span className={`w-3 h-3 rounded-full ${style.color}`} />
                    </div>
                    <p className="text-[10px] text-gray-500">{style.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: 语言选择 */}
            <div className="space-y-4 border-t border-gray-100 pt-6">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-600 flex items-center gap-1.5">
                <Globe size={14} />
                <span>4. {isZh ? '生成语言' : 'Language'}</span>
              </h3>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="lang"
                    checked={form.language === 'zh'}
                    onChange={() => setForm({ ...form, language: 'zh' })}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span>中文 (Simplified Chinese)</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="lang"
                    checked={form.language === 'en'}
                    onChange={() => setForm({ ...form, language: 'en' })}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span>English</span>
                </label>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{isZh ? '正在通过 AI 构建商业模板…' : 'Generating AI Template...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>{isZh ? '生成 AI 商业模板' : 'Generate AI Template'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
