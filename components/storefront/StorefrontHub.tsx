'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import {
  Store,
  Globe,
  Palette,
  Layout,
  ExternalLink,
  Bot,
  ShieldCheck,
  Monitor,
  Smartphone,
} from 'lucide-react'
import StorefrontEditor from '@/components/storefront/StorefrontEditor'
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
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab') as ActiveHubTab | null
  const { isZh } = useLanguage()
  const [activeTab, setActiveTab] = useState<ActiveHubTab>(
    tabParam === 'templates' || tabParam === 'console' || tabParam === 'pages_seo' || tabParam === 'editor'
      ? tabParam
      : 'editor'
  )
  const [isPublishing, setIsPublishing] = useState(false)
  const [published, setPublished] = useState(
    Boolean(storefrontSchema?.meta?.published ?? storePage?.published)
  )
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [publishFeedback, setPublishFeedback] = useState('')

  const publicUrl = `/store/${store.store_slug}`

  const handleCopyUrl = () => {
    if (typeof window !== 'undefined') {
      const fullUrl = `${window.location.origin}${publicUrl}`
      navigator.clipboard.writeText(fullUrl)
      setCopiedUrl(true)
      setTimeout(() => setCopiedUrl(false), 2000)
    }
  }

  const handleTogglePublish = async () => {
    setIsPublishing(true)
    setPublishFeedback('')

    try {
      const result = await publishStorefrontAction(store.id)
      if (result.success) {
        setPublished(Boolean(result.published))
        setPublishFeedback(
          result.published
            ? (isZh ? '店铺已正式发布上线！' : 'Store published successfully!')
            : (isZh ? '店铺已切换为草稿模式。' : 'Store unpublished (draft mode).')
        )
        router.refresh()
        setTimeout(() => setPublishFeedback(''), 3000)
      }
    } catch (err) {
      setPublishFeedback(err instanceof Error ? err.message : 'Publish action failed')
    } finally {
      setIsPublishing(false)
    }
  }

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
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* 左侧：多渠道接入看板 (8 cols) */}
            <div className="lg:col-span-8 space-y-5">
              <div className="crextio-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading text-base font-bold text-[#111827]">
                      {isZh ? '全渠道分发与链接状态' : 'Multi-Channel Distribution'}
                    </h3>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      {isZh
                        ? '同一套商品主档与主题配置，秒级同步分发至 Web、移动 H5 与 AI Agent 智能推荐网络'
                        : 'Single canonical schema synchronized across Web, Mobile, and AI Agents.'}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-200">
                    {isZh ? '全渠道已就绪' : 'All Ready'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                  <div className="p-4 rounded-2xl bg-[#F4F5F7] border border-[#E5E7EB] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Monitor size={18} className="text-[#111827]" />
                        <span className="text-[10px] font-bold text-green-600 bg-green-100/60 px-2 py-0.5 rounded-full">
                          ONLINE
                        </span>
                      </div>
                      <div className="text-xs font-bold text-[#111827]">
                        {isZh ? '独立商城官网 (Web)' : 'Desktop Web'}
                      </div>
                      <p className="text-[11px] text-[#6B7280] mt-1">
                        {isZh ? '支持大屏沉浸式瀑布流与 4K 视觉' : 'High-density grid layout'}
                      </p>
                    </div>
                    <div className="pt-3 mt-3 border-t border-[#E5E7EB] text-[11px] font-mono text-[#9CA3AF]">
                      {publicUrl}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F4F5F7] border border-[#E5E7EB] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Smartphone size={18} className="text-[#111827]" />
                        <span className="text-[10px] font-bold text-green-600 bg-green-100/60 px-2 py-0.5 rounded-full">
                          RESPONSIVE
                        </span>
                      </div>
                      <div className="text-xs font-bold text-[#111827]">
                        {isZh ? '移动端 H5 智能商城' : 'Mobile Web H5'}
                      </div>
                      <p className="text-[11px] text-[#6B7280] mt-1">
                        {isZh ? '自适应微信、小红书与外链一键拉起' : 'Adaptive touch navigation'}
                      </p>
                    </div>
                    <div className="pt-3 mt-3 border-t border-[#E5E7EB] text-[11px] font-mono text-[#9CA3AF]">
                      {publicUrl}?view=mobile
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F4F5F7] border border-[#E5E7EB] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Bot size={18} className="text-[#FB7185]" />
                        <span className="text-[10px] font-bold text-[#FB7185] bg-[#FB7185]/10 px-2 py-0.5 rounded-full">
                          AI AGENT
                        </span>
                      </div>
                      <div className="text-xs font-bold text-[#111827]">
                        {isZh ? 'Agent 语义推荐通道' : 'AI Agent Commerce API'}
                      </div>
                      <p className="text-[11px] text-[#6B7280] mt-1">
                        {isZh ? '供 GPT / Claude / Gemini 检索知识与直购' : 'MCP & REST Protocol'}
                      </p>
                    </div>
                    <div className="pt-3 mt-3 border-t border-[#E5E7EB] text-[11px] font-mono text-[#9CA3AF]">
                      /api/agent/v1/store/{store.store_slug}
                    </div>
                  </div>
                </div>
              </div>

              {/* 基础配置卡 */}
              <div className="crextio-card p-6 space-y-4">
                <h3 className="font-heading text-base font-bold text-[#111827]">
                  {isZh ? '店铺基本运行参数' : 'Store Parameters'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB]">
                    <span className="text-[#6B7280] block font-medium mb-1">
                      {isZh ? '店铺全局唯一标识 (Store ID)' : 'Store Entity ID'}
                    </span>
                    <span className="font-mono font-bold text-[#111827]">{store.id}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB]">
                    <span className="text-[#6B7280] block font-medium mb-1">
                      {isZh ? '自定义 Slug 路径' : 'Storefront Slug'}
                    </span>
                    <span className="font-mono font-bold text-[#111827]">/{store.store_slug}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧：安全与存证卡片 (4 cols) */}
            <div className="lg:col-span-4 space-y-5">
              <div className="crextio-dark-card p-6 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 text-[#edbc40] flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {isZh ? '数字存证与 SSL 加密' : 'Security & Trust'}
                  </h4>
                  <p className="text-xs text-white/70 mt-1 leading-relaxed">
                    {isZh
                      ? '所有页面渲染规则均受 TLS 1.3 高强度加密保护，并在 AI 搜索引擎中建立不可篡改的企业数字信任凭证。'
                      : 'Protected with TLS 1.3 and cryptographically verifiable seller identities.'}
                  </p>
                </div>
                <div className="pt-3 border-t border-white/10 text-xs text-white/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span>SSL 证书状态</span>
                    <span className="text-[#edbc40] font-bold">有效 (Auto Renew)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>边缘 CDN 加速</span>
                    <span className="text-[#edbc40] font-bold">已启用 (Cloudflare)</span>
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
