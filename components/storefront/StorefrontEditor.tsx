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

import { useState, useEffect, useId, useMemo } from 'react'
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
} from './PreviewCanvas'
import {
  saveStorefrontSchemaAction,
  loadStorefrontSchemaAction,
  publishStorefrontAction,
} from '@/app/actions/store'
import {
  saveTemplateSchemaAction,
  loadTemplateSchemaAction,
} from '@/app/actions/template'
import {
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
  Trash2,
  Copy,
  Check,
  ChevronUp,
  ChevronDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ImageIcon,
  CheckCircle2,
  Home,
  ShoppingBag,
  ShoppingCart,
  CreditCard,
  Sliders,
  Store,
  Sparkles,
  ShieldCheck,
  MessageCircle,
  Mail,
  FileText,
  Package,
} from 'lucide-react'

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
  { name: '电光紫', value: '#8B5CF6' },
  { name: '深紫罗兰', value: '#7C3AED' },
  { name: '靛蓝', value: '#4F46E5' },
  { name: '天青', value: '#0EA5E9' },
  { name: '翡翠', value: '#10B981' },
  { name: '琥珀', value: '#F59E0B' },
  { name: '绯红', value: '#EF4444' },
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

interface StorefrontEditorProps {
  store: {
    id: string
    store_name: string
    store_slug: string
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
    return products.length > 0 ? products : DEFAULT_PREVIEW_PRODUCTS
  }, [products])

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

  // Load schema from server on mount if no initial schema
  useEffect(() => {
    if (!initialSchema) {
      if (mode === 'template' && templateId) {
        loadTemplateSchemaAction(templateId)
          .then((loadedSchema) => {
            if (loadedSchema) {
              setSchema(loadedSchema)
            }
          })
          .catch((error) => {
            console.error('Failed to load template schema:', error)
          })
      } else {
        loadStorefrontSchemaAction(store.id)
          .then((loadedSchema) => {
            if (loadedSchema) {
              setSchema(loadedSchema)
            }
          })
          .catch((error) => {
            console.error('Failed to load storefront schema:', error)
          })
      }
    }
  }, [store.id, initialSchema, mode, templateId])

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

  const updateSectionContent = (id: string, content: Partial<StorefrontSection['content']>) => {
    setSchema((prev) =>
      touch({
        ...prev,
        sections: prev.sections.map((s) =>
          s.id === id ? { ...s, content: { ...s.content, ...content } } : s
        ),
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
      <div className="h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <a
            href={`/store/${store.store_slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-colors"
          >
            <span>{isZh ? '访问店铺' : 'Visit Store'}</span>
            <ExternalLink size={12} />
          </a>

          {mode === 'template' ? (
            <>
              <a
                href="/dashboard/storefront?tab=templates"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-colors"
              >
                <ArrowLeft size={12} />
                <span>{isZh ? '返回模板库' : 'Back to Templates'}</span>
              </a>

              {templateId && (
                <a
                  href={`/dashboard/storefront/templates/${templateId}/preview`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-colors"
                >
                  <Eye size={12} />
                  <span>{isZh ? '预览模板' : 'Preview Template'}</span>
                </a>
              )}
            </>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors"
            title={isFullscreen ? (isZh ? '退出全屏' : 'Exit Fullscreen') : isZh ? '全屏编辑' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>

          {mode === 'template' ? (
            <button
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="px-4 py-1.5 rounded-lg bg-[#FB7185] hover:bg-[#E11D48] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
            >
              {isSaving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
              <span>{isZh ? '保存模板' : 'Save Template'}</span>
            </button>
          ) : (
            <>
              <button
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="px-3.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold transition-all disabled:opacity-50"
              >
                {isSaving ? <RefreshCw size={12} className="animate-spin inline mr-1" /> : null}
                <span>{isZh ? '保存草稿' : 'Save Draft'}</span>
              </button>

              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="px-4 py-1.5 rounded-lg bg-[#FB7185] hover:bg-[#E11D48] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
              >
                {isPublishing ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
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
        <div className="w-64 sm:w-72 bg-white border-r border-gray-200 flex flex-col shrink-0">
          {/* 左栏头部：根据当前页面显示 */}
          <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-gray-50/70">
            <div className="flex items-center gap-1.5">
              <Layers size={15} className="text-[#FB7185]" />
              <span className="text-xs font-extrabold text-gray-900">
                {activePage === 'homepage' && (isZh ? '首页分区结构' : 'Homepage Sections')}
                {activePage === 'product' && (isZh ? '商品详情分区' : 'Product Page Sections')}
                {activePage === 'cart' && (isZh ? '购物车分区' : 'Cart Page Sections')}
                {activePage === 'checkout' && (isZh ? '结算咨询分区' : 'Checkout Sections')}
                {activePage === 'confirmation' && (isZh ? '订单确认分区' : 'Confirmation Sections')}
              </span>
            </div>
            {activePage === 'homepage' && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                {schema.sections.length}
              </span>
            )}
          </div>

          {/* 左栏主体 */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {/* 1. 首页模式：Section List */}
            {activePage === 'homepage' && (
              <div className="space-y-1.5">
                {orderedSections.map((section, index) => {
                  const isSelected = selectedSectionId === section.id
                  return (
                    <div
                      key={section.id}
                      onClick={() => selectSection(section.id)}
                      className={`group px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#FB7185] text-white border-[#FB7185] shadow-sm'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="truncate">
                          {isZh ? SECTION_LABELS[section.type].zh : SECTION_LABELS[section.type].en}
                        </span>
                        {!section.visible && (
                          <EyeOff size={12} className={isSelected ? 'text-white/70' : 'text-gray-400'} />
                        )}
                      </div>
                      <div
                        className={`flex items-center gap-0.5 shrink-0 ${
                          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        } transition-opacity`}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            moveSection(index, index - 1)
                          }}
                          disabled={index === 0}
                          className={`p-1 rounded disabled:opacity-30 ${
                            isSelected ? 'hover:bg-white/20' : 'hover:bg-gray-200'
                          }`}
                          title={isZh ? '上移' : 'Move up'}
                        >
                          <ChevronUp size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            moveSection(index, index + 1)
                          }}
                          disabled={index === orderedSections.length - 1}
                          className={`p-1 rounded disabled:opacity-30 ${
                            isSelected ? 'hover:bg-white/20' : 'hover:bg-gray-200'
                          }`}
                          title={isZh ? '下移' : 'Move down'}
                        >
                          <ChevronDown size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleSectionVisibility(section.id)
                          }}
                          className={`p-1 rounded ${
                            isSelected ? 'hover:bg-white/20' : 'hover:bg-gray-200'
                          }`}
                          title={section.visible ? (isZh ? '隐藏' : 'Hide') : isZh ? '显示' : 'Show'}
                        >
                          {section.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            duplicateSection(section.id)
                          }}
                          className={`p-1 rounded ${
                            isSelected ? 'hover:bg-white/20' : 'hover:bg-gray-200'
                          }`}
                          title={isZh ? '复制' : 'Duplicate'}
                        >
                          <Copy size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteSection(section.id)
                          }}
                          className={`p-1 rounded ${
                            isSelected ? 'hover:bg-white/20 text-white' : 'hover:bg-gray-200 text-red-500'
                          }`}
                          title={isZh ? '删除' : 'Delete'}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  )
                })}

                {/* 添加分区控件 */}
                <div className="pt-2 border-t border-gray-200 space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                    {isZh ? '添加新分区' : 'Add Section'}
                  </label>
                  <div className="flex gap-1.5">
                    <select
                      value={newSectionType}
                      onChange={(e) => setNewSectionType(e.target.value as SectionType)}
                      className="flex-1 px-2.5 py-1.5 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FB7185]"
                    >
                      {SECTION_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.type} value={opt.type}>
                          {isZh ? SECTION_LABELS[opt.type].zh : opt.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => addSection(newSectionType)}
                      className="px-3 py-1.5 bg-[#FB7185] hover:bg-[#E11D48] text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors shrink-0"
                    >
                      <Plus size={13} />
                      <span>{isZh ? '添加' : 'Add'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. 商品详情模式：Product Switcher & Page Modules */}
            {activePage === 'product' && (
              <div className="space-y-3">
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                    {isZh ? '切换预览商品' : 'Select Preview Product'}
                  </label>
                  <select
                    value={selectedProductId || displayProducts[0]?.id}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs font-semibold bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FB7185] truncate"
                  >
                    {displayProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.currency} {p.price})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block px-1">
                    {isZh ? '详情页模块构成' : 'Page Composition'}
                  </label>
                  {[
                    { nameZh: '悬浮顶栏导航', nameEn: 'Floating Navbar', icon: Sparkles },
                    { nameZh: '画廊主图与缩略图', nameEn: 'Interactive Gallery', icon: ImageIcon },
                    { nameZh: '变体与规格选择器', nameEn: 'Variant Pill Selectors', icon: Sliders },
                    { nameZh: '购买与咨询按钮组', nameEn: 'Commerce & Inquiry CTAs', icon: ShoppingBag },
                    { nameZh: '品质保障与服务承诺', nameEn: 'Trust Badges', icon: ShieldCheck },
                    { nameZh: '规格参数明细表', nameEn: 'Specifications Table', icon: FileText },
                    { nameZh: '推荐搭配与相关商品', nameEn: 'Curated Companions', icon: Package },
                    { nameZh: '全局品牌页脚', nameEn: 'Global Store Footer', icon: Layers },
                  ].map((mod, idx) => {
                    const Icon = mod.icon
                    return (
                      <div
                        key={idx}
                        className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 flex items-center gap-2.5 shadow-2xs"
                      >
                        <Icon size={14} className="text-[#FB7185] shrink-0" />
                        <span className="truncate">{isZh ? mod.nameZh : mod.nameEn}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 3. 购物车模式：Cart Mode & Modules */}
            {activePage === 'cart' && (
              <div className="space-y-3">
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                    {isZh ? '购物车预览状态' : 'Cart Preview State'}
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCartPreviewMode('filled')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border text-center transition-all ${
                        cartPreviewMode === 'filled'
                          ? 'bg-[#FB7185] text-white border-[#FB7185]'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {isZh ? '含商品预览' : 'With Items'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCartPreviewMode('empty')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border text-center transition-all ${
                        cartPreviewMode === 'empty'
                          ? 'bg-[#FB7185] text-white border-[#FB7185]'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {isZh ? '空袋预览' : 'Empty Bag'}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block px-1">
                    {isZh ? '购物车模块构成' : 'Cart Modules'}
                  </label>
                  {[
                    { nameZh: '悬浮顶栏与袋标', nameEn: 'Navbar with Cart Badge', icon: Sparkles },
                    { nameZh: '已选商品明细与数量步进', nameEn: 'Items List & Stepper', icon: ShoppingCart },
                    { nameZh: '小计结算侧边卡片', nameEn: 'Order Summary Card', icon: CreditCard },
                    { nameZh: '白手套直发保障承诺', nameEn: 'Direct Dispatch Guarantees', icon: ShieldCheck },
                    { nameZh: '前往结算主行动按钮', nameEn: 'Proceed to Checkout CTA', icon: CheckCircle2 },
                    { nameZh: '全局品牌页脚', nameEn: 'Global Store Footer', icon: Layers },
                  ].map((mod, idx) => {
                    const Icon = mod.icon
                    return (
                      <div
                        key={idx}
                        className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 flex items-center gap-2.5 shadow-2xs"
                      >
                        <Icon size={14} className="text-[#FB7185] shrink-0" />
                        <span className="truncate">{isZh ? mod.nameZh : mod.nameEn}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 4. 结算模式：Checkout Modules */}
            {activePage === 'checkout' && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block px-1">
                    {isZh ? '结算与意向登记分区' : 'Checkout Sections'}
                  </label>
                  {[
                    { nameZh: '顶栏与安全说明', nameEn: 'Navbar & Security Guarantee', icon: ShieldCheck },
                    { nameZh: '客户联络信息表单', nameEn: 'Contact Info Form', icon: Mail },
                    { nameZh: '收货地址与特殊备注', nameEn: 'Delivery Address & Notes', icon: FileText },
                    { nameZh: '确认偏好 (WhatsApp/邮件)', nameEn: 'Confirmation Channel Preference', icon: MessageCircle },
                    { nameZh: '实时商品与金额核对卡', nameEn: 'Itemized Order Snapshot', icon: CreditCard },
                    { nameZh: '提交意向与订单确认', nameEn: 'Submit Inquiry CTA', icon: CheckCircle2 },
                    { nameZh: '全局品牌页脚', nameEn: 'Global Store Footer', icon: Layers },
                  ].map((mod, idx) => {
                    const Icon = mod.icon
                    return (
                      <div
                        key={idx}
                        className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 flex items-center gap-2.5 shadow-2xs"
                      >
                        <Icon size={14} className="text-[#FB7185] shrink-0" />
                        <span className="truncate">{isZh ? mod.nameZh : mod.nameEn}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 5. 订单确认模式：Confirmation Modules */}
            {activePage === 'confirmation' && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block px-1">
                    {isZh ? '订单回执分区' : 'Confirmation Sections'}
                  </label>
                  {[
                    { nameZh: '成功提示与订单参考号 (ORD-*)', nameEn: 'Success Banner & Order Ref', icon: CheckCircle2 },
                    { nameZh: '一键 WhatsApp / 邮件管家联系', nameEn: 'Direct Merchant WhatsApp / Email', icon: MessageCircle },
                    { nameZh: '客户与目的地登记卡', nameEn: 'Client & Destination Record', icon: FileText },
                    { nameZh: '快照商品收据清单', nameEn: 'Itemized Receipt Snapshot', icon: Package },
                    { nameZh: '返回店铺继续浏览按钮', nameEn: 'Continue Shopping CTA', icon: ArrowLeft },
                    { nameZh: '全局品牌页脚', nameEn: 'Global Store Footer', icon: Layers },
                  ].map((mod, idx) => {
                    const Icon = mod.icon
                    return (
                      <div
                        key={idx}
                        className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 flex items-center gap-2.5 shadow-2xs"
                      >
                        <Icon size={14} className="text-[#FB7185] shrink-0" />
                        <span className="truncate">{isZh ? mod.nameZh : mod.nameEn}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 中间：Live Preview Canvas */}
        <div className="flex-1 bg-slate-100 overflow-hidden flex flex-col">
          <PreviewCanvas
            schema={schema}
            storeSlug={store.store_slug}
            products={displayProducts}
            activePage={activePage}
            onPageChange={setActivePage}
            selectedProductId={selectedProductId}
            cartPreviewMode={cartPreviewMode}
            deviceMode={deviceMode}
            onDeviceModeChange={setDeviceMode}
            showControlBar={true}
          />
        </div>

        {/* 右侧：Property Panel & Design System Controls */}
        <div className="w-72 sm:w-80 bg-white border-l border-gray-200 flex flex-col shrink-0">
          <div className="p-3 border-b border-gray-200 flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <Palette size={15} className="text-gray-700" />
              <span className="text-xs font-extrabold text-gray-900">
                {isZh ? '属性与设计系统' : 'Properties & Theme'}
              </span>
            </div>

            {/* Tab 切换：模块属性 / 全局主题 / 全店信息 */}
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('section')}
                className={`flex-1 px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeTab === 'section'
                    ? 'bg-white text-[#FB7185] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {activePage === 'homepage'
                  ? isZh
                    ? '模块'
                    : 'Section'
                  : isZh
                  ? '页面配置'
                  : 'Page'}
              </button>
              <button
                onClick={() => setActiveTab('theme')}
                className={`flex-1 px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeTab === 'theme'
                    ? 'bg-white text-[#FB7185] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {isZh ? '全局主题' : 'Theme'}
              </button>
              <button
                onClick={() => setActiveTab('global')}
                className={`flex-1 px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeTab === 'global'
                    ? 'bg-white text-[#FB7185] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {isZh ? '全店信息' : 'Global'}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'section' ? (
              activePage === 'homepage' ? (
                selectedSection ? (
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
                ) : (
                  <div className="text-center text-gray-400 text-xs py-8">
                    {isZh ? '请在左侧选择一个首页分区进行编辑' : 'Select a section to edit properties'}
                  </div>
                )
              ) : (
                <CommercePageProperties
                  activePage={activePage}
                  isZh={isZh}
                  schema={schema}
                  onUpdateGlobalInfo={updateGlobalInfo}
                />
              )
            ) : activeTab === 'theme' ? (
              <ThemePanel
                schema={schema}
                isZh={isZh}
                colorPickerId={colorPickerId}
                onUpdateTheme={updateThemeConfig}
              />
            ) : (
              <GlobalInfoPanel
                schema={schema}
                isZh={isZh}
                onUpdateGlobalInfo={updateGlobalInfo}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/** 商业闭环各页面独立配置面板 */
function CommercePageProperties({
  activePage,
  isZh,
  schema,
  onUpdateGlobalInfo,
}: {
  activePage: StorefrontEditorPage
  isZh: boolean
  schema: StorefrontSchema
  onUpdateGlobalInfo: (
    contact: Partial<StoreContactConfig>,
    social: Partial<StoreSocialConfig>,
    brandName?: string
  ) => void
}) {
  const contact = schema.contact || schema.globalInfo?.contact || {}

  if (activePage === 'product') {
    return (
      <div className="space-y-4 text-xs">
        <div className="p-3 rounded-xl bg-[#FFF1F2] border border-[#FECDD3] text-[#FB7185] font-semibold">
          {isZh
            ? '商品详情页完全由全局主题驱动，自动继承字体、强调色、圆角与阴影。'
            : 'Product Page is driven by the Global Theme and inherits all design tokens.'}
        </div>

        <div className="space-y-3">
          <div className="font-extrabold text-gray-900">
            {isZh ? '专属咨询与快捷渠道' : 'Concierge & Inquiry Channels'}
          </div>
          <TextField
            label={isZh ? 'WhatsApp 咨询号码' : 'WhatsApp Number'}
            value={contact.whatsapp || ''}
            onChange={(v) => onUpdateGlobalInfo({ whatsapp: v }, {})}
          />
          <TextField
            label={isZh ? '客服联络邮箱' : 'Contact Email'}
            value={contact.email || ''}
            onChange={(v) => onUpdateGlobalInfo({ email: v }, {})}
          />
        </div>

        <div className="space-y-2 pt-3 border-t border-gray-200">
          <div className="font-extrabold text-gray-900">
            {isZh ? '详情页交互与保障' : 'Product Interactivity'}
          </div>
          <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-700 font-bold">
              <CheckCircle2 size={13} />
              <span>{isZh ? '画廊缩略图切换已启用' : 'Thumbnail Gallery Active'}</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-700 font-bold">
              <CheckCircle2 size={13} />
              <span>{isZh ? '动态规格/变体切换已启用' : 'Dynamic Variant Switching Active'}</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-700 font-bold">
              <CheckCircle2 size={13} />
              <span>{isZh ? '无缝加入购物车与数量步进已启用' : 'Add to Cart Active'}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (activePage === 'cart') {
    return (
      <div className="space-y-4 text-xs">
        <div className="p-3 rounded-xl bg-[#FFF1F2] border border-[#FECDD3] text-[#FB7185] font-semibold">
          {isZh
            ? '购物车支持 LocalStorage 隔离存储、动态小计更新与白手套保障。'
            : 'Cart supports store-isolated storage, live subtotal, and guarantees.'}
        </div>

        <div className="space-y-3">
          <div className="font-extrabold text-gray-900">
            {isZh ? '购物车保障说明' : 'Cart Guarantees'}
          </div>
          <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 space-y-1">
            <div>• {isZh ? '100% 官方正品与大师编号保真' : '100% Verified Authentic'}</div>
            <div>• {isZh ? '全程白手套保价极速直发' : 'White-Glove Insured Delivery'}</div>
            <div>• {isZh ? '尊享 1 对 1 专属艺术顾问协助' : '1-on-1 Dedicated Concierge'}</div>
          </div>
        </div>
      </div>
    )
  }

  if (activePage === 'checkout') {
    return (
      <div className="space-y-4 text-xs">
        <div className="p-3 rounded-xl bg-[#FFF1F2] border border-[#FECDD3] text-[#FB7185] font-semibold">
          {isZh
            ? '结算流程采用服务端价格重算机制（Trust Boundary），保障价格准确。'
            : 'Checkout enforces Server Price Re-verification (Trust Boundary).'}
        </div>

        <div className="space-y-3">
          <div className="font-extrabold text-gray-900">
            {isZh ? '支持的确认与沟通偏好' : 'Supported Confirmation Channels'}
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-center">
              WhatsApp
            </div>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 font-bold text-center">
              Email
            </div>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 font-bold text-center">
              Phone
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (activePage === 'confirmation') {
    return (
      <div className="space-y-4 text-xs">
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
          {isZh
            ? '订单回执生成唯一 ORD-XXXX-XXXX 编号，并支持一键唤起 WhatsApp / 邮件客服。'
            : 'Order Confirmation creates unique ORD-* IDs with instant WhatsApp/Email actions.'}
        </div>

        <div className="space-y-3">
          <div className="font-extrabold text-gray-900">
            {isZh ? '回执快照项目' : 'Receipt Snapshot Features'}
          </div>
          <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 space-y-1">
            <div>• {isZh ? '商品名、SKU、规格与单价不可篡改快照' : 'Immutable SKU & Price Snapshot'}</div>
            <div>• {isZh ? '客户信息与收货地址记录' : 'Client Profile & Destination'}</div>
            <div>• {isZh ? '待确认审核状态标签' : 'Inquiry Pending Status Tag'}</div>
          </div>
        </div>
      </div>
    )
  }

  return null
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
  const hasTrustBadges = t === 'footer'
  const hasTextAlign = ['hero', 'collection', 'image_text', 'rich_text'].includes(t)
  const hasColumns = t === 'featured_products'
  const hasImagePosition = ['collection', 'image_text'].includes(t)
  const hasShowPrice = t === 'featured_products'

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
  const currentThemeId = schema.theme.themeId || DEFAULT_THEME_ID
  const currentAccent = schema.theme.accent || DEFAULT_ACCENT
  const currentRadius = schema.theme.radius ?? DEFAULT_RADIUS

  return (
    <div className="space-y-5">
      {/* 视觉风格选择 */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-900 block">
          {isZh ? '视觉风格 / 模版主题' : 'Visual Archetype'}
        </label>
        <div className="space-y-1.5">
          {AVAILABLE_THEMES.map((t) => {
            const isSelected = currentThemeId === t.id
            return (
              <div
                key={t.id}
                onClick={() => onUpdateTheme({ themeId: t.id })}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#FFF1F2] border-[#FB7185] shadow-xs'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      isSelected ? 'text-[#FB7185]' : 'text-gray-900'
                    }`}
                  >
                    {t.name}
                  </span>
                  {isSelected && <Check size={14} className="text-[#FB7185]" />}
                </div>
                <div className="text-[11px] text-gray-500 mt-1 leading-snug">
                  {t.description}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 品牌强调色 */}
      <div className="space-y-2 border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-900">
            {isZh ? '品牌强调色 (Accent Color)' : 'Brand Accent Color'}
          </label>
          <button
            type="button"
            onClick={() => onUpdateTheme({ accent: undefined })}
            className="text-[10px] font-bold text-gray-500 hover:text-gray-900"
          >
            {isZh ? '重置' : 'Reset'}
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
              className="w-8 h-8 rounded-lg border border-gray-300 shadow-inner flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
              style={{ backgroundColor: currentAccent }}
              title={isZh ? '选择自定义颜色' : 'Pick custom color'}
            />
          </div>
          <input
            type="text"
            value={currentAccent}
            onChange={(e) => onUpdateTheme({ accent: e.target.value })}
            className="w-28 px-2.5 py-1.5 text-xs font-mono uppercase font-bold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FB7185]"
          />
        </div>

        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {ACCENT_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => onUpdateTheme({ accent: preset.value })}
              className="p-1.5 rounded-lg border border-gray-200 hover:border-gray-400 flex items-center gap-1.5 transition-all text-left"
            >
              <span
                className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10"
                style={{ backgroundColor: preset.value }}
              />
              <span className="text-[10px] font-medium text-gray-700 truncate">
                {preset.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 界面圆角 */}
      <div className="space-y-2 border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-900">
            {isZh ? '界面圆角 (Border Radius)' : 'Border Radius'}
          </label>
          <span className="text-xs font-mono font-bold text-gray-700">
            {currentRadius}px
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1">
          {RADIUS_PRESETS.map((r) => {
            const isSelected = currentRadius === r.value
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => onUpdateTheme({ radius: r.value })}
                className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  isSelected
                    ? 'bg-[#FB7185] text-white border-[#FB7185]'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
              >
                {r.label}
              </button>
            )
          })}
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
