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
import {
  normalizeStorefrontSchema,
  type StorefrontSchema,
} from './schema'

/** 商品白名单列：只取 UI 需要的字段，绝不暴露 raw_data/sku/inventory 等内部字段。 */
const PRODUCT_SELECT =
  'id, name, description, price, currency, semantic_data, product_assets(url, asset_type)'

type StoreRef = Pick<StorefrontStore, 'id' | 'slug'> & {
  currency?: string | null
}

/**
 * 从 store_settings.theme_config 提取 theme_id。
 * 双形态兼容：canonical（theme.themeId）优先，legacy（theme_id）兜底。
 */
function readThemeId(themeConfig: unknown): string | null {
  if (themeConfig === null || typeof themeConfig !== 'object') return null
  const obj = themeConfig as Record<string, unknown>

  // canonical: { theme: { themeId } }
  if (obj.theme && typeof obj.theme === 'object') {
    const themeId = (obj.theme as Record<string, unknown>).themeId
    if (typeof themeId === 'string' && themeId.length > 0) return themeId
  }

  // legacy: { theme_id }
  const legacy = obj.theme_id
  return typeof legacy === 'string' && legacy.length > 0 ? legacy : null
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

/**
 * 公开店面入口 —— 唯一事实源 = store_settings.theme_config（canonical StorefrontSchema）。
 *
 * 公开门槛：
 *   1. store.status = 'active'
 *   2. canonical schema 存在且 meta.published = true
 *   3. legacy 兼容：schema 为草稿/缺失，但存在已发布 store_pages 行的旧店铺，
 *      沿用旧门槛保持可见（默认骨架渲染，hero 回填店名/简介）。
 *
 * store_pages 在此仅作 legacy 发布位兜底，不是内容事实源。
 */
export async function getPublicStorefront(
  storeSlug: string
): Promise<{ store: StorefrontStore; schema: StorefrontSchema } | null> {
  const supabase = await createClientServer()

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id, store_name, store_slug, description, logo_url, currency')
    .eq('store_slug', storeSlug)
    .eq('status', 'active')
    .maybeSingle()

  if (storeError) throw new Error(storeError.message)
  if (!store) return null

  const { data: settings, error: settingsError } = await supabase
    .from('store_settings')
    .select('theme_config')
    .eq('store_id', store.id)
    .maybeSingle()

  if (settingsError) throw new Error(settingsError.message)

  const rawConfig = settings?.theme_config
  let schema = normalizeStorefrontSchema(rawConfig)
  const isLegacyConfig =
    rawConfig !== null &&
    typeof rawConfig === 'object' &&
    typeof (rawConfig as Record<string, unknown>).theme_id === 'string' &&
    !(rawConfig as Record<string, unknown>).version

  // legacy 兼容回填：旧店铺没有编辑器内容，hero 用店名/简介，避免「假欢迎语」
  if (schema && isLegacyConfig) {
    schema = {
      ...schema,
      sections: schema.sections.map((s) =>
        s.type === 'hero'
          ? {
              ...s,
              content: {
                ...s.content,
                title: store.store_name,
                description: store.description ?? s.content.description,
              },
            }
          : s
      ),
    }
  }

  // 发布门槛：canonical 以 meta.published 为准；草稿/无 schema 时 legacy 店铺
  // 回退检查 store_pages.published（旧系统的唯一发布位）。
  if (!schema || !schema.meta.published) {
    const { data: publishedPage, error: pageError } = await supabase
      .from('store_pages')
      .select('id')
      .eq('store_id', store.id)
      .eq('published', true)
      .limit(1)
      .maybeSingle()

    if (pageError) throw new Error(pageError.message)
    if (!publishedPage) return null

    if (schema) {
      schema = { ...schema, meta: { ...schema.meta, published: true } }
    } else {
      // 无 theme_config 的 legacy 已发布店铺：默认骨架 + hero 回填，保持可见。
      const base = normalizeStorefrontSchema({ theme_id: 'electric-violet' })
      if (!base) return null
      schema = {
        ...base,
        sections: base.sections.map((s) =>
          s.type === 'hero'
            ? {
                ...s,
                content: {
                  ...s.content,
                  title: store.store_name,
                  description: store.description ?? s.content.description,
                },
              }
            : s
        ),
        meta: { ...base.meta, published: true },
      }
    }
  }

  if (!schema) return null

  return {
    store: {
      id: store.id,
      name: store.store_name,
      slug: store.store_slug,
      description: store.description,
      logoUrl: store.logo_url,
      currency: store.currency,
      themeId: schema.theme.themeId,
    },
    schema,
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
