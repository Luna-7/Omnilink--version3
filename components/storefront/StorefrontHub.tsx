'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import {
  Store,
  Globe,
  Palette,
  Layout,
} from 'lucide-react'
import StorefrontEditor from '@/components/storefront/StorefrontEditor'
import AcrylicDashboard from '@/components/dashboard/AcrylicDashboard'
import { TemplateSelector } from '@/components/store/TemplateSelector'
import { publishStorefrontAction } from '@/app/actions/store'
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
  storePage,
  storefrontSchema,
  storefrontProducts = [],
}: StorefrontHubProps) {
  const router = useRouter()
  const { isZh } = useLanguage()
  const [activeTab, setActiveTab] = useState<ActiveHubTab>('editor')

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* ============================================================
          1. 4 大核心功能选项卡 (Tabs: Editor | Console | Templates | Pages/SEO)
          ============================================================ */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('editor')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'editor'
              ? 'bg-[#FB7185] text-white shadow-sm'
              : 'text-[#6B7280] hover:text-[#FB7185] hover:bg-[#F4F5F7]'
          }`}
        >
          <Palette size={14} />
          <span>{isZh ? '视觉装修工作台' : 'Visual Store Builder'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('console')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'console'
              ? 'bg-[#FB7185] text-white shadow-sm'
              : 'text-[#6B7280] hover:text-[#FB7185] hover:bg-[#F4F5F7]'
          }`}
        >
          <Store size={14} />
          <span>{isZh ? '店铺控制台与概览' : 'Store Console & Channels'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'templates'
              ? 'bg-[#FB7185] text-white shadow-sm'
              : 'text-[#6B7280] hover:text-[#FB7185] hover:bg-[#F4F5F7]'
          }`}
        >
          <Layout size={14} />
          <span>{isZh ? '视觉风格库' : 'Templates Gallery'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pages_seo')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'pages_seo'
              ? 'bg-[#FB7185] text-white shadow-sm'
              : 'text-[#6B7280] hover:text-[#FB7185] hover:bg-[#F4F5F7]'
          }`}
        >
          <Globe size={14} />
          <span>{isZh ? '页面管理 & AI SEO' : 'Pages & AI SEO'}</span>
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
        <AcrylicDashboard />
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

      {/* Tab 4: 页面管理与 AI SEO (Pages & AI SEO) */}
      {activeTab === 'pages_seo' && (
        <div className="space-y-5">
          {/* 页面列表卡片 */}
          <div className="crextio-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-base font-bold text-[#111827]">
                  {isZh ? '线上商店页面矩阵 (Store Pages)' : 'Store Pages'}
                </h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {isZh ? '管理前台公开商城的路由节点与发布状态' : 'Manage published routes & pages.'}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-[#6B7280] font-semibold">
                    <th className="pb-3 px-3">{isZh ? '页面名称' : 'Page Name'}</th>
                    <th className="pb-3 px-3">{isZh ? '访问路径 (Route)' : 'URL Route'}</th>
                    <th className="pb-3 px-3">{isZh ? '发布状态' : 'Status'}</th>
                    <th className="pb-3 px-3">{isZh ? '页面类型' : 'Type'}</th>
                    <th className="pb-3 px-3 text-right">{isZh ? '操作' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]/60">
                  <tr>
                    <td className="py-3 px-3 font-bold text-[#111827]">
                      {isZh ? '商城主页 (Home Page)' : 'Storefront Home'}
                    </td>
                    <td className="py-3 px-3 font-mono text-[#6B7280]">
                      /store/{store.store_slug}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[11px] font-semibold">
                        {published ? (isZh ? '已发布' : 'Published') : isZh ? '草稿' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#6B7280]">
                      {isZh ? '动态复合模板' : 'Dynamic Canvas'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setActiveTab('editor')}
                        className="text-xs font-bold text-[#111827] hover:underline"
                      >
                        {isZh ? '编辑装修' : 'Edit'}
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 px-3 font-bold text-[#111827]">
                      {isZh ? '商品详情聚合页 (Product Detail)' : 'Product Showcase'}
                    </td>
                    <td className="py-3 px-3 font-mono text-[#6B7280]">
                      /store/{store.store_slug}/products/[id]
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[11px] font-semibold">
                        {isZh ? '自动激活' : 'Auto Active'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#6B7280]">
                      {isZh ? 'AI 语义增强单品' : 'Semantic View'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href="/dashboard/products"
                        className="text-xs font-bold text-[#111827] hover:underline"
                      >
                        {isZh ? '管理商品' : 'Manage'}
                      </Link>
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 px-3 font-bold text-[#111827]">
                      {isZh ? '品牌知识与售后条款 (FAQ & Policies)' : 'FAQ & Policies'}
                    </td>
                    <td className="py-3 px-3 font-mono text-[#6B7280]">
                      /store/{store.store_slug}#faq
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[11px] font-semibold">
                        {isZh ? '随主页发布' : 'Synced'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#6B7280]">
                      {isZh ? '知识库联动' : 'Knowledge Sync'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href="/dashboard/knowledge"
                        className="text-xs font-bold text-[#111827] hover:underline"
                      >
                        {isZh ? '知识库' : 'Knowledge'}
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* AI 语义搜索引擎与 SEO 配置 */}
          <div className="crextio-card p-6 space-y-4">
            <div>
              <h3 className="font-heading text-base font-bold text-[#111827]">
                {isZh ? 'AI 语义搜索引擎抓取与 SEO 优化' : 'AI Agent SEO & Semantic Metadata'}
              </h3>
              <p className="text-xs text-[#6B7280] mt-0.5">
                {isZh
                  ? '配置在 Google Search, Perplexity, ChatGPT Search 等大模型检索中展示的店铺元数据'
                  : 'Optimize metadata for search engines and LLM web crawlers.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1.5">
                  {isZh ? '搜索引擎标题 (Meta Title)' : 'Meta Title'}
                </label>
                <input
                  type="text"
                  defaultValue={`${store.store_name} - 官方正品旗舰店 | 智能科技`}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs font-medium text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#FB7185]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1.5">
                  {isZh ? 'AI Agent 抓取权限 (Robots Directive)' : 'AI Robots Policy'}
                </label>
                <select className="w-full h-10 px-3.5 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs font-medium text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#FB7185]">
                  <option value="allow_all">
                    {isZh ? '全开：允许所有大模型检索与推荐引用 (推荐)' : 'Allow All AI Crawlers'}
                  </option>
                  <option value="restricted">
                    {isZh ? '受限：仅允许已授权企业级 Agent 调用' : 'Restricted to Verified Agents'}
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1.5">
                {isZh ? '店铺核心语义描述 (Meta Description)' : 'Meta Description'}
              </label>
              <textarea
                rows={3}
                defaultValue={
                  isZh
                    ? `${store.store_name} 专注于前沿科技与高端声学硬件，为您提供官方正品保障与智能导购支持。`
                    : `${store.store_name} official flagship store for next-gen technology and acoustics.`
                }
                className="w-full p-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#FB7185] leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
