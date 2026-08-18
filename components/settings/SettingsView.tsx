'use client'

import React from 'react'
import { SectionTitle } from '@/components/dashboard/kit'
import { useLanguage } from '@/context/LanguageContext'
import { Settings, Store, Hash, Tag, Sparkles, SlidersHorizontal } from 'lucide-react'

export type SettingsViewProps = {
  currentStore: {
    store_name: string
    store_slug?: string
    industries?: { name: string } | null
  }
}

export function SettingsView({ currentStore }: SettingsViewProps) {
  const { t, isZh } = useLanguage()

  return (
    <div className="space-y-5">
      {/* 顶部指标卡行 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="crextio-card p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F4F5F7] border border-[#E5E7EB] text-[#111827] flex items-center justify-center shrink-0">
              <Store size={18} />
            </div>
            <div>
              <span className="text-xs text-[#6B7280] block font-medium">{t.settings.storeEntity}</span>
              <div className="text-base font-bold text-[#111827] mt-0.5 truncate max-w-[160px]">
                {currentStore.store_name}
              </div>
            </div>
          </div>
        </div>

        <div className="crextio-card p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F4F5F7] border border-[#E5E7EB] text-[#111827] flex items-center justify-center shrink-0">
              <Tag size={18} />
            </div>
            <div>
              <span className="text-xs text-[#6B7280] block font-medium">{t.settings.industryCategory}</span>
              <div className="text-base font-bold text-[#111827] mt-0.5">
                {currentStore.industries?.name || (isZh ? '零售百货' : 'Retail & Goods')}
              </div>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#edbc40] text-[#111827] text-xs font-bold shadow-sm">
            Live
          </span>
        </div>

        <div className="crextio-dark-card p-5 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs text-white/80 block font-medium">{t.settings.configuration}</span>
            <div className="text-sm font-bold text-white">{t.settings.productionMode}</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/10 text-[#edbc40] flex items-center justify-center">
            <SlidersHorizontal size={15} />
          </div>
        </div>
      </div>

      {/* 主体网格 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 左侧：店铺基本参数 (占 7 栏) */}
        <div className="lg:col-span-7">
          <div className="crextio-card p-6 h-full flex flex-col justify-between">
            <div>
              <SectionTitle
                title={t.settings.storeProfile}
                description={t.settings.storeProfileDesc}
              />

              <div className="space-y-4 mt-5">
                <FieldItem
                  label={t.settings.storeDisplayName}
                  value={currentStore.store_name}
                  icon={Store}
                />
                <FieldItem
                  label={t.settings.storeSlug}
                  value={currentStore.store_slug || '—'}
                  icon={Hash}
                  mono
                />
                <FieldItem
                  label={t.settings.industrySector}
                  value={currentStore.industries?.name || (isZh ? '综合零售' : 'General Retail')}
                  icon={Tag}
                />
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-[#E5E7EB] flex items-center gap-2 text-xs text-[#6B7280]">
              <Sparkles size={14} className="text-[#111827] shrink-0" />
              <span>{t.settings.syncNotice}</span>
            </div>
          </div>
        </div>

        {/* 右侧：高级偏好 (占 5 栏) */}
        <div className="lg:col-span-5">
          <div className="crextio-card p-6 flex flex-col justify-between h-full">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#F4F5F7] border border-[#E5E7EB] flex items-center justify-center text-[#111827] mb-4">
                <Settings size={22} />
              </div>

              <h3 className="font-heading text-lg font-bold text-[#111827]">
                {t.settings.systemPreferences}
              </h3>
              <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
                {t.settings.systemPreferencesDesc}
              </p>

              <div className="space-y-2.5 mt-5">
                <div className="p-3.5 rounded-2xl bg-[#F4F5F7] border border-[#E5E7EB] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111827]">{t.settings.currencySymbol}</span>
                  <span className="text-xs font-bold text-[#111827]">CNY (¥)</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F4F5F7] border border-[#E5E7EB] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111827]">{t.settings.imageWatermarking}</span>
                  <span className="text-xs font-bold text-[#e28c33]">{t.settings.enabledState}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E5E7EB]">
              <button
                type="button"
                className="w-full py-2.5 px-4 rounded-full bg-[#111827] hover:bg-black text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                {t.settings.savePreferences}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FieldItem({
  label,
  value,
  mono,
  icon: Icon,
}: {
  label: string
  value: string
  mono?: boolean
  icon: React.ComponentType<{ size?: number; className?: string }>
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#6B7280] mb-1.5">{label}</label>
      <div className="flex items-center gap-3 bg-[#F4F5F7] border border-[#E5E7EB] rounded-2xl px-4 py-3 text-xs font-semibold text-[#111827]">
        <Icon size={15} className="text-[#6B7280] shrink-0" />
        <span className={mono ? 'font-mono' : ''}>{value}</span>
      </div>
    </div>
  )
}
