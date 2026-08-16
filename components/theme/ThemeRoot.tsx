/**
 * ThemeRoot —— Theme → CSS Variables → React Tree 的最小渲染闭环。
 *
 * 职责仅限：主题解析 + CSS Variable 注入 + Theme Scope。
 *
 *   themeId
 *     → getTheme(themeId)            // 静态注册表，未知 id 安全回退默认主题
 *     → tokensToCssVars(id, tokens)  // 编译为 [data-theme="<id>"] { --th-*: … }
 *     → <style data-theme-css>       // SSR 内联，零客户端 JS
 *     → <div data-theme={id}>        // 作用域边界，children 原样渲染
 *
 * Server Component：不加 "use client"，无 state/effect/context，无 window/document。
 * 不负责取数、不选模板、不做页面布局（那些属于 service / template / route 层）。
 *
 * 作用域刻意不用 :root —— dashboard/login/onboarding 等非 storefront 页面
 * 不受 storefront 主题变量污染。
 */

import type { ReactNode } from 'react'
import { getTheme } from '@/lib/themes/registry'
import { tokensToCssVars } from '@/lib/themes/tokens-to-css'

type ThemeRootProps = {
  /** 主题 id（未来来自 store_settings.theme_config.theme_id）；空/未知回退默认主题。 */
  themeId?: string | null
  children: ReactNode
}

export default function ThemeRoot({ themeId, children }: ThemeRootProps) {
  const theme = getTheme(themeId)
  const css = tokensToCssVars(theme.id, theme.tokens)

  return (
    <>
      {/* CSS 来自代码内静态 ThemeTokens，且 themeId 已经 tokensToCssVars 校验。 */}
      <style data-theme-css dangerouslySetInnerHTML={{ __html: css }} />
      <div data-theme={theme.id}>{children}</div>
    </>
  )
}
