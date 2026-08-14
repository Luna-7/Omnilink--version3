import { PageHeader, GlassCard, SectionTitle } from '@/components/dashboard/kit'
import { Database, ShieldCheck, Sparkles } from 'lucide-react'

export default function DataSettingsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader title="商品与数据" description="商品数据的结构与语义处理策略。" />

      <div className="space-y-4">
        <GlassCard>
          <div className="flex items-center gap-2.5 mb-2">
            <Database size={15} className="text-violet-500" />
            <SectionTitle title="数据结构" />
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            商品数据以结构化字段存储（名称、分类、价格、描述等），并为每件商品生成 AI 可理解的语义数据节点。字段自定义能力将在后续版本开放。
          </p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2.5 mb-2">
            <Sparkles size={15} className="text-violet-500" />
            <SectionTitle title="语义处理" />
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            新建或导入商品后，系统会自动为其生成语义数据。处理完成后，商品会标记为「AI 就绪」，可被 Agent API 调用。
          </p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2.5 mb-2">
            <ShieldCheck size={15} className="text-violet-500" />
            <SectionTitle title="数据安全" />
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            店铺数据通过行级安全策略（RLS）隔离，仅店铺所有者可访问。数据导出与备份功能即将推出。
          </p>
        </GlassCard>
      </div>
    </div>
  )
}
