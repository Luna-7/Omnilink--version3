import { ProductWorkspace } from '@/components/products/ProductWorkspace'
import { createClientServer } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClientServer()

  const { data: dbProduct } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!dbProduct) {
    // If not found in DB, pass default fallback or render with ID
  }

  const initialData = dbProduct
    ? {
        name: dbProduct.name,
        description: dbProduct.description || '',
        price: Number(dbProduct.price) || 0,
        currency: dbProduct.currency || 'CNY',
        inventory: Number(dbProduct.inventory) || 0,
        sku: dbProduct.sku || '',
        category: dbProduct.category || 'Electronics & Acoustics',
      }
    : undefined

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <ProductWorkspace productId={id} initialData={initialData} />
    </div>
  )
}
