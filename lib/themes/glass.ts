/**
 * Glass (玻璃拟态) — 半透明通透质感 + 柔和模糊反射 + 层次浮卡。
 *
 * 视觉特征：
 * - 深黑背景 (#0C0E14)
 * - 半透明晶莹 Surface (rgba(255,255,255,0.06))
 * - 玻璃描边 (rgba(255,255,255,0.12))
 * - 靛蓝 (Indigo) 品牌光效
 * - 16px 圆角
 */

import type { ThemeDefinition, ThemeTokens } from './types'

export const glassTokens: ThemeTokens = {
  colors: {
    primary: '#6366F1',
    background: '#0C0E14',
    surface: 'rgba(255, 255, 255, 0.05)',
    text: '#F3F4F6',
    muted: '#9CA3AF',
    border: 'rgba(255, 255, 255, 0.12)',
    accent: '#818CF8',
  },
  typography: {
    headingFont: 'var(--font-heading)',
    bodyFont: 'var(--font-sans)',
    headingWeight: 700,
    bodyWeight: 400,
  },
  radius: {
    card: '1rem',      // 16px
    button: '0.75rem',  // 12px
    input: '0.75rem',
  },
  spacing: {
    section: '6rem',
    container: '80rem',
    grid: '1.5rem',
  },
  shadows: {
    card: '0 8px 32px 0 rgba(0, 0, 0, 0.36)',
    floating: '0 12px 40px 0 rgba(99, 102, 241, 0.28)',
  },
  motion: {
    duration: '220ms',
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
}

export const glassTheme: ThemeDefinition = {
  id: 'glass',
  name: 'Glass / 玻璃',
  description: '半透明通透质感、柔和模糊反射与多层卡片悬浮，呈现拟玻美感',
  tokens: glassTokens,
  variants: {
    navbar: 'floating',
    productCard: 'acrylic',
  },
  templates: ['home', 'product', 'collection'],
}
