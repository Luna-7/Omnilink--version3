import { supabase } from '@/lib/supabase/client'
import { notFound } from 'next/navigation'

export default async function PublicProductPage({
  params
}: {
  params: Promise<{ store_slug: string; id: string }>
}) {
  const { store_slug, id } = await params

  // Fetch store
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('*')
    .eq('store_slug', store_slug)
    .single()

  if (storeError || !store) {
    notFound()
  }

  // Fetch product with semantic_data
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*, semantic_data')
    .eq('id', id)
    .eq('store_id', store.id)
    .single()

  if (productError || !product) {
    notFound()
  }

  const semanticData = (product as any).semantic_data as Record<string, unknown> || {}

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability: 'https://schema.org/InStock'
    },
    ...Object.entries(semanticData).reduce((acc, [key, value]) => {
      acc[key] = value
      return acc
    }, {} as Record<string, unknown>)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-gray-600 mb-6">{product.description}</p>
          
          <div className="mb-6">
            <span className="text-2xl font-bold text-green-600">
              ${product.price} {product.currency}
            </span>
          </div>

          {Object.keys(semanticData).length > 0 && (
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Product Details</h2>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(semanticData).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 p-3 rounded">
                    <span className="text-sm text-gray-500 capitalize">{key}</span>
                    <p className="font-medium">{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6">
          <a
            href={`/store/${store_slug}`}
            className="text-blue-600 hover:text-blue-700"
          >
            ← Back to Store
          </a>
        </div>
      </div>
    </div>
  )
}
