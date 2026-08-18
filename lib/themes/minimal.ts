/**
 * Minimal (简约) — 极简白底 + 克制留白 + 高级排版韵律。
 *
 * 视觉特征：
 * - 白底 / 冷白 surface
 * - 6px 小圆角
 * - 微弱优雅阴影
 * - 锌黑 (Zinc-900) 品牌强调
 */

import type { ThemeDefinition, ThemeTokens } from './types'

export const minimalTokens: ThemeTokens = {
  colors: {
    primary: '#18181B',
    background: '#FFFFFF',
    surface: '#FAFAFA',
    text: '#09090B',
    muted: '#71717A',
    border: '#E4E4E7',
    accent: '#27272A',
  },
  typography: {
    headingFont: 'var(--font-heading)',
    bodyFont: 'var(--font-sans)',
    headingWeight: 700,
    bodyWeight: 400,
  },
  radius: {
    card: '0.375rem',  // 6px
    button: '0.375rem',
    input: '0.375rem',
  },
  spacing: {
    section: '6rem',
    container: '80rem',
    grid: '1.5rem',
  },
  shadows: {
    card: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
    floating: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
  },
  motion: {
    duration: '200ms',
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
}

export const minimalTheme: ThemeDefinition = {
  id: 'minimal',
  name: 'Minimal / 简约',
  description: '极致留白与精细排版，注重内容高效传达与高定质感',
  tokens: minimalTokens,
  variants: {
    navbar: 'default',
    productCard: 'flat',
  },
  templates: ['home', 'product', 'collection'],
}
