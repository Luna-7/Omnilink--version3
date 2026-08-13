import { getStoreByOwnerId } from '@/lib/stores/service'
import { createClientServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProductCreateDialog } from '@/components/product/ProductCreateDialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

async function getProducts(storeId: string) {
  const supabase = await createClientServer()

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', storeId)

  if (error) {
    throw new Error(`Failed to load products: ${error.message}`)
  }

  return products ?? []
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
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Merchant Products</h1>
        <ProductCreateDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product: { id: string; name: string; category?: string; semantic_data?: unknown }) => (
          <Card key={product.id}>
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground capitalize">{product.category || 'General'}</p>
              {product.semantic_data ? (
                <Badge>AI Ready</Badge>
              ) : (
                <Badge variant="secondary">Processing</Badge>
              )}
              <Button asChild variant="outline" className="w-full">
                <Link href={`/dashboard/products/${product.id}/node`}>
                  View AI Node
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
