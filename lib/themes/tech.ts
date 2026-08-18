/**
 * Tech (电光科技) — 高反差黑底 + 电光霓虹 + 极客硬朗切割。
 *
 * 视觉特征：
 * - 曜石黑背景 (#08090C)
 * - 硬朗科技 Surface (#101218)
 * - 电光青 (#00F0FF) / 电光紫 (#8B5CF6) 霓虹点缀
 * - 4px 硬朗小圆角
 */

import type { ThemeDefinition, ThemeTokens } from './types'

export const techTokens: ThemeTokens = {
  colors: {
    primary: '#00F0FF',
    background: '#08090C',
    surface: '#101218',
    text: '#F0F6FC',
    muted: '#8B949E',
    border: 'rgba(0, 240, 255, 0.22)',
    accent: '#8B5CF6',
  },
  typography: {
    headingFont: 'var(--font-heading)',
    bodyFont: 'var(--font-sans)',
    headingWeight: 800,
    bodyWeight: 400,
  },
  radius: {
    card: '0.25rem',    // 4px
    button: '0.25rem',
    input: '0.25rem',
  },
  spacing: {
    section: '6rem',
    container: '80rem',
    grid: '1.5rem',
  },
  shadows: {
    card: '0 0 15px -3px rgba(0, 240, 255, 0.15)',
    floating: '0 0 30px 0 rgba(0, 240, 255, 0.3)',
  },
  motion: {
    duration: '150ms',
    easing: 'cubic-bezier(0, 0, 0.2, 1)',
  },
}

export const techTheme: ThemeDefinition = {
  id: 'tech',
  name: 'Tech / 科技',
  description: '高反差曜黑底色、电光青/紫霓虹线条与硬朗方正轮廓，适配先锋极客',
  tokens: techTokens,
  variants: {
    navbar: 'default',
    productCard: 'flat',
  },
  templates: ['home', 'product', 'collection'],
}
