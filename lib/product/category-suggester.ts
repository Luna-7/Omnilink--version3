export type ProductCategorySuggestion = {
  categoryId?: string
  category: string
  path: string[]
  confidence: number
  matchedKeywords: string[]
}

export type CategoryRule = {
  categoryId?: string
  category: string
  path: string[]
  keywords: string[]
}

// Build rules dynamically from SEED_CATEGORIES + explicit prioritized rules
export const CATEGORY_RULES: CategoryRule[] = [
  {
    categoryId: 'cat-eyewear-sunglasses',
    category: '太阳镜',
    path: ['珠宝配饰与眼镜', '太阳镜'],
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
      '驾驶镜',
      '防紫外线眼镜',
    ],
  },
  {
    categoryId: 'cat-eyewear-optical',
    category: '光学眼镜与镜框',
    path: ['珠宝配饰与眼镜', '光学眼镜与镜框'],
    keywords: [
      'optical glasses',
      'prescription glasses',
      'eyewear',
      'glasses frame',
      '眼镜框',
      '镜框',
      '光学眼镜',
      '近视眼镜',
      '防蓝光眼镜',
      '纯钛眼镜',
      '配镜',
    ],
  },
  {
    categoryId: 'cat-electronics-audio',
    category: '影音娱乐',
    path: ['数码家电', '影音娱乐'],
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
      '音箱',
      '回音壁',
    ],
  },
  {
    categoryId: 'cat-electronics-wearables',
    category: '智能穿戴',
    path: ['数码家电', '智能穿戴'],
    keywords: [
      'smart watch',
      'smartwatch',
      'apple watch',
      'galaxy watch',
      'watch series',
      'smart band',
      '智能手表',
      '运动手表',
      '智能手环',
      '手环',
      'VR眼镜',
    ],
  },
  {
    categoryId: 'cat-sports-shoes',
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
      '板鞋',
      '慢跑鞋',
      '篮球鞋',
    ],
  },
  {
    categoryId: 'cat-apparel-women',
    category: '女装',
    path: ['服饰鞋包', '女装'],
    keywords: ['连衣裙', '半身裙', '女装', '小香风', '雪纺衫', '吊带裙', '女士T恤'],
  },
  {
    categoryId: 'cat-apparel-men',
    category: '男装',
    path: ['服饰鞋包', '男装'],
    keywords: ['男士夹克', '西服', 'POLO衫', '男装', '工装裤', '男士卫衣'],
  },
  {
    categoryId: 'cat-apparel-bags',
    category: '箱包',
    path: ['服饰鞋包', '箱包'],
    keywords: ['双肩包', '单肩包', '手提包', '行李箱', '斜挎包', '托特包', '背包'],
  },
  {
    categoryId: 'cat-beauty-skincare',
    category: '面部护肤',
    path: ['美妆个护', '面部护肤'],
    keywords: ['精华液', '面霜', '乳液', '爽肤水', '面膜', '防晒霜', '眼霜', '洁面乳'],
  },
  {
    categoryId: 'cat-food-snacks',
    category: '休闲零食',
    path: ['食品饮料', '休闲零食'],
    keywords: ['坚果', '巧克力', '薯片', '肉脯', '零食', '饼干', '糖果'],
  },
  {
    categoryId: 'cat-pet-food',
    category: '宠物主粮',
    path: ['宠物生活', '宠物主粮'],
    keywords: ['猫粮', '狗粮', '冻干', '主食罐', '幼猫粮'],
  },
]

export const COMMON_CATEGORY_OPTIONS = [
  '太阳镜',
  '光学眼镜与镜框',
  '影音娱乐',
  '智能穿戴',
  '运动鞋',
  '女装',
  '男装',
  '箱包',
  '手机数码',
  '电脑办公',
  '面部护肤',
  '彩妆香氛',
  '户外露营',
  '休闲零食',
  '宠物主粮',
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
    categoryId: best.rule.categoryId,
    category: best.rule.category,
    path: best.rule.path,
    confidence: Math.min(
      0.95,
      0.65 + best.score * 0.1
    ),
    matchedKeywords: best.matchedKeywords,
  }
}
