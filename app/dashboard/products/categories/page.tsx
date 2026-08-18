import { getStoreByOwnerId } from '@/lib/stores/service'
import { createClientServer } from '@/lib/supabase/server'
import { CategoriesView } from '@/components/product/CategoriesView'

export default async function CategoriesPage() {
  const supabase = await createClientServer()
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user ?? null
  } catch {
    user = null
  }

  let dbCategories: Array<{ name: string; count: number }> = []

  if (user) {
    const store = await getStoreByOwnerId(user.id).catch(() => null)
    if (store) {
      const { data: products } = await supabase
        .from('products')
        .select('id, category')
        .eq('store_id', store.id)

      if (products && products.length > 0) {
        const counts = new Map<string, number>()
        for (const p of products) {
          const key = p.category?.trim() || '未分类'
          counts.set(key, (counts.get(key) ?? 0) + 1)
        }
        dbCategories = Array.from(counts.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
      }
    }
  }

  return <CategoriesView initialCategories={dbCategories} />
}
