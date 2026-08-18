/**
 * Theme Registry — 主题的静态注册表。
 *
 * 安全约束：themeId 未来来自数据库（store_settings.theme_config），
 * 因此这里只允许静态查表 —— 禁止 eval / 动态 import / 路径拼接。
 * 未知 id 一律安全回退到默认主题。
 */

import type { ThemeDefinition } from './types'
import { minimalTheme } from './minimal'
import { glassTheme } from './glass'
import { diffuseTheme } from './diffuse'
import { techTheme } from './tech'
import { electricVioletTheme } from './electric-violet'

/** 当前默认视觉风格主题。 */
export const DEFAULT_THEME_ID = 'minimal'

/** 4 套核心 Style Library 主题及 Legacy 兼容别名。 */
const themes: Readonly<Record<string, ThemeDefinition>> = {
  // 4 核心风格
  'minimal': minimalTheme,
  'glass': glassTheme,
  'diffuse': diffuseTheme,
  'tech': techTheme,

  // Legacy & Alias 兼容映射（防旧数据库记录失效）
  'electric-violet': electricVioletTheme,
  'template-minimal-tech': techTheme,
  'template-audio-luxe': glassTheme,
  'template-nordic-studio': minimalTheme,
  'template-future-cyber': diffuseTheme,
}

/** 导出所有官方 Style 列表 */
export const ALL_STYLES: ThemeDefinition[] = [
  minimalTheme,
  glassTheme,
  diffuseTheme,
  techTheme,
]

/**
 * 按 id 查主题。未知 / 空 / 原型链键（如 "constructor"）均回退默认主题。
 */
export function getTheme(id: string | null | undefined): ThemeDefinition {
  if (id && Object.prototype.hasOwnProperty.call(themes, id)) {
    return themes[id]
  }
  return themes[DEFAULT_THEME_ID]
}
