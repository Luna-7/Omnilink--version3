import { PageHeader, GlassCard, FloatCard, SectionTitle } from '@/components/dashboard/kit'
import { Image as ImageIcon, ShieldCheck } from 'lucide-react'

export default function WatermarkPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="水印策略"
        description="水印用于保护商品图片，降低图片资产被无授权移除或滥用的风险。"
      />

      <GlassCard className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-800">启用图片水印</h3>
            <p className="text-xs text-gray-400 mt-1">在商品图片上叠加店铺标识水印</p>
          </div>
          {/* 视觉占位开关：后端策略未实现，禁用态 */}
          <button
            disabled
            role="switch"
            aria-checked={false}
            aria-label="启用图片水印（即将上线）"
            className="w-11 h-6 rounded-full bg-slate-200 relative cursor-not-allowed opacity-60"
            title="即将上线"
          >
            <span className="absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow" />
          </button>
        </div>
      </GlassCard>

      <FloatCard className="mb-4">
        <SectionTitle title="水印预览" description="配置生效后的效果示意" />
        <div className="relative h-44 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
          <ImageIcon size={28} className="text-gray-300" />
          <span className="absolute bottom-3 right-4 text-xs font-bold text-gray-400/70 select-none">
            Omnilink 店铺
          </span>
        </div>
        <p className="text-[11px] text-gray-400 mt-3">位置：右下角 · 不透明度：默认</p>
      </FloatCard>

      <p className="text-xs text-gray-400 flex items-start gap-2 leading-relaxed">
        <ShieldCheck size={13} className="shrink-0 mt-0.5" />
        水印策略的后端处理管线正在建设中，上线后可配置开关、位置与不透明度。当前页面为策略预览。
      </p>
    </div>
  )
}
