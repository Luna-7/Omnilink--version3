import { getStoreByOwnerId } from '@/lib/stores/service'
import { createClientServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader, GlassCard, SectionTitle, StatusDot } from '@/components/dashboard/kit'
import { User } from 'lucide-react'

export default async function AccountPage() {
  const supabase = await createClientServer()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  const store = await getStoreByOwnerId(user.id)

  if (!store) {
    redirect('/onboarding')
  }

  const createdAt = user.created_at
    ? new Date(user.created_at).toLocaleDateString('zh-CN')
    : '—'

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader title="个人资料" description="你的账户基础信息与登录状态。" />

      <GlassCard>
        <div className="flex items-center gap-4 pb-6 border-b border-gray-100 mb-6">
          <div className="w-12 h-12 rounded-md bg-gray-900 flex items-center justify-center text-white text-lg font-bold">
            {(user.email?.slice(0, 1) ?? 'U').toUpperCase()}
          </div>
          <div>
            <div className="text-base font-bold text-gray-900">{user.email}</div>
            <div className="mt-1"><StatusDot tone="ok" label="账户正常" /></div>
          </div>
        </div>

        <SectionTitle title="账户信息" />
        <dl className="grid gap-4 sm:grid-cols-2">
          <InfoRow label="登录邮箱" value={user.email ?? '—'} />
          <InfoRow label="注册时间" value={createdAt} />
          <InfoRow label="所属店铺" value={store.store_name} />
          <InfoRow label="账户 ID" value={`${user.id.slice(0, 8)}…`} />
        </dl>

        <div className="mt-6 pt-6 border-t border-gray-100 flex items-start gap-3 text-xs text-gray-500 leading-relaxed">
          <User size={14} className="shrink-0 mt-0.5 text-gray-400" />
          <p>密码修改与双重验证等安全设置将在后续版本提供。当前账户通过邮箱登录受 Supabase Auth 保护。</p>
        </div>
      </GlassCard>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3.5">
      <dt className="text-xs text-gray-400">{label}</dt>
      <dd className="text-sm font-semibold text-gray-800 mt-1 truncate">{value}</dd>
    </div>
  )
}
