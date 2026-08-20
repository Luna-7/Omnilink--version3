'use client'

import React, { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Database,
  FileText,
  ShoppingBag,
  Globe,
  Tag,
  ShieldCheck,
} from 'lucide-react'
import type { StorefrontSchema } from '@/lib/storefront/schema'
import type { StorefrontProduct } from '@/lib/storefront/types'

export type ImpactLevel = 'High' | 'Medium' | 'Low'

export interface OptimizationCardData {
  id: string
  issueZh: string
  issueEn: string
  impact: ImpactLevel
  reasonZh: string
  reasonEn: string
  currentStateZh: string
  currentStateEn: string
  targetModule: 'knowledge' | 'product' | 'editor' | 'console'
  actionTextZh: string
  actionTextEn: string
  targetHref?: string
}

interface AiVisibilityViewProps {
  store: {
    id: string
    store_name: string
    store_slug: string
  }
  storefrontSchema?: StorefrontSchema | null
  storefrontProducts?: StorefrontProduct[]
  onSwitchTab?: (tab: 'editor' | 'console' | 'templates' | 'pages_seo') => void
}

export function AiVisibilityView({
  store,
  storefrontSchema,
  storefrontProducts = [],
  onSwitchTab,
}: AiVisibilityViewProps) {
  const router = useRouter()
  const { isZh } = useLanguage()

  // ===== 1. 基于真实数据的诊断分析逻辑 =====
  const diagnostics = useMemo(() => {
    const totalProducts = storefrontProducts.length

    // 检查商品语义完整度（描述 >= 15 字，且至少有 1 个结构化 attributes）
    const completeProducts = storefrontProducts.filter((p) => {
      const hasDesc = (p.description || '').trim().length >= 15
      const hasAttrs = p.attributes && Object.keys(p.attributes).length > 0
      return hasDesc && hasAttrs
    })
    const incompleteProductsCount = totalProducts - completeProducts.length
    const semanticCoveragePercent =
      totalProducts > 0
        ? Math.round((completeProducts.length / totalProducts) * 100)
        : 0

    // 检查店铺基础信息（品牌名称/描述/联系邮箱）
    const hasBrandInfo = Boolean(
      storefrontSchema?.globalInfo?.brandName || store.store_name
    )
    const hasContactEmail = Boolean(
      storefrontSchema?.contact?.email ||
        storefrontSchema?.globalInfo?.contact?.email
    )
    const hasStoreDescription = Boolean(
      storefrontSchema?.contact?.address ||
        storefrontSchema?.globalInfo?.tagline ||
        storefrontSchema?.globalInfo?.contact?.address
    )
    const isStoreInfoIncomplete = !hasContactEmail || !hasStoreDescription

    // 检查 FAQ 知识库
    const faqSection = storefrontSchema?.sections?.find(
      (s) => s.type === 'faq' && s.visible !== false
    )
    const hasFaqKnowledge = Boolean(
      faqSection &&
        faqSection.content &&
        Array.isArray((faqSection.content as Record<string, unknown>).items) &&
        ((faqSection.content as Record<string, unknown>).items as unknown[])
          .length > 0
    )

    // 检查图文/品牌故事关联
    const hasBrandStorySection = storefrontSchema?.sections?.some(
      (s) =>
        (s.type === 'image_text' || s.type === 'rich_text') &&
        s.visible !== false
    )

    // 检查发布状态
    const isPublished = storefrontSchema?.meta?.published !== false

    // ===== 2. 生成优先级排序的优化建议列表 (High → Medium → Low) =====
    const items: OptimizationCardData[] = []

    // High 1: 店铺核心商业与联系信息不完整 -> 联动 Knowledge Base
    if (isStoreInfoIncomplete) {
      items.push({
        id: 'opt-store-info',
        issueZh: '店铺核心商业与联系信息不完整',
        issueEn: 'Store information is incomplete',
        impact: 'High',
        reasonZh:
          '缺少企业联系方式与主体业务描述，AI 搜索引擎无法在问答与推荐中验证店铺信誉及回答买家基本问题。',
        reasonEn:
          'Your store is missing core business information that helps AI understand what you sell and who you serve.',
        currentStateZh: '缺少联系邮箱 / 品牌服务定位',
        currentStateEn: 'Contact email or business description missing',
        targetModule: 'knowledge',
        actionTextZh: '→ 前往知识库完善',
        actionTextEn: '→ Improve in Knowledge',
        targetHref: '/dashboard/knowledge',
      })
    }

    // High 2: 商品语义信息/属性缺失 -> 联动 Product Workspace
    if (incompleteProductsCount > 0) {
      items.push({
        id: 'opt-product-semantics',
        issueZh: `${incompleteProductsCount} 个商品缺失结构化语义属性`,
        issueEn: `${incompleteProductsCount} products have incomplete semantic attributes`,
        impact: incompleteProductsCount > 2 ? 'High' : 'Medium',
        reasonZh:
          '商品缺少材质、尺寸、适用场景等关键结构化特征，AI 代理在进行用户意图匹配与同类比较时无法准确推荐。',
        reasonEn:
          'Products lacking structured attributes cannot be effectively matched or recommended by AI agents during comparative queries.',
        currentStateZh: `${incompleteProductsCount} / ${totalProducts} 个商品语义信息待补充`,
        currentStateEn: `${incompleteProductsCount} / ${totalProducts} products affected`,
        targetModule: 'product',
        actionTextZh: '→ 前往商品工作区',
        actionTextEn: '→ Review Products',
        targetHref: '/dashboard/products',
      })
    }

    // High 3: 店铺处于草稿模式 -> 联动 Store Console
    if (!isPublished) {
      items.push({
        id: 'opt-draft-status',
        issueZh: '店铺处于草稿模式，外部 AI 无法抓取',
        issueEn: 'Store is in Draft mode and hidden from AI crawlers',
        impact: 'High',
        reasonZh:
          '草稿状态下的独立商城路径未公开，阻断了外部 AI 搜索引擎与网络爬虫对店铺的公开索引。',
        reasonEn:
          'Draft storefronts block AI search engines and web crawlers from indexing your store pages.',
        currentStateZh: '当前状态：草稿 (Draft)',
        currentStateEn: 'Current Status: Draft',
        targetModule: 'console',
        actionTextZh: '→ 前往控制台发布',
        actionTextEn: '→ Publish Store',
      })
    }

    // Medium: FAQ 与售后政策不足 -> 联动 Knowledge Base
    if (!hasFaqKnowledge) {
      items.push({
        id: 'opt-faq-knowledge',
        issueZh: '常见问题 (FAQ) 与服务条款储备不足',
        issueEn: 'FAQ & store policies knowledge missing',
        impact: 'Medium',
        reasonZh:
          '缺乏关于发货时效、退换货保障与售后常见疑问的权威条目，AI 无法解答买家在购买决策中的关键疑虑。',
        reasonEn:
          'Without canonical FAQ and policy items, AI cannot resolve buyer hesitations about shipping, returns, or warranty.',
        currentStateZh: '知识库中未检测到完整的 FAQ 与政策配置',
        currentStateEn: 'No structured FAQ or policy entries found',
        targetModule: 'knowledge',
        actionTextZh: '→ 管理知识库',
        actionTextEn: '→ Manage Knowledge',
        targetHref: '/dashboard/knowledge',
      })
    }

    // Low: 商品与品牌故事缺乏图文关联 -> 联动 Storefront Builder
    if (!hasBrandStorySection) {
      items.push({
        id: 'opt-brand-story',
        issueZh: '商品与品牌核心故事缺乏关联图文',
        issueEn: 'Lack of narrative context linking products to brand story',
        impact: 'Low',
        reasonZh:
          '在商城主页增加品牌深度叙事与图文上下文，有助于加强大模型在分析品牌价值定位时的语义知识关联。',
        reasonEn:
          'Linking product catalogs with brand narrative blocks improves LLM context embedding for brand identity.',
        currentStateZh: '主页未配置图文叙事/富文本分区',
        currentStateEn: 'No rich narrative sections configured',
        targetModule: 'editor',
        actionTextZh: '→ 前往装修台添加',
        actionTextEn: '→ Edit in Store Builder',
      })
    }

    // 按 Impact 排序: High -> Medium -> Low
    const impactOrder: Record<ImpactLevel, number> = {
      High: 1,
      Medium: 2,
      Low: 3,
    }
    items.sort((a, b) => impactOrder[a.impact] - impactOrder[b.impact])

    return {
      totalProducts,
      completeProductsCount: completeProducts.length,
      semanticCoveragePercent,
      hasBrandInfo,
      hasContactEmail,
      hasFaqKnowledge,
      isPublished,
      items,
    }
  }, [store, storefrontSchema, storefrontProducts])

  // 处理卡片点击与跳转逻辑
  const handleCardClick = (card: OptimizationCardData) => {
    if (card.targetHref) {
      router.push(card.targetHref)
    } else if (card.targetModule === 'editor' && onSwitchTab) {
      onSwitchTab('editor')
    } else if (card.targetModule === 'console' && onSwitchTab) {
      onSwitchTab('console')
    }
  }

  return (
    <div className="space-y-6">
      {/* ============================================================
          1. Visibility Overview (概览看板)
          ============================================================ */}
      <div className="crextio-card p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E7EB] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FB7185]/10 text-[#FB7185] flex items-center justify-center font-bold">
                <Sparkles size={18} />
              </div>
              <h3 className="font-heading text-lg font-bold text-[#111827]">
                {isZh ? 'AI 检索可见度概览' : 'AI Visibility Overview'}
              </h3>
            </div>
            <p className="text-xs text-[#6B7280] mt-1">
              {isZh
                ? '基于店铺全量主档与知识库数据的 AI 发现与理解能力诊断'
                : 'Store-wide AI discoverability & comprehension analytics based on canonical data.'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-[#6B7280] font-medium">
              {isZh ? '总体发现状态:' : 'Overall Status:'}
            </span>
            {diagnostics.items.length > 0 ? (
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200 flex items-center gap-1.5">
                <AlertTriangle size={13} />
                <span>
                  {isZh
                    ? `${diagnostics.items.length} 项优化建议`
                    : `${diagnostics.items.length} Action Items`}
                </span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-200 flex items-center gap-1.5">
                <CheckCircle2 size={13} />
                <span>{isZh ? '最佳可见状态' : 'Optimal Visibility'}</span>
              </span>
            )}
          </div>
        </div>

        {/* 6 大核心维度数据小卡 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Dimension 1: Semantic Coverage */}
          <div className="p-3.5 rounded-2xl bg-[#F4F5F7] border border-[#E5E7EB] space-y-1">
            <div className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider flex items-center gap-1">
              <Tag size={12} className="text-[#FB7185]" />
              <span>{isZh ? '语义覆盖度' : 'Semantic Coverage'}</span>
            </div>
            <div className="text-lg font-extrabold text-[#111827]">
              {diagnostics.semanticCoveragePercent}%
            </div>
            <div className="text-[10px] text-[#9CA3AF] truncate">
              {isZh ? '结构化属性充实率' : 'Attribute Completeness'}
            </div>
          </div>

          {/* Dimension 2: Product Content */}
          <div className="p-3.5 rounded-2xl bg-[#F4F5F7] border border-[#E5E7EB] space-y-1">
            <div className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider flex items-center gap-1">
              <ShoppingBag size={12} className="text-[#FB7185]" />
              <span>{isZh ? '商品质量' : 'Product Content'}</span>
            </div>
            <div className="text-lg font-extrabold text-[#111827]">
              {diagnostics.completeProductsCount} / {diagnostics.totalProducts}
            </div>
            <div className="text-[10px] text-[#9CA3AF] truncate">
              {isZh ? '完全适配 LLM 检索' : 'Ready for AI Search'}
            </div>
          </div>

          {/* Dimension 3: Store Knowledge */}
          <div className="p-3.5 rounded-2xl bg-[#F4F5F7] border border-[#E5E7EB] space-y-1">
            <div className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider flex items-center gap-1">
              <FileText size={12} className="text-[#FB7185]" />
              <span>{isZh ? '知识储备' : 'Store Knowledge'}</span>
            </div>
            <div className="text-lg font-extrabold text-[#111827]">
              {diagnostics.hasFaqKnowledge
                ? isZh
                  ? '已储备'
                  : 'Ready'
                : isZh
                ? '待补充'
                : 'Partial'}
            </div>
            <div className="text-[10px] text-[#9CA3AF] truncate">
              {isZh ? 'FAQ & 品牌故事条目' : 'FAQ & Policy Entries'}
            </div>
          </div>

          {/* Dimension 4: Structured Data */}
          <div className="p-3.5 rounded-2xl bg-[#F4F5F7] border border-[#E5E7EB] space-y-1">
            <div className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider flex items-center gap-1">
              <Database size={12} className="text-[#FB7185]" />
              <span>{isZh ? '结构化数据' : 'Structured Data'}</span>
            </div>
            <div className="text-lg font-extrabold text-[#111827]">
              {diagnostics.hasBrandInfo
                ? isZh
                  ? 'Schema 就绪'
                  : 'JSON-LD Active'
                : isZh
                ? '信息缺损'
                : 'Incomplete'}
            </div>
            <div className="text-[10px] text-[#9CA3AF] truncate">
              {isZh ? 'JSON-LD 知识图谱' : 'Schema & Knowledge Graph'}
            </div>
          </div>

          {/* Dimension 5: Discoverability */}
          <div className="p-3.5 rounded-2xl bg-[#F4F5F7] border border-[#E5E7EB] space-y-1">
            <div className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider flex items-center gap-1">
              <Globe size={12} className="text-[#FB7185]" />
              <span>{isZh ? '可检索性' : 'Discoverability'}</span>
            </div>
            <div className="text-lg font-extrabold text-[#111827]">
              {diagnostics.isPublished
                ? isZh
                  ? '公开可爬取'
                  : 'Indexable'
                : isZh
                ? '草稿受限'
                : 'Restricted'}
            </div>
            <div className="text-[10px] text-[#9CA3AF] truncate">
              {isZh ? 'Robots 指令与路线' : 'Robots Policy'}
            </div>
          </div>

          {/* Dimension 6: Store Business Info */}
          <div className="p-3.5 rounded-2xl bg-[#F4F5F7] border border-[#E5E7EB] space-y-1">
            <div className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck size={12} className="text-[#FB7185]" />
              <span>{isZh ? '主体信任' : 'Entity Trust'}</span>
            </div>
            <div className="text-lg font-extrabold text-[#111827]">
              {diagnostics.hasContactEmail
                ? isZh
                  ? '信任凭证'
                  : 'Verified'
                : isZh
                ? '缺联系邮箱'
                : 'Unverified'}
            </div>
            <div className="text-[10px] text-[#9CA3AF] truncate">
              {isZh ? '商业实体真实凭证' : 'Merchant Identity'}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          2. Optimization Opportunities (优化卡片区域)
          ============================================================ */}
      <div className="space-y-4">
        <div>
          <h3 className="font-heading text-base font-bold text-[#111827]">
            {isZh ? '优先优化建议' : 'Prioritized Optimizations'}
          </h3>
          <p className="text-xs text-[#6B7280] mt-0.5">
            {isZh
              ? '按照对 AI 理解与发现能力的影响程度（High → Medium → Low）排序'
              : 'Sorted by impact on AI comprehension & discoverability (High → Medium → Low).'}
          </p>
        </div>

        {diagnostics.items.length === 0 ? (
          /* 无待优化的完美状态卡片 */
          <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center shrink-0 border border-green-200">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#111827]">
                {isZh
                  ? '所有 AI 检索可见度指标均已达到最佳状态'
                  : 'All AI visibility checks passed'}
              </h4>
              <p className="text-xs text-[#6B7280] mt-0.5">
                {isZh
                  ? '您的店铺主档、商品语义属性、知识库与结构化数据均已完善，AI 具备高度理解与推荐能力。'
                  : 'Your store schemas, product semantics, and knowledge base are fully complete for AI models.'}
              </p>
            </div>
          </div>
        ) : (
          /* 优化建议卡片列表 */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {diagnostics.items.map((card) => (
              <div
                key={card.id}
                onClick={() => handleCardClick(card)}
                className="group relative bg-white border border-[#E5E7EB] rounded-2xl p-5 hover:border-[#FB7185] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                {/* 顶部：问题与 Impact Pill */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-xs sm:text-sm font-bold text-[#111827] group-hover:text-[#FB7185] transition-colors leading-snug">
                      {isZh ? card.issueZh : card.issueEn}
                    </h4>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0 border ${
                        card.impact === 'High'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : card.impact === 'Medium'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {card.impact} Impact
                    </span>
                  </div>

                  {/* 简短原因 */}
                  <p className="text-xs text-[#6B7280] leading-relaxed">
                    {isZh ? card.reasonZh : card.reasonEn}
                  </p>
                </div>

                {/* 底部：默认状态 + Hover 浮现 Action 按钮 */}
                <div className="mt-4 pt-3 border-t border-[#F3F4F6] flex items-center justify-between text-xs">
                  <div className="text-[11px] font-medium text-[#9CA3AF] truncate">
                    <span className="font-semibold text-[#4B5563]">
                      {isZh ? '当前状态: ' : 'Status: '}
                    </span>
                    {isZh ? card.currentStateZh : card.currentStateEn}
                  </div>

                  {/* 鼠标 Hover 时才出现的极简 Action 入口 */}
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-0 translate-x-1 text-xs font-bold text-[#FB7185] flex items-center gap-1 shrink-0 ml-2">
                    <span>
                      {isZh ? card.actionTextZh : card.actionTextEn}
                    </span>
                    <ArrowRight size={13} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
