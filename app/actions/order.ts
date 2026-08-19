'use server'

import { createClientServer } from '@/lib/supabase/server'
import type {
  OrderSubmissionPayload,
  OrderConfirmationDTO,
  OrderConfirmationItem,
} from '@/lib/storefront/types'
import { getPublishedStore } from '@/lib/storefront/service'

// Fallback in-memory storage for demo sessions or before DB migration sync
const memoryOrders = new Map<string, OrderConfirmationDTO>()

// Demo products price lookup for omnilink-flagship
const DEMO_PRODUCTS: Record<
  string,
  { name: string; price: number; currency: string; sku: string }
> = {
  'prod-kinfolk-01': {
    name: 'The Kinfolk Round 01',
    price: 185,
    currency: 'USD',
    sku: 'OPT-KNF-01',
  },
  'prod-velvet-02': {
    name: 'The Velvet Horizon 02',
    price: 210,
    currency: 'USD',
    sku: 'OPT-VLV-02',
  },
  'prod-prism-03': {
    name: 'The Prism Mood 03',
    price: 195,
    currency: 'USD',
    sku: 'OPT-PRM-03',
  },
  'prod-paper-04': {
    name: 'The Paper Geometric 04',
    price: 220,
    currency: 'USD',
    sku: 'OPT-PPR-04',
  },
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.floor(1000 + Math.random() * 9000)
  return `ORD-${timestamp}-${random}`
}

