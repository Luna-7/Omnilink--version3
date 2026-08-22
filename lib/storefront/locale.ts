/**
 * Storefront Language & Locale Helpers
 *
 * 核心设计规则：
 *   1. Merchant / User Language Selection 是唯一的 Source of Truth ('en' | 'zh')
 *   2. Language 联动 Currency ($ / USD vs. ¥ / CNY)
 *   3. Language 联动 Typography (Latin font stack vs. CJK font stack)
 *   4. 优先级：Saved user preference -> Browser / IP default -> English fallback
 */

import type { StorefrontSection } from '@/lib/storefront/schema'

export type StorefrontLanguage = 'en' | 'zh'

/**
 * 根据保存偏好与环境解析当前 Storefront 语言
 */
export function resolveStorefrontLanguage(
  savedLanguage?: 'en' | 'zh' | null,
  acceptLanguageOrBrowserLocale?: string | null
): StorefrontLanguage {
  // 1. 用户 / 商家明确保存的偏好 (最高优先级，不被 IP / Browser 覆盖)
  if (savedLanguage === 'en' || savedLanguage === 'zh') {
    return savedLanguage
  }

  // 2. 检查传入的 accept-language header 或 browser locale / prop
  if (acceptLanguageOrBrowserLocale) {
    const lower = acceptLanguageOrBrowserLocale.toLowerCase()
    if (lower.includes('zh') || lower.includes('cn')) {
      return 'zh'
    }
    if (lower.includes('en')) {
      return 'en'
    }
  }

  // 3. 默认 fallback
  return 'en'
}

/**
 * 固定系统 UI / 按钮标签映射表 (英文 -> 中文)
 * 仅用于固定系统 UI / 按钮标签，严禁将 FAQ / 评测 / 品牌故事 / 商品信息 / 公告放入此处
 */
const SYSTEM_UI_MAP_EN_TO_ZH: Record<string, string> = {
  // Navigation & System UI
  Home: '首页',
  Products: '选品展厅',
  Contact: '联系我们',
  'About Us': '关于我们',
  FAQ: '常见问题',
  Testimonials: '顾客评测',
  'No products yet': '暂无商品',
  'Contact Us': '联系我们',
  Connect: '关注我们',
  'Call to Action': '立即行动',
  Store: '店铺',
  Welcome: '欢迎光临',
  Collection: '精选系列',

  // Buttons & Actions
  'Explore Collection': '探索系列',
  'Shop Collection': '选购系列',
  'Shop Now': '立即选购',
  'Read Craft Story': '阅读工坊故事',
  'Bespoke Styling': '预约专属造型',
  'Learn More': '了解更多',
  'Book Private Consultation': '预约私享咨询',
}

/**
 * 单条系统 UI / 按钮标签翻译助手 (仅用于固定 System UI/Buttons，保留商家原始文本)
 */
export function translateText(
  text: string | undefined | null,
  targetLang: StorefrontLanguage
): string {
  if (!text || typeof text !== 'string') return ''
  const trimmed = text.trim()
  if (!trimmed) return text

  if (targetLang === 'zh' && SYSTEM_UI_MAP_EN_TO_ZH[trimmed]) {
    return SYSTEM_UI_MAP_EN_TO_ZH[trimmed]
  }

  return text
}

/**
 * 针对 Template Demo Content，解析当前语言下对应的特定 locale-aware 内容 (例如 content.zh / content.en)。
 * 核心原则：商家编辑的顶层 Canonical 内容拥有最高优先级，绝对不被内置预设覆盖。
 */
export function resolveSectionContent(
  content: StorefrontSection['content'] | undefined,
  lang: StorefrontLanguage
): StorefrontSection['content'] {
  if (!content) return {}
  const localeContent = (content[lang] && typeof content[lang] === 'object' ? content[lang] : null) as Partial<StorefrontSection['content']> | null
  if (localeContent) {
    // 顶层 content 的字段优先于预设 localeContent，确保任何编辑即时生效
    const merged: Record<string, unknown> = { ...localeContent }
    for (const [key, val] of Object.entries(content)) {
      if (key !== 'en' && key !== 'zh' && val !== undefined && val !== null && val !== '') {
        merged[key] = val
      }
    }
    return merged as StorefrontSection['content']
  }
  return content
}

/**
 * 将某个 Section 的内容进行本地化解析并保留商家实时编辑
 */
export function localizeSectionContent(
  section: StorefrontSection,
  lang: StorefrontLanguage
): StorefrontSection {
  if (!section || !section.content) return section

  const resolvedContent = resolveSectionContent(section.content, lang)
  return {
    ...section,
    content: resolvedContent,
  }
}

/**
 * 格式化 Storefront 价格，自动跟随语言环境货币符号 ($ / ¥)
 */
export function formatStorefrontPrice(
  price: number,
  languageOrCurrency?: string
): string {
  const amount = Number.isFinite(price)
    ? price.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : '0.00'

  if (
    languageOrCurrency === 'zh' ||
    languageOrCurrency === 'CNY' ||
    languageOrCurrency === '¥'
  ) {
    return `¥${amount}`
  }

  return `$${amount}`
}
