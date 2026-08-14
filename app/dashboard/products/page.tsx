import { getStoreByOwnerId } from '@/lib/stores/service'
import { createClientServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProductCreateDialog } from '@/components/product/ProductCreateDialog'
import { ProductTable, type ProductRow } from '@/components/product/ProductTable'
import { PageHeader, GhostLink } from '@/components/dashboard/kit'
import { Sparkles } from 'lucide-react'

async function getProducts(storeId: string): Promise<ProductRow[]> {
  const supabase = await createClientServer()

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', storeId)

  if (error) {
    throw new Error(`Failed to load products: ${error.message}`)
  }

  return (products ?? []) as ProductRow[]
}

export default async function ProductsPage() {
  const supabase = await createClientServer()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  const store = await getStoreByOwnerId(user.id)

  if (!store) {
    redirect('/onboarding')
  }

  const products = await getProducts(store.id)

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="产品"
        description="管理你的结构化商品数据，追踪每个商品的 AI 就绪状态。"
      >
        <GhostLink href="/dashboard/products/import">
          <Sparkles size={15} />
          AI 智能导入
        </GhostLink>
        <ProductCreateDialog />
      </PageHeader>

      <ProductTable products={products} />
    </div>
  )
}
