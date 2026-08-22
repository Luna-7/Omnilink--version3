export interface AttributeTemplateField {
  key: string
  nameZh: string
  nameEn: string
  type: 'text' | 'number' | 'boolean' | 'select'
  unit?: string
  options?: string[]
  placeholderZh?: string
  placeholderEn?: string
}

export interface ProductCategoryTemplate {
  id: string
  category: string
  titleZh: string
  titleEn: string
  descriptionZh?: string
  descriptionEn?: string
  fields: AttributeTemplateField[]
}

export const PRODUCT_CATEGORY_TEMPLATES: Record<string, ProductCategoryTemplate> = {
  '太阳镜': {
    id: 'eyewear-sunglasses-v1',
    category: '太阳镜',
    titleZh: '太阳镜规格',
    titleEn: 'Sunglasses Specifications',
    descriptionZh: '针对防紫外线、镜片材质与框型人体工学的标准规格',
    descriptionEn: 'Standard specs for UV protection, lens materials, and frame ergonomics',
    fields: [
      {
        key: 'frame_material',
        nameZh: '镜框材质',
        nameEn: 'Frame Material',
        type: 'text',
        placeholderZh: '如: 钛合金 / TR90 / 醋酸纤维',
        placeholderEn: 'e.g. Titanium / TR90 / Acetate',
      },
      {
        key: 'lens_material',
        nameZh: '镜片材质',
        nameEn: 'Lens Material',
        type: 'text',
        placeholderZh: '如: TAC / 尼龙偏光 / PC 树脂',
        placeholderEn: 'e.g. TAC / Nylon / PC Resin',
      },
      {
        key: 'lens_type',
        nameZh: '镜片类型',
        nameEn: 'Lens Type',
        type: 'select',
        options: ['Polarized', 'Non-polarized', 'Photochromic'],
      },
      {
        key: 'uv_protection',
        nameZh: 'UV 防护',
        nameEn: 'UV Protection',
        type: 'text',
        placeholderZh: '如: UV400 / 100% UVA/UVB',
        placeholderEn: 'e.g. UV400 / 100% UVA/UVB',
      },
      {
        key: 'temple_length',
        nameZh: '镜腿长度',
        nameEn: 'Temple Length',
        type: 'number',
        unit: 'mm',
        placeholderZh: '如: 145',
        placeholderEn: 'e.g. 145',
      },
      {
        key: 'frame_width',
        nameZh: '镜框总宽',
        nameEn: 'Frame Width',
        type: 'number',
        unit: 'mm',
        placeholderZh: '如: 142',
        placeholderEn: 'e.g. 142',
      },
    ],
  },

  '光学眼镜': {
    id: 'eyewear-optical-v1',
    category: '光学眼镜',
    titleZh: '光学眼镜规格',
    titleEn: 'Optical Eyewear Specifications',
    descriptionZh: '针对视力矫正、镜架结构与面部适配的标准规格',
    descriptionEn: 'Standard specs for optical frames, prescription lenses, and face fit',
    fields: [
      {
        key: 'frame_material',
        nameZh: '镜框材质',
        nameEn: 'Frame Material',
        type: 'text',
        placeholderZh: '如: β钛 / 记忆金属 / 纯钛',
        placeholderEn: 'e.g. Beta Titanium / Memory Metal',
      },
      {
        key: 'frame_type',
        nameZh: '镜框类型',
        nameEn: 'Frame Type',
        type: 'select',
        options: ['Full Rim', 'Half Rim', 'Rimless'],
      },
      {
        key: 'bridge_width',
        nameZh: '鼻梁宽度',
        nameEn: 'Bridge Width',
        type: 'number',
        unit: 'mm',
        placeholderZh: '如: 18',
        placeholderEn: 'e.g. 18',
      },
      {
        key: 'temple_length',
        nameZh: '镜腿长度',
        nameEn: 'Temple Length',
        type: 'number',
        unit: 'mm',
        placeholderZh: '如: 140',
        placeholderEn: 'e.g. 140',
      },
    ],
  },

  '耳机': {
    id: 'audio-headphones-v1',
    category: '耳机',
    titleZh: '耳机规格',
    titleEn: 'Headphone Specifications',
    descriptionZh: '针对声学单元、降噪性能与无线续航的标准声学规格',
    descriptionEn: 'Acoustic drivers, noise cancellation, and battery performance',
    fields: [
      {
        key: 'driver_size',
        nameZh: '发声单元',
        nameEn: 'Driver Size',
        type: 'text',
        placeholderZh: '如: 40mm 动圈 / 平面振膜',
        placeholderEn: 'e.g. 40mm Dynamic / Planar Magnetic',
      },
      {
        key: 'frequency_response',
        nameZh: '频响范围',
        nameEn: 'Frequency Response',
        type: 'text',
        placeholderZh: '如: 20Hz - 40,000Hz (Hi-Res)',
        placeholderEn: 'e.g. 20Hz - 40kHz',
      },
      {
        key: 'noise_cancellation',
        nameZh: '主动降噪',
        nameEn: 'Noise Cancellation',
        type: 'boolean',
      },
      {
        key: 'battery_life',
        nameZh: '续航时间',
        nameEn: 'Battery Life',
        type: 'number',
        unit: 'hours',
        placeholderZh: '如: 30',
        placeholderEn: 'e.g. 30',
      },
      {
        key: 'bluetooth_version',
        nameZh: '蓝牙版本',
        nameEn: 'Bluetooth Version',
        type: 'text',
        placeholderZh: '如: Bluetooth 5.4 / LDAC',
        placeholderEn: 'e.g. BT 5.4 / LDAC',
      },
    ],
  },

  '智能手表': {
    id: 'wearable-smartwatch-v1',
    category: '智能手表',
    titleZh: '智能手表规格',
    titleEn: 'Smartwatch Specifications',
    descriptionZh: '针对穿戴屏幕、健康传感与防护等级的标准规格',
    descriptionEn: 'Display size, health sensors, and ingress protection rating',
    fields: [
      {
        key: 'display_size',
        nameZh: '屏幕尺寸',
        nameEn: 'Display Size',
        type: 'number',
        unit: 'inch',
        placeholderZh: '如: 1.43',
        placeholderEn: 'e.g. 1.43',
      },
      {
        key: 'battery_life',
        nameZh: '续航时间',
        nameEn: 'Battery Life',
        type: 'text',
        placeholderZh: '如: 7天常规 / 14天省电',
        placeholderEn: 'e.g. Up to 7 days',
      },
      {
        key: 'water_resistance',
        nameZh: '防水等级',
        nameEn: 'Water Resistance',
        type: 'text',
        placeholderZh: '如: 5ATM / IP68 游泳级防水',
        placeholderEn: 'e.g. 5ATM / IP68',
      },
      {
        key: 'sensor_types',
        nameZh: '传感器配置',
        nameEn: 'Sensors',
        type: 'text',
        placeholderZh: '如: 心率 / 血氧 / GPS / ECG',
        placeholderEn: 'e.g. Heart rate, SpO2, Dual GPS',
      },
    ],
  },

  '运动鞋': {
    id: 'sports-shoes-v1',
    category: '运动鞋',
    titleZh: '运动鞋规格',
    titleEn: 'Sports Shoes Specifications',
    descriptionZh: '针对鞋面透气、中底缓震与运动定位的专业规格',
    descriptionEn: 'Upper materials, cushioning midsole, and athletic application',
    fields: [
      {
        key: 'upper_material',
        nameZh: '鞋面材质',
        nameEn: 'Upper Material',
        type: 'text',
        placeholderZh: '如: 透气网布 / 飞织 / 针织面料',
        placeholderEn: 'e.g. Engineered Mesh / Flyknit',
      },
      {
        key: 'sole_material',
        nameZh: '鞋底与中底材质',
        nameEn: 'Sole Material',
        type: 'text',
        placeholderZh: '如: EVA 超临界发泡 + 耐磨橡胶',
        placeholderEn: 'e.g. Supercritical EVA + Rubber Outsole',
      },
      {
        key: 'closure_type',
        nameZh: '闭合方式',
        nameEn: 'Closure Type',
        type: 'select',
        options: ['Lace-up', 'Slip-on', 'Velcro', 'BOA Dial'],
      },
      {
        key: 'shoe_type',
        nameZh: '鞋款定位',
        nameEn: 'Shoe Application',
        type: 'select',
        options: ['Running', 'Basketball', 'Training', 'Casual'],
      },
    ],
  },
}

