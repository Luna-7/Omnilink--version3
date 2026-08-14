import { getStoreByOwnerId } from '@/lib/stores/service'
import { createClientServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader, GlassCard, SectionTitle } from '@/components/dashboard/kit'

export default async function SettingsPage() {
  const supabase = await createClientServer()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  const store = await getStoreByOwnerId(user.id)

  if (!store) {
    redirect('/onboarding')
  }

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader title="店铺设置" description="店铺基础身份信息。" />

      <GlassCard>
        <SectionTitle title="店铺信息" />
        <div className="space-y-4">
          <Field label="店铺名称" value={store.store_name} />
          <Field label="店铺标识（Slug）" value={store.store_slug} mono />
          <Field label="所属行业" value={store.industries?.name || '未设置'} />
        </div>
        <p className="mt-6 pt-5 border-t border-gray-100 text-xs text-gray-400 leading-relaxed">
          店铺信息修改功能即将上线。当前信息来源于开店时填写的内容。
        </p>
      </GlassCard>
    </div>
  )
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
      <div
        className={`w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 ${mono ? 'font-mono' : ''}`}
      >
        {value}
      </div>
    </div>
  )
}
