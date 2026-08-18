import { getStoreByOwnerId } from '@/lib/stores/service'
import { createClientServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader, EmptyState, RowLink } from '@/components/dashboard/kit'
import { Folder, Package } from 'lucide-react'

type ProductCategoryRow = { id: string; category?: string | null }

export default async function CategoriesPage() {
  const supabase = await createClientServer()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  const store = await getStoreByOwnerId(user.id)

  if (!store) {
    redirect('/onboarding')
  }

  // 基于真实产品数据聚合分类（当前无独立分类表，分类来自产品 category 字段）
  const { data: products } = await supabase
    .from('products')
    .select('id, category')
    .eq('store_id', store.id)

  const rows = (products ?? []) as ProductCategoryRow[]
  const counts = new Map<string, number>()
  for (const p of rows) {
    const key = p.category?.trim() || '未分类'
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  const categories = Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="分类"
        description="按分类组织你的产品数据。分类信息来源于产品的分类字段。"
      />

      {categories.length === 0 ? (
        <EmptyState
          icon={Folder}
          title="还没有分类"
          description="创建产品并填写分类字段后，这里会自动生成产品分类视图。"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <div key={c.name} className="glass-panel rounded-lg p-5 flex items-center gap-4">
              <span className="w-11 h-11 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500">
                <Package size={18} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-gray-800 truncate">{c.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">{c.count} 个产品</div>
              </div>
              <RowLink href="/dashboard/products" label="查看" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
