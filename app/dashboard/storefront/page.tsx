'use client'

import Link from 'next/link'
import { SectionTitle } from '@/components/dashboard/kit'
import { useLanguage } from '@/context/LanguageContext'
import { Store, Globe, MousePointerClick, Palette, Sparkles, ArrowRight, Eye, Layout } from 'lucide-react'

export default function StorefrontPage() {
  const { t, isZh } = useLanguage()

  const SECTIONS = [
    { name: t.storefront.navBar, icon: Layout },
    { name: t.storefront.heroBanner, icon: Sparkles },
    { name: t.storefront.productGrid, icon: Store },
    { name: t.storefront.footerPolicies, icon: MousePointerClick },
  ]

  return (
    <div className="space-y-5">
      {/* 顶部指标卡行 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="crextio-card p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F4F5F7] border border-[#E5E7EB] text-[#111827] flex items-center justify-center shrink-0">
              <Globe size={18} />
            </div>
            <div>
              <span className="text-xs text-[#6B7280] block font-medium">{t.storefront.liveStorefront}</span>
              <div className="text-base font-bold text-[#111827] mt-0.5">
                {t.storefront.multiThemeEnabled}
              </div>
            </div>
          </div>
        </div>

        <div className="crextio-card p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F4F5F7] border border-[#E5E7EB] text-[#111827] flex items-center justify-center shrink-0">
              <Palette size={18} />
            </div>
            <div>
              <span className="text-xs text-[#6B7280] block font-medium">{t.storefront.themeEngine}</span>
              <div className="text-base font-bold text-[#111827] mt-0.5">
                {t.storefront.modernClean}
              </div>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#edbc40] text-[#111827] text-xs font-bold shadow-sm">
            Active
          </span>
        </div>

        <div className="crextio-dark-card p-5 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs text-white/80 block font-medium">{t.storefront.storeConsole}</span>
            <div className="text-sm font-bold text-white">{t.storefront.publishReady}</div>
          </div>
          <Link
            href="/dashboard/store"
            className="w-8 h-8 rounded-full bg-white/10 text-[#edbc40] flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* 主体布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 左侧：页面组件列表 (占 3 栏) */}
        <div className="lg:col-span-3">
          <div className="crextio-card p-5 h-full">
            <SectionTitle title={t.storefront.sections} description={t.storefront.sectionsDesc} />
            <ul className="space-y-2 mt-4">
              {SECTIONS.map((c) => {
                const Icon = c.icon
                return (
                  <li
                    key={c.name}
                    className="flex items-center gap-2.5 px-3.5 py-3 rounded-2xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs font-bold text-[#111827]"
                  >
                    <Icon size={14} className="text-[#111827]" />
                    <span>{c.name}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        {/* 中间：可视化画板预览 (占 6 栏) */}
        <div className="lg:col-span-6">
          <div className="crextio-card p-8 min-h-[380px] flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#F4F5F7] border border-[#E5E7EB] text-[#111827] flex items-center justify-center mb-4 shadow-sm">
              <Palette size={26} strokeWidth={1.75} />
            </div>
            <h3 className="font-heading text-lg font-bold text-[#111827]">
              {t.storefront.visualDesigner}
            </h3>
            <p className="text-xs text-[#6B7280] mt-2 max-w-sm leading-relaxed">
              {t.storefront.visualDesignerDesc}
            </p>

            <Link
              href="/dashboard/store"
              className="mt-6 px-6 py-2.5 rounded-full bg-[#111827] hover:bg-black text-white text-xs font-semibold shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Eye size={14} className="text-[#edbc40]" />
              <span>{t.storefront.configureInStore}</span>
            </Link>
          </div>
        </div>

        {/* 右侧：样式属性配置 (占 3 栏) */}
        <div className="lg:col-span-3">
          <div className="crextio-card p-5 h-full flex flex-col justify-between">
            <div>
              <SectionTitle title={t.storefront.themeProperties} description={t.storefront.globalStyling} />
              <div className="space-y-3 mt-4">
                <div className="bg-[#F4F5F7] border border-[#E5E7EB] rounded-2xl p-3.5">
                  <span className="text-[11px] text-[#6B7280] block font-medium">{t.storefront.primaryAccent}</span>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#edbc40] border border-black/10" />
                    <span className="text-xs font-bold text-[#111827]">
                      {isZh ? '荧光青柠 (#edbc40)' : 'Vivid Lime (#edbc40)'}
                    </span>
                  </div>
                </div>

                <div className="bg-[#F4F5F7] border border-[#E5E7EB] rounded-2xl p-3.5">
                  <span className="text-[11px] text-[#6B7280] block font-medium">{t.storefront.cornerRadius}</span>
                  <span className="text-xs font-bold text-[#111827] block mt-1">
                    {isZh ? '20px 现代微圆角' : '20px Modern Radius'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
