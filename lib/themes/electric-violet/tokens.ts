/**
 * Electric Violet — Omnilink 第一个官方 storefront 主题的令牌值。
 *
 * 视觉方向：极简白底（white-first）+ Electric Violet accent +
 * 悬浮亚克力卡片 + 克制阴影 + 高信息密度。
 *
 * 只定义值；类型来自 lib/themes/types.ts（#39）。
 * 字体一律引用 layout.tsx 已注入的变量，不新建字体体系。
 */

import type { ThemeTokens } from '../types'

export const electricVioletTokens: ThemeTokens = {
  colors: {
    // 品牌主色：Electric Violet。仅用于 CTA / active / accent，不大面积铺色。
    primary: '#8B5CF6',
    // White-first 背景。
    background: '#FFFFFF',
    // 极轻微冷白 surface（亚克力浮卡的底色）。
    surface: '#FAFAFC',
    text: '#111827',
    muted: '#6B7280',
    border: 'rgba(17,24,39,0.08)',
    // 深一档紫，用于 hover / 强调态。
    accent: '#7C3AED',
  },
  typography: {
    // 复用 app/layout.tsx 注入的 next/font 变量（Plus Jakarta Sans / Inter）。
    headingFont: 'var(--font-heading)',
    bodyFont: 'var(--font-sans)',
    headingWeight: 600,
    bodyWeight: 400,
  },
  radius: {
    // 全主题统一 8px。
    card: '0.5rem',
    button: '0.5rem',
    input: '0.5rem',
  },
  spacing: {
    // premium SaaS 留白。
    section: '6rem',
    container: '80rem',
    grid: '1.5rem',
  },
  shadows: {
    // 受控阴影：卡片近乎无影，浮卡带一点品牌色深度。
    card: '0 1px 2px rgba(17,24,39,0.05)',
    floating: '0 12px 32px rgba(139,92,246,0.12)',
  },
  motion: {
    duration: '200ms',
    easing: 'cubic-bezier(0.4,0,0.2,1)',
  },
}
