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
import type {
  StorefrontProduct,
  StorefrontStore,
  OrderConfirmationDTO,
} from './types'
import {
  normalizeStorefrontSchema,
  type StorefrontSchema,
  type StoreContactConfig,
  type StoreSocialConfig,
} from './schema'

/** 商品白名单列：只取 UI 需要的字段，绝不暴露 raw_data/sku/inventory 等内部字段。
 *  product_semantics(semantic_data, updated_at) 为 canonical 语义事实源（经 RLS 作用域限定）。 */
const PRODUCT_SELECT =
  'id, name, description, price, currency, semantic_data, product_assets(url, asset_type), product_semantics(semantic_data, updated_at)'

const PRODUCT_DETAIL_SELECT =
  'id, name, description, price, currency, semantic_data, product_assets(url, asset_type), product_semantics(semantic_data, updated_at), product_options(id, name, code, position, values), product_variants(id, sku, price, currency, inventory, status, option_values)'

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

/** 提取全局联系与社交配置 */
function readGlobalInfo(themeConfig: unknown): {
  contact?: StoreContactConfig
  social?: StoreSocialConfig
} {
  if (themeConfig === null || typeof themeConfig !== 'object') return {}
  const obj = themeConfig as Record<string, unknown>
  const globalInfo =
    obj.globalInfo && typeof obj.globalInfo === 'object'
      ? (obj.globalInfo as Record<string, unknown>)
      : null

  const contact = (globalInfo?.contact || obj.contact) as
    | StoreContactConfig
    | undefined
  const social = (globalInfo?.social || obj.social) as
    | StoreSocialConfig
    | undefined

  return { contact, social }
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
  if (!store) {
    if (storeSlug === 'omnilink-flagship') {
      return {
        id: 'demo-store',
        name: 'Omnilink 旗舰店',
        slug: 'omnilink-flagship',
        description: 'AI 原生智能电商示范旗舰店',
        logoUrl: null,
        currency: 'CNY',
        themeId: 'minimal',
        contact: {
          email: 'concierge@omnilink.ai',
          whatsapp: '+1 (555) 019-2834',
          phone: '+1 (555) 019-2834',
          address: '77 Atelier Way, Suite 400, San Francisco, CA',
        },
        social: {
          instagram: 'https://instagram.com/omnilink',
          x: 'https://x.com/omnilink',
        },
      }
    }
    return null
  }

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

  const { contact, social } = readGlobalInfo(settings?.theme_config)

  return {
    id: store.id,
    name: store.store_name,
    slug: store.store_slug,
    description: store.description,
    logoUrl: store.logo_url,
    currency: store.currency,
    themeId: readThemeId(settings?.theme_config),
    contact,
    social,
  }
}

/**
 * 公开店面入口 —— 唯一事实源 = store_settings.theme_config（canonical StorefrontSchema）。
 */
export async function getPublicStorefront(
  storeSlug: string
): Promise<{ store: StorefrontStore; schema: StorefrontSchema } | null> {
  try {
    const supabase = await createClientServer()

    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id, store_name, store_slug, description, logo_url, currency')
      .eq('store_slug', storeSlug)
      .eq('status', 'active')
      .maybeSingle()

    if (storeError) {
      console.error('getPublicStorefront store error:', storeError.message)
    }

    if (!store) {
      if (storeSlug === 'omnilink-flagship') {
        const demoSchema = normalizeStorefrontSchema({ theme_id: 'minimal' })!
        return {
          store: {
            id: 'demo-store',
            name: 'Omnilink 旗舰店',
            slug: 'omnilink-flagship',
            description: 'AI 原生智能电商示范旗舰店',
            logoUrl: null,
            currency: 'CNY',
            themeId: demoSchema.theme.themeId,
            contact: demoSchema.globalInfo?.contact,
            social: demoSchema.globalInfo?.social,
          },
          schema: {
            ...demoSchema,
            meta: { ...demoSchema.meta, published: true },
          },
        }
      }
      return null
    }

    const { data: settings, error: settingsError } = await supabase
      .from('store_settings')
      .select('theme_config')
      .eq('store_id', store.id)
      .maybeSingle()

    if (settingsError) throw new Error(settingsError.message)

    const rawConfig = settings?.theme_config
    let schema = normalizeStorefrontSchema(rawConfig)
    const { contact, social } = readGlobalInfo(rawConfig)

    const isLegacyConfig =
      rawConfig !== null &&
      typeof rawConfig === 'object' &&
      typeof (rawConfig as Record<string, unknown>).theme_id === 'string' &&
      !(rawConfig as Record<string, unknown>).version

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
        const base = normalizeStorefrontSchema({ theme_id: 'minimal' })
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
        contact: contact || schema.globalInfo?.contact,
        social: social || schema.globalInfo?.social,
      },
      schema,
    }
  } catch (err) {
    console.error('getPublicStorefront error:', err)
    if (storeSlug === 'omnilink-flagship') {
      const demoSchema = normalizeStorefrontSchema({ theme_id: 'minimal' })!
      return {
        store: {
          id: 'demo-store',
          name: 'Omnilink 旗舰店',
          slug: 'omnilink-flagship',
          description: 'AI 原生智能电商示范旗舰店',
          logoUrl: null,
          currency: 'CNY',
          themeId: demoSchema.theme.themeId,
          contact: demoSchema.globalInfo?.contact,
          social: demoSchema.globalInfo?.social,
        },
        schema: {
          ...demoSchema,
          meta: { ...demoSchema.meta, published: true },
        },
      }
    }
    return null
  }
}

