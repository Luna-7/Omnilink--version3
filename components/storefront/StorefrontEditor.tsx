/**
 * StorefrontEditor — 多页面全景视觉装修工作台。
 *
 * 架构：
 *   Editor Shell
 *     ├── Top Toolbar: 页面切换 (首页 / 详情 / 购物车 / 结算 / 订单确认) + 视口设备 + 保存发布
 *     ├── Left Panel: 页面分区结构树 (根据当前预览页面动态切换分区与商品选择器)
 *     ├── Center Canvas: ThemeRoot + overrides + Device Viewport，所见即所得
 *     └── Right Panel: 页面/模块属性 + 全局主题设计系统 + 全店与联络信息
 *
 * 契约：严格消费 StorefrontSchema + Theme System，无缝同步全页面。
 */

'use client'

import { useState, useEffect, useId, useMemo, useRef } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import type {
  SectionStyle,
  SectionType,
  StorefrontSchema,
  StorefrontSection,
  StoreContactConfig,
  StoreSocialConfig,
} from '@/lib/storefront/schema'
import { createDefaultSchema } from '@/lib/storefront/schema'
import type { StorefrontProduct } from '@/lib/storefront/types'
import { getTheme, DEFAULT_THEME_ID, ALL_STYLES } from '@/lib/themes/registry'
import PreviewCanvas, {
  type StorefrontEditorPage,
  DEFAULT_PREVIEW_PRODUCTS,
  getPreviewProductsForLanguage,
} from './PreviewCanvas'
import {
  saveStorefrontSchemaAction,
  publishStorefrontAction,
} from '@/app/actions/store'
import {
  saveTemplateSchemaAction,
} from '@/app/actions/template'
import {
  ENGLISH_FONTS,
  CHINESE_FONTS,
} from '@/lib/storefront/theme-overrides'
import {
  Type,
  ArrowLeft,
  Eye,
  Save,
  Layers,
  Palette,
  EyeOff,
  Maximize2,
  Minimize2,
  RefreshCw,
  Send,
  ExternalLink,
  AlertCircle,
  Plus,
  X,
  Trash2,
  Copy,
  Check,
  ChevronUp,
  ChevronDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react'
import { resolveStorefrontLanguage } from '@/lib/storefront/locale'

/** 可选 Section 类型（与 schema.ts SECTION_TYPES 对齐）。 */
const SECTION_TYPE_OPTIONS: Array<{ type: SectionType; label: string }> = [
  { type: 'header', label: 'Header' },
  { type: 'hero', label: 'Hero' },
  { type: 'featured_products', label: 'Featured Products' },
  { type: 'collection', label: 'Collection' },
  { type: 'image_text', label: 'Image + Text' },
  { type: 'rich_text', label: 'Rich Text' },
  { type: 'cta', label: 'Call to Action' },
  { type: 'testimonials', label: 'Testimonials' },
  { type: 'faq', label: 'FAQ' },
  { type: 'footer', label: 'Footer' },
]

/** 分区友好显示名。 */
const SECTION_LABELS: Record<SectionType, { zh: string; en: string }> = {
  header: { zh: '顶栏导航', en: 'Header' },
  hero: { zh: '主横幅', en: 'Hero Banner' },
  featured_products: { zh: '精选商品', en: 'Featured Products' },
  collection: { zh: '精选系列', en: 'Collection' },
  image_text: { zh: '图文组合', en: 'Image + Text' },
  rich_text: { zh: '富文本', en: 'Rich Text' },
  cta: { zh: '行动号召', en: 'Call to Action' },
  testimonials: { zh: '客户评价', en: 'Testimonials' },
  faq: { zh: '常见问题', en: 'FAQ' },
  footer: { zh: '页脚', en: 'Footer' },
}

/** 主题/视觉风格选项来自 ThemeRegistry 的 ALL_STYLES 官方列表。 */
const AVAILABLE_THEMES = ALL_STYLES.map((t) => ({
  id: t.id,
  name: t.name,
  description: t.description,
}))

/** 主题默认 accent（electric-violet primary）。 */
const DEFAULT_ACCENT = getTheme(DEFAULT_THEME_ID).tokens.colors.primary
const DEFAULT_RADIUS = 8

/** 强调色预设。 */
const ACCENT_PRESETS: Array<{ name: string; value: string }> = [
  { name: 'HP电光蓝', value: '#024ad8' },
  { name: '深海蓝', value: '#0e3191' },
  { name: '电光紫', value: '#8B5CF6' },
  { name: '靛蓝', value: '#4F46E5' },
  { name: '天青', value: '#0EA5E9' },
  { name: '翡翠', value: '#10B981' },
  { name: '墨黑', value: '#111827' },
]

/** 圆角预设。 */
const RADIUS_PRESETS: Array<{ label: string; value: number }> = [
  { label: '直角', value: 0 },
  { label: '紧凑', value: 8 },
  { label: '现代', value: 16 },
  { label: '圆润', value: 24 },
  { label: '胶囊', value: 32 },
]

/** 精选配图库。 */
const STOCK_IMAGES: Array<{ name: string; url: string }> = [
  {
    name: '极简流线智能台灯',
    url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: '手工高硼硅冰川杯',
    url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: '南部铁器极简茶壶',
    url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: '复古黑胶无线音箱',
    url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: '极简设计工作室画廊',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
  },
]

function generateSectionId(type: SectionType): string {
  return `${type}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

function defaultContentFor(type: SectionType): StorefrontSection['content'] {
  switch (type) {
    case 'header':
      return {
        title: 'KURA OBJECTS',
        showAnnouncement: true,
        announcement: 'Complimentary white-glove worldwide shipping on all orders over $250',
      }
    case 'hero':
      return {
        tag: 'LIMITED ATELIER DROP',
        title: 'Form Follows Silence',
        subtitle: 'A collection of monolithic home objects crafted from raw minerals and dark stoneware.',
        description: 'Engineered in Zurich, hand-cast in Kyoto. Limited to 150 serialized editions globally.',
        imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80',
        buttonText: 'Explore Collection',
        buttonLink: '#products',
        secondaryButtonText: 'Read Provenance',
        secondaryButtonLink: '#about',
      }
    case 'featured_products':
      return {
        tag: 'THE CATALOGUE',
        title: 'Selected Works',
        subtitle: 'Each object is numbered and accompanied by an artisan certificate of authenticity.',
        count: 6,
        columns: 3,
        showPrice: true,
        showBuyButton: true,
      }
    case 'collection':
      return {
        tag: 'SERIES 03',
        title: 'Tactile Stoneware',
        subtitle: 'High-fire ceramic vessels textured with volcanic ash glaze.',
        description: 'Designed to elevate the rituals of daily contemplation and tea appreciation.',
        imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=80',
        imagePosition: 'left',
        buttonText: 'View Series',
        buttonLink: '#products',
      }
    case 'image_text':
      return {
        tag: 'PROVENANCE',
        title: 'Honoring Material Integrity',
        subtitle: 'No artificial polymers, no planned obsolescence.',
        description: 'In a culture defined by rapid obsolescence, KURA creates durable, tactile goods designed to age gracefully.',
        imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80',
        buttonText: 'Our Atelier Story',
        buttonLink: '#',
      }
    case 'rich_text':
      return {
        tag: 'MANIFESTO',
        title: 'The Philosophy of the Enduring Object',
        subtitle: 'We believe modern living requires fewer, better things.',
        description: 'In a culture defined by rapid obsolescence, KURA creates durable, tactile goods designed to age gracefully.',
      }
    case 'cta':
      return {
        tag: 'PRIVATE ACCESS',
        title: 'Join the KURA Atelier Circle',
        subtitle: 'Receive private invitations to limited-run artisan drops and acoustic exhibitions.',
        description: 'Subscribers gain early access 24 hours prior to public collection releases.',
        buttonText: 'Request Access',
        buttonLink: '#products',
      }
    case 'testimonials':
      return {
        tag: 'PRESS & REVIEWS',
        title: 'Critical Reflection',
        testimonialsList: [
          {
            name: 'Monocle Design Review',
            role: 'Architecture & Objects Issue',
            quote: 'KURA has accomplished the rare feat of fusing acoustic purity with museum-grade ceramic art.',
            rating: 5,
          },
        ],
      }
    case 'faq':
      return {
        tag: 'ASSISTANCE',
        title: 'Frequently Asked Questions',
        faqList: [
          {
            question: 'Where are KURA objects crafted?',
            answer: 'Each piece is hand-finished in small studios across Kyoto and Zurich.',
          },
        ],
      }
    case 'footer':
      return {
        title: 'KURA OBJECTS',
        showTrustBadges: true,
        trustBadge1: 'Ethically Hand-Crafted',
        trustBadge2: 'Insured Global Shipping',
        trustBadge3: '5-Year Limited Warranty',
        copyright: '© 2026 KURA OBJECTS. All rights reserved.',
      }
    default:
      return { title: 'Section title' }
  }
}

function defaultStyleFor(type: SectionType): SectionStyle {
  return {
    padding: 'standard',
    bgStyle: type === 'cta' ? 'contrast' : 'default',
    textAlign: 'left',
  }
}

function AddSectionMenu({ isZh, onAdd }: { isZh: boolean; onAdd: (type: SectionType) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-2 bg-black hover:bg-black/90 text-white rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
      >
        <Plus size={12} />
        <span>{isZh ? '添加分区' : 'Add Section'}</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden py-1 z-30 animate-in fade-in slide-in-from-bottom-2 duration-150">
          {SECTION_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.type}
              type="button"
              onClick={() => {
                onAdd(opt.type)
                setIsOpen(false)
              }}
              className="w-full text-left px-3 py-2 text-xs text-[#1D1D1F] hover:bg-black/5 font-semibold transition-colors cursor-pointer"
            >
              {isZh ? SECTION_LABELS[opt.type].zh : opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface StorefrontEditorProps {
  store: {
    id: string
    store_name: string
    store_slug: string
    base_currency?: string
    currency?: string
  }
  initialSchema?: StorefrontSchema
  products?: StorefrontProduct[]
  mode?: 'store' | 'template'
  templateId?: string
}

export default function StorefrontEditor({
  store,
  initialSchema,
  products = [],
  mode = 'store',
  templateId,
}: StorefrontEditorProps) {
  const { isZh } = useLanguage()
  const colorPickerId = useId()
  const [schema, setSchema] = useState<StorefrontSchema>(
    initialSchema || createDefaultSchema()
  )

  // 多页面状态
  const [activePage, setActivePage] = useState<StorefrontEditorPage>('homepage')
  const [selectedProductId, setSelectedProductId] = useState<string | null>(() => products[0]?.id || DEFAULT_PREVIEW_PRODUCTS[0]?.id || null)
  const [cartPreviewMode, setCartPreviewMode] = useState<'filled' | 'empty'>('filled')

  // 首页 Section 状态
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [activeTab, setActiveTab] = useState<'section' | 'theme' | 'global'>('section')
  const [activeSubTab, setActiveSubTab] = useState<'content' | 'layout' | 'style'>('content')
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)
  const [newSectionType, setNewSectionType] = useState<SectionType>('hero')

  const displayProducts = useMemo(() => {
    return products.length > 0 ? products : getPreviewProductsForLanguage(isZh ? 'zh' : 'en')
  }, [products, isZh])

  function updateGlobalInfo(
    contactPartial: Partial<StoreContactConfig>,
    socialPartial: Partial<StoreSocialConfig>,
    brandName?: string
  ) {
    setSchema((prev) => {
      const currentGlobal = prev.globalInfo || {}
      const currentContact = prev.contact || currentGlobal.contact || {}
      const currentSocial = prev.social || currentGlobal.social || {}
      const newContact = { ...currentContact, ...contactPartial }
      const newSocial = { ...currentSocial, ...socialPartial }
      const newBrandName = brandName !== undefined ? brandName : currentGlobal.brandName

      const newGlobal = {
        ...currentGlobal,
        brandName: newBrandName,
        contact: newContact,
        social: newSocial,
      }

      return {
        ...prev,
        globalInfo: newGlobal,
        contact: newContact,
        social: newSocial,
        sections: prev.sections.map((sec) => {
          if (sec.type === 'footer' && brandName !== undefined && brandName.trim()) {
            return {
              ...sec,
              content: {
                ...sec.content,
                title: brandName,
              },
            }
          }
          return sec
        }),
      }
    })
  }

  // Schema is loaded on the server side and passed via initialSchema.
  // The client uses the initialSchema or falls back to a clean default schema.

  const orderedSections = useMemo(() => {
    return [...schema.sections].sort((a, b) => a.order - b.order)
  }, [schema.sections])

  const selectedSection = schema.sections.find((s) => s.id === selectedSectionId)

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const selectSection = (id: string) => {
    setSelectedSectionId(id)
    setActiveSubTab('content')
    if (activePage !== 'homepage') {
      setActivePage('homepage')
    }
  }

  const touch = (prev: StorefrontSchema): StorefrontSchema => ({
    ...prev,
    meta: { ...prev.meta, lastModified: new Date().toISOString() },
  })

  const toggleSectionVisibility = (id: string) => {
    setSchema((prev) =>
      touch({
        ...prev,
        sections: prev.sections.map((s) =>
          s.id === id ? { ...s, visible: !s.visible } : s
        ),
      })
    )
  }

  const moveSection = (fromIndex: number, toIndex: number) => {
    const newSections = [...schema.sections].sort((a, b) => a.order - b.order)
    if (toIndex < 0 || toIndex >= newSections.length) return
    const [moved] = newSections.splice(fromIndex, 1)
    newSections.splice(toIndex, 0, moved)

    const reorderedSections = newSections.map((s, index) => ({
      ...s,
      order: index,
    }))

    setSchema((prev) => touch({ ...prev, sections: reorderedSections }))
  }

  const addSection = (type: SectionType) => {
    const maxOrder = schema.sections.reduce((m, s) => Math.max(m, s.order), -1)
    const newSection: StorefrontSection = {
      id: generateSectionId(type),
      type,
      order: maxOrder + 1,
      visible: true,
      content: defaultContentFor(type),
      style: defaultStyleFor(type),
    }
    setSchema((prev) => touch({ ...prev, sections: [...prev.sections, newSection] }))
    setSelectedSectionId(newSection.id)
    if (activePage !== 'homepage') {
      setActivePage('homepage')
    }
    showToast(isZh ? `已添加「${SECTION_LABELS[type].zh}」` : `${SECTION_LABELS[type].en} added`)
  }

  const duplicateSection = (id: string) => {
    const source = schema.sections.find((s) => s.id === id)
    if (!source) return
    const maxOrder = schema.sections.reduce((m, s) => Math.max(m, s.order), -1)
    const copy: StorefrontSection = {
      ...source,
      id: generateSectionId(source.type),
      order: maxOrder + 1,
      content: { ...source.content },
      style: source.style ? { ...source.style } : undefined,
      settings: source.settings ? { ...source.settings } : undefined,
    }
    setSchema((prev) => touch({ ...prev, sections: [...prev.sections, copy] }))
    setSelectedSectionId(copy.id)
    if (activePage !== 'homepage') {
      setActivePage('homepage')
    }
    showToast(isZh ? '已复制分区' : 'Section duplicated')
  }

  const deleteSection = (id: string) => {
    setSchema((prev) =>
      touch({ ...prev, sections: prev.sections.filter((s) => s.id !== id) })
    )
    if (selectedSectionId === id) {
      setSelectedSectionId(null)
    }
    showToast(isZh ? '已删除分区' : 'Section deleted')
  }

  const updateSectionContent = (id: string, contentUpdate: Partial<StorefrontSection['content']>) => {
    setSchema((prev) =>
      touch({
        ...prev,
        sections: prev.sections.map((s) => {
          if (s.id !== id) return s
          const newContent = { ...s.content, ...contentUpdate }
          // 清除子语言覆盖中对应的同名键，确保商家的即时修改立刻在任何语言预览中生效
          if (newContent.zh && typeof newContent.zh === 'object') {
            const zh = { ...(newContent.zh as Record<string, unknown>) }
            for (const key of Object.keys(contentUpdate)) {
              delete zh[key]
            }
            newContent.zh = zh
          }
          if (newContent.en && typeof newContent.en === 'object') {
            const en = { ...(newContent.en as Record<string, unknown>) }
            for (const key of Object.keys(contentUpdate)) {
              delete en[key]
            }
            newContent.en = en
          }
          return {
            ...s,
            content: newContent,
          }
        }),
      })
    )
  }

  const updateSectionStyle = (id: string, style: Partial<SectionStyle>) => {
    setSchema((prev) =>
      touch({
        ...prev,
        sections: prev.sections.map((s) =>
          s.id === id ? { ...s, style: { ...s.style, ...style } } : s
        ),
      })
    )
  }

  const updateThemeConfig = (config: Partial<StorefrontSchema['theme']>) => {
    setSchema((prev) =>
      touch({ ...prev, theme: { ...prev.theme, ...config } })
    )
  }

  const handleSaveDraft = async () => {
    setIsSaving(true)

    try {
      if (mode === 'template' && templateId) {
        const res = await saveTemplateSchemaAction(templateId, schema)
        if (res.success) {
          showToast(isZh ? '模板已成功保存' : 'Template saved successfully')
        } else {
          showToast(res.error || (isZh ? '保存失败' : 'Save failed'), 'err')
        }
      } else {
        await saveStorefrontSchemaAction(store.id, schema)
        showToast(isZh ? '草稿已保存' : 'Draft saved')
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to save'
      showToast(msg, 'err')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    if (mode === 'template') return

    setIsPublishing(true)

    try {
      await saveStorefrontSchemaAction(store.id, schema)
      const result = await publishStorefrontAction(store.id)
      if (result.success) {
        setSchema((prev) => ({
          ...prev,
          meta: { ...prev.meta, published: true },
        }))
        showToast(isZh ? '已发布上线' : 'Published live')
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to publish'
      showToast(msg, 'err')
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div
      className={`flex flex-col h-[calc(100vh-90px)] min-h-[640px] bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen bg-gray-50' : ''
      }`}
    >
      {/* Toast 反馈 */}
      {toast && (
        <div
          className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-2xl border ${
            toast.type === 'ok'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-red-50 text-red-900 border-red-200'
          }`}
        >
          {toast.type === 'ok' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* 顶部工具栏 */}
      <div
        className="h-14 px-4 flex items-center justify-between shrink-0 z-20"
        style={{
          background: 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.4)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)',
        }}
      >
        <div className="flex items-center gap-2">
          <a
            href={`/store/${store.store_slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-black/10 bg-white hover:bg-gray-50 text-gray-700 text-[11px] font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <span>{isZh ? '访问店铺' : 'Visit Store'}</span>
            <ExternalLink size={11} />
          </a>

          {mode === 'template' ? (
            <>
              <a
                href="/dashboard/storefront?tab=templates"
                className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-black/10 bg-white hover:bg-gray-50 text-gray-700 text-[11px] font-semibold shadow-2xs transition-all cursor-pointer"
              >
                <ArrowLeft size={11} />
                <span>{isZh ? '返回模板库' : 'Back to Templates'}</span>
              </a>

              {templateId && (
                <a
                  href={`/dashboard/storefront/templates/${templateId}/preview`}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-black/10 bg-white hover:bg-gray-50 text-gray-700 text-[11px] font-semibold shadow-2xs transition-all cursor-pointer"
                >
                  <Eye size={11} />
                  <span>{isZh ? '预览模板' : 'Preview Template'}</span>
                </a>
              )}
            </>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-full border border-black/10 bg-white hover:bg-gray-50 text-gray-700 shadow-2xs transition-all cursor-pointer"
            title={isFullscreen ? (isZh ? '退出全屏' : 'Exit Fullscreen') : isZh ? '全屏编辑' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>

          {mode === 'template' ? (
            <button
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="px-5 py-1.5 rounded-full bg-black hover:bg-black/90 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
              <span>{isZh ? '保存模板' : 'Save Template'}</span>
            </button>
          ) : (
            <>
              <button
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="px-4 py-1.5 rounded-full border border-black/10 bg-white hover:bg-gray-50 text-gray-700 text-[11px] font-bold transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? <RefreshCw size={11} className="animate-spin inline mr-1" /> : null}
                <span>{isZh ? '保存草稿' : 'Save Draft'}</span>
              </button>

              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="px-5 py-1.5 rounded-full bg-black hover:bg-black/90 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                {isPublishing ? <RefreshCw size={12} className="animate-spin" /> : <Send size={12} />}
                <span>
                  {isPublishing
                    ? isZh
                      ? '发布中…'
                      : 'Publishing...'
                    : schema.meta.published
                    ? isZh
                      ? '更新发布'
                      : 'Update Live'
                    : isZh
                    ? '全网发布'
                    : 'Publish Live'}
                </span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 三栏工作台 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧：页面分区与层级结构 (Dynamic Page Section Inspector) */}
        <div
          className={`flex flex-col shrink-0 overflow-hidden transition-all duration-300 ease-in-out transform ${
            activePage === 'homepage'
              ? 'w-64 sm:w-72 opacity-100 translate-x-0 pointer-events-auto'
              : 'w-0 opacity-0 -translate-x-full pointer-events-none'
          }`}
          style={{
            background: 'rgba(255, 255, 255, 0.65)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderRight: '1px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)',
          }}
        >
          <div className="w-64 sm:w-72 flex flex-col h-full shrink-0">
            {/* 全局配置组 (Global Design System Shortcuts) */}
            <div className="p-3 border-b border-black/[0.04]">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 select-none">
                {isZh ? '全局配置' : 'Global Settings'}
              </div>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSectionId('theme_design')
                    setActiveTab('theme')
                  }}
                  className={`w-full px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    selectedSectionId === 'theme_design'
                      ? 'bg-black text-white shadow-sm font-bold'
                      : 'text-gray-700 hover:bg-black/5'
                  }`}
                >
                  <Palette size={13} />
                  <span>{isZh ? '全局主题' : 'Global Theme'}</span>
                </button>
              </div>
            </div>

            {/* 左栏头部：分区结构 */}
            <div className="p-3 border-b border-black/[0.04] flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Layers size={13} className="text-gray-400" />
                <span className="text-xs font-bold text-gray-800">
                  {isZh ? '分区结构' : 'Sections Structure'}
                </span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-black/5 text-gray-500">
                {schema.sections.length}
              </span>
            </div>

            {/* 左栏主体：首页 Section List (macOS List Style) */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              <div className="space-y-1">
                {orderedSections.map((section, index) => {
                  const isSelected = selectedSectionId === section.id
                  return (
                    <div
                      key={section.id}
                      onClick={() => selectSection(section.id)}
                      className={`group px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-between select-none ${
                        isSelected
                          ? 'bg-black text-white shadow-sm font-bold'
                          : 'bg-transparent text-[#1D1D1F] hover:bg-black/5'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="truncate">
                          {isZh ? SECTION_LABELS[section.type].zh : SECTION_LABELS[section.type].en}
                        </span>
                        {!section.visible && (
                          <EyeOff size={11} className={isSelected ? 'text-white/60' : 'text-gray-400'} />
                        )}
                      </div>
                      <div
                        className={`flex items-center gap-0.5 shrink-0 ${
                          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        } transition-opacity`}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            moveSection(index, index - 1)
                          }}
                          disabled={index === 0}
                          className={`p-0.5 rounded disabled:opacity-30 ${
                            isSelected ? 'hover:bg-white/10 text-white' : 'hover:bg-black/5 text-gray-400 hover:text-black'
                          }`}
                          title={isZh ? '上移' : 'Move up'}
                        >
                          <ChevronUp size={11} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            moveSection(index, index + 1)
                          }}
                          disabled={index === orderedSections.length - 1}
                          className={`p-0.5 rounded disabled:opacity-30 ${
                            isSelected ? 'hover:bg-white/10 text-white' : 'hover:bg-black/5 text-gray-400 hover:text-black'
                          }`}
                          title={isZh ? '下移' : 'Move down'}
                        >
                          <ChevronDown size={11} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleSectionVisibility(section.id)
                          }}
                          className={`p-0.5 rounded ${
                            isSelected ? 'hover:bg-white/10 text-white' : 'hover:bg-black/5 text-gray-400 hover:text-black'
                          }`}
                          title={section.visible ? (isZh ? '隐藏' : 'Hide') : isZh ? '显示' : 'Show'}
                        >
                          {section.visible ? <Eye size={11} /> : <EyeOff size={11} />}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            duplicateSection(section.id)
                          }}
                          className={`p-0.5 rounded ${
                            isSelected ? 'hover:bg-white/10 text-white' : 'hover:bg-black/5 text-gray-400 hover:text-black'
                          }`}
                          title={isZh ? '复制' : 'Duplicate'}
                        >
                          <Copy size={11} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteSection(section.id)
                          }}
                          className={`p-0.5 rounded ${
                            isSelected ? 'hover:bg-white/10 text-white' : 'hover:bg-black/5 text-red-500'
                          }`}
                          title={isZh ? '删除' : 'Delete'}
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  )
                })}

                {/* Inline elegant + Add Section trigger */}
                <div className="relative pt-3 border-t border-black/[0.04] mt-2">
                  <AddSectionMenu isZh={isZh} onAdd={addSection} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 中间：Live Preview Canvas */}
        <div className="flex-1 bg-slate-100 overflow-hidden flex flex-col">
          <PreviewCanvas
            schema={schema}
            storeSlug={store.store_slug}
            storeBaseCurrency={(store.base_currency === 'USD' || store.currency === 'USD') ? 'USD' : 'CNY'}
            products={displayProducts}
            activePage={activePage}
            onPageChange={setActivePage}
            selectedProductId={selectedProductId}
            onProductChange={setSelectedProductId}
            cartPreviewMode={cartPreviewMode}
            deviceMode={deviceMode}
            onDeviceModeChange={setDeviceMode}
            showControlBar={true}
            rightPanelOpen={selectedSectionId !== null}
          />
        </div>

        {/* 右侧：Property Panel & Design System Controls */}
        <div
          className={`flex flex-col shrink-0 overflow-hidden transition-all duration-300 ease-in-out transform ${
            selectedSectionId !== null
              ? 'w-72 sm:w-80 opacity-100 translate-x-0 pointer-events-auto'
              : 'w-0 opacity-0 translate-x-full pointer-events-none'
          }`}
          style={{
            background: 'rgba(255, 255, 255, 0.65)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderLeft: '1px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)',
          }}
        >
          {selectedSectionId !== null && (
            <>
              {/* Header inside the sliding drawer */}
              <div className="p-3 border-b border-black/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                  {selectedSectionId === 'theme_design' ? (
                    <>
                      <Palette size={13} className="text-gray-500" />
                      <span>{isZh ? '全局主题设计' : 'Global Theme'}</span>
                    </>
                  ) : selectedSection ? (
                    <>
                      <Layers size={13} className="text-gray-500" />
                      <span>
                        {isZh ? '编辑分区: ' : 'Edit: '}
                        {isZh ? SECTION_LABELS[selectedSection.type].zh : SECTION_LABELS[selectedSection.type].en}
                      </span>
                    </>
                  ) : (
                    <span>{isZh ? '分区属性' : 'Properties'}</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedSectionId(null)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-900 hover:bg-black/5 transition-all cursor-pointer"
                  title={isZh ? '收起面板' : 'Close Panel'}
                >
                  <X size={13} />
                </button>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {selectedSectionId === 'theme_design' ? (
                  <ThemePanel
                    schema={schema}
                    isZh={isZh}
                    colorPickerId={colorPickerId}
                    onUpdateTheme={updateThemeConfig}
                  />
                ) : selectedSection ? (
                  <SectionProperties
                    section={selectedSection}
                    isZh={isZh}
                    activeSubTab={activeSubTab}
                    onSubTabChange={setActiveSubTab}
                    onUpdateContent={(content) => updateSectionContent(selectedSection.id, content)}
                    onUpdateStyle={(style) => updateSectionStyle(selectedSection.id, style)}
                    onToggleVisibility={() => toggleSectionVisibility(selectedSection.id)}
                    onDuplicate={() => duplicateSection(selectedSection.id)}
                    onDelete={() => deleteSection(selectedSection.id)}
                  />
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/** 首页分区属性面板 */
function SectionProperties({
  section,
  isZh,
  activeSubTab,
  onSubTabChange,
  onUpdateContent,
  onUpdateStyle,
  onToggleVisibility,
  onDuplicate,
  onDelete,
}: {
  section: StorefrontSection
  isZh: boolean
  activeSubTab: 'content' | 'layout' | 'style'
  onSubTabChange: (tab: 'content' | 'layout' | 'style') => void
  onUpdateContent: (content: Partial<StorefrontSection['content']>) => void
  onUpdateStyle: (style: Partial<SectionStyle>) => void
  onToggleVisibility: () => void
  onDuplicate: () => void
  onDelete: () => void
}) {
  const c = section.content
  const st = section.style
  const t = section.type

  const hasTag = ['hero', 'featured_products', 'collection', 'image_text', 'rich_text', 'cta', 'testimonials', 'faq'].includes(t)
  const hasSubtitle = ['hero', 'featured_products', 'collection', 'image_text', 'rich_text', 'cta'].includes(t)
  const hasDescription = ['hero', 'collection', 'image_text', 'rich_text', 'cta'].includes(t)
  const hasAnnouncement = t === 'header'
  const hasImage = ['hero', 'collection', 'image_text'].includes(t)
  const hasPrimaryButton = ['hero', 'collection', 'image_text', 'cta'].includes(t)
  const hasSecondaryButton = t === 'hero'
  const hasCount = t === 'featured_products'
  const hasCopyright = t === 'footer'
  const hasTextAlign = ['hero', 'collection', 'image_text', 'rich_text'].includes(t)
  const hasColumns = t === 'featured_products'
  const hasImagePosition = ['collection', 'image_text'].includes(t)

  return (
    <div className="space-y-4">
      {/* 模块标题与快捷操作 */}
      <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
        <div className="min-w-0">
          <div className="text-xs font-extrabold text-gray-900 truncate">
            {isZh ? SECTION_LABELS[t].zh : SECTION_LABELS[t].en}
          </div>
          <div className="text-[10px] text-gray-400 font-mono">Type: {t}</div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onDuplicate}
            className="p-1.5 rounded hover:bg-white text-gray-700 transition-colors"
            title={isZh ? '复制此模块' : 'Duplicate'}
          >
            <Copy size={13} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded hover:bg-white text-red-500 transition-colors"
            title={isZh ? '删除此模块' : 'Delete'}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* 子 Tab：内容 / 布局 / 样式 */}
      <div className="flex border-b border-gray-200 text-xs font-bold">
        {(
          [
            { key: 'content', zh: '内容', en: 'Content' },
            { key: 'layout', zh: '布局', en: 'Layout' },
            { key: 'style', zh: '样式', en: 'Style' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => onSubTabChange(tab.key)}
            className={`pb-2 px-3 border-b-2 transition-colors ${
              activeSubTab === tab.key
                ? 'border-[#FB7185] text-[#FB7185]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            {isZh ? tab.zh : tab.en}
          </button>
        ))}
      </div>

      {/* SUB-TAB: 内容 */}
      {activeSubTab === 'content' && (
        <div className="space-y-3.5">
          {hasAnnouncement && (
            <>
              <TextField
                label={isZh ? '公告栏文字' : 'Announcement'}
                value={c.announcement}
                onChange={(v) => onUpdateContent({ announcement: v })}
              />
              <ToggleField
                label={isZh ? '显示公告栏' : 'Show announcement'}
                checked={c.showAnnouncement !== false}
                onChange={(v) => onUpdateContent({ showAnnouncement: v })}
              />
            </>
          )}

          <TextField
            label={isZh ? '主标题' : 'Heading'}
            value={c.title}
            onChange={(v) => onUpdateContent({ title: v })}
          />

          {hasSubtitle && (
            <TextField
              label={isZh ? '副标题' : 'Subheading'}
              value={c.subtitle}
              onChange={(v) => onUpdateContent({ subtitle: v })}
            />
          )}

          {hasTag && (
            <TextField
              label={isZh ? '上标徽章' : 'Badge / Tag'}
              value={c.tag}
              onChange={(v) => onUpdateContent({ tag: v })}
            />
          )}

          {hasDescription && (
            <TextArea
              label={isZh ? '描述段落' : 'Description'}
              value={c.description}
              onChange={(v) => onUpdateContent({ description: v })}
            />
          )}

          {hasCount && (
            <NumberField
              label={isZh ? '商品数量' : 'Product Count'}
              value={c.count ?? 6}
              min={1}
              max={24}
              onChange={(v) => onUpdateContent({ count: v })}
            />
          )}

          {t === 'featured_products' && (
            <div className="space-y-2 pt-2 border-t border-gray-200">
              <ToggleField
                label={isZh ? '显示商品价格' : 'Show product price'}
                checked={c.showPrice !== false}
                onChange={(v) => onUpdateContent({ showPrice: v })}
              />
            </div>
          )}

          {t === 'testimonials' && (
            <div className="space-y-3 pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-900">
                  {isZh ? '顾客评测列表' : 'Testimonials List'}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const list = Array.isArray(c.testimonialsList) ? [...c.testimonialsList] : []
                    list.push({
                      name: isZh ? '新顾客' : 'New Customer',
                      role: isZh ? '认证买家' : 'Verified Buyer',
                      quote: isZh ? '品质非常出色，包装严实，非常满意的体验！' : 'Superb craftsmanship and seamless experience.',
                      rating: 5,
                    })
                    onUpdateContent({ testimonialsList: list })
                  }}
                  className="text-[11px] font-bold text-[#FB7185] hover:text-[#E11D48] flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={12} />
                  <span>{isZh ? '添加评测' : 'Add Testimonial'}</span>
                </button>
              </div>
              {(c.testimonialsList || []).map((item, idx) => (
                <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">#{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const list = [...(c.testimonialsList || [])]
                        list.splice(idx, 1)
                        onUpdateContent({ testimonialsList: list })
                      }}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder={isZh ? '姓名' : 'Name'}
                    value={item.name || ''}
                    onChange={(e) => {
                      const list = [...(c.testimonialsList || [])]
                      list[idx] = { ...list[idx], name: e.target.value }
                      onUpdateContent({ testimonialsList: list })
                    }}
                    className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded bg-white"
                  />
                  <input
                    type="text"
                    placeholder={isZh ? '身份/称谓' : 'Role'}
                    value={item.role || ''}
                    onChange={(e) => {
                      const list = [...(c.testimonialsList || [])]
                      list[idx] = { ...list[idx], role: e.target.value }
                      onUpdateContent({ testimonialsList: list })
                    }}
                    className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded bg-white"
                  />
                  <textarea
                    placeholder={isZh ? '评测评价' : 'Quote'}
                    value={item.quote || ''}
                    onChange={(e) => {
                      const list = [...(c.testimonialsList || [])]
                      list[idx] = { ...list[idx], quote: e.target.value }
                      onUpdateContent({ testimonialsList: list })
                    }}
                    className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded bg-white h-14 resize-none"
                  />
                </div>
              ))}
            </div>
          )}

          {t === 'faq' && (
            <div className="space-y-3 pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-900">
                  {isZh ? '问答列表' : 'FAQ Items'}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const list = Array.isArray(c.faqList) ? [...c.faqList] : []
                    list.push({
                      question: isZh ? '新的常见问题' : 'New Question',
                      answer: isZh ? '在此输入详细回答内容。' : 'Provide clear answer here.',
                    })
                    onUpdateContent({ faqList: list })
                  }}
                  className="text-[11px] font-bold text-[#FB7185] hover:text-[#E11D48] flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={12} />
                  <span>{isZh ? '添加问答' : 'Add Question'}</span>
                </button>
              </div>
              {(c.faqList || []).map((item, idx) => (
                <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Q{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const list = [...(c.faqList || [])]
                        list.splice(idx, 1)
                        onUpdateContent({ faqList: list })
                      }}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder={isZh ? '问题' : 'Question'}
                    value={item.question || ''}
                    onChange={(e) => {
                      const list = [...(c.faqList || [])]
                      list[idx] = { ...list[idx], question: e.target.value }
                      onUpdateContent({ faqList: list })
                    }}
                    className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded bg-white font-semibold"
                  />
                  <textarea
                    placeholder={isZh ? '回答' : 'Answer'}
                    value={item.answer || ''}
                    onChange={(e) => {
                      const list = [...(c.faqList || [])]
                      list[idx] = { ...list[idx], answer: e.target.value }
                      onUpdateContent({ faqList: list })
                    }}
                    className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded bg-white h-14 resize-none"
                  />
                </div>
              ))}
            </div>
          )}

          {t === 'footer' && (
            <div className="space-y-3 pt-2 border-t border-gray-200">
              <ToggleField
                label={isZh ? '显示信任背书徽章' : 'Show trust badges'}
                checked={c.showTrustBadges !== false}
                onChange={(v) => onUpdateContent({ showTrustBadges: v })}
              />
              {c.showTrustBadges !== false && (
                <>
                  <TextField
                    label={isZh ? '信任徽章 1' : 'Trust Badge 1'}
                    value={c.trustBadge1 as string || ''}
                    onChange={(v) => onUpdateContent({ trustBadge1: v })}
                  />
                  <TextField
                    label={isZh ? '信任徽章 2' : 'Trust Badge 2'}
                    value={c.trustBadge2 as string || ''}
                    onChange={(v) => onUpdateContent({ trustBadge2: v })}
                  />
                  <TextField
                    label={isZh ? '信任徽章 3' : 'Trust Badge 3'}
                    value={c.trustBadge3 as string || ''}
                    onChange={(v) => onUpdateContent({ trustBadge3: v })}
                  />
                </>
              )}
            </div>
          )}

          {hasPrimaryButton && (
            <div className="space-y-2 pt-2 border-t border-gray-200">
              <label className="text-xs font-bold text-gray-900">
                {isZh ? '主按钮' : 'Primary Button'}
              </label>
              <input
                type="text"
                placeholder={isZh ? '按钮文字' : 'Button label'}
                value={c.buttonText || ''}
                onChange={(e) => onUpdateContent({ buttonText: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FB7185]"
              />
              <input
                type="text"
                placeholder={isZh ? '跳转链接 (/products)' : 'Button URL (/products)'}
                value={c.buttonLink || ''}
                onChange={(e) => onUpdateContent({ buttonLink: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FB7185]"
              />
            </div>
          )}

          {hasSecondaryButton && (
            <div className="space-y-2 pt-2 border-t border-gray-200">
              <label className="text-xs font-bold text-gray-900">
                {isZh ? '次按钮' : 'Secondary Button'}
              </label>
              <input
                type="text"
                placeholder={isZh ? '按钮文字' : 'Button label'}
                value={c.secondaryButtonText || ''}
                onChange={(e) => onUpdateContent({ secondaryButtonText: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FB7185]"
              />
              <input
                type="text"
                placeholder={isZh ? '跳转链接' : 'Button URL'}
                value={c.secondaryButtonLink || ''}
                onChange={(e) => onUpdateContent({ secondaryButtonLink: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FB7185]"
              />
            </div>
          )}

          {hasImage && (
            <div className="space-y-2 pt-2 border-t border-gray-200">
              <label className="text-xs font-bold text-gray-900">
                {isZh ? '配图 URL' : 'Image URL'}
              </label>
              <input
                type="text"
                placeholder="https://..."
                value={c.imageUrl || ''}
                onChange={(e) => onUpdateContent({ imageUrl: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FB7185]"
              />
              <div className="space-y-1 pt-1">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  {isZh ? '快捷配图' : 'Stock Library'}
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {STOCK_IMAGES.map((img) => (
                    <button
                      key={img.url}
                      type="button"
                      onClick={() => onUpdateContent({ imageUrl: img.url })}
                      className="text-left px-2 py-1 text-[11px] font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 truncate"
                    >
                      {img.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {hasCopyright && (
            <TextField
              label={isZh ? '版权声明' : 'Copyright'}
              value={c.copyright}
              onChange={(v) => onUpdateContent({ copyright: v })}
            />
          )}
        </div>
      )}

      {/* SUB-TAB: 布局 */}
      {activeSubTab === 'layout' && (
        <div className="space-y-4">
          {hasColumns && (
            <RadioGroup
              label={isZh ? '商品列数' : 'Columns'}
              value={String(c.columns || 3)}
              options={[
                { value: '2', label: isZh ? '2 列' : '2 cols' },
                { value: '3', label: isZh ? '3 列' : '3 cols' },
                { value: '4', label: isZh ? '4 列' : '4 cols' },
              ]}
              onChange={(v) => onUpdateContent({ columns: parseInt(v) })}
            />
          )}

          {hasImagePosition && (
            <RadioGroup
              label={isZh ? '图片位置' : 'Image Position'}
              value={c.imagePosition || 'left'}
              options={[
                { value: 'left', label: isZh ? '居左' : 'Left' },
                { value: 'right', label: isZh ? '居右' : 'Right' },
              ]}
              onChange={(v) => onUpdateContent({ imagePosition: v as 'left' | 'right' })}
            />
          )}

          {hasTextAlign && (
            <RadioGroup
              label={isZh ? '文本对齐' : 'Text Alignment'}
              value={st?.textAlign || 'left'}
              options={[
                { value: 'left', label: isZh ? '居左' : 'Left', icon: <AlignLeft size={13} /> },
                { value: 'center', label: isZh ? '居中' : 'Center', icon: <AlignCenter size={13} /> },
                { value: 'right', label: isZh ? '居右' : 'Right', icon: <AlignRight size={13} /> },
              ]}
              onChange={(v) => onUpdateStyle({ textAlign: v as 'left' | 'center' | 'right' })}
            />
          )}
        </div>
      )}

      {/* SUB-TAB: 样式 */}
      {activeSubTab === 'style' && (
        <div className="space-y-4">
          <RadioGroup
            label={isZh ? '内边距 (Padding)' : 'Padding'}
            value={st?.padding || 'standard'}
            options={[
              { value: 'compact', label: isZh ? '紧凑' : 'Compact' },
              { value: 'standard', label: isZh ? '标准' : 'Standard' },
              { value: 'spacious', label: isZh ? '宽松' : 'Spacious' },
            ]}
            onChange={(v) => onUpdateStyle({ padding: v as 'compact' | 'standard' | 'spacious' })}
          />

          <RadioGroup
            label={isZh ? '背景风格' : 'Background Style'}
            value={st?.bgStyle || 'default'}
            options={[
              { value: 'default', label: isZh ? '默认' : 'Default' },
              { value: 'contrast', label: isZh ? '反差暗色' : 'Contrast' },
              { value: 'accent', label: isZh ? '主题强调' : 'Accent' },
              { value: 'glass', label: isZh ? '毛玻璃' : 'Glass' },
            ]}
            onChange={(v) => onUpdateStyle({ bgStyle: v as 'default' | 'contrast' | 'accent' | 'glass' })}
          />
        </div>
      )}
    </div>
  )
}

/** 全局主题控制面板 */
function ThemePanel({
  schema,
  isZh,
  colorPickerId,
  onUpdateTheme,
}: {
  schema: StorefrontSchema
  isZh: boolean
  colorPickerId: string
  onUpdateTheme: (theme: Partial<StorefrontSchema['theme']>) => void
}) {
  const currentAccent = schema.theme.accent || DEFAULT_ACCENT
  const currentRadius = schema.theme.radius ?? DEFAULT_RADIUS
  const currentLanguage = resolveStorefrontLanguage(schema.theme?.language, isZh ? 'zh' : 'en')

  return (
    <div className="space-y-4">
      {/* 默认字体设置 */}
      <div className="space-y-1.5 pb-1">
        <label className="text-[11px] font-semibold text-gray-500">
          {isZh ? '界面展示字体' : 'Font Family'}
        </label>
        <div className="flex items-center gap-1.5">
          {/* 字体选择下拉框 */}
          <div className="relative flex-1">
            <select
              value={schema.theme?.fontFamily || (currentLanguage === 'zh' ? CHINESE_FONTS[0].value : ENGLISH_FONTS[0].value)}
              onChange={(e) => onUpdateTheme({ fontFamily: e.target.value })}
              className="w-full pl-2.5 pr-7 py-1.5 rounded-lg border border-gray-100 bg-white/70 backdrop-blur-xs text-[11px] font-semibold text-gray-800 shadow-2xs focus:outline-none transition-all cursor-pointer appearance-none"
              style={{ fontFamily: schema.theme?.fontFamily }}
            >
              {(currentLanguage === 'zh' ? CHINESE_FONTS : ENGLISH_FONTS).map((font) => (
                <option key={font.id} value={font.value} className="text-gray-900 bg-white text-xs">
                  {isZh ? font.label : font.nameEn}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <ChevronDown size={11} />
            </div>
          </div>

          {/* 恢复默认字体 */}
          {schema.theme?.fontFamily && (
            <button
              type="button"
              onClick={() => onUpdateTheme({ fontFamily: undefined })}
              className="px-1.5 py-0.5 text-[10px] font-semibold text-gray-500 hover:text-black flex items-center gap-1 cursor-pointer transition-colors"
              title={isZh ? '恢复默认字体' : 'Restore Default Font'}
            >
              <RotateCcw size={10} />
              <span>{isZh ? '恢复默认字体' : 'Restore Default Font'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 唯一主题色选择 (Brand Accent Color without Presets) */}
      <div className="space-y-1.5 border-t border-gray-100 pt-3">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-gray-500">
            {isZh ? '主题色' : 'Theme Color'}
          </label>
          <button
            type="button"
            onClick={() => onUpdateTheme({ accent: undefined })}
            className="text-[10px] font-semibold text-gray-500 hover:text-black flex items-center gap-1 cursor-pointer transition-colors"
            title={isZh ? '恢复默认主题色' : 'Restore Default Accent'}
          >
            <RotateCcw size={10} />
            <span>{isZh ? '恢复默认颜色' : 'Restore Default Accent'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              id={colorPickerId}
              type="color"
              value={currentAccent}
              onChange={(e) => onUpdateTheme({ accent: e.target.value })}
              className="sr-only"
            />
            <label
              htmlFor={colorPickerId}
              className="w-7 h-7 rounded-lg border border-gray-100 shadow-[inset_0_1px_1.5px_rgba(0,0,0,0.02)] flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
              style={{ backgroundColor: currentAccent }}
            />
          </div>
          <input
            type="text"
            value={currentAccent}
            onChange={(e) => onUpdateTheme({ accent: e.target.value })}
            className="w-24 px-2 py-1 text-[11px] font-mono uppercase font-semibold border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-200"
          />
        </div>
      </div>

      {/* 界面圆角 - 改为滑块移动 (Border Radius Slider) */}
      <div className="space-y-1.5 border-t border-gray-100 pt-3">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-gray-500">
            {isZh ? '界面圆角' : 'Border Radius'}
          </label>
          <span className="text-[11px] font-mono font-bold text-gray-500">
            {currentRadius}px
          </span>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="range"
            min="0"
            max="24"
            step="2"
            value={currentRadius}
            onChange={(e) => onUpdateTheme({ radius: parseInt(e.target.value) })}
            className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-rose-500 focus:outline-none focus:ring-0"
          />
        </div>
      </div>
    </div>
  )
}

function RadioGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: Array<{ value: string; label: string; icon?: React.ReactNode }>
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-gray-900">{label}</label>
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}>
        {options.map((opt) => {
          const isSelected = value === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`py-2 px-1 rounded-lg text-xs font-bold border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#FB7185] text-white border-[#FB7185]'
                  : 'bg-gray-50 text-gray-900 border-gray-200 hover:border-[#FB7185]'
              }`}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-200 hover:border-[#FECDD3] transition-colors"
    >
      <span className="text-xs font-medium text-gray-900">{label}</span>
      <span
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          checked ? 'bg-[#FB7185]' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  )
}

function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}) {
  return (
    <div>
      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
        {label}
      </label>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value)
          onChange(Number.isFinite(n) && n >= min ? Math.min(n, max) : min)
        }}
        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FB7185]"
      />
    </div>
  )
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string | undefined
  onChange: (value: string) => void
}) {
  return (
    <div>
      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
        {label}
      </label>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FB7185]"
      />
    </div>
  )
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string
  value: string | undefined
  onChange: (value: string) => void
}) {
  return (
    <div>
      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
        {label}
      </label>
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FB7185] h-24 resize-none"
      />
    </div>
  )
}

function GlobalInfoPanel({
  schema,
  isZh,
  onUpdateGlobalInfo,
}: {
  schema: StorefrontSchema
  isZh: boolean
  onUpdateGlobalInfo: (
    contact: Partial<StoreContactConfig>,
    social: Partial<StoreSocialConfig>,
    brandName?: string
  ) => void
}) {
  const contact = schema.contact || schema.globalInfo?.contact || {}
  const social = schema.social || schema.globalInfo?.social || {}
  const brandName = schema.globalInfo?.brandName || ''

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="text-xs font-extrabold text-gray-900">
          {isZh ? '品牌标识' : 'Brand Identity'}
        </div>
        <TextField
          label={isZh ? '品牌/店铺名称' : 'Brand Name'}
          value={brandName}
          onChange={(v) => onUpdateGlobalInfo({}, {}, v)}
        />
      </div>

      <div className="space-y-3 border-t border-gray-200 pt-4">
        <div className="text-xs font-extrabold text-gray-900">
          {isZh ? '联系方式 (Contact)' : 'Contact Details'}
        </div>
        <TextField
          label={isZh ? '客服邮箱' : 'Contact Email'}
          value={contact.email || ''}
          onChange={(v) => onUpdateGlobalInfo({ email: v }, {})}
        />
        <TextField
          label={isZh ? '服务电话' : 'Phone Number'}
          value={contact.phone || ''}
          onChange={(v) => onUpdateGlobalInfo({ phone: v }, {})}
        />
        <TextField
          label={isZh ? 'WhatsApp 号码' : 'WhatsApp Number'}
          value={contact.whatsapp || ''}
          onChange={(v) => onUpdateGlobalInfo({ whatsapp: v }, {})}
        />
        <TextField
          label={isZh ? '工作室 / 地址' : 'Store Address'}
          value={contact.address || ''}
          onChange={(v) => onUpdateGlobalInfo({ address: v }, {})}
        />
        <TextField
          label={isZh ? '专属咨询链接' : 'Contact URL'}
          value={contact.contactUrl || ''}
          onChange={(v) => onUpdateGlobalInfo({ contactUrl: v }, {})}
        />
      </div>

      <div className="space-y-3 border-t border-gray-200 pt-4">
        <div className="text-xs font-extrabold text-gray-900">
          {isZh ? '社交媒体 (Social Channels)' : 'Social Channels'}
        </div>
        <TextField
          label="Instagram"
          value={social.instagram || ''}
          onChange={(v) => onUpdateGlobalInfo({}, { instagram: v })}
        />
        <TextField
          label="Facebook"
          value={social.facebook || ''}
          onChange={(v) => onUpdateGlobalInfo({}, { facebook: v })}
        />
        <TextField
          label="YouTube"
          value={social.youtube || ''}
          onChange={(v) => onUpdateGlobalInfo({}, { youtube: v })}
        />
        <TextField
          label="TikTok"
          value={social.tiktok || ''}
          onChange={(v) => onUpdateGlobalInfo({}, { tiktok: v })}
        />
        <TextField
          label="X (Twitter)"
          value={social.x || ''}
          onChange={(v) => onUpdateGlobalInfo({}, { x: v })}
        />
        <TextField
          label="LinkedIn"
          value={social.linkedin || ''}
          onChange={(v) => onUpdateGlobalInfo({}, { linkedin: v })}
        />
      </div>
    </div>
  )
}
