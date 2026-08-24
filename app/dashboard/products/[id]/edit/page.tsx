import { ProductWorkspace } from '@/components/products/ProductWorkspace'
import { createClientServer } from '@/lib/supabase/server'
import { DEMO_PRODUCTS } from '@/lib/products/demo-data'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClientServer()

  let dbProduct = null
  try {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    dbProduct = data
  } catch (err) {
    console.error('Failed to fetch product from db:', err)
  }

  let initialData = undefined

  if (dbProduct) {
    initialData = {
      name: dbProduct.name,
      description: dbProduct.description || '',
      price: Number(dbProduct.price) || 0,
      currency: dbProduct.currency || 'CNY',
      inventory: Number(dbProduct.inventory) || 0,
      sku: dbProduct.sku || '',
      category: dbProduct.category || 'Electronics & Acoustics',
    }
  } else {
    // Fallback to demo/sample product
    const demoProduct = DEMO_PRODUCTS.find(
      (p) => p.id === id || p.sku.toLowerCase() === id.toLowerCase()
    )
    if (demoProduct) {
      initialData = {
        name: demoProduct.name,
        description: demoProduct.description || '',
        price: Number(demoProduct.price) || 0,
        currency: demoProduct.currency || 'CNY',
        inventory: Number(demoProduct.inventory) || 0,
        sku: demoProduct.sku || '',
        category: demoProduct.category || 'Electronics & Acoustics',
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <ProductWorkspace productId={id} initialData={initialData} />
    </div>
  )
}
