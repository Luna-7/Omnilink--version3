import { PageHeader, FloatCard, GlassCard, SectionTitle, StatusDot } from '@/components/dashboard/kit'
import { CheckCircle2, ShieldCheck } from 'lucide-react'

export default function SubscriptionPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader title="订阅计划" description="当前方案与功能权限。" />

      <FloatCard className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">基础版</h2>
              <StatusDot tone="ok" label="当前方案" />
            </div>
            <p className="text-sm text-gray-500 mt-1.5">
              覆盖 MVP 阶段的核心能力：店铺、产品数据与线上商店。
            </p>
          </div>
          <button
            disabled
            className="btn-primary-omni px-5 py-2.5 rounded-lg text-sm opacity-50 cursor-not-allowed"
            title="升级入口即将开放"
          >
            升级（即将开放）
          </button>
        </div>
      </FloatCard>

      <GlassCard>
        <SectionTitle title="功能权限" />
        <ul className="grid gap-3 sm:grid-cols-2">
          {[
            '单店铺管理',
            '产品数据管理',
            'AI 智能导入',
            '线上商店发布',
            'Agent API（即将开放）',
            '团队协作（即将推出）',
          ].map((f) => (
            <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
              <CheckCircle2 size={15} className="text-violet-500 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
        <p className="mt-6 pt-5 border-t border-gray-100 text-xs text-gray-400 flex items-center gap-2">
          <ShieldCheck size={13} />
          计费与用量统计将在正式版提供，当前不产生任何费用。
        </p>
      </GlassCard>
    </div>
  )
}
