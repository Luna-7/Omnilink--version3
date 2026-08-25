import { Suspense } from 'react'
import { createClientServer } from '@/lib/supabase/server'
import { getStoreByOwnerId } from '@/lib/stores/service'
import { type ProductRow } from '@/components/product/ProductTable'
import { ProductsView } from '@/components/product/ProductsView'
import { ProductsSkeleton } from '@/components/product/ProductsSkeleton'
import { DEMO_PRODUCTS } from '@/lib/products/demo-data'

const PRODUCT_SELECT =
  'id, store_id, sku, name, description, price, currency, inventory, status, raw_data, semantic_data, created_at, updated_at'

function mapDbProductToRow(db: Record<string, any>): ProductRow {
  const raw = db.raw_data && typeof db.raw_data === 'object' ? db.raw_data : {}
  const category =
    (typeof raw.category === 'string' && raw.category.trim() ? raw.category : null) ||
    (typeof raw.category_id === 'string' && raw.category_id.trim() ? raw.category_id : null) ||
    null

  const imageUrl =
    (typeof raw.image_url === 'string' && raw.image_url.trim() ? raw.image_url : null) ||
    (Array.isArray(raw.images) && raw.images[0]?.url ? raw.images[0].url : null) ||
    null

  return {
    id: db.id,
    name: db.name ?? '',
    category,
    price: db.price,
    inventory: db.inventory,
    image_url: imageUrl,
    semantic_data: db.semantic_data,
    sku: db.sku,
    status: db.status,
    sales_count: 0,
  }
}

async function getRealProducts(storeId: string): Promise<ProductRow[]> {
  const supabase = await createClientServer()
  const { data: products, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error || !products) {
    return []
  }
  return products.map(mapDbProductToRow)
}

async function ProductsListContent() {
  const supabase = await createClientServer()
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user ?? null
  } catch {
    user = null
  }

  // Resolve store_id the exact same way as API routes (requireUser + getOwnedStore)
  let storeId: string | null = null
  if (user) {
    const store = await getStoreByOwnerId(user.id).catch(() => null)
    storeId = store?.id ?? null
  }

  const dbProducts = storeId ? await getRealProducts(storeId) : []

  // Demo fallback rows only if database has no products at all
  const demoRows: ProductRow[] = DEMO_PRODUCTS.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    inventory: p.inventory,
    image_url: p.image_url,
    semantic_data: p.semantic_data,
    sku: p.sku,
    status: p.status,
    sales_count: p.sales_count,
  }))

  return <ProductsView products={dbProducts.length > 0 ? dbProducts : demoRows} />
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsSkeleton />}>
      <ProductsListContent />
    </Suspense>
  )
}
