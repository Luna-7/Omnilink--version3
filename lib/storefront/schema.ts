/**
 * Storefront Schema Contract — 动态店面配置的数据契约。
 *
 * 设计原则：
 *   - versioned schema: 支持未来演进
 *   - section order 显式: 不依赖数据库行顺序
 *   - content/style/settings 分离: 编辑体验清晰
 *   - JSONB 存储: 复用现有 store_settings.theme_config
 *   - Theme System 兼容: 映射到现有 ThemeDefinition
 */

/** Schema 版本号，用于未来迁移检测。 */
export const STOREFRONT_SCHEMA_VERSION = '1.0.0'

/** Section 类型定义（基于 ZIP 实际使用的类型）。 */
export type SectionType =
  | 'header'
  | 'hero'
  | 'featured_products'
  | 'collection'
  | 'image_text'
  | 'rich_text'
  | 'cta'
  | 'footer'
  | 'testimonials'
  | 'faq'

/** Section 内容配置（type-specific）。 */
export interface SectionContent {
  /** 通用字段 */
  title?: string
  subtitle?: string
  description?: string
  tag?: string

  /** Hero 专用 */
  imageUrl?: string
  buttonText?: string
  buttonLink?: string
  secondaryButtonText?: string
  secondaryButtonLink?: string

  /** Collection 专用 */
  imagePosition?: 'left' | 'right'

  /** Product Grid 专用 */
  columns?: number
  count?: number
  showPrice?: boolean
  showBuyButton?: boolean

  /** Header 专用 */
  announcement?: string
  showAnnouncement?: boolean

  /** Footer 专用 */
  showTrustBadges?: boolean
  trustBadge1?: string
  trustBadge2?: string
  trustBadge3?: string
  copyright?: string

  /** Testimonials 专用 */
  testimonialsList?: Array<{
    name: string
    role: string
    quote: string
    rating: number
  }>

  /** FAQ 专用 */
  faqList?: Array<{
    question: string
    answer: string
  }>

  /** 扩展字段（保持向前兼容） */
  [key: string]: unknown
}

/** Section 样式配置。 */
export interface SectionStyle {
  padding?: 'compact' | 'standard' | 'spacious'
  bgStyle?: 'default' | 'contrast' | 'accent' | 'glass'
  textAlign?: 'left' | 'center' | 'right'
  customCSS?: string
}

/** Section 设置配置。 */
export interface SectionSettings {
  animations?: boolean
  spacing?: number
  [key: string]: unknown
}

/** 单个 Section 定义。 */
export interface StorefrontSection {
  /** 稳定 ID（用于引用和重排）。 */
  id: string
  /** Section 类型。 */
  type: SectionType
  /** 显示顺序（显式控制，不依赖数据库顺序）。 */
  order: number
  /** 是否可见。 */
  visible: boolean
  /** Section 内容。 */
  content: SectionContent
  /** Section 样式。 */
  style?: SectionStyle
  /** Section 设置。 */
  settings?: SectionSettings
}

/** Theme 配置（映射到当前 Theme System）。 */
export interface StorefrontThemeConfig {
  /** Theme ID（映射到 ThemeRegistry）。 */
  themeId: string
  /** 自定义强调色（覆盖 theme tokens）。 */
  accent?: string
  /** 自定义圆角（覆盖 theme tokens）。 */
  radius?: number
  /** 自定义 CSS tokens（高级定制）。 */
  customTokens?: Record<string, string>
}

/** 完整 Storefront Schema。 */
export interface StorefrontSchema {
  /** Schema 版本。 */
  version: string
  /** Theme 配置。 */
  theme: StorefrontThemeConfig
  /** Sections 列表。 */
  sections: StorefrontSection[]
  /** 元数据。 */
  meta: {
    /** 最后修改时间。 */
    lastModified: string
    /** 草稿/发布状态。 */
    published: boolean
  }
}

/** 默认 Schema（新店铺初始化用）。 */
export function createDefaultSchema(): StorefrontSchema {
  return {
    version: STOREFRONT_SCHEMA_VERSION,
    theme: {
      themeId: 'electric-violet',
      accent: '#8B5CF6',
      radius: 8,
    },
    sections: [
      {
        id: 'sec-header',
        type: 'header',
        order: 0,
        visible: true,
        content: {
          announcement: 'Welcome to our store',
          showAnnouncement: true,
        },
        style: {
          padding: 'standard',
          bgStyle: 'default',
        },
      },
      {
        id: 'sec-hero',
        type: 'hero',
        order: 1,
        visible: true,
        content: {
          tag: 'NEW COLLECTION',
          title: 'Welcome to Our Store',
          description: 'Discover our latest products',
          buttonText: 'Shop Now',
          buttonLink: '/products',
        },
        style: {
          padding: 'standard',
          bgStyle: 'default',
          textAlign: 'left',
        },
      },
      {
        id: 'sec-products',
        type: 'featured_products',
        order: 2,
        visible: true,
        content: {
          tag: 'FEATURED',
          title: 'Featured Products',
          columns: 3,
          showPrice: true,
          showBuyButton: true,
        },
        style: {
          padding: 'standard',
          bgStyle: 'default',
        },
      },
      {
        id: 'sec-footer',
        type: 'footer',
        order: 3,
        visible: true,
        content: {},
        style: {
          padding: 'standard',
          bgStyle: 'default',
        },
      },
    ],
    meta: {
      lastModified: new Date().toISOString(),
      published: false,
    },
  }
}

