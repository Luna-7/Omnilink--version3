'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import {
  Store,
  Palette,
  Layout,
  Bot,
  ShieldCheck,
  Monitor,
  Smartphone,
  Sparkles,
} from 'lucide-react'
import StorefrontEditor from '@/components/storefront/StorefrontEditor'
import { TemplateSelector } from '@/components/store/TemplateSelector'
import { AiVisibilityView } from '@/components/storefront/AiVisibilityView'
import type { StorefrontSchema } from '@/lib/storefront/schema'
import type { StorefrontProduct } from '@/lib/storefront/types'

interface StorefrontHubProps {
  store: {
    id: string
    store_name: string
    store_slug: string
  }
  storePage?: {
    id: string
    published?: boolean | null
    template_id?: string | null
    sections?: unknown
  } | null
  storefrontSchema?: StorefrontSchema | null
  storefrontProducts?: StorefrontProduct[]
}

type ActiveHubTab = 'editor' | 'console' | 'templates' | 'pages_seo'

export function StorefrontHub({
  store,
  storefrontSchema,
  storefrontProducts = [],
}: StorefrontHubProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab') as ActiveHubTab | null
  const { isZh } = useLanguage()
  const [activeTab, setActiveTab] = useState<ActiveHubTab>(
    tabParam === 'templates' || tabParam === 'console' || tabParam === 'pages_seo' || tabParam === 'editor'
      ? tabParam
      : 'editor'
  )

  const publicUrl = `/store/${store.store_slug}`

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* ============================================================
          1. Apple HIG Segmented Control (高度压缩单行分段控制器)
          ============================================================ */}
      <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-gray-100/80 border border-gray-200/40 shadow-[inset_0_1px_1.5px_rgba(0,0,0,0.02)] max-w-max overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('editor')}
          className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
            activeTab === 'editor'
              ? 'bg-white text-gray-900 shadow-[0_1px_2px_rgba(0,0,0,0.08),0_0.5px_1px_rgba(0,0,0,0.03)]'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          {isZh ? '视觉装修' : 'Visual Builder'}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('console')}
          className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
            activeTab === 'console'
              ? 'bg-white text-gray-900 shadow-[0_1px_2px_rgba(0,0,0,0.08),0_0.5px_1px_rgba(0,0,0,0.03)]'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          {isZh ? '店铺控制台' : 'Store Console'}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('templates')}
          className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
            activeTab === 'templates'
              ? 'bg-white text-gray-900 shadow-[0_1px_2px_rgba(0,0,0,0.08),0_0.5px_1px_rgba(0,0,0,0.03)]'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          {isZh ? '视觉风格库' : 'Style Gallery'}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pages_seo')}
          className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
            activeTab === 'pages_seo'
              ? 'bg-white text-gray-900 shadow-[0_1px_2px_rgba(0,0,0,0.08),0_0.5px_1px_rgba(0,0,0,0.03)]'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          {isZh ? 'AI 检索可见度' : 'AI Visibility'}
        </button>
      </div>

      {/* ============================================================
          3. 选项卡主体内容
          ============================================================ */}

      {/* Tab 1: 视觉装修工作台 (WYSIWYG Editor) */}
      {activeTab === 'editor' && (
        <StorefrontEditor
          store={store}
          initialSchema={storefrontSchema ?? undefined}
          products={storefrontProducts}
        />
      )}

      {/* Tab 2: 店铺控制台与概览 (Store Console & Channels) */}
      {activeTab === 'console' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* 左侧：多渠道接入看板 (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3.5">
                <div className="flex items-center justify-between pb-1 border-b border-gray-100/60">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {isZh ? '全渠道状态' : 'Multi-Channel Distribution'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-md bg-green-50 text-green-700 text-[10px] font-semibold border border-green-200/50">
                    {isZh ? '已就绪' : 'Ready'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-lg bg-gray-50/80 border border-gray-100/80 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <Monitor size={16} className="text-gray-800" />
                        <span className="text-[9px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                          ONLINE
                        </span>
                      </div>
                      <div className="text-[11px] font-bold text-gray-900">
                        {isZh ? '独立官网' : 'Desktop Web'}
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-gray-50/80 border border-gray-100/80 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <Smartphone size={16} className="text-gray-800" />
                        <span className="text-[9px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                          H5
                        </span>
                      </div>
                      <div className="text-[11px] font-bold text-gray-900">
                        {isZh ? '移动 H5 商城' : 'Mobile Web'}
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-rose-50/10 border border-rose-100/30 flex flex-col justify-between shadow-[0_1px_2px_rgba(251,113,133,0.02)]">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <Bot size={16} className="text-rose-500" />
                        <span className="text-[9px] font-semibold text-rose-500 bg-rose-50/50 px-1.5 py-0.5 rounded">
                          AGENT
                        </span>
                      </div>
                      <div className="text-[11px] font-bold text-gray-900">
                        {isZh ? 'Agent 推荐通道' : 'AI Agent'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 基础配置卡 */}
              <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3.5">
                <h3 className="text-sm font-semibold text-gray-900">
                  {isZh ? '运行参数' : 'Parameters'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div className="p-3 rounded-lg bg-gray-50/80 border border-gray-100/80">
                    <span className="text-gray-500 block font-medium mb-0.5">
                      {isZh ? '店铺标识' : 'Store ID'}
                    </span>
                    <span className="font-mono font-semibold text-gray-800">{store.id}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-gray-50/80 border border-gray-100/80">
                    <span className="text-gray-500 block font-medium mb-0.5">
                      {isZh ? '定制路径' : 'Store Slug'}
                    </span>
                    <span className="font-mono font-semibold text-gray-800">/{store.store_slug}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧：安全与存证卡片 (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-gray-900 border border-gray-800 p-5 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/5 text-amber-400 flex items-center justify-center">
                    <ShieldCheck size={18} />
                  </div>
                  <h4 className="text-xs font-semibold text-white">
                    {isZh ? '数字存证' : 'Security'}
                  </h4>
                </div>
                <div className="pt-2.5 border-t border-white/5 text-[11px] text-white/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span>SSL 证书</span>
                    <span className="text-amber-400 font-semibold">{isZh ? '有效' : 'Active'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>CDN 加速</span>
                    <span className="text-amber-400 font-semibold">{isZh ? '启用' : 'Enabled'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: 行业模板库 (Templates Gallery) */}
      {activeTab === 'templates' && (
        <div className="crextio-card p-6">
          <TemplateSelector
            storeId={store.id}
            onTemplateSelect={() => {
              router.refresh()
            }}
          />
        </div>
      )}

      {/* Tab 4: AI 检索可见度 (AI Visibility) */}
      {activeTab === 'pages_seo' && (
        <AiVisibilityView
          store={store}
          storefrontSchema={storefrontSchema}
          storefrontProducts={storefrontProducts}
          onSwitchTab={(tab) => setActiveTab(tab)}
        />
      )}
    </div>
  )
}
