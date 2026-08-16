/**
 * Storefront service —— 服务端数据访问层。
 *
 * 查询原则：Database filtering first → Normalization second → Rendering last。
 * 所有过滤（store 归属 / active / published / limit / 排除当前商品）都下推到
 * Supabase 查询，绝不先全量拉取再 JS 过滤。
 *
 * 使用项目既有 server Supabase client（createClientServer），不新建客户端、
 * 不用 service role。查询错误抛给调用方（路由层决定 404/500）；
 * 「不存在」返回 null / []。
 */

import { createClientServer } from '@/lib/supabase/server'
import {
  normalizeProduct,
  normalizeProducts,
  type StorefrontProductRow,
} from './normalize'
import type { StorefrontProduct, StorefrontStore } from './types'

/** 商品白名单列：只取 UI 需要的字段，绝不暴露 raw_data/sku/inventory 等内部字段。 */
const PRODUCT_SELECT =
  'id, name, description, price, currency, semantic_data, product_assets(url, asset_type)'

type StoreRef = Pick<StorefrontStore, 'id' | 'slug'> & {
  currency?: string | null
}

/** 从 store_settings.theme_config 提取 theme_id（仅当是字符串）。 */
function readThemeId(themeConfig: unknown): string | null {
  if (themeConfig === null || typeof themeConfig !== 'object') return null
  const value = (themeConfig as Record<string, unknown>).theme_id
  return typeof value === 'string' && value.length > 0 ? value : null
}

/**
 * 获取公开 storefront 的店铺数据。
 * 公开口径（与现有公开路由一致）：status = 'active' 且存在已发布的 store_pages。
 */
export async function getPublishedStore(
  storeSlug: string
): Promise<StorefrontStore | null> {
  const supabase = await createClientServer()

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id, store_name, store_slug, description, logo_url, currency')
    .eq('store_slug', storeSlug)
    .eq('status', 'active')
    .maybeSingle()

  if (storeError) throw new Error(storeError.message)
  if (!store) return null

  const { data: publishedPage, error: pageError } = await supabase
    .from('store_pages')
    .select('id')
    .eq('store_id', store.id)
    .eq('published', true)
    .limit(1)
    .maybeSingle()

  if (pageError) throw new Error(pageError.message)
  if (!publishedPage) return null

  const { data: settings, error: settingsError } = await supabase
    .from('store_settings')
    .select('theme_config')
    .eq('store_id', store.id)
    .maybeSingle()

  if (settingsError) throw new Error(settingsError.message)

  return {
    id: store.id,
    name: store.store_name,
    slug: store.store_slug,
    description: store.description,
    logoUrl: store.logo_url,
    currency: store.currency,
    themeId: readThemeId(settings?.theme_config),
  }
}

/** 店铺公开商品列表（active、按创建时间倒序、限量）。 */
export async function getStorefrontProducts(
  store: StoreRef,
  limit = 24
): Promise<StorefrontProduct[]> {
  const supabase = await createClientServer()

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('store_id', store.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)

  return normalizeProducts(
    (data ?? []) as unknown as StorefrontProductRow[],
    { storeSlug: store.slug, storeCurrency: store.currency }
  )
}

/**
 * 单个公开商品。store_id + 商品 id 双重过滤，
 * 从数据库层阻止跨店铺读取（/store/a/products/属于b的商品 → null）。
 */
export async function getStorefrontProduct(
  store: StoreRef,
  productId: string
): Promise<StorefrontProduct | null> {
  const supabase = await createClientServer()

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('id', productId)
    .eq('store_id', store.id)
    .eq('status', 'active')
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null

  return normalizeProduct(data as unknown as StorefrontProductRow, {
    storeSlug: store.slug,
    storeCurrency: store.currency,
  })
}

/**
 * 相关商品。当前阶段刻意简单：同店铺 + active + 排除当前商品 + limit。
 * 不做推荐算法。
 */
export async function getRelatedProducts(
  store: StoreRef,
  productId: string,
  limit = 4
): Promise<StorefrontProduct[]> {
  const supabase = await createClientServer()

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('store_id', store.id)
    .eq('status', 'active')
    .neq('id', productId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)

  return normalizeProducts(
    (data ?? []) as unknown as StorefrontProductRow[],
    { storeSlug: store.slug, storeCurrency: store.currency }
  )
}
