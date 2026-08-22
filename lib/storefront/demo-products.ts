import { DEMO_PRODUCTS, type DemoProduct } from '@/lib/products/demo-data'
import type { StorefrontProduct } from './types'

const DEMO_GALLERY_MAP: Record<string, string[]> = {
  'prod-101': [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
  ],
  'prod-102': [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80',
  ],
  'prod-103': [
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80',
  ],
  'prod-104': [
    'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=800&auto=format&fit=crop&q=80',
  ],
  'prod-105': [
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80',
  ],
}

export function demoProductToStorefront(
  p: DemoProduct,
  lang: 'zh' | 'en' = 'zh',
  storeSlug = 'omnilink-flagship'
): StorefrontProduct {
  const isZh = lang === 'zh'
  const gallery = DEMO_GALLERY_MAP[p.id] || (p.image_url ? [p.image_url] : [])

  const rawAttrs = p.semantic_data?.attributes || {}
  const attributes: Record<string, string> = {}
  for (const [k, v] of Object.entries(rawAttrs)) {
    if (k === 'mcp_agent_ready' || k === 'gan_chip' || k === 'ecg_certified') continue
    const formattedKey = isZh
      ? k === 'noise_reduction_depth'
        ? '降噪深度'
        : k === 'battery_life_hours'
        ? '续航时间'
        : k === 'bluetooth_version'
        ? '蓝牙版本'
        : k === 'driver_size_mm'
        ? '发声单元'
        : k === 'weight_g' || k === 'total_weight_g'
        ? '机身重量'
        : k === 'casing_material'
        ? '机身材质'
        : k === 'display_type'
        ? '屏幕规格'
        : k === 'water_resistance'
        ? '防水等级'
        : k === 'battery_life_days'
        ? '续航天数'
        : k === 'fov_degrees'
        ? '视场角'
        : k === 'display_resolution'
        ? '显示分辨率'
        : k === 'live_translation_languages'
        ? '同传支持'
        : k === 'max_power_output_w'
        ? '最大输出功率'
        : k === 'magnetic_standard'
        ? '磁吸标准'
        : k === 'device_slots'
        ? '支持设备数'
        : k
      : k
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase())

    attributes[formattedKey] = String(v)
  }

  return {
    id: p.id,
    name: isZh ? p.name : p.name_en || p.name,
    slug: p.id,
    price: p.price,
    currency: p.currency || 'CNY',
    imageUrl: p.image_url,
    images: gallery,
    href: `/store/${storeSlug}/products/${p.id}`,
    description: isZh ? p.description : p.description_en || p.description,
    attributes,
    badges: p.sales_count > 1000 ? [isZh ? '热销爆款' : 'Best Seller'] : [isZh ? '官方正品' : 'Official'],
    options: p.options.map((opt) => ({
      id: opt.id,
      name: isZh ? opt.name : opt.name_en || opt.name,
      code: opt.code,
      values: opt.values,
    })),
    variants: p.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      price: v.price,
      currency: p.currency || 'CNY',
      inventory: v.inventory,
      status: v.status,
      optionValues: v.option_values,
    })),
  }
}

export const STOREFRONT_DEMO_PRODUCTS_ZH: StorefrontProduct[] = DEMO_PRODUCTS.map((p) =>
  demoProductToStorefront(p, 'zh')
)

export const STOREFRONT_DEMO_PRODUCTS_EN: StorefrontProduct[] = DEMO_PRODUCTS.map((p) =>
  demoProductToStorefront(p, 'en')
)

export function getStorefrontDemoProducts(lang: 'zh' | 'en' = 'zh'): StorefrontProduct[] {
  return lang === 'zh' ? STOREFRONT_DEMO_PRODUCTS_ZH : STOREFRONT_DEMO_PRODUCTS_EN
}
