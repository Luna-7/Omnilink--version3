import { getStoreByOwnerId } from '@/lib/stores/service'
import { createClientServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader, GlassCard, EmptyState, StatusDot, RowLink } from '@/components/dashboard/kit'
import { Globe, FileText } from 'lucide-react'

type StorePageRow = {
  id: string
  store_id: string
  published?: boolean | null
  created_at?: string
  updated_at?: string
}

export default async function StorePagesPage() {
  const supabase = await createClientServer()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  const store = await getStoreByOwnerId(user.id)

  if (!store) {
    redirect('/onboarding')
  }

  // 真实查询：当前店铺已生成的商店页面
  const { data: pages } = await supabase
    .from('store_pages')
    .select('*')
    .eq('store_id', store.id)

  const pageList = (pages ?? []) as StorePageRow[]

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="页面管理"
        description="管理线上商店对外展示的页面及其发布状态。"
      />

      {pageList.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="还没有商店页面"
          description="在模板编辑器中选择模板后，系统会为你的店铺生成首页。自定义页面（关于我们、联系我们等）将在后续版本提供。"
        />
      ) : (
        <GlassCard className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                <th className="px-5 py-3.5 font-semibold">页面</th>
                <th className="px-5 py-3.5 font-semibold">URL</th>
                <th className="px-5 py-3.5 font-semibold">状态</th>
                <th className="px-5 py-3.5 font-semibold text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {pageList.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-gray-800">首页</td>
                  <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">
                    /store/{store.store_slug}
                  </td>
                  <td className="px-5 py-3.5">
                    {p.published ? (
                      <StatusDot tone="ok" label="已发布" />
                    ) : (
                      <StatusDot tone="idle" label="未发布" />
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <RowLink href="/dashboard/store" label="前往管理" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      )}

      <p className="mt-4 text-xs text-gray-400 flex items-center gap-2">
        <Globe size={13} />
        发布后可通过公开链接访问你的线上商店。
      </p>
    </div>
  )
}
