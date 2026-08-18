/**
 * Storefront normalize —— 纯转换层（本任务核心）。
 *
 *   database row ──→ normalize ──→ StorefrontProduct
 *
 * 无副作用、无 IO、无 DB 访问。任何单条脏数据（缺图/缺价/缺语义/
 * 畸形 semantic_data）都只影响该条本身，绝不让页面崩溃。
 */

import type { StorefrontProduct } from './types'

/** service 层查询返回的单条商品行（白名单 select + 关联 assets）。 */
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

/** 主图：优先 original，其次任一有效 url，最后 null。 */
function pickImageUrl(
  assets: StorefrontProductRow['product_assets']
): string | null {
  if (!Array.isArray(assets) || assets.length === 0) return null
  const valid = assets.filter(
    (a): a is { url: string; asset_type: string | null } =>
      typeof a?.url === 'string' && a.url.length > 0
  )
  if (valid.length === 0) return null
  const original = valid.find((a) => a.asset_type === 'original')
  return (original ?? valid[0]).url
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

export function normalizeProduct(
  row: StorefrontProductRow,
  opts: NormalizeOptions
): StorefrontProduct {
  const id = String(row.id)
  return {
    id,
    name: row.name?.trim() || 'Untitled product',
    // DB 无 slug 列：公开路由使用 /products/[id]，slug 即 id。
    slug: id,
    price: toFiniteNumber(row.price),
    currency: row.currency ?? opts.storeCurrency ?? 'USD',
    imageUrl: pickImageUrl(row.product_assets),
    href: `/store/${opts.storeSlug}/products/${id}`,
    description: row.description ?? null,
    attributes: flattenSemanticData(row.semantic_data),
    badges: [],
  }
}

export function normalizeProducts(
  rows: StorefrontProductRow[],
  opts: NormalizeOptions
): StorefrontProduct[] {
  if (!Array.isArray(rows)) return []
  return rows.map((row) => normalizeProduct(row, opts))
}
