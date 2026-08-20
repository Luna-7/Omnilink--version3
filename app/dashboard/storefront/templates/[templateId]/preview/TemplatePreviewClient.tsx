'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import type { StorefrontSchema } from '@/lib/storefront/schema'
import type { StorefrontProduct } from '@/lib/storefront/types'
import { createDefaultSchema } from '@/lib/storefront/schema'
import PreviewCanvas, { DEFAULT_PREVIEW_PRODUCTS, getPreviewProductsForLanguage } from '@/components/storefront/PreviewCanvas'
import { applyTemplateToStoreAction } from '@/app/actions/template'
import {
  ArrowLeft,
  Edit3,
  Check,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Globe,
} from 'lucide-react'

interface TemplatePreviewClientProps {
  templateId: string
  store: {
    id: string
    store_name: string
    store_slug: string
  }
  initialSchema: StorefrontSchema | null
}

const TEMPLATE_NAMES: Record<string, { zh: string; en: string }> = {
  minimal: { zh: 'Minimal · 极简主义', en: 'Minimal Studio' },
  glass: { zh: 'Glass · 玻璃拟态', en: 'Glass Surface' },
  diffuse: { zh: 'Diffuse · 弥散氛围', en: 'Diffuse Glow' },
  tech: { zh: 'Tech · 电光科技', en: 'Cyber Tech' },
}

/** 4 款高定眼镜展示商品（对应真实图片资产与商业选品，4列完美排版） */
const CURATED_EYEWEAR_PRODUCTS: StorefrontProduct[] = [
  {
    id: 'prod-kinfolk-01',
    name: 'The Kinfolk Round 01',
    slug: 'kinfolk-round-01',
    price: 185,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?q=80&w=800&auto=format&fit=crop',
    href: '#products',
    description: 'Handcrafted Japanese beta-titanium core with organic tortoiseshell acetate rims.',
    attributes: {
      Material: 'Japanese Titanium',
      Shape: 'Round Classic',
      Optics: 'Anti-Reflective UV400',
    },
    badges: ['Best Seller', 'Artisan Edition'],
  },
  {
    id: 'prod-velvet-02',
    name: 'The Velvet Horizon 02',
    slug: 'velvet-horizon-02',
    price: 210,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=800&auto=format&fit=crop',
    href: '#products',
    description: 'Deep midnight obsidian & burgundy sculpted bio-acetate frame with rose gold accents.',
    attributes: {
      Material: 'Mazzucchelli Bio-Acetate',
      Shape: 'Square Architectural',
      Optics: 'High-Index Clarity',
    },
    badges: ['Limited Batch'],
  },
  {
    id: 'prod-prism-03',
    name: 'The Prism Mood 03',
    slug: 'prism-mood-03',
    price: 195,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop',
    href: '#products',
    description: 'Ultra-lightweight champagne gold wireframe with spectrum-tint optical lenses.',
    attributes: {
      Material: 'Beta-Titanium Alloy',
      Shape: 'Panto Minimal',
      Optics: 'Blue-Light Guard',
    },
    badges: ['New Arrival'],
  },
  {
    id: 'prod-paper-04',
    name: 'The Paper Geometric 04',
    slug: 'paper-geometric-04',
    price: 220,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?q=80&w=800&auto=format&fit=crop',
    href: '#products',
    description: 'Dual-tone enamel rimmed geometric wireframe engineered for weightless ergonomics.',
    attributes: {
      Material: 'Cold-Formed Alloy',
      Shape: 'Hexagonal',
      Optics: 'Gradient Polarized',
    },
    badges: ["Editor's Pick"],
  },
]

