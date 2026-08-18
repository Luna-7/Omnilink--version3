/**
 * Canonical Template Schema Validator
 *
 * 验证规则：
 * 1. 结构完整：含有 version, theme, sections, meta
 * 2. Theme合法：theme.themeId 属于 ['minimal', 'glass', 'diffuse', 'tech']
 * 3. 模版模块数量：sections 数量必须严格等于 10
 * 4. Canonical 10-Module 顺序严格对齐：
 *    [0]: header
 *    [1]: hero
 *    [2]: featured_products
 *    [3]: collection
 *    [4]: image_text
 *    [5]: rich_text
 *    [6]: testimonials
 *    [7]: faq
 *    [8]: cta
 *    [9]: footer
 * 5. 安全检查：绝不包含 <script>、<iframe> 或内联 JavaScript
 */

import type { SectionType } from './schema'

export const CANONICAL_SECTION_ORDER: readonly SectionType[] = [
  'header',
  'hero',
  'featured_products',
  'collection',
  'image_text',
  'rich_text',
  'testimonials',
  'faq',
  'cta',
  'footer',
]

export const VALID_THEME_IDS = ['minimal', 'glass', 'diffuse', 'tech'] as const

export function validateCanonicalTemplateSchema(schema: unknown): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
    return { valid: false, errors: ['Schema is not a valid JSON object'] }
  }

  const obj = schema as Record<string, unknown>

  // 1. Version & Meta check
  if (typeof obj.version !== 'string') {
    errors.push('Missing or invalid "version" string field')
  }

  if (!obj.meta || typeof obj.meta !== 'object') {
    errors.push('Missing or invalid "meta" object field')
  }

  // 2. Theme check
  if (!obj.theme || typeof obj.theme !== 'object') {
    errors.push('Missing or invalid "theme" object field')
  } else {
    const themeObj = obj.theme as Record<string, unknown>
    if (
      typeof themeObj.themeId !== 'string' ||
      !VALID_THEME_IDS.includes(themeObj.themeId as (typeof VALID_THEME_IDS)[number])
    ) {
      errors.push(
        `Invalid themeId "${String(themeObj.themeId)}". Must be one of: ${VALID_THEME_IDS.join(
          ', '
        )}`
      )
    }
  }

  // 3. Sections check
  if (!Array.isArray(obj.sections)) {
    errors.push('Missing or invalid "sections" array')
  } else {
    if (obj.sections.length !== 10) {
      errors.push(
        `Sections count must be exactly 10, but got ${obj.sections.length}`
      )
    } else {
      obj.sections.forEach((sec: unknown, idx: number) => {
        if (!sec || typeof sec !== 'object') {
          errors.push(`Section at index ${idx} is not an object`)
          return
        }
        const s = sec as Record<string, unknown>
        const expectedType = CANONICAL_SECTION_ORDER[idx]
        if (s.type !== expectedType) {
          errors.push(
            `Section at index ${idx} type mismatch. Expected "${expectedType}", got "${String(
              s.type
            )}"`
          )
        }
        if (typeof s.id !== 'string' || !s.id.trim()) {
          errors.push(`Section at index ${idx} missing valid "id"`)
        }
      })
    }
  }

  // 4. Security check against unsafe HTML / Scripts
  const jsonString = JSON.stringify(obj).toLowerCase()
  if (
    jsonString.includes('<script') ||
    jsonString.includes('javascript:') ||
    jsonString.includes('<iframe') ||
    jsonString.includes('onload=') ||
    jsonString.includes('onerror=')
  ) {
    errors.push('Schema contains potentially malicious script or HTML code')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
