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
    // 品牌主色：HP Electric Blue (#024ad8)。仅用于 CTA / active / accent。
    primary: '#024ad8',
    // White-first 画布背景。
    background: '#FFFFFF',
    // 灰色卡片分层 (Cloud #f7f7f7)。
    surface: '#F7F7F7',
    text: '#1A1A1A',
    muted: '#636363',
    border: '#E8E8E8',
    // 深蓝 Deep Navy (#0e3191)，用于 hover / 强调态。
    accent: '#0e3191',
  },
  typography: {
    // 复用 app/layout.tsx 注入的 next/font 变量（Plus Jakarta Sans / Inter）。
    headingFont: 'var(--font-heading)',
    bodyFont: 'var(--font-sans)',
    headingWeight: 500,
    bodyWeight: 400,
  },
  radius: {
    // 卡片圆角微调收紧至 8px (0.5rem)。按钮 4px (0.25rem)。
    card: '0.5rem',   // 8px
    button: '0.25rem', // 4px
    input: '0.25rem',  // 4px
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
