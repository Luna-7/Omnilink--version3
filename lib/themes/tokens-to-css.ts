/**
 * Omnilink Theme System — Token → CSS Variables 编译器（纯函数）。
 *
 * 输入一份 ThemeTokens，输出形如：
 *
 *   [data-theme="electric-violet"] {
 *     --th-color-primary: #8B5CF6;
 *     --th-font-heading: var(--font-heading);
 *     --th-radius-card: 0.5rem;
 *     ...
 *   }
 *
 * 供服务端 ThemeRoot 内联进 <style>，组件用 var(--th-*) 消费。
 * 无运行时副作用、无依赖、无客户端 JS。
 */

import type { ThemeTokens } from './types'

/** 统一 CSS 变量命名空间，与 dashboard 令牌（--color-iris / --accent-* 等）隔离。 */
export const THEME_VAR_PREFIX = '--th'

/** token 顶层分组 → CSS 变量段名。 */
const GROUP_ALIAS: Record<string, string> = {
  colors: 'color',
  typography: 'font',
  radius: 'radius',
  spacing: 'spacing',
  shadows: 'shadow',
  motion: 'motion',
}

/**
 * 个别叶子路径的完整别名（优先级高于 GROUP_ALIAS 推导）。
 * 让排版变量保持简短语义：`--th-font-heading` 而非 `--th-font-heading-font`。
 */
const PATH_ALIAS: Record<string, string> = {
  'typography.headingFont': 'font-heading',
  'typography.bodyFont': 'font-body',
}

/** themeId 将拼进 CSS 选择器，必须严格受限（它可能来自 DB 的商家配置）。 */
const THEME_ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/

function toKebabCase(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

/** 把嵌套 token 对象拍平成 [变量路径, 值] 列表。 */
function flattenTokens(
  node: Record<string, unknown>,
  path: string[] = []
): Array<readonly [string, string]> {
  const out: Array<readonly [string, string]> = []

  for (const [key, raw] of Object.entries(node)) {
    const nextPath = [...path, key]

    if (raw !== null && typeof raw === 'object') {
      out.push(...flattenTokens(raw as Record<string, unknown>, nextPath))
      continue
    }

    const joined = nextPath.join('.')
    const varPath =
      PATH_ALIAS[joined] ??
      [GROUP_ALIAS[nextPath[0]] ?? toKebabCase(nextPath[0]), ...nextPath.slice(1).map(toKebabCase)].join('-')

    out.push([varPath, String(raw)] as const)
  }

  return out
}

/**
 * 编译 ThemeTokens 为 `[data-theme="<id>"] { ... }` 作用域 CSS 字符串。
 * @throws 当 themeId 含非法字符时。
 */
export function tokensToCssVars(themeId: string, tokens: ThemeTokens): string {
  if (!THEME_ID_PATTERN.test(themeId)) {
    throw new Error(`tokensToCssVars: invalid themeId "${themeId}"`)
  }

  const body = flattenTokens(tokens as unknown as Record<string, unknown>)
    .map(([path, value]) => `  ${THEME_VAR_PREFIX}-${path}: ${value};`)
    .join('\n')

  return `[data-theme="${themeId}"] {\n${body}\n}`
}
