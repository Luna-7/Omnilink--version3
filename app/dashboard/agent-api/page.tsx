'use client'

import React, { useState } from 'react'
import {
  SectionTitle,
  StatusDot,
} from '@/components/dashboard/kit'
import { useLanguage } from '@/context/LanguageContext'
import {
  Bot,
  Cable,
  Braces,
  Key,
  Copy,
  Check,
  Code2,
  Cpu,
  Zap,
} from 'lucide-react'

export default function AgentApiPage() {
  const [copied, setCopied] = useState(false)
  const { t } = useLanguage()

  const copyEndpoint = () => {
    navigator.clipboard?.writeText('https://api.omnilink.ai/v1/merchant/products')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-5">
      {/* 顶部指标卡行 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="crextio-card p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F4F5F7] border border-[#E5E7EB] text-[#111827] flex items-center justify-center shrink-0">
              <Bot size={18} />
            </div>
            <div>
              <span className="text-xs text-[#6B7280] block font-medium">{t.agentApi.agentStatus}</span>
              <div className="text-base font-bold text-[#111827] mt-0.5">
                <StatusDot tone="ok" label={t.agentApi.bridgeReady} />
              </div>
            </div>
          </div>
        </div>

        <div className="crextio-card p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F4F5F7] border border-[#E5E7EB] text-[#111827] flex items-center justify-center shrink-0">
              <Code2 size={18} />
            </div>
            <div>
              <span className="text-xs text-[#6B7280] block font-medium">{t.agentApi.availableEndpoints}</span>
              <div className="text-base font-bold text-[#111827] mt-0.5 tnum">
                {t.agentApi.activeRest}
              </div>
            </div>
          </div>
        </div>

        <div className="crextio-dark-card p-5 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs text-white/80 block font-medium">{t.agentApi.authentication}</span>
            <div className="text-sm font-bold text-white">{t.agentApi.authMethod}</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/10 text-[#edbc40] flex items-center justify-center">
            <Key size={15} />
          </div>
        </div>
      </div>

      {/* 主体网格 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 左侧：数据端点与调用规范 (占 7 栏) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="crextio-card p-6">
            <div className="flex items-center justify-between mb-4">
              <SectionTitle
                title={t.agentApi.dataEndpoints}
                description={t.agentApi.dataEndpointsDesc}
              />
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#edbc40] text-[#111827] shadow-sm">
                {t.agentApi.v1Ready}
              </span>
            </div>

            {/* 端点代码块 */}
            <div className="bg-[#111827] rounded-2xl p-4 font-mono text-xs text-white flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#edbc40] text-[#111827]">
                    GET
                  </span>
                  <span className="text-gray-200">/api/merchant/products</span>
                </div>
                <button
                  onClick={copyEndpoint}
                  className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  {copied ? <Check size={13} className="text-[#edbc40]" /> : <Copy size={13} />}
                  <span>{copied ? t.agentApi.copied : t.agentApi.copy}</span>
                </button>
              </div>

              <div className="text-[11px] text-gray-400 font-sans space-y-1">
                <p>{t.agentApi.endpointExplain}</p>
                <p className="text-gray-500">{t.agentApi.queryParams}: <span className="font-mono text-gray-300">?page=1&limit=20&ready=true</span></p>
              </div>
            </div>

            {/* 接口能力介绍 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <div className="bg-[#F4F5F7] border border-[#E5E7EB] rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <Cable size={15} className="text-[#111827]" />
                  <h4 className="text-xs font-bold text-[#111827]">{t.agentApi.semanticQuery}</h4>
                </div>
                <p className="text-[11px] text-[#6B7280] leading-relaxed">
                  {t.agentApi.semanticQueryDesc}
                </p>
              </div>

              <div className="bg-[#F4F5F7] border border-[#E5E7EB] rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <Braces size={15} className="text-[#3b3686]" />
                  <h4 className="text-xs font-bold text-[#111827]">{t.agentApi.aiReadySchemas}</h4>
                </div>
                <p className="text-[11px] text-[#6B7280] leading-relaxed">
                  {t.agentApi.aiReadySchemasDesc}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：连接器与权限控制 (占 5 栏) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="crextio-card p-6 flex flex-col justify-between h-full">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#F4F5F7] border border-[#E5E7EB] text-[#111827] flex items-center justify-center mb-4">
                <Cpu size={22} />
              </div>

              <h3 className="font-heading text-lg font-bold text-[#111827]">
                {t.agentApi.bridgeHub}
              </h3>
              <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
                {t.agentApi.bridgeHubDesc}
              </p>

              <div className="mt-5 space-y-2.5">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F4F5F7] border border-[#E5E7EB]">
                  <span className="text-xs font-medium text-[#111827]">{t.agentApi.rateLimit}</span>
                  <span className="text-xs font-bold text-[#111827] tnum">1,000 req/min</span>
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F4F5F7] border border-[#E5E7EB]">
                  <span className="text-xs font-medium text-[#111827]">{t.agentApi.latencyTarget}</span>
                  <span className="text-xs font-bold text-[#e28c33] tnum">&lt; 120ms</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E5E7EB]">
              <button
                type="button"
                className="w-full py-2.5 px-4 rounded-full bg-[#111827] hover:bg-black text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap size={14} className="text-[#edbc40]" />
                <span>{t.agentApi.generateKey}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
