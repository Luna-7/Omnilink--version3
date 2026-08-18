/**
 * StorefrontEditor — 三栏工作台店面编辑器。
 *
 * 架构：
 *   Editor Shell
 *     ├── Section Tree (左侧：选择 / 新增 / 复制 / 删除 / 上移 / 下移 / 可见性)
 *     ├── Live Preview (中间：ThemeRoot + overrides + 设备宽度，共享渲染器)
 *     └── Property Panel (右侧：分区属性[内容/布局/样式 三子 Tab] / 主题控制)
 *
 * 预览与公开店面共用 DynamicSectionRenderer + Theme System，所见即所得。
 *
 * 数据契约：所有编辑只写回 canonical StorefrontSchema（section.content /
 * section.style / schema.theme），不触碰 store_pages、不写 snake_case 主题键。
 *
 * 职责：
 *   - 编辑器状态管理 / Section 操作 / 实时预览 / 脏状态跟踪 / Toast 反馈
 *   - 持久化经 Server Actions（saveStorefrontSchemaAction / publishStorefrontAction）
 *
 * 不负责：authentication（由调用方与服务端 Action 控制）。
 */

'use client'

import { useState, useEffect, useId, type CSSProperties } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import type {
  SectionStyle,
  SectionType,
  StorefrontSchema,
  StorefrontSection,
} from '@/lib/storefront/schema'
import { createDefaultSchema } from '@/lib/storefront/schema'
import type { StorefrontProduct } from '@/lib/storefront/types'
import { storefrontThemeOverrides } from '@/lib/storefront/theme-overrides'
import ThemeRoot from '@/components/theme/ThemeRoot'
import { getTheme, DEFAULT_THEME_ID } from '@/lib/themes/registry'
import DynamicSectionRenderer from './DynamicSectionRenderer'
import {
  saveStorefrontSchemaAction,
  loadStorefrontSchemaAction,
  publishStorefrontAction,
} from '@/app/actions/store'
import {
  Layers,
  Palette,
  EyeOff,
  Monitor,
  Tablet,
  Smartphone,
  Maximize2,
  Minimize2,
  RefreshCw,
  Send,
  ExternalLink,
  LayoutTemplate,
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

/** 分区友好显示名（无需改 schema，纯展示层）。 */
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

/** 主题选项只来自真实 ThemeRegistry，杜绝假 ID。 */
const AVAILABLE_THEMES = [getTheme(DEFAULT_THEME_ID)].map((t) => ({
  id: t.id,
  name: t.name,
  description: t.description,
}))

/** 主题默认 accent（electric-violet primary），用于「恢复默认」。 */
const DEFAULT_ACCENT = getTheme(DEFAULT_THEME_ID).tokens.colors.primary
const DEFAULT_RADIUS = 8

/** 强调色预设（与 electric-violet 主题色系协调，可自由扩展）。 */
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

/** 精选配图库（hero / collection / image_text 快捷填充）。 */
const STOCK_IMAGES: Array<{ name: string; url: string }> = [
  {
    name: '极简流线智能台灯',
    url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: '手工高硼硅冰川杯',
    url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: '先锋科技几何耳机',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: '极简北欧木质时钟',
    url: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: '数码极简工作空间',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
  },
]

/** 模块级唯一 ID 生成（避免在组件渲染作用域调用 Date.now 触发纯度检查）。 */
let sectionIdCounter = 0
function generateSectionId(type: SectionType): string {
  sectionIdCounter += 1
  return `sec-${type}-${Date.now().toString(36)}${sectionIdCounter.toString(36)}`
}

/** 新增 section 的默认内容（按类型给最小可用骨架）。 */
function defaultContentFor(type: SectionType): StorefrontSection['content'] {
  switch (type) {
    case 'header':
      return { title: 'Store', announcement: 'Welcome to our store', showAnnouncement: true }
    case 'hero':
      return {
        tag: 'NEW',
        title: 'Your headline here',
        subtitle: '',
        description: 'Describe your store or campaign',
        buttonText: 'Shop Now',
        buttonLink: '#products',
      }
    case 'featured_products':
      return { tag: 'FEATURED', title: 'Featured Products', subtitle: '', columns: 3, count: 6, showPrice: true, showBuyButton: true }
    case 'collection':
    case 'image_text':
      return { title: 'Section title', subtitle: '', description: 'Section description', imagePosition: 'right' }
    case 'rich_text':
      return { title: 'About Us', subtitle: '', description: 'Tell your story' }
    case 'cta':
      return { title: 'Call to Action', subtitle: '', description: 'Give visitors a reason', buttonText: 'Shop Now', buttonLink: '#products' }
    case 'testimonials':
      return { tag: 'TESTIMONIALS', title: 'What customers say' }
    case 'faq':
      return { tag: 'FAQ', title: 'Frequently asked questions' }
    case 'footer':
      return {
        title: 'Store',
        showTrustBadges: true,
        trustBadge1: '7天无理由退换',
        trustBadge2: '极速包邮',
        trustBadge3: '正品官方保障',
        copyright: '',
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
  /** 真实商品（服务端预取的白名单 DTO），用于预览 featured_products。 */
  products?: StorefrontProduct[]
}

export default function StorefrontEditor({
  store,
  initialSchema,
  products = [],
}: StorefrontEditorProps) {
  const { isZh } = useLanguage()
  const colorPickerId = useId()
  const [schema, setSchema] = useState<StorefrontSchema>(
    initialSchema || createDefaultSchema()
  )
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [activeTab, setActiveTab] = useState<'section' | 'theme'>('section')
  const [activeSubTab, setActiveSubTab] = useState<'content' | 'layout' | 'style'>('content')
  const [isDirty, setIsDirty] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)
  const [newSectionType, setNewSectionType] = useState<SectionType>('hero')

  // Load schema from server on mount if no initial schema
  useEffect(() => {
    if (!initialSchema) {
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
  }, [store.id, initialSchema])

  const orderedSections = [...schema.sections].sort((a, b) => a.order - b.order)
  const selectedSection = schema.sections.find((s) => s.id === selectedSectionId)

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Section 操作函数
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
    setIsDirty(true)
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
    setIsDirty(true)
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
    setIsDirty(true)
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
    setIsDirty(true)
    showToast(isZh ? '已复制分区' : 'Section duplicated')
  }

  const deleteSection = (id: string) => {
    setSchema((prev) =>
      touch({ ...prev, sections: prev.sections.filter((s) => s.id !== id) })
    )
    if (selectedSectionId === id) {
      setSelectedSectionId(null)
    }
    setIsDirty(true)
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
    setIsDirty(true)
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
    setIsDirty(true)
  }

  const updateThemeConfig = (config: Partial<StorefrontSchema['theme']>) => {
    setSchema((prev) =>
      touch({ ...prev, theme: { ...prev.theme, ...config } })
    )
    setIsDirty(true)
  }

  const handleSaveDraft = async () => {
    setIsSaving(true)

    try {
      await saveStorefrontSchemaAction(store.id, schema)
      setIsDirty(false)
      showToast(isZh ? '草稿已保存' : 'Draft saved')
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to save'
      showToast(msg, 'err')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    setIsPublishing(true)

    try {
      await saveStorefrontSchemaAction(store.id, schema)
      const result = await publishStorefrontAction(store.id)
      if (result.success) {
        setSchema((prev) => ({
          ...prev,
          meta: { ...prev.meta, published: true },
        }))
        setIsDirty(false)
        showToast(isZh ? '已发布上线' : 'Published live')
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to publish'
      showToast(msg, 'err')
    } finally {
      setIsPublishing(false)
    }
  }

  const previewMaxWidth =
    deviceMode === 'mobile' ? 390 : deviceMode === 'tablet' ? 768 : '100%'

  return (
    <div
      className={`flex flex-col h-[calc(100vh-90px)] min-h-[640px] bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen bg-gray-50' : ''
      }`}
    >
      {/* Toast 反馈（成功/失败） */}
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
          <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
            <LayoutTemplate size={16} />
          </div>
          <div>
            <div className="text-xs font-extrabold text-gray-900 flex items-center gap-1.5">
              <span>{isZh ? '网页装修' : 'Theme Editor'}</span>
              <span className="text-[10px] font-medium text-gray-500">
                • {store.store_name}
              </span>
              {isDirty && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                  {isZh ? '未保存' : 'Unsaved'}
                </span>
              )}
            </div>
            <div className="text-[10px] text-gray-400">
              {schema.meta.published ? (isZh ? '已发布' : 'Published') : isZh ? '草稿' : 'Draft'}
            </div>
          </div>
        </div>

        {/* 设备切换 */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setDeviceMode('desktop')}
            className={`p-1.5 rounded ${
              deviceMode === 'desktop' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500'
            }`}
            title={isZh ? '桌面端' : 'Desktop'}
          >
            <Monitor size={16} />
          </button>
          <button
            onClick={() => setDeviceMode('tablet')}
            className={`p-1.5 rounded ${
              deviceMode === 'tablet' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500'
            }`}
            title={isZh ? '平板' : 'Tablet'}
          >
            <Tablet size={16} />
          </button>
          <button
            onClick={() => setDeviceMode('mobile')}
            className={`p-1.5 rounded ${
              deviceMode === 'mobile' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500'
            }`}
            title={isZh ? '手机' : 'Mobile'}
          >
            <Smartphone size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors"
            title={isFullscreen ? (isZh ? '退出全屏' : 'Exit Fullscreen') : isZh ? '全屏编辑' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>

          <a
            href={`/store/${store.store_slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-colors"
          >
            <span>{isZh ? '访问店铺' : 'Visit Store'}</span>
            <ExternalLink size={12} />
          </a>

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
            className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
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
        </div>
      </div>

      {/* 三栏工作台 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧：Section Tree */}
        <div className="w-72 sm:w-80 bg-white border-r border-gray-200 flex flex-col shrink-0">
          <div className="p-3.5 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-gray-700" />
              <span className="text-xs font-extrabold text-gray-900">
                {isZh ? '页面分区' : 'Sections'}
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
              {schema.sections.length} {isZh ? '个分区' : 'Sections'}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {orderedSections.map((section, index) => {
              const isSelected = selectedSectionId === section.id
              return (
                <div
                  key={section.id}
                  onClick={() => selectSection(section.id)}
                  className={`group px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
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
                  {/* 操作控件：上移 / 下移 / 复制 / 删除 */}
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
                        isSelected ? 'hover:bg-white/20' : 'hover:bg-red-100 text-red-500'
                      }`}
                      title={isZh ? '删除' : 'Delete'}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* 新增分区 */}
          <div className="p-3 border-t border-gray-200 flex items-center gap-2">
            <select
              value={newSectionType}
              onChange={(e) => setNewSectionType(e.target.value as SectionType)}
              className="flex-1 px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            >
              {SECTION_TYPE_OPTIONS.map((opt) => (
                <option key={opt.type} value={opt.type}>
                  {isZh ? SECTION_LABELS[opt.type].zh : opt.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => addSection(newSectionType)}
              className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <Plus size={13} />
              <span>{isZh ? '添加' : 'Add'}</span>
            </button>
          </div>
        </div>

        {/* 中间：Live Preview（与公开店面共享渲染器 + 主题） */}
        <div className="flex-1 bg-gray-100 overflow-auto">
          <ThemeRoot themeId={schema.theme.themeId}>
            <div style={storefrontThemeOverrides(schema.theme) as CSSProperties}>
              <div
                className="min-h-full mx-auto bg-[var(--th-color-background)] transition-all"
                style={{ maxWidth: previewMaxWidth }}
              >
                {orderedSections.map((section) => (
                  <DynamicSectionRenderer
                    key={section.id}
                    section={section}
                    storeSlug={store.store_slug}
                    products={products}
                  />
                ))}
              </div>
            </div>
          </ThemeRoot>
        </div>

        {/* 右侧：Property Panel */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col shrink-0">
          <div className="p-3.5 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Palette size={16} className="text-gray-700" />
              <span className="text-xs font-extrabold text-gray-900">
                {isZh ? '属性编辑' : 'Properties'}
              </span>
            </div>
            <div className="flex gap-1 mt-3 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('section')}
                className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === 'section'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {isZh ? '模块' : 'Section'}
              </button>
              <button
                onClick={() => setActiveTab('theme')}
                className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === 'theme'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {isZh ? '主题' : 'Theme'}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'section' ? (
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
                  {isZh ? '选择一个分区以编辑属性' : 'Select a section to edit properties'}
                </div>
              )
            ) : (
              <ThemePanel
                schema={schema}
                isZh={isZh}
                colorPickerId={colorPickerId}
                onUpdateTheme={updateThemeConfig}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/** 分区属性面板 —— 内容 / 布局 / 样式 三子 Tab，按类型渲染必要字段。 */
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

  // 字段可见性（按类型）
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
                ? 'border-purple-600 text-purple-600'
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
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="text"
                placeholder={isZh ? '跳转链接 (/products)' : 'Button URL (/products)'}
                value={c.buttonLink || ''}
                onChange={(e) => onUpdateContent({ buttonLink: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="text"
                placeholder={isZh ? '跳转链接 (/about)' : 'Button URL (/about)'}
                value={c.secondaryButtonLink || ''}
                onChange={(e) => onUpdateContent({ secondaryButtonLink: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}

          {hasImage && (
            <div className="space-y-2.5 pt-2 border-t border-gray-200">
              <label className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <ImageIcon size={13} className="text-gray-500" />
                <span>{isZh ? '展示配图' : 'Showcase Image'}</span>
              </label>
              <input
                type="text"
                value={c.imageUrl || ''}
                onChange={(e) => onUpdateContent({ imageUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 text-xs font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 font-bold">
                  {isZh ? '快捷精选配图：' : 'Curated stock photos:'}
                </span>
                <div className="grid grid-cols-5 gap-1.5">
                  {STOCK_IMAGES.map((img) => (
                    <div
                      key={img.url}
                      onClick={() => onUpdateContent({ imageUrl: img.url })}
                      className="aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-purple-600 cursor-pointer transition-all hover:scale-105"
                      title={img.name}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {hasTrustBadges && (
            <div className="space-y-2.5 pt-2 border-t border-gray-200">
              <label className="text-xs font-bold text-gray-900">
                {isZh ? '信任徽章' : 'Trust Badges'}
              </label>
              <TextField
                label={isZh ? '徽章 1' : 'Badge 1'}
                value={c.trustBadge1}
                onChange={(v) => onUpdateContent({ trustBadge1: v })}
              />
              <TextField
                label={isZh ? '徽章 2' : 'Badge 2'}
                value={c.trustBadge2}
                onChange={(v) => onUpdateContent({ trustBadge2: v })}
              />
              <TextField
                label={isZh ? '徽章 3' : 'Badge 3'}
                value={c.trustBadge3}
                onChange={(v) => onUpdateContent({ trustBadge3: v })}
              />
            </div>
          )}

          {hasCopyright && (
            <TextField
              label={isZh ? '版权信息' : 'Copyright'}
              value={c.copyright}
              onChange={(v) => onUpdateContent({ copyright: v })}
            />
          )}
        </div>
      )}

      {/* SUB-TAB: 布局 */}
      {activeSubTab === 'layout' && (
        <div className="space-y-3.5">
          {hasTextAlign && (
            <SegmentedControl
              label={isZh ? '文本对齐' : 'Text Alignment'}
              value={st?.textAlign || 'left'}
              options={[
                { value: 'left', label: isZh ? '左' : 'Left', icon: <AlignLeft size={13} /> },
                { value: 'center', label: isZh ? '中' : 'Center', icon: <AlignCenter size={13} /> },
                { value: 'right', label: isZh ? '右' : 'Right', icon: <AlignRight size={13} /> },
              ]}
              onChange={(v) => onUpdateStyle({ textAlign: v as SectionStyle['textAlign'] })}
            />
          )}

          {hasColumns && (
            <SegmentedControl
              label={isZh ? '网格列数' : 'Grid Columns'}
              value={String(c.columns ?? 3)}
              options={[
                { value: '2', label: isZh ? '2 列' : '2 Cols' },
                { value: '3', label: isZh ? '3 列' : '3 Cols' },
                { value: '4', label: isZh ? '4 列' : '4 Cols' },
              ]}
              onChange={(v) => onUpdateContent({ columns: parseInt(v) })}
            />
          )}

          <SegmentedControl
            label={isZh ? '上下间距' : 'Vertical Spacing'}
            value={st?.padding || 'standard'}
            options={[
              { value: 'compact', label: isZh ? '紧凑' : 'Compact' },
              { value: 'standard', label: isZh ? '标准' : 'Standard' },
              { value: 'spacious', label: isZh ? '宽松' : 'Spacious' },
            ]}
            onChange={(v) => onUpdateStyle({ padding: v as SectionStyle['padding'] })}
          />

          {hasImagePosition && (
            <SegmentedControl
              label={isZh ? '图片位置' : 'Image Position'}
              value={c.imagePosition || 'right'}
              options={[
                { value: 'left', label: isZh ? '左侧' : 'Left' },
                { value: 'right', label: isZh ? '右侧' : 'Right' },
              ]}
              onChange={(v) => onUpdateContent({ imagePosition: v as 'left' | 'right' })}
            />
          )}
        </div>
      )}

      {/* SUB-TAB: 样式 */}
      {activeSubTab === 'style' && (
        <div className="space-y-3.5">
          <SegmentedControl
            label={isZh ? '背景风格' : 'Background Style'}
            value={st?.bgStyle || 'default'}
            options={[
              { value: 'default', label: isZh ? '白底' : 'Default' },
              { value: 'glass', label: isZh ? '浅灰' : 'Surface' },
              { value: 'accent', label: isZh ? '微光' : 'Accent' },
              { value: 'contrast', label: isZh ? '深黑' : 'Dark' },
            ]}
            onChange={(v) => onUpdateStyle({ bgStyle: v as SectionStyle['bgStyle'] })}
          />

          {hasShowPrice && (
            <div className="space-y-2 pt-2 border-t border-gray-200">
              <label className="text-xs font-bold text-gray-900">
                {isZh ? '元素显隐' : 'Visibility Toggles'}
              </label>
              <ToggleField
                label={isZh ? '显示商品价格' : 'Show price'}
                checked={c.showPrice !== false}
                onChange={(v) => onUpdateContent({ showPrice: v })}
              />
            </div>
          )}

          {hasTrustBadges && (
            <ToggleField
              label={isZh ? '显示信任徽章' : 'Show trust badges'}
              checked={c.showTrustBadges !== false}
              onChange={(v) => onUpdateContent({ showTrustBadges: v })}
            />
          )}

          <div className="pt-2 border-t border-gray-200">
            <ToggleField
              label={isZh ? '在页面显示此分区' : 'Section visible'}
              checked={section.visible}
              onChange={onToggleVisibility}
            />
          </div>
        </div>
      )}
    </div>
  )
}

/** 主题控制面板：模板选择 + 强调色预设/自定义 + 圆角预设/滑块 + 重置。 */
function ThemePanel({
  schema,
  isZh,
  colorPickerId,
  onUpdateTheme,
}: {
  schema: StorefrontSchema
  isZh: boolean
  colorPickerId: string
  onUpdateTheme: (config: Partial<StorefrontSchema['theme']>) => void
}) {
  const accent = schema.theme.accent || DEFAULT_ACCENT
  const radius = schema.theme.radius ?? DEFAULT_RADIUS
  const currentTheme = AVAILABLE_THEMES.find((t) => t.id === schema.theme.themeId) || AVAILABLE_THEMES[0]

  return (
    <div className="space-y-5">
      {/* 模板选择 */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
          <Palette size={14} className="text-purple-600" />
          <span>{isZh ? '当前主题模板' : 'Active Template'}</span>
        </label>
        <div className="relative">
          <select
            value={schema.theme.themeId}
            onChange={(e) => onUpdateTheme({ themeId: e.target.value })}
            className="w-full px-3 py-2.5 pr-8 text-xs font-bold border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 cursor-pointer"
          >
            {AVAILABLE_THEMES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
        </div>
        {currentTheme.description && (
          <p className="text-[11px] text-gray-500 leading-relaxed p-3 rounded-xl bg-gray-50 border border-gray-200">
            {currentTheme.description}
          </p>
        )}
      </div>

      {/* 强调色 */}
      <div className="space-y-2.5 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-900">
            {isZh ? '主品牌强调色' : 'Accent Color'}
          </label>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-gray-50 border border-gray-200 text-gray-900 uppercase">
            {accent}
          </span>
        </div>

        {/* 预设调色板 */}
        <div className="grid grid-cols-4 gap-2">
          {ACCENT_PRESETS.map((col) => {
            const isSelected = accent.toLowerCase() === col.value.toLowerCase()
            return (
              <button
                key={col.value}
                onClick={() => onUpdateTheme({ accent: col.value })}
                className={`h-7 rounded-lg transition-transform flex items-center justify-center relative cursor-pointer border border-gray-200 ${
                  isSelected ? 'scale-110 ring-2 ring-offset-2 ring-purple-600' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: col.value }}
                title={col.name}
              >
                {isSelected && <Check size={12} className="text-white" />}
              </button>
            )
          })}
        </div>

        {/* 自定义拾色器 */}
        <div className="flex items-center gap-2 pt-1">
          <input
            id={colorPickerId}
            type="color"
            value={accent}
            onChange={(e) => onUpdateTheme({ accent: e.target.value })}
            className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer p-0 bg-transparent"
          />
          <input
            type="text"
            value={accent}
            onChange={(e) => onUpdateTheme({ accent: e.target.value })}
            className="flex-1 px-2.5 py-1.5 text-xs font-mono font-bold uppercase border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
          />
        </div>
      </div>

      {/* 圆角 */}
      <div className="space-y-2.5 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-900">
            {isZh ? '全局圆角弧度' : 'Corner Radius'}
          </label>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-gray-50 border border-gray-200 text-gray-900">
            {radius}px
          </span>
        </div>

        {/* 预设圆角 */}
        <div className="grid grid-cols-5 gap-1.5">
          {RADIUS_PRESETS.map((rad) => {
            const isSelected = radius === rad.value
            return (
              <button
                key={rad.value}
                onClick={() => onUpdateTheme({ radius: rad.value })}
                className={`px-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-gray-50 text-gray-900 border-gray-200 hover:border-purple-600'
                }`}
              >
                {rad.label}
              </button>
            )
          })}
        </div>

        {/* 滑块微调 */}
        <div className="pt-1">
          <input
            type="range"
            min="0"
            max="32"
            step="2"
            value={radius}
            onChange={(e) => onUpdateTheme({ radius: parseInt(e.target.value) })}
            className="w-full accent-purple-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-gray-500 mt-1">
            <span>0px</span>
            <span>16px</span>
            <span>32px</span>
          </div>
        </div>
      </div>

      {/* 重置 */}
      <div className="pt-3 border-t border-gray-200">
        <button
          onClick={() => onUpdateTheme({ accent: DEFAULT_ACCENT, radius: DEFAULT_RADIUS })}
          className="w-full py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-900 transition-colors"
        >
          {isZh ? '恢复主题默认' : 'Reset to theme defaults'}
        </button>
      </div>
    </div>
  )
}

/** 分段选择控件（对齐/列数/间距/背景/图片位置共用）。 */
function SegmentedControl({
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
      <div className={`grid gap-1.5`} style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}>
        {options.map((opt) => {
          const isSelected = value === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`py-2 px-1 rounded-lg text-xs font-bold border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-gray-50 text-gray-900 border-gray-200 hover:border-purple-600'
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

/** 开关控件（行式 label + 切换）。 */
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
      className="w-full flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-200 hover:border-purple-300 transition-colors"
    >
      <span className="text-xs font-medium text-gray-900">{label}</span>
      <span
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          checked ? 'bg-purple-600' : 'bg-gray-300'
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
        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-24 resize-none"
      />
    </div>
  )
}