/** Schema 验证（基础验证，不替代 TypeScript）。 */
export function validateSchema(schema: unknown): schema is StorefrontSchema {
  if (!schema || typeof schema !== 'object') return false
  const s = schema as Record<string, unknown>
  return (
    typeof s.version === 'string' &&
    typeof s.theme === 'object' &&
    Array.isArray(s.sections) &&
    typeof s.meta === 'object'
  )
}

/** 合法 Section 类型集合（normalize 时校验用）。 */
const SECTION_TYPES: readonly SectionType[] = [
  'header',
  'hero',
  'featured_products',
  'collection',
  'image_text',
  'rich_text',
  'cta',
  'footer',
  'testimonials',
  'faq',
]

/** 单条 section 安全归一：畸形条目丢弃（返回 null），绝不让整体崩溃。 */
function sanitizeSection(raw: unknown, index: number): StorefrontSection | null {
  if (!raw || typeof raw !== 'object') return null
  const s = raw as Record<string, unknown>
  if (typeof s.id !== 'string' || s.id.length === 0) return null
  if (typeof s.type !== 'string' || !SECTION_TYPES.includes(s.type as SectionType)) return null

  return {
    id: s.id,
    type: s.type as SectionType,
    order: typeof s.order === 'number' && Number.isFinite(s.order) ? s.order : index,
    visible: s.visible !== false,
    content:
      s.content && typeof s.content === 'object' && !Array.isArray(s.content)
        ? (s.content as SectionContent)
        : {},
    style:
      s.style && typeof s.style === 'object' && !Array.isArray(s.style)
        ? (s.style as SectionStyle)
        : undefined,
    settings:
      s.settings && typeof s.settings === 'object' && !Array.isArray(s.settings)
        ? (s.settings as SectionSettings)
        : undefined,
  }
}

/**
 * Storefront Schema 归一化 —— legacy / canonical 双形态 → 唯一 canonical schema。
 *
 * 背景：早期系统把 store_settings.theme_config 写成 legacy 形态
 *   { theme_id: 'electric-violet' }
 * 新编辑器写入 canonical 形态 StorefrontSchema。
 * 本函数是唯一入口，把两种形态统一为 canonical：
 *
 *   canonical（version+theme+sections+meta）→ 逐字段清洗后返回
 *   legacy（theme_id 字符串）→ 迁移为 canonical：theme.themeId = theme_id，
 *                              sections 用 createDefaultSchema() 默认骨架
 *   其它 → null（调用方决定回退策略）
 *
 * 只读转换：不修改入参对象，不销毁 legacy 数据。
 */
export function normalizeStorefrontSchema(raw: unknown): StorefrontSchema | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const obj = raw as Record<string, unknown>

  // Canonical 形态
  if (validateSchema(obj)) {
    const theme = obj.theme as unknown as Record<string, unknown>
    const meta = obj.meta as unknown as Record<string, unknown>
    const sections = (obj.sections as unknown[])
      .map((s, i) => sanitizeSection(s, i))
      .filter((s): s is StorefrontSection => s !== null)

    return {
      version: typeof obj.version === 'string' ? obj.version : STOREFRONT_SCHEMA_VERSION,
      theme: {
        themeId:
          typeof theme.themeId === 'string' && theme.themeId.length > 0
            ? theme.themeId
            : 'electric-violet',
        accent: typeof theme.accent === 'string' ? theme.accent : undefined,
        radius:
          typeof theme.radius === 'number' && Number.isFinite(theme.radius)
            ? theme.radius
            : undefined,
      },
      sections,
      meta: {
        lastModified:
          typeof meta.lastModified === 'string' ? meta.lastModified : new Date().toISOString(),
        published: meta.published === true,
      },
    }
  }

  // Legacy 形态：{ theme_id: '...' }（可能混有其它 legacy 键，一律保留语义只迁移 theme_id）
  if (typeof obj.theme_id === 'string' && obj.theme_id.length > 0) {
    const base = createDefaultSchema()
    base.theme.themeId = obj.theme_id
    return base
  }

  return null
}