export async function submitOrderInquiryAction(
  payload: OrderSubmissionPayload
): Promise<{
  success: boolean
  orderId?: string
  orderNumber?: string
  error?: string
}> {
  try {
    const { storeSlug, customer, items } = payload

    if (!storeSlug || !customer?.name || !customer?.email || !items || items.length === 0) {
      return { success: false, error: 'Missing required customer or items information' }
    }

    // 1. Verify Store Existence
    const store = await getPublishedStore(storeSlug)
    if (!store) {
      return { success: false, error: 'Store not found or inactive' }
    }

    const supabase = await createClientServer()
    const productIds = items.map((i) => i.productId).filter(Boolean)

    // 2. Fetch server-authoritative product data (TRUST BOUNDARY: IGNORE CLIENT PRICES)
    let dbProducts: Array<{
      id: string
      name: string
      price: number | string | null
      currency: string | null
    }> = []

    if (store.id !== 'demo-store' && productIds.length > 0) {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, currency')
        .eq('store_id', store.id)
        .in('id', productIds)

      if (!error && data) {
        dbProducts = data
      }
    }

    // Optional: Fetch variant data if variants are submitted
    const variantIds = items.map((i) => i.variantId).filter(Boolean) as string[]
    let dbVariants: Array<{
      id: string
      sku: string | null
      price: number | string | null
      currency: string | null
    }> = []

    if (variantIds.length > 0 && store.id !== 'demo-store') {
      try {
        const { data } = await supabase
          .from('product_variants')
          .select('id, sku, price, currency')
          .in('id', variantIds)

        if (data) dbVariants = data
      } catch {
        // Safe fallback
      }
    }

    // 3. Recalculate order items and subtotal on the server
    const orderItemsToInsert: Array<{
      product_id: string | null
      variant_id: string | null
      product_name_snapshot: string
      sku_snapshot: string | null
      quantity: number
      unit_price_snapshot: number
      currency: string
      selected_options: Record<string, string>
    }> = []

    let calculatedSubtotal = 0
    const currency = store.currency || 'USD'

    for (const item of items) {
      const qty = Math.max(1, Math.floor(Number(item.quantity) || 1))

      let productName = 'Product'
      let unitPrice = 0
      let sku: string | null = null
      let itemCurrency = currency

      const foundDbProd = dbProducts.find((p) => p.id === item.productId)
      const foundDemoProd = DEMO_PRODUCTS[item.productId]

      if (foundDbProd) {
        productName = foundDbProd.name || 'Product'
        unitPrice = Number(foundDbProd.price) || 0
        itemCurrency = foundDbProd.currency || currency
      } else if (foundDemoProd) {
        productName = foundDemoProd.name
        unitPrice = foundDemoProd.price
        itemCurrency = foundDemoProd.currency
        sku = foundDemoProd.sku
      }

      // Check variant price override if available
      if (item.variantId) {
        const foundVariant = dbVariants.find((v) => v.id === item.variantId)
        if (foundVariant) {
          if (foundVariant.price !== null && foundVariant.price !== undefined) {
            unitPrice = Number(foundVariant.price)
          }
          if (foundVariant.sku) {
            sku = foundVariant.sku
          }
        }
      }

      const itemTotal = unitPrice * qty
      calculatedSubtotal += itemTotal

      orderItemsToInsert.push({
        product_id: item.productId.startsWith('prod-') ? null : item.productId,
        variant_id: item.variantId || null,
        product_name_snapshot: productName,
        sku_snapshot: sku,
        quantity: qty,
        unit_price_snapshot: unitPrice,
        currency: itemCurrency,
        selected_options: item.selectedOptions || {},
      })
    }

    const orderNumber = generateOrderNumber()
    const orderId = crypto.randomUUID()
    const now = new Date().toISOString()

    // 4. Try Persisting to DB
    let persistedToDb = false
    if (store.id !== 'demo-store') {
      try {
        const { error: orderError } = await supabase.from('orders').insert({
          id: orderId,
          store_id: store.id,
          order_number: orderNumber,
          customer_name: customer.name.trim(),
          customer_email: customer.email.trim(),
          customer_phone: customer.phone?.trim() || null,
          customer_whatsapp: customer.whatsapp?.trim() || null,
          company: customer.company?.trim() || null,
          country: customer.country?.trim() || null,
          state: customer.state?.trim() || null,
          city: customer.city?.trim() || null,
          address: customer.address?.trim() || null,
          notes: customer.notes?.trim() || null,
          contact_preference: customer.contactPreference || 'email',
          currency,
          subtotal: calculatedSubtotal,
          status: 'inquiry_pending',
          created_at: now,
        })

        if (!orderError) {
          const itemsPayload = orderItemsToInsert.map((it) => ({
            id: crypto.randomUUID(),
            order_id: orderId,
            ...it,
            created_at: now,
          }))

          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(itemsPayload)

          if (!itemsError) {
            persistedToDb = true
          }
        }
      } catch (dbErr) {
        console.warn('Orders DB insert fallback to memory:', dbErr)
      }
    }

    // Always store snapshot in memory registry to guarantee immediate confirmation view
    const confirmationItems: OrderConfirmationItem[] = orderItemsToInsert.map(
      (it, idx) => ({
        id: `item-${idx}-${orderId}`,
        productId: it.product_id,
        variantId: it.variant_id,
        productName: it.product_name_snapshot,
        sku: it.sku_snapshot,
        quantity: it.quantity,
        unitPrice: it.unit_price_snapshot,
        currency: it.currency,
        selectedOptions: it.selected_options,
        subtotal: it.unit_price_snapshot * it.quantity,
      })
    )

    const confirmationDto: OrderConfirmationDTO = {
      id: orderId,
      orderNumber,
      storeId: store.id,
      storeSlug,
      storeName: store.name,
      customer: {
        name: customer.name.trim(),
        email: customer.email.trim(),
        phone: customer.phone?.trim(),
        whatsapp: customer.whatsapp?.trim(),
        company: customer.company?.trim(),
        country: customer.country?.trim(),
        state: customer.state?.trim(),
        city: customer.city?.trim(),
        address: customer.address?.trim(),
        notes: customer.notes?.trim(),
        contactPreference: customer.contactPreference || 'email',
      },
      items: confirmationItems,
      currency,
      subtotal: calculatedSubtotal,
      status: 'inquiry_pending',
      createdAt: now,
      storeContact: store.contact,
    }

    memoryOrders.set(orderId, confirmationDto)

    return {
      success: true,
      orderId,
      orderNumber,
    }
  } catch (err: any) {
    console.error('submitOrderInquiryAction error:', err)
    return { success: false, error: err?.message || 'Failed to submit order inquiry' }
  }
}

export async function getOrderConfirmationAction(
  storeSlug: string,
  orderId: string
): Promise<OrderConfirmationDTO | null> {
  // Check memory first
  if (memoryOrders.has(orderId)) {
    return memoryOrders.get(orderId)!
  }

  // Fallback to service layer
  const { getOrderById } = await import('@/lib/storefront/service')
  return await getOrderById(storeSlug, orderId)
}
