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

/** 联系方式全局数据架构 */
export interface StoreContactConfig {
  email?: string
  phone?: string
  whatsapp?: string
  address?: string
  contactUrl?: string
}

/** 社交媒体全局数据架构 */
export interface StoreSocialConfig {
  instagram?: string
  facebook?: string
  youtube?: string
  tiktok?: string
  x?: string
  linkedin?: string
}

/** 全局品牌与店铺元数据 */
export interface GlobalStoreInfo {
  brandName?: string
  tagline?: string
  logoUrl?: string
  contact?: StoreContactConfig
  social?: StoreSocialConfig
}

/** 完整 Storefront Schema。 */
export interface StorefrontSchema {
  /** Schema 版本。 */
  version: string
  /** Theme 配置。 */
  theme: StorefrontThemeConfig
  /** Sections 列表。 */
  sections: StorefrontSection[]
  /** 全局店铺信息（品牌、联系方式、社交网络）。 */
  globalInfo?: GlobalStoreInfo
  /** 向后兼容顶级 contact 挂载 */
  contact?: StoreContactConfig
  /** 向后兼容顶级 social 挂载 */
  social?: StoreSocialConfig
  /** 元数据。 */
  meta: {
    /** 最后修改时间。 */
    lastModified: string
    /** 草稿/发布状态。 */
    published: boolean
  }
}