/**
 * Match a category name to a template.
 * Matches exact keys or category synonyms.
 */
export function getCategoryTemplate(category?: string | null): ProductCategoryTemplate | null {
  if (!category) return null

  const trimmed = category.trim()
  if (!trimmed) return null

  // Direct key lookup
  if (PRODUCT_CATEGORY_TEMPLATES[trimmed]) {
    return PRODUCT_CATEGORY_TEMPLATES[trimmed]
  }

  const lower = trimmed.toLowerCase()

  // Fuzzy matching rules for synonyms
  if (
    lower.includes('太阳镜') ||
    lower.includes('墨镜') ||
    lower.includes('偏光镜') ||
    lower.includes('sunglass')
  ) {
    return PRODUCT_CATEGORY_TEMPLATES['太阳镜']
  }

  if (
    lower.includes('光学眼镜') ||
    lower.includes('近视') ||
    lower.includes('眼镜框') ||
    lower.includes('optical') ||
    (lower.includes('眼镜') && !lower.includes('智能'))
  ) {
    return PRODUCT_CATEGORY_TEMPLATES['光学眼镜']
  }

  if (
    lower.includes('耳机') ||
    lower.includes('headphone') ||
    lower.includes('earphone') ||
    lower.includes('earbud') ||
    lower.includes('headset') ||
    lower.includes('音频')
  ) {
    return PRODUCT_CATEGORY_TEMPLATES['耳机']
  }

  if (
    lower.includes('智能手表') ||
    lower.includes('运动手表') ||
    lower.includes('手环') ||
    lower.includes('smartwatch') ||
    lower.includes('smart watch') ||
    lower.includes('watch')
  ) {
    return PRODUCT_CATEGORY_TEMPLATES['智能手表']
  }

  if (
    lower.includes('运动鞋') ||
    lower.includes('跑鞋') ||
    lower.includes('球鞋') ||
    lower.includes('sneaker') ||
    lower.includes('running shoes') ||
    lower.includes('shoes')
  ) {
    return PRODUCT_CATEGORY_TEMPLATES['运动鞋']
  }

  return null
}
