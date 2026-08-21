/**
 * Storefront normalize —— 纯转换层（本任务核心）。
 *
 *   database row ──→ normalize ──→ StorefrontProduct
 *
 * 无副作用、无 IO、无 DB 访问。任何单条脏数据（缺图/缺价/缺语义/
 * 畸形 semantic_data）都只影响该条本身，绝不让页面崩溃。
 */

import type {
  StorefrontProduct,
  StorefrontProductOption,
  StorefrontProductVariant,
} from './types'

/** service 层查询返回的单条商品行（白名单 select + 关联 assets + 关联 options/variants）。 */
export interface StorefrontProductRow {
  id: string
  name: string | null
  description: string | null
  price: number | string | null
  currency: string | null
  semantic_data: unknown
  product_assets?: Array<{
    url: string | null
    asset_type: string | null
  }> | null
  product_options?: Array<{
    id: string
    name: string
    code: string
    position?: number
    values: unknown
  }> | null
  product_variants?: Array<{
    id: string
    sku: string | null
    price: number | string | null
    currency: string | null
    inventory: number | null
    status: string | null
    option_values: unknown
  }> | null
}

export interface NormalizeOptions {
  /** 店铺 slug，用于生成 href。 */
  storeSlug: string
  /** 店铺货币，作为商品 currency 缺失时的回退。 */
  storeCurrency?: string | null
}

function toFiniteNumber(value: number | string | null): number {
  const n = typeof value === 'string' ? Number(value) : value
  return typeof n === 'number' && Number.isFinite(n) ? n : 0
}

/** 提取画廊图片：优先 original 居首，其余有效 URL 随后，去重。 */
function extractImageGallery(
  assets: StorefrontProductRow['product_assets']
): { primary: string | null; all: string[] } {
  if (!Array.isArray(assets) || assets.length === 0) {
    return { primary: null, all: [] }
  }

  const valid = assets.filter(
    (a): a is { url: string; asset_type: string | null } =>
      typeof a?.url === 'string' && a.url.trim().length > 0
  )

  if (valid.length === 0) {
    return { primary: null, all: [] }
  }

  const urls: string[] = []

  const publicAssets = valid.filter((asset) =>
    ['public', 'processed', 'watermark', 'transparent'].includes(
      asset.asset_type ?? ''
    )
  )

  for (const asset of publicAssets) {
    if (!urls.includes(asset.url)) {
      urls.push(asset.url)
    }
  }

  // Legacy compatibility for old demo records.
  if (urls.length === 0) {
    const legacyOriginal = valid.find(
      (asset) => asset.asset_type === 'original'
    )

    if (legacyOriginal) {
      urls.push(legacyOriginal.url)
    }
  }

  return {
    primary: urls[0] ?? null,
    all: urls,
  }
}

/**
 * semantic_data 安全拍平：
 * 只保留顶层的 string/number/boolean 叶子；跳过 null、嵌套对象与数组。
 * 不发明新 ontology，不向 UI 暴露内部结构。
 */
function flattenSemanticData(input: unknown): Record<string, string> {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    return {}
  }
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      out[key] = String(value)
    }
  }
  return out
}

function normalizeOptions(
  rawOptions?: StorefrontProductRow['product_options']
): StorefrontProductOption[] | undefined {
  if (!Array.isArray(rawOptions) || rawOptions.length === 0) return undefined
  return rawOptions
    .map((opt) => ({
      id: String(opt.id),
      name: String(opt.name || opt.code || 'Option'),
      code: String(opt.code || opt.name || 'opt').toLowerCase(),
      position: typeof opt.position === 'number' ? opt.position : 0,
      values: Array.isArray(opt.values)
        ? opt.values.map((v) => (typeof v === 'string' ? v : String(v?.name || v)))
        : [],
    }))
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
}

function normalizeVariants(
  rawVariants?: StorefrontProductRow['product_variants']
): StorefrontProductVariant[] | undefined {
  if (!Array.isArray(rawVariants) || rawVariants.length === 0) return undefined
  return rawVariants.map((v) => ({
    id: String(v.id),
    sku: v.sku ? String(v.sku) : null,
    price: v.price !== null && v.price !== undefined ? toFiniteNumber(v.price) : null,
    currency: v.currency ? String(v.currency) : null,
    inventory: typeof v.inventory === 'number' ? v.inventory : null,
    status: v.status ? String(v.status) : 'active',
    optionValues:
      v.option_values && typeof v.option_values === 'object' && !Array.isArray(v.option_values)
        ? (v.option_values as Record<string, string>)
        : {},
  }))
}

export function normalizeProduct(
  row: StorefrontProductRow,
  opts: NormalizeOptions
): StorefrontProduct {
  const id = String(row.id)
  const gallery = extractImageGallery(row.product_assets)
  const options = normalizeOptions(row.product_options)
  const variants = normalizeVariants(row.product_variants)

  return {
    id,
    name: row.name?.trim() || 'Untitled product',
    // DB 无 slug 列：公开路由使用 /products/[id]，slug 即 id。
    slug: id,
    price: toFiniteNumber(row.price),
    currency: row.currency ?? opts.storeCurrency ?? 'USD',
    imageUrl: gallery.primary,
    images: gallery.all.length > 0 ? gallery.all : (gallery.primary ? [gallery.primary] : []),
    href: `/store/${opts.storeSlug}/products/${id}`,
    description: row.description ?? null,
    attributes: flattenSemanticData(row.semantic_data),
    badges: [],
    options,
    variants,
  }
}

export function normalizeProducts(
  rows: StorefrontProductRow[],
  opts: NormalizeOptions
): StorefrontProduct[] {
  if (!Array.isArray(rows)) return []
  return rows.map((row) => normalizeProduct(row, opts))
}
