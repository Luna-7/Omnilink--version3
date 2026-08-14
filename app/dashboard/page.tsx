import { getStoreByOwnerId } from '@/lib/stores/service'
import { createClientServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  PageHeader, GlassCard, FloatCard, MetricCard, PrimaryLink, GhostLink,
  SectionTitle, StatusDot, EnergyRing,
} from '@/components/dashboard/kit'
import {
  Package, Sparkles, Store, Plus, Boxes, CheckCircle2, Activity, Zap,
} from 'lucide-react'

/* 真实产品统计：总数 + AI 就绪数（semantic_data 非空） */
async function getProductStats(storeId: string) {
  const supabase = await createClientServer()
  const { data, error } = await supabase
    .from('products')
    .select('id, semantic_data')
    .eq('store_id', storeId)

  if (error) {
    return { total: 0, aiReady: 0 }
  }

  const total = data?.length ?? 0
  const aiReady = (data ?? []).filter((p) => p.semantic_data).length
  return { total, aiReady }
}

export default async function DashboardPage() {
  const supabase = await createClientServer()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  const store = await getStoreByOwnerId(user.id)

  if (!store) {
    redirect('/onboarding')
  }

  const stats = await getProductStats(store.id)
  const readiness = stats.total > 0 ? Math.round((stats.aiReady / stats.total) * 100) : 0

  return (
    <div>
      <PageHeader
        title="概览"
        description="你的店铺指挥中心——店铺状态、核心数据与 AI 就绪度，一眼看清。"
      >
        <GhostLink href="/dashboard/products/import">
          <Sparkles size={14} />
          AI 智能导入
        </GhostLink>
        <PrimaryLink href="/dashboard/products/new">
          <Plus size={14} />
          添加产品
        </PrimaryLink>
      </PageHeader>

      {/* 店铺状态条 */}
      <GlassCard className="mb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-md bg-gray-900 flex items-center justify-center text-white text-sm font-bold">
              {store.store_name?.slice(0, 1) ?? 'O'}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-semibold text-gray-900">{store.store_name}</h2>
                <StatusDot tone="ok" label="运行中" />
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {store.industries?.name || '未设置行业'} · 店铺标识 {store.store_slug}
              </p>
            </div>
          </div>
          <GhostLink href="/dashboard/storefront">
            <Store size={14} />
            查看线上商店
          </GhostLink>
        </div>
      </GlassCard>

      <div className="grid gap-4 lg:grid-cols-3 mb-4">
        {/* AI 自动化率能量环（2D 矢量，紫→绿） */}
        <FloatCard className="circuit-purple flex flex-col items-center justify-center py-7">
          <EnergyRing
            percent={readiness}
            label={`${readiness}%`}
            sub="AI 数据就绪度"
          />
          <p className="text-xs text-gray-500 mt-4 text-center leading-relaxed px-4">
            {stats.total === 0
              ? '还没有商品数据，导入第一个产品开始构建。'
              : `${stats.aiReady} / ${stats.total} 个商品已具备 AI 可理解的语义数据`}
          </p>
        </FloatCard>

        {/* 实时任务流（无后端任务源 → 诚实空态） */}
        <GlassCard>
          <SectionTitle title="实时任务流" description="AI 正在处理的商品任务" />
          <div className="flex flex-col items-center justify-center text-center py-8">
            <div className="w-10 h-10 rounded-md flex items-center justify-center mb-3 bg-[#8b5cf6]/[0.08] border border-[#8b5cf6]/15">
              <Zap size={17} className="text-[#8b5cf6]" strokeWidth={1.75} />
            </div>
            <p className="text-sm font-medium text-gray-700">暂无进行中的任务</p>
            <p className="text-xs text-gray-400 mt-1.5 leading-relaxed max-w-[220px]">
              使用 AI 智能导入后，解析任务将实时显示在这里。
            </p>
          </div>
        </GlassCard>

        {/* Agent 活跃度（2D 波浪线图 + 即将推出） */}
        <GlassCard>
          <SectionTitle title="Agent 活跃度" description="AI Agent 调用趋势" />
          <div className="relative">
            <AgentWave />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20">
                即将推出
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3 leading-relaxed">
            接入 Agent API 后，这里将展示调用量与活跃趋势。
          </p>
        </GlassCard>
      </div>

      {/* 核心指标 */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-4">
        <MetricCard icon={Boxes} label="商品总数" value={stats.total} hint="店铺内全部商品" />
        <MetricCard icon={CheckCircle2} label="AI 就绪商品" value={stats.aiReady} hint="语义数据已生成" />
        <MetricCard icon={Sparkles} label="数据完整度" value={`${readiness}%`} hint="AI 就绪商品占比" accent />
        <MetricCard icon={Store} label="店铺状态" value="正常" hint="线上服务运行中" />
      </div>

      {/* 快捷操作 */}
      <GlassCard>
        <SectionTitle title="快捷操作" />
        <div className="grid gap-2.5 sm:grid-cols-2">
          <QuickAction
            href="/dashboard/products/new"
            icon={<Plus size={15} />}
            title="添加产品"
            desc="手动创建单个商品"
          />
          <QuickAction
            href="/dashboard/products/import"
            icon={<Sparkles size={15} />}
            title="AI 智能导入"
            desc="上传表格，AI 自动解析为结构化数据"
          />
          <QuickAction
            href="/dashboard/storefront"
            icon={<Store size={15} />}
            title="编辑线上商店"
            desc="配置模板并发布门店"
          />
          <QuickAction
            href="/dashboard/products"
            icon={<Package size={15} />}
            title="管理产品"
            desc="查看全部商品与 AI 状态"
          />
        </div>
      </GlassCard>
    </div>
  )
}

/* 2D 波浪线（Agent 活跃度占位视觉，非真实数据） */
function AgentWave() {
  return (
    <svg viewBox="0 0 240 80" className="w-full h-20" aria-hidden="true">
      {/* 中性网格 */}
      <g stroke="#f1f2f4" strokeWidth="1">
        <line x1="0" y1="20" x2="240" y2="20" />
        <line x1="0" y1="40" x2="240" y2="40" />
        <line x1="0" y1="60" x2="240" y2="60" />
      </g>
      <path
        d="M0 50 C 30 30, 50 62, 80 44 S 130 22, 160 40 S 215 58, 240 38"
        fill="none"
        stroke="#8b5cf6"
        strokeWidth="1.75"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M0 62 C 35 48, 60 70, 95 56 S 150 40, 185 54 S 225 66, 240 52"
        fill="none"
        stroke="#10b981"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  )
}

function QuickAction({
  href,
  icon,
  title,
  desc,
}: {
  href: string
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-md border border-gray-200 bg-white px-4 py-3 transition-all duration-200 hover:border-[#8b5cf6]/30 hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)]"
    >
      <span className="w-8 h-8 rounded-md bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 group-hover:text-[#8b5cf6] group-hover:border-[#8b5cf6]/25 transition-colors">
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium text-gray-900">{title}</span>
        <span className="block text-xs text-gray-400 mt-0.5 truncate">{desc}</span>
      </span>
      <Activity size={13} className="text-gray-300 group-hover:text-[#8b5cf6] transition-colors shrink-0" />
    </Link>
  )
}
