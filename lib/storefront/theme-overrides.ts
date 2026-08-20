/**
 * Storefront theme overrides —— 商家自定义 accent/radius → --th-* CSS 变量覆盖。
 *
 * 机制：ThemeRoot 已按 ThemeDefinition 注入 `[data-theme] { --th-* }`；
 * 本函数产出的变量通过内联 style 挂在渲染容器上（更靠近子树，优先级高于
 * 继承值），从而让 schema.theme.accent / radius 对编辑器预览与公开店面
 * 同时生效。不新建主题引擎，只在现有 Theme System 之上做变量覆盖。
 *
 * 纯函数、无副作用，可在 Server / Client 组件共用。
 */

import type { StorefrontThemeConfig } from './schema'
import { resolveStorefrontLanguage } from './locale'

/** 半径允许范围（防脏数据产生异常 CSS）。 */
const MIN_RADIUS = 0
const MAX_RADIUS = 64

export interface FontOption {
  id: string
  label: string
  nameEn: string
  value: string
}

export const ENGLISH_FONTS: FontOption[] = [
  {
    id: 'modern-sans',
    label: 'Modern Sans',
    nameEn: 'Plus Jakarta / Inter',
    value: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
  },
  {
    id: 'editorial-serif',
    label: 'Editorial Serif',
    nameEn: 'Playfair Display',
    value: '"Playfair Display", Georgia, "Times New Roman", serif',
  },
  {
    id: 'tech-mono',
    label: 'Tech Mono',
    nameEn: 'JetBrains Mono',
    value: '"JetBrains Mono", Consolas, Monaco, monospace',
  },
  {
    id: 'display-bold',
    label: 'Display Bold',
    nameEn: 'Syne / Trebuchet',
    value: 'Syne, "Trebuchet MS", sans-serif',
  },
]

export const CHINESE_FONTS: FontOption[] = [
  {
    id: 'pingfang-hei',
    label: '苹方黑体',
    nameEn: 'PingFang / YaHei',
    value: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", system-ui, sans-serif',
  },
  {
    id: 'songti-ming',
    label: '宋体明朝',
    nameEn: 'Songti / Noto Serif',
    value: '"Songti SC", "STSong", "Noto Serif CJK SC", "Source Han Serif SC", Georgia, serif',
  },
  {
    id: 'kaiti-calligraphy',
    label: '楷体人文',
    nameEn: 'Kaiti SC / KaiTi',
    value: '"Kaiti SC", "STKaiti", "KaiTi", serif',
  },
  {
    id: 'yuanti-round',
    label: '圆体柔和',
    nameEn: 'YouYuan / STHeiti',
    value: '"STHeiti Light", "YouYuan", "PingFang SC", system-ui, sans-serif',
  },
]

export function storefrontThemeOverrides(
  theme?: StorefrontThemeConfig | null,
  acceptLanguageOrBrowserLocale?: string | null
): Record<string, string> {
  const vars: Record<string, string> = {}
  const lang = resolveStorefrontLanguage(theme?.language, acceptLanguageOrBrowserLocale)

  let bodyFont = ''
  let headingFont = ''

  if (theme?.fontFamily) {
    bodyFont = theme.fontFamily
    headingFont = theme.fontFamily
  } else if (lang === 'zh') {
    bodyFont = CHINESE_FONTS[0].value
    headingFont = CHINESE_FONTS[0].value
  } else {
    bodyFont = ENGLISH_FONTS[0].value
    headingFont = ENGLISH_FONTS[0].value
  }

  vars['--th-font-body'] = bodyFont
  vars['--th-font-heading'] = headingFont
  vars['--font-sans'] = bodyFont
  vars['--font-heading'] = headingFont
  vars['fontFamily'] = bodyFont

  if (lang === 'zh') {
    vars['--th-currency-symbol'] = '¥'
    vars['--th-currency-code'] = 'CNY'
  } else {
    vars['--th-currency-symbol'] = '$'
    vars['--th-currency-code'] = 'USD'
  }

  if (theme) {
    if (typeof theme.accent === 'string' && theme.accent.length > 0) {
      // primary 用于主按钮/强调；accent 用于 hover/深一档强调。
      vars['--th-color-primary'] = theme.accent
      vars['--th-color-accent'] = theme.accent
    }

    if (typeof theme.radius === 'number' && Number.isFinite(theme.radius)) {
      const clamped = Math.max(MIN_RADIUS, Math.min(MAX_RADIUS, theme.radius))
      const px = `${clamped}px`
      vars['--th-radius-card'] = px
      vars['--th-radius-button'] = px
      vars['--th-radius-input'] = px
    }
  }

  return vars
}
