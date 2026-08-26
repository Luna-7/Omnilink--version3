/**
 * Editor-only product read for the Storefront Visual Editor.
 *
 * This intentionally diverges from getStorefrontProducts (public): it also
 * returns DRAFT products so the editor can preview freshly created items that
 * have not been activated yet. It must NEVER be used on the public storefront
 * route — that route keeps using getStorefrontProducts, which is restricted to
 * `status = 'active'` so drafts never leak to visitors.
 *
 * Reuses the existing normalization layer (normalizeProducts / StorefrontProduct)
 * — no duplication of the conversion logic.
 */

import { createClientServer } from '@/lib/supabase/server'
import {
  normalizeProducts,
  type StorefrontProductRow,
} from './normalize'
import type { StorefrontProduct } from './types'

/** 商品白名单列：只取 UI 需要的字段，绝不暴露 raw_data/sku/inventory 等内部字段。 */
const PRODUCT_SELECT =
  'id, name, description, price, currency, semantic_data, product_assets(url, asset_type)'

type EditorStoreRef =
  | string
  | { id: string; slug?: string; store_slug?: string; currency?: string | null }

/**
 * 编辑器商品读取：store_id 匹配 + status in ('active', 'draft')，按创建时间倒序。
 * 供 Dashboard Storefront Visual Editor 使用，让 draft 商品也能在装修器中预览。
 */
export async function getEditorStorefrontProducts(
  storeOrId: EditorStoreRef,
  limit = 24
): Promise<StorefrontProduct[]> {
  const storeId = typeof storeOrId === 'string' ? storeOrId : storeOrId?.id
  const storeSlug =
    typeof storeOrId === 'string'
      ? 'store'
      : ('slug' in storeOrId ? storeOrId.slug : storeOrId.store_slug) || 'store'
  const storeCurrency = typeof storeOrId === 'string' ? null : storeOrId?.currency

  // demo-store 走前端回退，不需要查询真实库。
  if (!storeId || storeId === 'demo-store') {
    return []
  }

  try {
    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('store_id', storeId)
      .in('status', ['active', 'draft'])
      .order('created_at', { ascending: false })
      .limit(limit)

    console.error('[StorefrontDebug][EditorProducts]', {
      storeId,
      queryStatus: error ? 'error' : 'success',
      errorMessage: error?.message ?? null,
      rawCount: data?.length ?? 0,
      rawProducts: (data ?? []).map((p: Record<string, unknown>) => ({
        id: p.id,
        name: p.name,
        status: p.status ?? null,
      })),
    })

    if (error) {
      console.error('getEditorStorefrontProducts error:', error.message)
      return []
    }

    const normalized = normalizeProducts(
      (data ?? []) as unknown as StorefrontProductRow[],
      { storeSlug, storeCurrency }
    )

    console.error('[StorefrontDebug][EditorProductsNormalized]', {
      normalizedCount: normalized.length,
      normalizedNames: normalized.map((p) => p.name),
    })

    return normalized
  } catch (err) {
    console.error('getEditorStorefrontProducts exception:', err)
    return []
  }
}
