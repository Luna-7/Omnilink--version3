/**
 * Theme Registry — 主题的静态注册表。
 *
 * 安全约束：themeId 未来来自数据库（store_settings.theme_config），
 * 因此这里只允许静态查表 —— 禁止 eval / 动态 import / 路径拼接。
 * 未知 id 一律安全回退到默认主题。
 */

import type { ThemeDefinition } from './types'
import { electricVioletTheme } from './electric-violet'

/** 当前默认（也是唯一）主题。 */
export const DEFAULT_THEME_ID = 'electric-violet'

const themes: Readonly<Record<string, ThemeDefinition>> = {
  'electric-violet': electricVioletTheme,
}

/**
 * 按 id 查主题。未知 / 空 / 原型链键（如 "constructor"）均回退默认主题。
 */
export function getTheme(id: string | null | undefined): ThemeDefinition {
  if (id && Object.prototype.hasOwnProperty.call(themes, id)) {
    return themes[id]
  }
  return themes[DEFAULT_THEME_ID]
}
