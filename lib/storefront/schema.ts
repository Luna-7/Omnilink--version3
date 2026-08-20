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
  /** 展示语言偏好：'en' | 'zh' （Demo 阶段唯一源头，联动 Currency & Typography）。 */
  language?: 'en' | 'zh'
  /** 字体族选择（英文或中文字体）。 */
  fontFamily?: string
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

/** 默认 Schema（新店铺初始化 / Minimal Base Template 事实源：OPTIQUE ATELIER 高定眼镜独立站）。 */
export function createDefaultSchema(): StorefrontSchema {
  return {
    version: STOREFRONT_SCHEMA_VERSION,
    theme: {
      themeId: 'minimal',
      accent: '#121214',
      radius: 4,
    },
    sections: [
      {
        id: 'sec-header',
        type: 'header',
        order: 0,
        visible: true,
        content: {
          title: 'OPTIQUE ATELIER',
          announcement: 'COMPLIMENTARY WORLDWIDE INSURED COURIER ON ALL ARTISAN EDITIONS · 30-DAY ATELIER TRY-ON',
          showAnnouncement: true,
          en: {
            announcement: 'COMPLIMENTARY WORLDWIDE INSURED COURIER ON ALL ARTISAN EDITIONS · 30-DAY ATELIER TRY-ON',
          },
          zh: {
            announcement: '全场匠人手作限定系列享全球保价包邮 · 支持 30 天工坊无忧试戴',
          },
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
          tag: 'SPRING / SUMMER 2026 EDITION',
          title: 'Sculpted Light & Architectural Eyewear',
          subtitle: 'Handcrafted in Sabae and Belluno. Pure bio-acetate contours meeting weightless Japanese beta-titanium.',
          description: 'Engineered with millimeter precision for effortless daily wear. Calibrated optical balance that frames your individual perspective with quiet distinction.',
          buttonText: 'Explore 2026 Editions',
          buttonLink: '#products',
          secondaryButtonText: 'Read Craft Story',
          secondaryButtonLink: '#sec-image-text',
          imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1200&auto=format&fit=crop',
          en: {
            tag: 'SPRING / SUMMER 2026 EDITION',
            title: 'Sculpted Light & Architectural Eyewear',
            subtitle: 'Handcrafted in Sabae and Belluno. Pure bio-acetate contours meeting weightless Japanese beta-titanium.',
            description: 'Engineered with millimeter precision for effortless daily wear. Calibrated optical balance that frames your individual perspective with quiet distinction.',
            buttonText: 'Explore 2026 Editions',
            secondaryButtonText: 'Read Craft Story',
          },
          zh: {
            tag: '2026 春夏高级眼镜系列',
            title: '雕琢之光 · 极简高定光学镜架',
            subtitle: '日本鲭江与意大利贝尔鲁诺手工打造。纯正生物醋酸纤维与轻量化日本β钛金属组合。',
            description: '毫米级精密结构计算，为无感佩戴而生。调校光学平衡，彰显独立审美。',
            buttonText: '探索 2026 选品',
            secondaryButtonText: '阅读工坊故事',
          },
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
          tag: 'SIGNATURE EDITIONS',
          title: 'Curated Eyewear & Optics',
          subtitle: 'Small-batch releases sculpted for balance, tactile luxury, and everyday clarity.',
          columns: 4,
          count: 4,
          showPrice: true,
          showBuyButton: true,
          en: {
            tag: 'SIGNATURE EDITIONS',
            title: 'Curated Eyewear & Optics',
            subtitle: 'Small-batch releases sculpted for balance, tactile luxury, and everyday clarity.',
          },
          zh: {
            tag: '工坊代表作',
            title: '精选高级光学镜架',
            subtitle: '限量手工小批量发行，兼具佩戴平衡感、高定质感与清晰视野。',
          },
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
          tag: 'SEASONAL HIGHLIGHT',
          title: 'The Kinfolk Minimalist Series',
          subtitle: 'Organic circular curves, hand-beveled tortoiseshell rims, and featherweight core wires.',
          description: 'Inspired by modernist architectural forms and honest materiality. The Kinfolk series balances classic circular contours with ultra-light Japanese titanium wirework, delivering an uncompromised field of vision and zero pressure points.',
          buttonText: 'Discover Kinfolk Series',
          buttonLink: '#products',
          imagePosition: 'right',
          imageUrl: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?q=80&w=1200&auto=format&fit=crop',
          en: {
            tag: 'SEASONAL HIGHLIGHT',
            title: 'The Kinfolk Minimalist Series',
            subtitle: 'Organic circular curves, hand-beveled tortoiseshell rims, and featherweight core wires.',
            description: 'Inspired by modernist architectural forms and honest materiality. The Kinfolk series balances classic circular contours with ultra-light Japanese titanium wirework, delivering an uncompromised field of vision and zero pressure points.',
            buttonText: 'Discover Kinfolk Series',
          },
          zh: {
            tag: '本季主打',
            title: 'Kinfolk 极简圆框系列',
            subtitle: '有机圆润线条，手工倒角玳瑁纹理与超轻金属镜腿。',
            description: '灵感源自现代主义建筑线条与纯粹材质。Kinfolk 系列平衡经典复古圆框与超轻钛金材质，带来无感舒适的配戴体验。',
            buttonText: '探索 Kinfolk 系列',
          },
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
          tag: 'CRAFTSMANSHIP & MATERIALS',
          title: 'Mazzucchelli Bio-Acetate & Sabae Beta-Titanium',
          subtitle: 'Over 200 meticulous hand-finishing steps across three generations of mastery.',
          description: 'Every frame is tumbled in Japanese cedar barrels for 72 hours to achieve our signature velvet patina. Hand-riveted 5-barrel hinges and custom core wires ensure lifetime structural integrity without unnecessary weight or branding.',
          buttonText: 'Our Atelier Process',
          buttonLink: '#sec-rich-text',
          imagePosition: 'left',
          imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=1200&auto=format&fit=crop',
          en: {
            tag: 'CRAFTSMANSHIP & MATERIALS',
            title: 'Mazzucchelli Bio-Acetate & Sabae Beta-Titanium',
            subtitle: 'Over 200 meticulous hand-finishing steps across three generations of mastery.',
            description: 'Every frame is tumbled in Japanese cedar barrels for 72 hours to achieve our signature velvet patina. Hand-riveted 5-barrel hinges and custom core wires ensure lifetime structural integrity without unnecessary weight or branding.',
            buttonText: 'Our Atelier Process',
          },
          zh: {
            tag: '传统工艺与材质',
            title: '意大利 Mazzucchelli 生物板材与鲭江β钛',
            subtitle: '三代匠人传承，200 余道精密手工打磨工序。',
            description: '镜框经雪松木桶 72 小时手工滚筒打磨，呈现丝绒般温润质感。配备手工铆钉与高耐用铰链，无冗余重量与夸张 Logos。',
            buttonText: '了解工坊制作流程',
          },
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
          title: 'Frames Designed to Disappear, Silhouettes Meant to Endure',
          subtitle: 'We believe true luxury in optics is not loud branding, but structural poise and pure optical clarity.',
          description: 'In an era of disposable fast fashion and conspicuous logos, OPTIQUE ATELIER crafts timeless optical instruments. We calibrate the weight distribution to the exact millimeter, ensuring that when you wear our glasses, you forget the frame exists — while the world sees pure architectural poise.',
          en: {
            tag: 'OUR MANIFESTO',
            title: 'Frames Designed to Disappear, Silhouettes Meant to Endure',
            subtitle: 'We believe true luxury in optics is not loud branding, but structural poise and pure optical clarity.',
            description: 'In an era of disposable fast fashion and conspicuous logos, OPTIQUE ATELIER crafts timeless optical instruments. We calibrate the weight distribution to the exact millimeter, ensuring that when you wear our glasses, you forget the frame exists — while the world sees pure architectural poise.',
          },
          zh: {
            tag: '工坊宣言',
            title: '设计至无感，廓形至长久',
            subtitle: '我们相信，光学领域的真正奢华绝非张扬标语，而是精简的结构沉淀与极致清晰。',
            description: '在快时尚泛滥的时代，我们打造经典耐用的光学镜架。严格校准配重，让您几乎感受不到镜框的存在，展现独立沉稳的风采。',
          },
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
          tag: 'CRITICAL REFLECTION',
          title: 'Words from Opticians, Architects & Collectors',
          testimonialsList: [
            {
              name: 'Architectural Review Digest',
              role: 'Design & Living Journal',
              quote: 'OPTIQUE ATELIER accomplishes what few luxury brands can: weightless architectural geometry paired with warm, tactile materiality.',
              rating: 5,
            },
            {
              name: 'Dr. Julian Vance, O.D.',
              role: 'Master Optometrist, Vance Vision Studio',
              quote: 'The nasal bridge ergonomics and cold-insertion lens centration in the Sabae Series are extraordinary. Easily the finest daily wear frame I have fitted this decade.',
              rating: 5,
            },
            {
              name: 'Claire DeWitt',
              role: 'Creative Director & Industrial Designer',
              quote: 'The Kinfolk Round in Classic Tortoise has become my permanent daily signature. Impeccable hinge action and universally flattering proportions.',
              rating: 5,
            },
          ],
          en: {
            tag: 'CRITICAL REFLECTION',
            title: 'Words from Opticians, Architects & Collectors',
            testimonialsList: [
              {
                name: 'Architectural Review Digest',
                role: 'Design & Living Journal',
                quote: 'OPTIQUE ATELIER accomplishes what few luxury brands can: weightless architectural geometry paired with warm, tactile materiality.',
                rating: 5,
              },
              {
                name: 'Dr. Julian Vance, O.D.',
                role: 'Master Optometrist, Vance Vision Studio',
                quote: 'The nasal bridge ergonomics and cold-insertion lens centration in the Sabae Series are extraordinary. Easily the finest daily wear frame I have fitted this decade.',
                rating: 5,
              },
              {
                name: 'Claire DeWitt',
                role: 'Creative Director & Industrial Designer',
                quote: 'The Kinfolk Round in Classic Tortoise has become my permanent daily signature. Impeccable hinge action and universally flattering proportions.',
                rating: 5,
              },
            ],
          },
          zh: {
            tag: '行业评价',
            title: '验光师、建筑师与收藏家之声',
            testimonialsList: [
              {
                name: '《建筑评论》',
                role: '设计与生活专刊',
                quote: 'OPTIQUE ATELIER 实现了少数奢牌才能做到的品质：轻量建筑几何与极致温润材质的完美融合。',
                rating: 5,
              },
              {
                name: '朱利安·凡斯 博士',
                role: '首席验光师，Vance 视光中心',
                quote: 'Sabae 系列的人体工学鼻梁与镜片嵌合度令人惊叹，绝对是我近十年来验配过最舒适的日常镜架。',
                rating: 5,
              },
              {
                name: '克莱尔·德维特',
                role: '创意总监 & 工业设计师',
                quote: '经典玳瑁色的 Kinfolk 圆框已成为我的日常标志。严丝合缝的铰链体验与百搭比例。',
                rating: 5,
              },
            ],
          },
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
          tag: 'CONCIERGE & SUPPORT',
          title: 'Frequently Asked Questions',
          faqList: [
            {
              question: 'Can I fit custom prescription or progressive lenses into OPTIQUE ATELIER frames?',
              answer: 'Yes. All of our frames feature optical-grade bevel channels engineered for cold and warm lens insertion, fully compatible with single-vision, progressive, high-index blue light, and polarized sunglass prescriptions from any licensed optometrist.',
            },
            {
              question: 'How does the complimentary 30-day Home Atelier Try-On work?',
              answer: 'We provide insured, expedited courier delivery worldwide. Take up to 30 days to test the fit and optical balance in your daily environment. If you need a different bridge width or style, returns and exchanges are completely complimentary.',
            },
            {
              question: 'What materials are used, and how should I care for bio-acetate frames?',
              answer: 'Our frames are sculpted from plant-based Mazzucchelli bio-acetate and Japanese titanium. Clean gently with lukewarm water and our custom woven microfiber cloth. Store in the included molded magnetic leather case when not in use.',
            },
          ],
          en: {
            tag: 'CONCIERGE & SUPPORT',
            title: 'Frequently Asked Questions',
            faqList: [
              {
                question: 'Can I fit custom prescription or progressive lenses into OPTIQUE ATELIER frames?',
                answer: 'Yes. All of our frames feature optical-grade bevel channels engineered for cold and warm lens insertion, fully compatible with single-vision, progressive, high-index blue light, and polarized sunglass prescriptions from any licensed optometrist.',
              },
              {
                question: 'How does the complimentary 30-day Home Atelier Try-On work?',
                answer: 'We provide insured, expedited courier delivery worldwide. Take up to 30 days to test the fit and optical balance in your daily environment. If you need a different bridge width or style, returns and exchanges are completely complimentary.',
              },
              {
                question: 'What materials are used, and how should I care for bio-acetate frames?',
                answer: 'Our frames are sculpted from plant-based Mazzucchelli bio-acetate and Japanese titanium. Clean gently with lukewarm water and our custom woven microfiber cloth. Store in the included molded magnetic leather case when not in use.',
              },
            ],
          },
          zh: {
            tag: '客户服务 & 常见问题',
            title: '常见问题解答',
            faqList: [
              {
                question: '是否支持配置定制近视镜片或渐进多焦点镜片？',
                answer: '支持。我们所有镜架均采用光学级槽口设计，适配各类近视、远视、防蓝光及偏光太阳镜片。',
              },
              {
                question: '30 天工坊试戴服务是如何运作的？',
                answer: '我们提供全程保价快递。您可以在收到后 30 天内自由试戴。如有尺寸或款式调整需求，均享免费退换。',
              },
              {
                question: '使用了哪些材质？板材镜架应如何保养？',
                answer: '镜框采用植物基生物醋酸纤维与日本钛金属。建议使用温水与擦镜布清洁，存放于随附的磁吸皮革盒中。',
              },
            ],
          },
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
          tag: 'PRIVATE ATELIER ACCESS',
          title: 'Experience Architectural Optics',
          subtitle: 'Schedule a private styling consultation or reserve priority allocation for upcoming artisan batch releases.',
          description: 'Patrons receive preview access 48 hours prior to public collection drops, bespoke bridge adjustments, and complimentary lifetime optical servicing.',
          buttonText: 'Book Private Consultation',
          buttonLink: '#products',
          en: {
            tag: 'PRIVATE ATELIER ACCESS',
            title: 'Experience Architectural Optics',
            subtitle: 'Schedule a private styling consultation or reserve priority allocation for upcoming artisan batch releases.',
            description: 'Patrons receive preview access 48 hours prior to public collection drops, bespoke bridge adjustments, and complimentary lifetime optical servicing.',
            buttonText: 'Book Private Consultation',
          },
          zh: {
            tag: '私享工坊通道',
            title: '预约体验建筑美学眼镜',
            subtitle: '预约一对一造型建议，或优先锁定下一批工坊限量作品。',
            description: '会员可提前 48 小时优先购，享受专属鼻梁微调与终身免费维护服务。',
            buttonText: '预约私享咨询',
          },
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
          title: 'OPTIQUE ATELIER',
          showTrustBadges: true,
          trustBadge1: 'Handcrafted in Sabae & Belluno',
          trustBadge2: '30-Day Atelier Try-On',
          trustBadge3: 'Lifetime Structural Warranty',
          copyright: '© 2026 OPTIQUE ATELIER. Handcrafted Optics & Fine Eyewear. All rights reserved.',
          en: {
            title: 'OPTIQUE ATELIER',
            trustBadge1: 'Handcrafted in Sabae & Belluno',
            trustBadge2: '30-Day Atelier Try-On',
            trustBadge3: 'Lifetime Structural Warranty',
            copyright: '© 2026 OPTIQUE ATELIER. Handcrafted Optics & Fine Eyewear. All rights reserved.',
          },
          zh: {
            title: 'OPTIQUE ATELIER',
            trustBadge1: '日本鲭江 & 意大利贝尔鲁诺手工',
            trustBadge2: '30 天工坊试戴',
            trustBadge3: '终身质保承诺',
            copyright: '© 2026 OPTIQUE ATELIER 高级光学镜架工坊. 保留所有权利.',
          },
        },
        style: {
          padding: 'standard',
          bgStyle: 'default',
        },
      },
    ],
    globalInfo: {
      brandName: 'OPTIQUE ATELIER',
      tagline: 'Sculpted Light & Architectural Eyewear',
      contact: {
        email: 'concierge@optique-atelier.com',
        phone: '+1 (212) 555-0198',
        whatsapp: '+1 212 555 0198',
        address: '742 Mercer Street, SoHo, New York · Sabae Workshop, Fukui',
        contactUrl: '#products',
      },
      social: {
        instagram: 'https://instagram.com/optique_atelier',
        x: 'https://x.com/optique_atelier',
        youtube: 'https://youtube.com/@optique_atelier',
      },
    },
    contact: {
      email: 'concierge@optique-atelier.com',
      phone: '+1 (212) 555-0198',
      whatsapp: '+1 212 555 0198',
      address: '742 Mercer Street, SoHo, New York · Sabae Workshop, Fukui',
      contactUrl: '#products',
    },
    social: {
      instagram: 'https://instagram.com/optique_atelier',
      x: 'https://x.com/optique_atelier',
      youtube: 'https://youtube.com/@optique_atelier',
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
