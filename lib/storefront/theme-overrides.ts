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

/** 半径允许范围（防脏数据产生异常 CSS）。 */
const MIN_RADIUS = 0
const MAX_RADIUS = 64

export function storefrontThemeOverrides(
  theme: StorefrontThemeConfig
): Record<string, string> {
  const vars: Record<string, string> = {}

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

  return vars
}
