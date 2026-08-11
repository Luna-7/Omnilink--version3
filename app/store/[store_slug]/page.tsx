import { supabase } from '@/lib/supabase/client'
import { notFound } from 'next/navigation'
import StoreRenderer from '@/components/store/StoreRenderer'

export default async function PublicStorePage({
  params
}: {
  params: Promise<{ store_slug: string }>
}) {
  const { store_slug } = await params

  // Fetch store
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('*')
    .eq('store_slug', store_slug)
    .single()

  if (storeError || !store) {
    notFound()
  }

  // Fetch published store page
  const { data: page, error: pageError } = await supabase
    .from('store_pages')
    .select('*')
    .eq('store_id', store.id)
    .eq('published', true)
    .single()

  if (pageError || !page) {
    notFound()
  }

  // Fetch store products
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', store.id)
    .eq('status', 'active')

  const sections = page.sections as any
  const productsList = products || []

  return (
    <div className="min-h-screen">
      <StoreRenderer
        sections={sections?.sections || []}
        products={productsList}
        storeSlug={store_slug}
      />
    </div>
  )
}
