import { PageHeader, GlassCard, SectionTitle, ComingSoon } from '@/components/dashboard/kit'
import { KeyRound, Lock } from 'lucide-react'

export default function ApiKeysPage() {
  return (
    <div className="max-w-4xl space-y-4">
      <PageHeader title="API 密钥" description="管理外部系统访问你店铺数据的凭据。" />

      {/* 密钥容器预览：深紫透明容器 + 荧光白等宽文字，页面其余保持白色画布 */}
      <GlassCard>
        <SectionTitle
          title="密钥预览"
          description="密钥创建后只会完整展示一次，此后仅显示脱敏摘要。以下为样式示意，非真实密钥。"
        />
        <div
          className="rounded-md px-4 py-3.5 font-mono text-sm flex items-center gap-3"
          style={{
            background: 'rgba(59, 7, 100, 0.92)',
            border: '1px solid rgba(59, 54, 134, 0.35)',
          }}
        >
          <Lock size={14} className="text-iris shrink-0" />
          <span className="tracking-wider text-white">
            omni_live_••••••••••••••••••••••••
          </span>
          <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white/15 text-iris font-sans">
            脱敏
          </span>
        </div>
      </GlassCard>

      <ComingSoon
        icon={KeyRound}
        title="API 密钥管理即将推出"
        description="密钥创建、轮换与吊销功能正在建设中。出于安全考虑，密钥只会在创建时完整展示一次，此后仅显示脱敏摘要。"
      />
    </div>
  )
}
