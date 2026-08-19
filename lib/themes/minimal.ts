/**
 * Minimal (简约) — 高端商业独立站极简模板（Editorial Eyewear & Optics）。
 *
 * 视觉特征：
 * - 纯净暖白背景 (#FAFAFA) + 顶级骨白/纯白 Surface (#FFFFFF)
 * - 4px (0.25rem) 建筑感微圆角，克制且锋利
 * - 极轻微的自然漫反射阴影，层次由高反差排版与精准留白驱动
 * - 纯黑/深曜石 (Onyx #121214) 品牌色彩系统
 * - 严格的 10-Module 商业转化节拍
 */

import type { ThemeDefinition, ThemeTokens } from './types'

export const minimalTokens: ThemeTokens = {
  colors: {
    primary: '#121214',
    background: '#FAFAFA',
    surface: '#FFFFFF',
    text: '#121214',
    muted: '#71717A',
    border: '#E5E5E7',
    accent: '#27272A',
  },
  typography: {
    headingFont: 'var(--font-heading)',
    bodyFont: 'var(--font-sans)',
    headingWeight: 700,
    bodyWeight: 400,
  },
  radius: {
    card: '0.25rem',  // 4px - 锋利而优雅的商业排版形态
    button: '0.25rem',
    input: '0.25rem',
  },
  spacing: {
    section: '6rem',
    container: '80rem',
    grid: '1.5rem',
  },
  shadows: {
    card: '0 1px 3px 0 rgba(0, 0, 0, 0.03), 0 1px 2px -1px rgba(0, 0, 0, 0.02)',
    floating: '0 12px 30px -8px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
  },
  motion: {
    duration: '220ms',
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
}

export const minimalTheme: ThemeDefinition = {
  id: 'minimal',
  name: 'Minimal / 极简',
  description: '极致留白与精细排版，注重内容高效传达与高定质感',
  tokens: minimalTokens,
  variants: {
    navbar: 'default',
    productCard: 'flat',
  },
  templates: ['home', 'product', 'collection'],
}

