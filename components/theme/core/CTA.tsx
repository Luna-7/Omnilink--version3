/**
 * CTA —— Theme System 核心展示组件（Electric Violet）。
 *
 * 通用 CTA 区块（presentation only）。title / subtitle / action 全部来自 props。
 * 不依赖 store / product / 数据库 / 业务规则 / 路由发现（P3 B）。
 * 视觉全部消费 --th-* 令牌；section 级悬浮亚克力面板，响应式且紧凑。
 *
 * Server Component：无 state、无 client、无自动导航、无硬编码 URL（P6）。
 */

import Link from 'next/link'

export type CTAAction = {
  label: string
  href: string
}

type CTAProps = {
  title: string
  subtitle?: string
  /** 行动点。缺省只展示文案（不自动发明 /contact /shop /checkout 等 URL）。 */
  action?: CTAAction
}

export default function CTA({ title, subtitle, action }: CTAProps) {
  return (
    <section className="bg-[var(--th-color-background)] px-4 py-[calc(var(--th-spacing-section)/2)]">
      <div className="mx-auto max-w-[var(--th-spacing-container)]">
        {/* 悬浮亚克力面板 */}
        <div className="flex flex-col items-center gap-4 rounded-[var(--th-radius-card)] border border-[var(--th-color-border)] bg-[var(--th-color-surface)]/80 px-6 py-10 text-center shadow-[var(--th-shadow-floating)] backdrop-blur-md sm:px-10 sm:py-12">
          <h2 className="[font-family:var(--th-font-heading)] text-2xl [font-weight:var(--th-font-heading-weight)] leading-tight tracking-tight text-[var(--th-color-text)] sm:text-3xl">
            {title}
          </h2>

          {subtitle && (
            <p className="max-w-2xl text-base leading-relaxed text-[var(--th-color-muted)]">
              {subtitle}
            </p>
          )}

          {action && (
            <Link
              href={action.href}
              className="mt-2 inline-flex items-center justify-center rounded-[var(--th-radius-button)] bg-[var(--th-color-primary)] px-6 py-3 text-sm font-semibold text-white transition-colors [transition-duration:var(--th-motion-duration)] [transition-timing-function:var(--th-motion-easing)] hover:bg-[var(--th-color-accent)]"
            >
              {action.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