/** 店铺公开商品列表（active、按创建时间倒序、限量）。 */
export async function getStorefrontProducts(
  storeOrId: StoreRef | { id: string; store_slug?: string; currency?: string | null } | string,
  limit = 24
): Promise<StorefrontProduct[]> {
  const storeId = typeof storeOrId === 'string' ? storeOrId : storeOrId?.id
  const storeSlug = typeof storeOrId === 'string' ? 'store' : ('slug' in storeOrId ? storeOrId.slug : storeOrId.store_slug) || 'store'
  const storeCurrency = typeof storeOrId === 'string' ? null : storeOrId?.currency

  if (!storeId) {
    return []
  }

  try {
    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('store_id', storeId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[Storefront][getStorefrontProducts] query failed', {
        storeId,
        errorCode: error.code ?? null,
        errorMessage: error.message,
      })
      throw new Error(`Failed to load storefront products: ${error.message}`)
    }

    return normalizeProducts(
      (data ?? []) as unknown as StorefrontProductRow[],
      { storeSlug, storeCurrency }
    )
  } catch (err) {
    console.error('[Storefront][getStorefrontProducts] exception', {
      storeId,
      error: err instanceof Error ? err.message : String(err),
    })
    throw new Error(`Failed to load storefront products: ${err instanceof Error ? err.message : String(err)}`)
  }
}

/**
 * 单个公开商品。store_id + 商品 id 双重过滤。
 * 优雅降级：若 product_options/product_variants 表查询报错，退回到普通查询。
 */
export async function getStorefrontProduct(
  store: StoreRef,
  productId: string
): Promise<StorefrontProduct | null> {
  const supabase = await createClientServer()

  try {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_DETAIL_SELECT)
      .eq('id', productId)
      .eq('store_id', store.id)
      .eq('status', 'active')
      .maybeSingle()

    if (!error && data) {
      return normalizeProduct(data as unknown as StorefrontProductRow, {
        storeSlug: store.slug,
        storeCurrency: store.currency,
      })
    }
  } catch {
    // fallback below
  }

  // Fallback to basic product select
  const { data: basicData, error: basicError } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('id', productId)
    .eq('store_id', store.id)
    .eq('status', 'active')
    .maybeSingle()

  if (basicError) {
    console.error('[Storefront][getStorefrontProduct] query failed', {
      storeId: store.id,
      productId,
      errorCode: basicError.code ?? null,
      errorMessage: basicError.message,
    })
    throw new Error(basicError.message)
  }
  if (!basicData) return null

  return normalizeProduct(basicData as unknown as StorefrontProductRow, {
    storeSlug: store.slug,
    storeCurrency: store.currency,
  })
}

/**
 * 相关商品。
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

/**
 * 根据 orderId 和 storeSlug 查询订单确认回执。
 */
export async function getOrderById(
  storeSlug: string,
  orderId: string
): Promise<OrderConfirmationDTO | null> {
  try {
    const supabase = await createClientServer()

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        store_id,
        customer_name,
        customer_email,
        customer_phone,
        customer_whatsapp,
        company,
        country,
        state,
        city,
        address,
        notes,
        contact_preference,
        currency,
        subtotal,
        status,
        created_at,
        order_items (
          id,
          product_id,
          variant_id,
          product_name_snapshot,
          sku_snapshot,
          quantity,
          unit_price_snapshot,
          currency,
          selected_options
        ),
        stores (
          store_name,
          store_slug,
          store_settings (
            theme_config
          )
        )
      `)
      .eq('id', orderId)
      .maybeSingle()

    if (orderError || !order) {
      return null
    }

    const storeData = Array.isArray(order.stores) ? order.stores[0] : order.stores
    const settings = Array.isArray(storeData?.store_settings)
      ? storeData.store_settings[0]
      : storeData?.store_settings

    const { contact } = readGlobalInfo(settings?.theme_config)

    const rawItems = Array.isArray(order.order_items) ? order.order_items : []
    const items = rawItems.map((item: any) => ({
      id: item.id,
      productId: item.product_id,
      variantId: item.variant_id,
      productName: item.product_name_snapshot,
      sku: item.sku_snapshot,
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unit_price_snapshot) || 0,
      currency: item.currency || order.currency || 'USD',
      selectedOptions: item.selected_options || {},
      subtotal:
        (Number(item.unit_price_snapshot) || 0) * (Number(item.quantity) || 1),
    }))

    return {
      id: order.id,
      orderNumber: order.order_number,
      storeId: order.store_id,
      storeSlug: storeData?.store_slug || storeSlug,
      storeName: storeData?.store_name || 'Store',
      customer: {
        name: order.customer_name,
        email: order.customer_email,
        phone: order.customer_phone,
        whatsapp: order.customer_whatsapp,
        company: order.company,
        country: order.country,
        state: order.state,
        city: order.city,
        address: order.address,
        notes: order.notes,
        contactPreference: order.contact_preference,
      },
      items,
      currency: order.currency || 'USD',
      subtotal: Number(order.subtotal) || 0,
      status: order.status || 'inquiry_pending',
      createdAt: order.created_at,
      storeContact: contact,
    }
  } catch (err) {
    console.error('getOrderById error:', err)
    return null
  }
}
