import type { ConditionalRule } from './conditional-rules'

export const CATEGORY_CONDITIONAL_RULES: Record<string, ConditionalRule[]> = {
  '太阳镜': [
    {
      id: 'sunglasses-polarized-uv-required',
      when: {
        fieldKey: 'lens_type',
        operator: 'equals',
        value: 'Polarized',
      },
      then: {
        fieldKey: 'uv_protection',
        effect: 'required',
      },
    },
  ],

  '光学眼镜': [],

  '耳机': [],

  '智能手表': [],

  '运动鞋': [
    {
      id: 'running-shoes-sole-required',
      when: {
        fieldKey: 'shoe_type',
        operator: 'equals',
        value: 'Running',
      },
      then: {
        fieldKey: 'sole_material',
        effect: 'required',
      },
    },
  ],
}

export function getCategoryConditionalRules(
  category?: string | null,
): ConditionalRule[] {
  if (!category) {
    return []
  }

  return CATEGORY_CONDITIONAL_RULES[category.trim()] ?? []
}
