/**
 * Theme Preview Mock Data —— 仅供 /theme-preview/electric-violet 开发预览使用。
 *
 * 严格使用真实 Storefront DTO（StorefrontStore / StorefrontProduct /
 * StorefrontCollection）与真实 Template 内容契约（HomepageHeroContent 等）。
 * 不存在第二套 Preview 专用数据契约；字段口径与 lib/storefront/normalize.ts
 * 输出保持一致（href 形如 /store/<slug>/products/<id>）。
 *
 * 故意覆盖 fallback 场景：imageUrl=null / description=null / attributes={} /
 * badges=undefined / badges=[] / logoUrl=null（P10）。
 */

import type {
  StorefrontCollection,
  StorefrontProduct,
  StorefrontStore,
} from '@/lib/storefront/types'
import type {
  HomepageCtaContent,
  HomepageHeroContent,
} from '@/components/theme/templates/Homepage'
import type { ProductPageCtaContent } from '@/components/theme/templates/ProductPage'

export const previewStore: StorefrontStore = {
  id: 'preview-store-001',
  name: 'Electric Violet Studio',
  slug: 'electric-violet-studio',
  description:
    'A small design studio crafting everyday objects in a single, unmistakable hue. Each piece is made in limited runs and shipped worldwide.',
  logoUrl: null, // 故意为 null：验证首字母 fallback
  currency: 'USD',
  themeId: 'electric-violet',
}

const href = (id: string) => `/store/${previewStore.slug}/products/${id}`

/** 1. 完整商品：图片 + description + attributes + badges。 */
const lamp: StorefrontProduct = {
  id: 'ev-lamp',
  name: 'Violet Resin Table Lamp',
  slug: 'ev-lamp',
  price: 189,
  currency: 'USD',
  imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900&q=80',
  href: href('ev-lamp'),
  description:
    'Hand-cast resin lamp with a soft violet gradient. Dimmable warm LED, braided cotton cord.',
  attributes: {
    Material: 'Resin',
    Color: 'Electric Violet',
    Dimensions: '28 × 18 cm',
    Weight: '1.4 kg',
  },
  badges: ['New', 'Bestseller'],
}

/** 2. 无图片商品：imageUrl = null。 */
const organizer: StorefrontProduct = {
  id: 'ev-organizer',
  name: 'Acrylic Desk Organizer',
  slug: 'ev-organizer',
  price: 59,
  currency: 'USD',
  imageUrl: null,
  href: href('ev-organizer'),
  description: 'Stackable frosted-acrylic trays for pens, cards and cables.',
  attributes: { Color: 'Frosted Violet', Pieces: '3' },
  badges: ['Sale'],
}

/** 3. 无 description 商品 + 不同货币（EUR）+ badges 缺省（undefined）。 */
const poster: StorefrontProduct = {
  id: 'ev-poster',
  name: 'Ultraviolet Gradient Art Poster',
  slug: 'ev-poster',
  price: 29,
  currency: 'EUR',
  imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=900&q=80',
  href: href('ev-poster'),
  description: null,
  attributes: { Size: '50 × 70 cm', Paper: '200 gsm matte' },
}

/** 4. attributes 为空 + 超长名称 + 不同货币（CNY）+ badges 为空数组。 */
const phoneCase: StorefrontProduct = {
  id: 'ev-case',
  name: 'Iridescent MagSafe Phone Case — Limited Chromatic Studio Edition',
  slug: 'ev-case',
  price: 1299,
  currency: 'CNY',
  imageUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=900&q=80',
  href: href('ev-case'),
  description: 'Limited run. Iridescent coating shifts from violet to indigo under light.',
  attributes: {},
  badges: [],
}

/** 5. 常规商品：短名称 + badges 为空数组。 */
const mug: StorefrontProduct = {
  id: 'ev-mug',
  name: 'Studio Mug',
  slug: 'ev-mug',
  price: 24,
  currency: 'USD',
  imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=900&q=80',
  href: href('ev-mug'),
  description: 'Glazed stoneware mug, 350 ml.',
  attributes: { Capacity: '350 ml' },
  badges: [],
}

/** 首页 Featured（≥4 个，覆盖全部 fallback 场景）。 */
export const previewProducts: StorefrontProduct[] = [
  lamp,
  organizer,
  poster,
  phoneCase,
  mug,
]

/** 商品详情页主商品 + 相关商品。 */
export const previewProduct: StorefrontProduct = lamp
export const previewRelatedProducts: StorefrontProduct[] = [
  organizer,
  poster,
  phoneCase,
]

/** 集合（严格 StorefrontCollection：id/title/products）。 */
export const previewCollection: StorefrontCollection = {
  id: 'ev-collection-violet-edit',
  title: 'The Violet Edit',
  products: [lamp, organizer, mug],
}

/** 首页 Hero 内容（props 内容契约，非 DTO）。 */
export const previewHero: HomepageHeroContent = {
  title: 'Objects in Electric Violet',
  subtitle:
    'Limited-run homeware and accessories from our studio bench — designed around a single hue, made to be used every day.',
  imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
  imageAlt: 'Assorted studio objects arranged on a violet backdrop',
  primaryAction: {
    label: 'Shop the collection',
    href: `/store/${previewStore.slug}`,
  },
  secondaryAction: {
    label: 'Our story',
    href: `/store/${previewStore.slug}/about`,
  },
}

/** 页尾 CTA 内容。 */
export const previewCta: HomepageCtaContent & ProductPageCtaContent = {
  title: 'Join the studio list',
  subtitle: 'Early access to new drops, studio notes, and seconds sales. One email a month.',
  action: {
    label: 'Subscribe',
    href: `/store/${previewStore.slug}/subscribe`,
  },
}

/** 商品详情页主行动点（非交易型：纯展示导航，不伪造购买系统）。 */
export const previewProductAction = {
  label: 'Inquire about this piece',
  href: `/store/${previewStore.slug}/contact`,
}
