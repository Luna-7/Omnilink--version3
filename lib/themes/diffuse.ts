/**
 * Diffuse (弥散氛围) — 柔和弥散渐变 + 弥散光影 + 温暖空间包裹感。
 *
 * 视觉特征：
 * - 暖夜紫黑背景 (#100C1B)
 * - 弥散紫罗兰 Surface (#1B152B)
 * - 柔和瑰粉 (Rose-Pink) 品牌氛围
 * - 20px 大圆角
 */

import type { ThemeDefinition, ThemeTokens } from './types'

export const diffuseTokens: ThemeTokens = {
  colors: {
    primary: '#EC4899',
    background: '#100C1B',
    surface: '#1B152B',
    text: '#FDF2F8',
    muted: '#A78BFA',
    border: 'rgba(236, 72, 153, 0.18)',
    accent: '#F472B6',
  },
  typography: {
    headingFont: 'var(--font-heading)',
    bodyFont: 'var(--font-sans)',
    headingWeight: 700,
    bodyWeight: 400,
  },
  radius: {
    card: '1.25rem',   // 20px
    button: '1rem',      // 16px
    input: '1rem',
  },
  spacing: {
    section: '6rem',
    container: '80rem',
    grid: '1.5rem',
  },
  shadows: {
    card: '0 10px 40px -10px rgba(236, 72, 153, 0.22)',
    floating: '0 20px 50px -12px rgba(168, 85, 247, 0.35)',
  },
  motion: {
    duration: '250ms',
    easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  },
}

export const diffuseTheme: ThemeDefinition = {
  id: 'diffuse',
  name: 'Diffuse / 弥散',
  description: '柔和弥散渐变、微光氛围场与大圆角舒适包裹，具空间张力',
  tokens: diffuseTokens,
  variants: {
    navbar: 'floating',
    productCard: 'acrylic',
  },
  templates: ['home', 'product', 'collection'],
}
