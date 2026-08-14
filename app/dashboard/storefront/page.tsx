import { PageHeader, FloatCard, GlassCard, SectionTitle, PrimaryLink } from '@/components/dashboard/kit'
import { Store, Globe, MousePointerClick, Palette } from 'lucide-react'

export default function StorefrontPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="模板编辑器"
        description="定制你的线上商店外观——选择模板、发布门店。"
      >
        <PrimaryLink href="/dashboard/store">
          <Store size={15} />
          打开模板与发布控制台
        </PrimaryLink>
      </PageHeader>

      {/* 未来可视化编辑器的信息架构占位：左组件 / 中预览 / 右属性 */}
      <div className="grid gap-4 lg:grid-cols-[220px_1fr_220px] mb-6">
        <GlassCard className="hidden lg:block">
          <SectionTitle title="组件" />
          <ul className="space-y-2 text-sm text-gray-500">
            {['页头导航', '商品陈列', '品牌横幅', '页脚信息'].map((c) => (
              <li key={c} className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-50 border border-gray-200">
                <MousePointerClick size={13} className="text-gray-400" />
                {c}
              </li>
            ))}
          </ul>
        </GlassCard>

        <FloatCard className="min-h-[280px] flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 flex items-center justify-center mb-4">
            <Palette size={22} className="text-gray-400" />
          </div>
          <h3 className="text-sm font-bold text-gray-800">可视化编辑预览区</h3>
          <p className="text-xs text-gray-400 mt-2 max-w-xs leading-relaxed">
            完整的拖拽式页面编辑器正在建设中。当前可通过模板与发布控制台完成门店配置。
          </p>
        </FloatCard>

        <GlassCard className="hidden lg:block">
          <SectionTitle title="属性" />
          <p className="text-xs text-gray-400 leading-relaxed px-1">
            选中组件后，在这里调整颜色、文案与布局属性。
          </p>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Globe size={16} className="text-violet-500 shrink-0" />
          <p>
            模板选择与门店发布已可用：进入
            <span className="font-semibold text-gray-800">「模板与发布控制台」</span>
            选择模板并发布你的线上商店。
          </p>
        </div>
      </GlassCard>
    </div>
  )
}
