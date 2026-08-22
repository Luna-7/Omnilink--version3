export type ProductCategorySuggestion = {
  category: string
  path: string[]
  confidence: number
  matchedKeywords: string[]
}

export type CategoryRule = {
  category: string
  path: string[]
  keywords: string[]
}

export const CATEGORY_RULES: CategoryRule[] = [
  {
    category: '太阳镜',
    path: ['眼镜', '太阳镜'],
    keywords: [
      'sunglasses',
      'sun glasses',
      'polarized sunglasses',
      'wayfarer',
      'aviator',
      '太阳镜',
      '墨镜',
      '偏光镜',
      '偏光太阳镜',
    ],
  },
  {
    category: '光学眼镜',
    path: ['眼镜', '光学眼镜'],
    keywords: [
      'optical glasses',
      'prescription glasses',
      'eyewear',
      'glasses frame',
      '眼镜框',
      '镜框',
      '光学眼镜',
      '近视眼镜',
    ],
  },
  {
    category: '耳机',
    path: ['消费电子', '耳机'],
    keywords: [
      'headphone',
      'headphones',
      'earphone',
      'earphones',
      'earbuds',
      'wireless earbuds',
      'headset',
      'airpods',
      'wh-1000xm',
      'anc',
      '耳机',
      '蓝牙耳机',
      '无线耳机',
      '降噪耳机',
    ],
  },
  {
    category: '智能手表',
    path: ['智能穿戴', '智能手表'],
    keywords: [
      'smart watch',
      'smartwatch',
      'apple watch',
      'galaxy watch',
      'watch series',
      'smart band',
      '智能手表',
      '运动手表',
    ],
  },
  {
    category: '运动鞋',
    path: ['运动户外', '运动鞋'],
    keywords: [
      'running shoes',
      'sneakers',
      'sports shoes',
      'training shoes',
      'air max',
      '运动鞋',
      '跑鞋',
      '球鞋',
      '休闲鞋',
    ],
  },
]

export const COMMON_CATEGORY_OPTIONS = [
  '太阳镜',
  '光学眼镜',
  '眼镜',
  '耳机',
  '智能手表',
  '运动鞋',
  '消费电子',
  '智能家居',
  '数码周边',
  '智能穿戴',
  '运动户外',
  '生活美学',
  '其他',
]

function normalizeText(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

/**
 * Local deterministic rule engine for product category suggestion.
 * Fast, predictable, no API call required.
 */
export function suggestProductCategory(
  productName: string
): ProductCategorySuggestion | null {
  const normalized = normalizeText(productName)

  if (!normalized) {
    return null
  }

  const matches = CATEGORY_RULES
    .map((rule) => {
      const matchedKeywords = rule.keywords.filter((keyword) =>
        normalized.includes(keyword.toLowerCase())
      )

      return {
        rule,
        matchedKeywords,
        score: matchedKeywords.length,
      }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)

  const best = matches[0]

  if (!best) {
    return null
  }

  return {
    category: best.rule.category,
    path: best.rule.path,
    confidence: Math.min(
      0.95,
      0.65 + best.score * 0.1
    ),
    matchedKeywords: best.matchedKeywords,
  }
}
