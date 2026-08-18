import { redirect } from 'next/navigation'
import { createClientServer } from '@/lib/supabase/server'
import { getStoreByOwnerId } from '@/lib/stores/service'
import { type ProductRow } from '@/components/product/ProductTable'
import { ProductsView } from '@/components/product/ProductsView'

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
    // Surface a real error to the page rather than substituting fake rows.
    throw new Error(`Failed to load products: ${error.message}`)
  }
  return (products ?? []) as unknown as ProductRow[]
}

/**
 * /dashboard/products — real merchant products only.
 *
 * Demo fallback rows ("Minimalist Ceramic Vase" / "Nordic Oak Dining Chair"
 * / etc.) were previously used when the merchant had zero products. Per
 * the #59 UX rule "no fake data on the real-user path", this page now
 * returns an empty list when the merchant has not yet added any products;
 * the empty state in ProductsView communicates this honestly.
 */
export default async function ProductsPage() {
  const supabase = await createClientServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const store = await getStoreByOwnerId(user.id)
  if (!store) {
    redirect('/onboarding')
  }

  const products = await getRealProducts(store.id)
  return <ProductsView products={products} />
}