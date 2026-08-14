import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Sparkles, ArrowRight, type LucideIcon } from 'lucide-react'

/* ============================================================
   Omnilink Dashboard Kit —— White Acrylic 共享组件
   白色画布 · 锐利几何（radius ≤ 8px）· 轻阴影 · 受控强调色
   Purple #8B5CF6 = AI · Green #10B981 = 商业 · Orange #F59E0B = 警示
   仅 UI 层，零业务逻辑。所有文案中文。
   ============================================================ */

/* 页面头部：模块标题 + 中文描述 + 右侧操作区 */
export function PageHeader({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children?: React.ReactNode
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-gray-900">{title}</h1>
        {description && (
          <p className="text-sm text-gray-500 mt-1 max-w-xl leading-relaxed">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2.5">{children}</div>}
    </header>
  )
}

/* 亚克力卡片（LEVEL 2） */
export function GlassCard({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('glass-panel rounded-lg p-5', className)}>{children}</div>
  )
}

/* 强调亚克力卡片（LEVEL 3，重点/AI 相关） */
export function FloatCard({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('glass-float rounded-lg p-5', className)}>{children}</div>
  )
}

/* 区块标题 */
export function SectionTitle({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="mb-4">
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
    </div>
  )
}

/* 主按钮（电光紫实心） */
export function PrimaryLink({
  href,
  children,
  className,
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        'btn-primary-omni inline-flex items-center gap-1.5 px-4 h-9 text-sm',
        className
      )}
    >
      {children}
    </Link>
  )
}

/* 次级按钮（白底灰边） */
export function GhostLink({
  href,
  children,
  className,
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-1.5 px-4 h-9 rounded-md text-sm font-medium',
        'bg-white border border-gray-200 text-gray-700',
        'hover:border-gray-300 hover:bg-gray-50 transition-colors duration-200',
        className
      )}
    >
      {children}
    </Link>
  )
}

/* 空状态：说明「什么为空 / 为什么重要 / 下一步做什么」 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="glass-panel rounded-lg px-8 py-14 flex flex-col items-center text-center">
      <div className="w-11 h-11 rounded-md flex items-center justify-center mb-4 bg-[#8b5cf6]/[0.08] border border-[#8b5cf6]/15">
        <Icon size={20} className="text-[#8b5cf6]" strokeWidth={1.75} />
      </div>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <p className="text-xs text-gray-500 mt-1.5 max-w-sm leading-relaxed">{description}</p>
      {action && <div className="mt-5 flex items-center gap-2.5">{action}</div>}
    </div>
  )
}

/* 即将推出占位 */
export function ComingSoon({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <div className="glass-panel rounded-lg px-8 py-14 flex flex-col items-center text-center">
      <div className="relative w-11 h-11 rounded-md flex items-center justify-center mb-4 bg-gray-50 border border-gray-200">
        <Icon size={20} className="text-gray-400" strokeWidth={1.75} />
        <span className="absolute -top-2 -right-2 text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20">
          即将推出
        </span>
      </div>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <p className="text-xs text-gray-500 mt-1.5 max-w-sm leading-relaxed">{description}</p>
    </div>
  )
}

/* 状态点 + 文案（tiny indicator，不滥用彩色标签） */
export function StatusDot({
  tone,
  label,
}: {
  tone: 'ok' | 'warn' | 'idle'
  label: string
}) {
  const color =
    tone === 'ok' ? 'bg-[#10b981]' : tone === 'warn' ? 'bg-[#f59e0b]' : 'bg-gray-300'
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600">
      <span className={cn('w-1.5 h-1.5 rounded-full', color)} />
      {label}
    </span>
  )
}

/* AI 状态徽章 */
export function AiBadge({ ready }: { ready: boolean }) {
  return ready ? (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded bg-[#8b5cf6]/[0.08] text-[#8b5cf6] border border-[#8b5cf6]/15">
      <Sparkles size={11} />
      AI 就绪
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 border border-gray-200">
      待完善
    </span>
  )
}

/* 进度条（紫 → 绿，细线条） */
export function ReadinessBar({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent))
  return (
    <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{
          width: `${clamped}%`,
          background: 'linear-gradient(90deg, #8b5cf6 0%, #10b981 100%)',
        }}
      />
    </div>
  )
}

/* AI 自动化率能量环：2D 矢量圆环（紫 → 绿），非 3D、非厚重渐变 */
export function EnergyRing({
  percent,
  size = 150,
  label,
  sub,
}: {
  percent: number
  size?: number
  label: string
  sub?: string
}) {
  const clamped = Math.max(0, Math.min(100, percent))
  const stroke = 8
  const r = (size - stroke) / 2 - 4
  const c = 2 * Math.PI * r
  const offset = c * (1 - clamped / 100)
  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="energy-ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        {/* 底环 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#eef0f2"
          strokeWidth={stroke}
        />
        {/* 进度环 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#energy-ring-grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tracking-tight text-gray-900 tnum">{label}</span>
        {sub && <span className="text-[10px] text-gray-500 mt-0.5 font-medium">{sub}</span>}
      </div>
    </div>
  )
}

/* 指标卡：Category / Main Metric / Delta / Metadata 四层结构 */
export function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: LucideIcon
  label: string
  value: string | number
  hint?: string
  accent?: boolean
}) {
  return (
    <div className={cn('rounded-lg p-4 glass-panel hover-lift', accent && 'circuit-purple relative overflow-hidden')}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
          {label}
        </span>
        <span
          className={cn(
            'w-7 h-7 rounded-md flex items-center justify-center',
            accent
              ? 'bg-[#8b5cf6] text-white'
              : 'bg-gray-100 text-gray-500'
          )}
        >
          <Icon size={14} strokeWidth={1.75} />
        </span>
      </div>
      <div className="mt-2.5 text-xl font-bold tracking-tight text-gray-900 tnum">{value}</div>
      {hint && <div className="text-[11px] text-gray-400 mt-1">{hint}</div>}
    </div>
  )
}

/* 列表行内「查看」链接 */
export function RowLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-xs font-medium text-[#8b5cf6] hover:text-[#7c3aed] transition-colors"
    >
      {label}
      <ArrowRight size={12} />
    </Link>
  )
}
