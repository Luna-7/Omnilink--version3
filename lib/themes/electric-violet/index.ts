/**
 * Electric Violet — ThemeDefinition 组装。
 * id 同时用作 `[data-theme="electric-violet"]` 作用域选择器。
 */

import type { ThemeDefinition } from '../types'
import { electricVioletTokens } from './tokens'

export const electricVioletTheme: ThemeDefinition = {
  id: 'electric-violet',
  name: 'Electric Violet',
  description:
    'Omnilink 首个官方 storefront 主题：极简白底 + Electric Violet accent + 悬浮亚克力卡片。',
  tokens: electricVioletTokens,
  variants: {
    navbar: 'floating',
    productCard: 'acrylic',
  },
  templates: ['home', 'product', 'collection'],
}
