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
    const rawData =
      dbProduct.raw_data && typeof dbProduct.raw_data === 'object'
        ? (dbProduct.raw_data as Record<string, unknown>)
        : {}
    const category =
      (typeof rawData.category === 'string' && rawData.category.trim() ? rawData.category : null) ||
      (typeof rawData.category_id === 'string' && rawData.category_id.trim() ? rawData.category_id : null) ||
      ''

    const imageUrl =
      (typeof rawData.image_url === 'string' && rawData.image_url.trim() ? rawData.image_url : null) ||
      (Array.isArray(rawData.images) && rawData.images[0]?.url ? rawData.images[0].url : null) ||
      null

    const existingAssets = Array.isArray(rawData.images) && rawData.images.length > 0
      ? rawData.images.map((img: any, idx: number) => ({
          id: img.id || `img-${idx}`,
          url: img.url,
          asset_type: 'image' as const,
        }))
      : imageUrl
      ? [{ id: 'main-asset', url: imageUrl, asset_type: 'image' as const }]
      : []

    initialData = {
      name: dbProduct.name,
      description: dbProduct.description || '',
      price: Number(dbProduct.price) || 0,
      currency: dbProduct.currency || 'CNY',
      inventory: Number(dbProduct.inventory) || 0,
      sku: dbProduct.sku || '',
      category: category,
      categoryId: typeof rawData.category_id === 'string' ? rawData.category_id : null,
      status: (dbProduct.status || 'draft') as 'draft' | 'active' | 'archived',
      existingAssets,
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