export default function TemplatePreviewClient({
  templateId,
  store,
  initialSchema,
}: TemplatePreviewClientProps) {
  const router = useRouter()
  const { isZh } = useLanguage()
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [activePage, setActivePage] = useState<'homepage' | 'product' | 'cart' | 'checkout' | 'confirmation'>('homepage')
  const [selectedProductId, setSelectedProductId] = useState<string | null>(DEFAULT_PREVIEW_PRODUCTS[0]?.id || null)
  const [isApplying, setIsApplying] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const schema = initialSchema || createDefaultSchema()
  const [previewLanguage, setPreviewLanguage] = useState<'en' | 'zh'>(
    schema.theme?.language || (isZh ? 'zh' : 'en')
  )

  useEffect(() => {
    setPreviewLanguage(isZh ? 'zh' : 'en')
  }, [isZh])

  // 确保 ThemeId 与预览的目标 Template 对齐，并带入当前选择的预览语言
  const effectiveSchema: StorefrontSchema = {
    ...schema,
    theme: {
      ...schema.theme,
      themeId: templateId,
      language: previewLanguage,
    },
  }

  const templateName =
    TEMPLATE_NAMES[templateId] ? (isZh ? TEMPLATE_NAMES[templateId].zh : TEMPLATE_NAMES[templateId].en) : templateId

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleApplyTemplate = async () => {
    setIsApplying(true)
    try {
      const result = await applyTemplateToStoreAction(store.id, templateId)
      if (result.success) {
        showToast(isZh ? '模板已成功套用至您的店铺！' : 'Template applied to your store successfully!')
        setTimeout(() => {
          router.push('/dashboard/storefront')
          router.refresh()
        }, 1200)
      } else {
        showToast(result.error || (isZh ? '套用失败' : 'Failed to apply'), 'err')
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : (isZh ? '套用失败' : 'Failed to apply'), 'err')
    } finally {
      setIsApplying(false)
    }
  }

  const handleEditTemplate = () => {
    router.push(`/dashboard/storefront/templates/${templateId}/edit`)
  }

  const handleBack = () => {
    router.push('/dashboard/storefront?tab=templates')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col relative">
      {/* Toast 反馈 */}
      {toast && (
        <div
          className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full text-xs font-bold flex items-center gap-2 shadow-2xl border ${
            toast.type === 'ok'
              ? 'bg-emerald-900 text-white border-emerald-700'
              : 'bg-red-900 text-white border-red-700'
          }`}
        >
          {toast.type === 'ok' ? <CheckCircle2 size={16} /> : null}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* 顶部悬浮控制栏 Toolbar */}
      <header className="sticky top-0 z-40 h-14 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 md:px-6 flex items-center justify-between shadow-xs">
        {/* 左侧：返回风格库 */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>{isZh ? '返回视觉风格库' : 'Back to Style Library'}</span>
          </button>
          <div className="h-4 w-px bg-gray-200 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-2">
            <Sparkles size={15} className="text-purple-600" />
            <span className="text-xs font-extrabold text-gray-900">{templateName}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-mono font-bold border border-purple-200">
              Template Preview
            </span>
          </div>
        </div>

        {/* 右侧：展示语言切换、编辑模板与使用此风格 */}
        <div className="flex items-center gap-2">
          {/* 单按钮展示语言切换 */}
          <button
            type="button"
            onClick={() => setPreviewLanguage((prev) => (prev === 'zh' ? 'en' : 'zh'))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 text-gray-900 text-xs font-bold transition-all cursor-pointer shadow-2xs"
            title={isZh ? '切换展示语言与币种 ($ / ¥)' : 'Toggle Display Language & Currency ($ / ¥)'}
          >
            <Globe size={13} className="text-[#FB7185]" />
            <span>{previewLanguage === 'zh' ? '中文 (¥)' : 'English ($)'}</span>
          </button>

          <button
            onClick={handleEditTemplate}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-800 text-xs font-bold transition-all cursor-pointer"
          >
            <Edit3 size={13} />
            <span>{isZh ? '编辑模板' : 'Edit Template'}</span>
          </button>

          <button
            onClick={handleApplyTemplate}
            disabled={isApplying}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            {isApplying ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
            <span>{isZh ? '使用此风格' : 'Apply to Store'}</span>
          </button>
        </div>
      </header>

      {/* 主预览画布：支持精确 Viewport 与 Zoom Slider / Fit */}
      <main className="flex-1 overflow-hidden relative">
        <PreviewCanvas
          schema={effectiveSchema}
          storeSlug={store.store_slug}
          products={getPreviewProductsForLanguage(previewLanguage)}
          activePage={activePage}
          onPageChange={setActivePage}
          selectedProductId={selectedProductId}
          onProductChange={setSelectedProductId}
          deviceMode={deviceMode}
          onDeviceModeChange={setDeviceMode}
        />
      </main>
    </div>
  )
}