/** 默认 Schema（新店铺初始化 / Minimal Base Template 事实源）。 */
export function createDefaultSchema(): StorefrontSchema {
  return {
    version: STOREFRONT_SCHEMA_VERSION,
    theme: {
      themeId: 'minimal',
      accent: '#18181B',
      radius: 6,
    },
    sections: [
      {
        id: 'sec-header',
        type: 'header',
        order: 0,
        visible: true,
        content: {
          title: 'KURA OBJECTS',
          announcement: 'COMPLIMENTARY WORLDWIDE INSURED SHIPPING OVER $250',
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
          tag: 'AUTUMN / WINTER 2026',
          title: 'Tactile Objects for Intentional Living',
          subtitle: 'Sculptural acoustics, hand-finished stoneware, and quiet rituals.',
          description: 'Crafted in small-batch editions by master artisans in Kyoto and Zurich. Every piece balances tactile materiality with acoustic precision.',
          buttonText: 'Explore Collection',
          buttonLink: '#products',
          secondaryButtonText: 'Read Manifesto',
          secondaryButtonLink: '#sec-rich-text',
          imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1200&auto=format&fit=crop',
        },
        style: {
          padding: 'spacious',
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
          tag: 'CURATED SELECTION',
          title: 'Featured Editions',
          subtitle: 'Limited release objects designed for modern sanctuaries.',
          columns: 3,
          count: 6,
          showPrice: true,
          showBuyButton: true,
        },
        style: {
          padding: 'standard',
          bgStyle: 'default',
        },
      },
      {
        id: 'sec-collection',
        type: 'collection',
        order: 3,
        visible: true,
        content: {
          tag: 'FEATURED SERIES',
          title: 'The Ceramic Acoustic Vessel',
          subtitle: 'Where ancient stoneware techniques meet ambient sound resonance.',
          description: 'Engineered with high-density stoneware clay and tuned acoustic chambers, the Vessel series redefines how music integrates into refined living environments.',
          buttonText: 'Discover Vessel Series',
          buttonLink: '#products',
          imagePosition: 'right',
          imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop',
        },
        style: {
          padding: 'standard',
          bgStyle: 'default',
          textAlign: 'left',
        },
      },
      {
        id: 'sec-image-text',
        type: 'image_text',
        order: 4,
        visible: true,
        content: {
          tag: 'CRAFTSMANSHIP',
          title: 'Honest Materials, Uncompromising Precision',
          subtitle: 'Sourced responsibly, hand-finished individually.',
          description: 'From Japanese unglazed clay to aerospace-grade anodized aluminum, we honor the natural character of raw materials without superficial coatings.',
          buttonText: 'Our Crafting Process',
          buttonLink: '#sec-rich-text',
          imagePosition: 'left',
          imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200&auto=format&fit=crop',
        },
        style: {
          padding: 'standard',
          bgStyle: 'default',
          textAlign: 'left',
        },
      },
      {
        id: 'sec-rich-text',
        type: 'rich_text',
        order: 5,
        visible: true,
        content: {
          tag: 'OUR MANIFESTO',
          title: 'Designed for Quiet Moments',
          subtitle: 'We believe objects should enrich everyday rituals without demanding visual noise.',
          description: 'In a culture defined by rapid obsolescence, KURA creates durable, tactile goods designed to age gracefully. Every curve and finish is crafted to foster focus, calm, and genuine connection with your physical environment.',
        },
        style: {
          padding: 'spacious',
          bgStyle: 'default',
          textAlign: 'center',
        },
      },
      {
        id: 'sec-testimonials',
        type: 'testimonials',
        order: 6,
        visible: true,
        content: {
          tag: 'PRESS & REVIEWS',
          title: 'Critical Reflection',
          testimonialsList: [
            {
              name: 'Monocle Design Review',
              role: 'Architecture & Objects Issue',
              quote: 'KURA has accomplished the rare feat of fusing acoustic purity with museum-grade ceramic art. An indispensable presence in the modern interior.',
              rating: 5,
            },
            {
              name: 'Elena Rostova',
              role: 'Principal Architect, Studio Rostova',
              quote: 'The tactile weight and quiet elegance of these pieces elevate every residential space we specify them for. Sublime craftsmanship.',
              rating: 5,
            },
            {
              name: 'Marcus Chen',
              role: 'Industrial Designer & Collector',
              quote: 'Uncompromising attention to material detail. KURA objects don’t just sit in a room; they transform its sensory atmosphere.',
              rating: 5,
            },
          ],
        },
        style: {
          padding: 'standard',
          bgStyle: 'default',
        },
      },
      {
        id: 'sec-faq',
        type: 'faq',
        order: 7,
        visible: true,
        content: {
          tag: 'ASSISTANCE',
          title: 'Frequently Asked Questions',
          faqList: [
            {
              question: 'Where are KURA objects crafted?',
              answer: 'Each piece is hand-finished in small studios across Kyoto and Zurich, working directly with master ceramicists and precision audio engineers.',
            },
            {
              question: 'What is your shipping and delivery process?',
              answer: 'We offer complimentary white-glove worldwide shipping on orders over $250. Every order is packaged in plastic-free, custom-molded recycled fiber casing.',
            },
            {
              question: 'How do I care for hand-finished stoneware?',
              answer: 'Clean gently with a dry or lightly dampened microfiber cloth. Avoid abrasive chemical cleaners to preserve the natural matte patina.',
            },
          ],
        },
        style: {
          padding: 'standard',
          bgStyle: 'default',
        },
      },
      {
        id: 'sec-cta',
        type: 'cta',
        order: 8,
        visible: true,
        content: {
          tag: 'PRIVATE ACCESS',
          title: 'Join the KURA Atelier Circle',
          subtitle: 'Receive private invitations to limited-run artisan drops and acoustic exhibitions.',
          description: 'Subscribers gain early access 24 hours prior to public collection releases. No noise, strictly curated announcements.',
          buttonText: 'Request Access',
          buttonLink: '#products',
        },
        style: {
          padding: 'spacious',
          bgStyle: 'default',
        },
      },
      {
        id: 'sec-footer',
        type: 'footer',
        order: 9,
        visible: true,
        content: {
          title: 'KURA OBJECTS',
          showTrustBadges: true,
          trustBadge1: 'Ethically Hand-Crafted',
          trustBadge2: 'Insured Global Shipping',
          trustBadge3: '5-Year Limited Warranty',
          copyright: '© 2026 KURA OBJECTS. All rights reserved.',
        },
        style: {
          padding: 'standard',
          bgStyle: 'default',
        },
      },
    ],
    globalInfo: {
      brandName: 'KURA OBJECTS',
      tagline: 'Tactile Objects for Intentional Living',
      contact: {
        email: 'concierge@kura-objects.com',
        phone: '+41 44 211 8800',
        whatsapp: '+41 79 123 4567',
        address: 'Zurich Atelier · Kyoto Studio',
        contactUrl: '#sec-cta',
      },
      social: {
        instagram: 'https://instagram.com/kura_objects',
        x: 'https://x.com/kura_objects',
        youtube: 'https://youtube.com/@kura_objects',
      },
    },
    contact: {
      email: 'concierge@kura-objects.com',
      phone: '+41 44 211 8800',
      whatsapp: '+41 79 123 4567',
      address: 'Zurich Atelier · Kyoto Studio',
      contactUrl: '#sec-cta',
    },
    social: {
      instagram: 'https://instagram.com/kura_objects',
      x: 'https://x.com/kura_objects',
      youtube: 'https://youtube.com/@kura_objects',
    },
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

    const rawGlobal = (obj.globalInfo as Record<string, unknown>) || {}
    const rawContact = (obj.contact as Record<string, unknown>) || (rawGlobal.contact as Record<string, unknown>) || {}
    const rawSocial = (obj.social as Record<string, unknown>) || (rawGlobal.social as Record<string, unknown>) || {}

    const contact: StoreContactConfig = {
      email: typeof rawContact.email === 'string' && rawContact.email.trim() ? rawContact.email.trim() : undefined,
      phone: typeof rawContact.phone === 'string' && rawContact.phone.trim() ? rawContact.phone.trim() : undefined,
      whatsapp: typeof rawContact.whatsapp === 'string' && rawContact.whatsapp.trim() ? rawContact.whatsapp.trim() : undefined,
      address: typeof rawContact.address === 'string' && rawContact.address.trim() ? rawContact.address.trim() : undefined,
      contactUrl: typeof rawContact.contactUrl === 'string' && rawContact.contactUrl.trim() ? rawContact.contactUrl.trim() : undefined,
    }

    const social: StoreSocialConfig = {
      instagram: typeof rawSocial.instagram === 'string' && rawSocial.instagram.trim() ? rawSocial.instagram.trim() : undefined,
      facebook: typeof rawSocial.facebook === 'string' && rawSocial.facebook.trim() ? rawSocial.facebook.trim() : undefined,
      youtube: typeof rawSocial.youtube === 'string' && rawSocial.youtube.trim() ? rawSocial.youtube.trim() : undefined,
      tiktok: typeof rawSocial.tiktok === 'string' && rawSocial.tiktok.trim() ? rawSocial.tiktok.trim() : undefined,
      x: typeof rawSocial.x === 'string' && rawSocial.x.trim() ? rawSocial.x.trim() : undefined,
      linkedin: typeof rawSocial.linkedin === 'string' && rawSocial.linkedin.trim() ? rawSocial.linkedin.trim() : undefined,
    }

    const globalInfo: GlobalStoreInfo = {
      brandName: typeof rawGlobal.brandName === 'string' ? rawGlobal.brandName : undefined,
      tagline: typeof rawGlobal.tagline === 'string' ? rawGlobal.tagline : undefined,
      logoUrl: typeof rawGlobal.logoUrl === 'string' ? rawGlobal.logoUrl : undefined,
      contact,
      social,
    }

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
      globalInfo,
      contact,
      social,
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
