import { Suspense } from 'react'
import { createClientServer } from '@/lib/supabase/server'
import { getStoreByOwnerId } from '@/lib/stores/service'
import { type ProductRow } from '@/components/product/ProductTable'
import { ProductsView } from '@/components/product/ProductsView'
import { ProductsSkeleton } from '@/components/product/ProductsSkeleton'
import { DEMO_PRODUCTS } from '@/lib/products/demo-data'

const PRODUCT_SELECT =
  'id, store_id, sku, name, description, price, currency, inventory, status, raw_data, semantic_data, created_at, updated_at'

async function getRealProducts(storeId: string): Promise<ProductRow[]> {
  const supabase = await createClientServer()
  const { data: products, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return []
  }
  return (products ?? []) as unknown as ProductRow[]
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

  // Demo fallback rows to show complete UI in preview mode
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

  if (!user) {
    return <ProductsView products={demoRows} />
  }

  const store = await getStoreByOwnerId(user.id).catch(() => null)
  if (!store) {
    return <ProductsView products={demoRows} />
  }

  const dbProducts = await getRealProducts(store.id)
  return <ProductsView products={dbProducts.length > 0 ? dbProducts : demoRows} />
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsSkeleton />}>
      <ProductsListContent />
    </Suspense>
  )
}
