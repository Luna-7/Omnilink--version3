'use client'

import React from 'react'
import {
  SectionTitle,
  StatusDot,
} from '@/components/dashboard/kit'
import { useLanguage } from '@/context/LanguageContext'
import { ShieldCheck, Calendar, Store, Fingerprint, KeyRound, Sparkles } from 'lucide-react'

export type AccountViewProps = {
  currentStore: { store_name: string; id: string }
  currentUser: { email: string; id: string; created_at?: string }
}

export function AccountView({ currentStore, currentUser }: AccountViewProps) {
  const { t, isZh } = useLanguage()

  const createdAt = currentUser.created_at
    ? new Date(currentUser.created_at).toLocaleDateString(isZh ? 'zh-CN' : 'en-US', {
        year: 'numeric',
        month: isZh ? 'long' : 'short',
        day: 'numeric',
      })
    : '—'

  return (
    <div className="space-y-5">
      {/* 顶部指标卡行 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="crextio-card p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F4F5F7] border border-[#E5E7EB] text-[#111827] flex items-center justify-center shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <span className="text-xs text-[#6B7280] block font-medium">{t.account.accountStatus}</span>
              <div className="text-base font-bold text-[#111827] mt-0.5">
                <StatusDot tone="ok" label={t.account.activeVerified} />
              </div>
            </div>
          </div>
        </div>

        <div className="crextio-card p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F4F5F7] border border-[#E5E7EB] text-[#111827] flex items-center justify-center shrink-0">
              <Store size={18} />
            </div>
            <div>
              <span className="text-xs text-[#6B7280] block font-medium">{t.account.assignedStore}</span>
              <div className="text-base font-bold text-[#111827] mt-0.5 truncate max-w-[160px]">
                {currentStore.store_name}
              </div>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#edbc40] text-[#111827] text-xs font-bold shadow-sm">
            Owner
          </span>
        </div>

        <div className="crextio-dark-card p-5 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs text-white/80 block font-medium">{t.account.securityKey}</span>
            <div className="text-sm font-bold text-white">{t.account.oauthAuth}</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/10 text-[#edbc40] flex items-center justify-center">
            <KeyRound size={15} />
          </div>
        </div>
      </div>

      {/* 主体网格 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 左侧：账户凭据与信息 (占 7 栏) */}
        <div className="lg:col-span-7">
          <div className="crextio-card p-6 h-full flex flex-col justify-between">
            <div>
              <SectionTitle
                title={t.account.accountDetails}
                description={t.account.accountDetailsDesc}
              />

              <div className="space-y-4 mt-5">
                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] mb-1.5">
                    {t.account.emailAddress}
                  </label>
                  <div className="flex items-center gap-3 bg-[#F4F5F7] border border-[#E5E7EB] rounded-2xl px-4 py-3 text-xs font-bold text-[#111827]">
                    <span className="font-mono">{currentUser.email}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] mb-1.5">
                    {t.account.uniqueUserId}
                  </label>
                  <div className="flex items-center gap-3 bg-[#F4F5F7] border border-[#E5E7EB] rounded-2xl px-4 py-3 text-xs font-mono text-[#6B7280]">
                    <Fingerprint size={15} className="text-[#111827] shrink-0" />
                    <span className="truncate">{currentUser.id}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] mb-1.5">
                    {t.account.registrationDate}
                  </label>
                  <div className="flex items-center gap-3 bg-[#F4F5F7] border border-[#E5E7EB] rounded-2xl px-4 py-3 text-xs font-medium text-[#111827]">
                    <Calendar size={15} className="text-[#6B7280] shrink-0" />
                    <span>{createdAt}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-[#E5E7EB] flex items-center gap-2 text-xs text-[#6B7280]">
              <Sparkles size={14} className="text-[#111827] shrink-0" />
              <span>{t.account.mfaNotice}</span>
            </div>
          </div>
        </div>

        {/* 右侧：权限与快速操作 (占 5 栏) */}
        <div className="lg:col-span-5">
          <div className="crextio-card p-6 flex flex-col justify-between h-full">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#F4F5F7] border border-[#E5E7EB] text-[#111827] flex items-center justify-center mb-4">
                <ShieldCheck size={22} />
              </div>

              <h3 className="font-heading text-lg font-bold text-[#111827]">
                {t.account.storePermissions}
              </h3>
              <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
                {t.account.storePermissionsDesc}
              </p>

              <div className="mt-5 space-y-2.5">
                <div className="p-3.5 rounded-2xl bg-[#F4F5F7] border border-[#E5E7EB] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111827]">{t.account.storeOwner}</span>
                  <span className="text-xs font-bold text-[#e28c33]">{t.account.authorized}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F4F5F7] border border-[#E5E7EB] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111827]">{t.account.agentAccess}</span>
                  <span className="text-xs font-bold text-[#3b3686]">{t.account.fullRestRead}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E5E7EB]">
              <button
                type="button"
                className="w-full py-2.5 px-4 rounded-full bg-[#111827] hover:bg-black text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                {t.account.changePassword}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
