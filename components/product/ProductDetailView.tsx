'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Sparkles,
  Save,
  Check,
  Package,
  Layers,
  Cpu,
  RefreshCw,
  Send,
  ExternalLink,
  Bot,
  User,
  Plus,
  Trash2,
  DollarSign,
} from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import type { DemoProduct } from '@/lib/products/demo-data'
import { ProductDocumentsSection } from '@/components/products/ProductDocumentsSection'

interface ProductDetailViewProps {
  product: DemoProduct
}

type ActiveTab = 'overview' | 'variants' | 'semantic' | 'channels' | 'simulator'

export function ProductDetailView({ product: initialProduct }: ProductDetailViewProps) {
  const { isZh } = useLanguage()
  const [product, setProduct] = useState<DemoProduct>(initialProduct)
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isReanalyzing, setIsReanalyzing] = useState(false)
  const [reanalyzeSuccess, setReanalyzeSuccess] = useState(false)

  // Agent Chat Simulator state
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'agent'; text: string }>>([
    {
      sender: 'agent',
      text: isZh
        ? `你好！我是针对【${product.name}】的专属 AI 导购 Agent。你可以向我咨询任何关于该产品的性能、兼容性、使用场景或购买建议。`
        : `Hello! I am the AI Shopping Assistant for 【${product.name_en || product.name}】. Ask me anything about specs, compatibility, or purchase recommendations.`,
    },
  ])
  const [chatInput, setChatInput] = useState('')

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }, 600)
  }

  const handleReanalyze = () => {
    setIsReanalyzing(true)
    setTimeout(() => {
      setIsReanalyzing(false)
      setReanalyzeSuccess(true)
      // Boost confidence slightly
      setProduct((prev) => ({
        ...prev,
        semantic_data: {
          ...prev.semantic_data,
          confidence: Math.min(0.998, prev.semantic_data.confidence + 0.005),
        },
      }))
      setTimeout(() => setReanalyzeSuccess(false), 3000)
    }, 1200)
  }

  const handleSendChat = (textToSend?: string) => {
    const query = (textToSend || chatInput).trim()
    if (!query) return

    const newMsgs = [...chatMessages, { sender: 'user' as const, text: query }]
    setChatMessages(newMsgs)
    if (!textToSend) setChatInput('')

    // Look for matching demo QA
    setTimeout(() => {
      const match = product.agent_qa.find(
        (qa) =>
          qa.question.includes(query) ||
          query.includes(qa.question.slice(0, 4)) ||
          qa.question_en.toLowerCase().includes(query.toLowerCase())
      )

      let reply = ''
      if (match) {
        reply = isZh ? match.answer : match.answer_en
      } else {
        reply = isZh
          ? `根据【${product.name}】的语义知识节点：该产品属于【${product.category}】，官方售价为 ¥${product.price}，核心亮点包括：${product.semantic_data.key_features.slice(0, 2).join('、')}。已就绪全网 Agent 实时分发。`
          : `According to the semantic node of 【${product.name_en}】: categorized as 【${product.category_en}】 at ¥${product.price}. Key features include: ${product.semantic_data.key_features_en.slice(0, 2).join(', ')}.`;
      }

      setChatMessages((prev) => [...prev, { sender: 'agent', text: reply }])
    }, 500)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 顶部面包屑与操作栏 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/products"
            className="w-9 h-9 rounded-full bg-white border border-[#E5E7EB] hover:bg-[#F4F5F7] flex items-center justify-center text-[#111827] transition-colors shadow-sm"
            title={isZh ? '返回商品列表' : 'Back to Products'}
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#6B7280]">
                {isZh ? '商品管理' : 'Products'} / {product.category}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#F4F5F7] text-[#6B7280] font-mono text-[10px]">
                {product.sku}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  product.status === 'active'
                    ? 'bg-[#edbc40]/20 text-[#111827] border border-[#edbc40]/40'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {product.status === 'active' ? (isZh ? '在售中' : 'Active') : isZh ? '草稿' : 'Draft'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#111827] mt-1 flex items-center gap-2">
              <span>{isZh ? product.name : product.name_en}</span>
            </h1>
          </div>
        </div>

        {/* 顶部操作按钮 */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleReanalyze}
            disabled={isReanalyzing}
            className="px-3.5 py-2 rounded-full bg-white border border-[#E5E7EB] hover:border-[#111827] text-[#111827] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Sparkles size={14} className={isReanalyzing ? 'animate-spin text-[#8B5CF6]' : 'text-[#8B5CF6]'} />
            <span>{isReanalyzing ? (isZh ? 'AI 重构中...' : 'Re-analyzing...') : isZh ? 'AI 语义重构' : 'AI Re-analyze'}</span>
          </button>

          <Link
            href={`/dashboard/products/${product.id}/node`}
            className="px-3.5 py-2 rounded-full bg-[#F4F5F7] hover:bg-[#E5E7EB] text-[#111827] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ExternalLink size={14} />
            <span>{isZh ? '查看独立节点' : 'View Node'}</span>
          </Link>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 rounded-full bg-[#111827] hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            {saveSuccess ? (
              <>
                <Check size={14} className="text-[#edbc40]" />
                <span>{isZh ? '已保存！' : 'Saved!'}</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>{isSaving ? (isZh ? '正在保存...' : 'Saving...') : isZh ? '保存更改' : 'Save Changes'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 提示消息条 */}
      {reanalyzeSuccess && (
        <div className="p-3.5 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 text-[#8B5CF6] text-xs font-medium flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles size={14} />
            <span>
              {isZh
                ? 'AI 语义节点重构完成！商品结构化属性与推理特征已同步更新，置信度提升至 '
                : 'AI Semantic Node re-analyzed successfully! Confidence increased to '}
              <strong>{(product.semantic_data.confidence * 100).toFixed(1)}%</strong>
            </span>
          </div>
          <span className="text-[10px] bg-white px-2 py-0.5 rounded-full font-bold">Updated</span>
        </div>
      )}

      {/* 核心指标与导航 Tabs 条 */}
      <div className="crextio-card p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <TabButton
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            icon={<Package size={15} />}
            label={isZh ? '基础信息' : 'Overview'}
          />
          <TabButton
            active={activeTab === 'variants'}
            onClick={() => setActiveTab('variants')}
            icon={<Layers size={15} />}
            label={isZh ? `规格与变体 (${product.variants.length})` : `Variants (${product.variants.length})`}
          />
          <TabButton
            active={activeTab === 'semantic'}
            onClick={() => setActiveTab('semantic')}
            icon={<Cpu size={15} />}
            label={isZh ? 'AI 语义节点' : 'AI Semantic Node'}
            badge="AI Ready"
          />
          <TabButton
            active={activeTab === 'channels'}
            onClick={() => setActiveTab('channels')}
            icon={<RefreshCw size={15} />}
            label={isZh ? '全渠道同步' : 'Channels Sync'}
          />
          <TabButton
            active={activeTab === 'simulator'}
            onClick={() => setActiveTab('simulator')}
            icon={<Bot size={15} />}
            label={isZh ? 'Agent 试用模拟器' : 'Agent Simulator'}
          />
        </div>

        {/* 右侧健康度胶囊 */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-[#6B7280] font-medium">{isZh ? 'AI 发现置信度:' : 'AI Confidence:'}</span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#edbc40] text-[#111827] font-bold text-xs shadow-sm">
            {(product.semantic_data.confidence * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Tab 1: 基础信息 (Overview) */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 左侧主体字段 (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            <div className="crextio-card p-6 space-y-4">
              <h3 className="text-sm font-bold text-[#111827] flex items-center justify-between">
                <span>{isZh ? '基本信息' : 'General Info'}</span>
                <span className="text-[11px] text-[#9CA3AF] font-normal">ID: {product.id}</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1.5">
                  {isZh ? '商品标题 *' : 'Product Title *'}
                </label>
                <input
                  type="text"
                  value={isZh ? product.name : product.name_en}
                  onChange={(e) =>
                    setProduct({
                      ...product,
                      [isZh ? 'name' : 'name_en']: e.target.value,
                    })
                  }
                  className="w-full h-10 px-3.5 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs font-medium text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1.5">
                    {isZh ? '商品货号 (SKU)' : 'Product SKU'}
                  </label>
                  <input
                    type="text"
                    value={product.sku}
                    onChange={(e) => setProduct({ ...product, sku: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs font-mono text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1.5">
                    {isZh ? '商品分类' : 'Category'}
                  </label>
                  <select
                    value={product.category}
                    onChange={(e) => setProduct({ ...product, category: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs font-medium text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
                  >
                    <option value="声学音频">声学音频 (Audio & Acoustics)</option>
                    <option value="智能穿戴">智能穿戴 (Smart Wearables)</option>
                    <option value="智能眼镜">智能眼镜 (Smart Glasses)</option>
                    <option value="数码配件">数码配件 (Accessories & Power)</option>
                    <option value="电脑外设">电脑外设 (Computer Peripherals)</option>
                    <option value="智能家居">智能家居 (Smart Home)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1.5">
                  {isZh ? '商品详细描述与核心卖点' : 'Description & Selling Points'}
                </label>
                <textarea
                  rows={4}
                  value={isZh ? product.description : product.description_en}
                  onChange={(e) =>
                    setProduct({
                      ...product,
                      [isZh ? 'description' : 'description_en']: e.target.value,
                    })
                  }
                  className="w-full p-3.5 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827] leading-relaxed"
                />
              </div>
            </div>

            {/* 价格与库存卡片 */}
            <div className="crextio-card p-6 space-y-4">
              <h3 className="text-sm font-bold text-[#111827]">{isZh ? '价格与库存' : 'Pricing & Inventory'}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1.5">
                    {isZh ? '基准售价 (¥)' : 'Base Price'}
                  </label>
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                    <input
                      type="number"
                      value={product.price}
                      onChange={(e) => setProduct({ ...product, price: parseFloat(e.target.value) || 0 })}
                      className="w-full h-10 pl-8 pr-3.5 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs font-bold text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1.5">
                    {isZh ? '总库存量' : 'Total Inventory'}
                  </label>
                  <input
                    type="number"
                    value={product.inventory}
                    onChange={(e) => setProduct({ ...product, inventory: parseInt(e.target.value) || 0 })}
                    className="w-full h-10 px-3.5 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs font-bold text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1.5">
                    {isZh ? '上架状态' : 'Sales Status'}
                  </label>
                  <select
                    value={product.status}
                    onChange={(e) => setProduct({ ...product, status: e.target.value as DemoProduct['status'] })}
                    className="w-full h-10 px-3.5 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs font-medium text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
                  >
                    <option value="active">{isZh ? '已上架 (Active)' : 'Active'}</option>
                    <option value="draft">{isZh ? '草稿箱 (Draft)' : 'Draft'}</option>
                    <option value="archived">{isZh ? '已归档 (Archived)' : 'Archived'}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Product Documents Section */}
            <div className="crextio-card p-6">
              <ProductDocumentsSection productId={product.id} />
            </div>
          </div>

          {/* 右侧边栏 (4 cols): 商品图与快速指标 */}
          <div className="lg:col-span-4 space-y-5">
            {/* 商品主图预览 */}
            <div className="crextio-card p-5 space-y-3">
              <h4 className="text-xs font-bold text-[#111827]">{isZh ? '商品主图' : 'Main Image'}</h4>
              <div className="w-full aspect-square rounded-2xl overflow-hidden bg-[#F4F5F7] border border-[#E5E7EB] relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    className="px-3 py-1.5 bg-white text-[#111827] rounded-full text-xs font-bold shadow-md hover:bg-gray-100"
                  >
                    {isZh ? '替换图片' : 'Replace'}
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-[#9CA3AF] text-center">
                {isZh ? '支持 JPG、PNG、WebP 高清商品图' : 'Supports JPG, PNG, WebP'}
              </p>
            </div>

            {/* 统计指标卡 */}
            <div className="crextio-card p-5 space-y-3">
              <h4 className="text-xs font-bold text-[#111827]">{isZh ? '销售表现' : 'Sales Performance'}</h4>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#6B7280]">{isZh ? '历史累计销量' : 'Total Sales'}</span>
                  <span className="font-bold text-[#111827]">{product.sales_count} 件</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#6B7280]">{isZh ? '累计贡献营收' : 'Total Revenue'}</span>
                  <span className="font-bold text-[#e0652b]">¥{(product.sales_count * product.price).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#6B7280]">{isZh ? '渠道分发覆盖' : 'Channels'}</span>
                  <span className="font-bold text-[#111827]">
                    {Object.values(product.channels).filter(Boolean).length} / 4 平台
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: 规格与变体 (Variants & Matrix) */}
      {activeTab === 'variants' && (
        <div className="space-y-5">
          {/* 规格属性组定义 */}
          <div className="crextio-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#111827]">{isZh ? '规格维度 (Options)' : 'Product Options'}</h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {isZh
                    ? '配置如颜色、尺寸、套餐等不同维度，系统将自动生成笛卡尔积变体矩阵。'
                    : 'Configure option dimensions like Color, Size to generate variant combinations.'}
                </p>
              </div>
              <button
                type="button"
                className="px-3.5 py-1.5 rounded-full bg-[#111827] text-white text-xs font-semibold flex items-center gap-1 shadow-sm"
              >
                <Plus size={13} />
                <span>{isZh ? '添加规格维度' : 'Add Option'}</span>
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {product.options.map((opt) => (
                <div key={opt.id} className="p-4 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#111827]">{isZh ? opt.name : opt.name_en}</span>
                    <span className="text-[10px] font-mono text-[#9CA3AF]">{opt.code}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {opt.values.map((v) => (
                      <span
                        key={v}
                        className="px-2.5 py-1 rounded-lg bg-white border border-[#E5E7EB] text-xs font-medium text-[#111827] shadow-2xs"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 变体矩阵明细表 */}
          <div className="crextio-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#111827]">
                {isZh ? `变体矩阵列表 (${product.variants.length})` : `Variant Combinations (${product.variants.length})`}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => alert(isZh ? '已完成一键批量价格校准' : 'Batch updated!')}
                  className="px-3 py-1.5 rounded-lg bg-[#F4F5F7] hover:bg-[#E5E7EB] text-xs font-semibold text-[#111827]"
                >
                  {isZh ? '批量改价' : 'Batch Price'}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-[#6B7280] font-semibold">
                    <th className="pb-3 px-3">{isZh ? '规格组合' : 'Option Values'}</th>
                    <th className="pb-3 px-3">{isZh ? '变体 SKU' : 'Variant SKU'}</th>
                    <th className="pb-3 px-3">{isZh ? '售价 (¥)' : 'Price'}</th>
                    <th className="pb-3 px-3">{isZh ? '库存' : 'Inventory'}</th>
                    <th className="pb-3 px-3">{isZh ? '国际条码 (Barcode)' : 'Barcode'}</th>
                    <th className="pb-3 px-3 text-right">{isZh ? '操作' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]/60">
                  {product.variants.map((v) => (
                    <tr key={v.id} className="hover:bg-[#F4F5F7]/50 transition-colors">
                      <td className="py-3 px-3 font-medium text-[#111827]">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(v.option_values).map(([k, val]) => (
                            <span key={k} className="px-2 py-0.5 rounded-md bg-[#F4F5F7] text-[11px] font-semibold">
                              {val}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-[#6B7280]">{v.sku}</td>
                      <td className="py-3 px-3 font-bold text-[#111827]">¥{v.price}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            v.inventory < 50 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {v.inventory} 件
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-[#9CA3AF]">{v.barcode || '-'}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded"
                          title="Remove"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: AI 语义节点与 Agent 知识图谱 (Semantic Node) */}
      {activeTab === 'semantic' && (
        <div className="space-y-6">
          {/* 顶部 AI 语义拓扑看板 */}
          <div className="crextio-dark-card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#edbc40]">
                  <Cpu size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{isZh ? 'AI 语义知识节点 (Semantic Node)' : 'AI Semantic Knowledge Node'}</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#edbc40] text-[#111827] text-[10px] font-bold">
                      MCP v2 Ready
                    </span>
                  </h3>
                  <p className="text-xs text-white/70 mt-0.5">
                    {isZh
                      ? '本商品已转化为大模型与自主 Agent 可直接查询调用的结构化语义节点，免除传统关键词死板匹配。'
                      : 'Structured semantic node ready for AI Agent retrieval and autonomous reasoning.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-white/80">{isZh ? '语义置信度' : 'Confidence'}:</span>
                <span className="text-lg font-bold text-[#edbc40]">
                  {(product.semantic_data.confidence * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* AI 推荐推理机制说明 */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-white/90 leading-relaxed">
              <span className="font-bold text-[#edbc40] mr-1.5">{isZh ? '【Agent 推理特征】' : '【Agent Reasoning】'}</span>
              {isZh ? product.semantic_data.agent_reasoning : product.semantic_data.agent_reasoning_en}
            </div>
          </div>

          {/* 结构化语义属性列表 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="crextio-card p-6 space-y-4">
              <h3 className="text-sm font-bold text-[#111827] flex items-center justify-between">
                <span>{isZh ? '结构化属性矩阵 (Attributes)' : 'Structured Attributes'}</span>
                <span className="text-[11px] text-[#6B7280]">{Object.keys(product.semantic_data.attributes).length} 项</span>
              </h3>

              <div className="space-y-2.5">
                {Object.entries(product.semantic_data.attributes).map(([k, val]) => (
                  <div key={k} className="flex justify-between items-center p-3 rounded-xl bg-[#F4F5F7] text-xs">
                    <span className="font-semibold text-[#111827] font-mono">{k}</span>
                    <span className="font-bold text-[#111827]">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 核心卖点与目标人群 */}
            <div className="crextio-card p-6 space-y-4">
              <h3 className="text-sm font-bold text-[#111827]">{isZh ? '核心特征与受众定位' : 'Key Features & Audience'}</h3>

              <div>
                <label className="block text-xs font-semibold text-[#6B7280] mb-2">
                  {isZh ? '核心特征标签 (Key Features)' : 'Key Features'}
                </label>
                <div className="space-y-1.5">
                  {(isZh ? product.semantic_data.key_features : product.semantic_data.key_features_en).map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-[#111827]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#edbc40]" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5E7EB]">
                <label className="block text-xs font-semibold text-[#6B7280] mb-1.5">
                  {isZh ? '推荐目标受众 (Target Audience)' : 'Target Audience'}
                </label>
                <p className="text-xs text-[#111827] font-medium leading-relaxed">
                  {isZh ? product.semantic_data.target_audience : product.semantic_data.target_audience_en}
                </p>
              </div>

              <div className="pt-3 border-t border-[#E5E7EB]">
                <label className="block text-xs font-semibold text-[#6B7280] mb-2">
                  {isZh ? '语义搜索联想词 (AI Search Vectors)' : 'AI Search Terms'}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {product.semantic_data.ai_search_terms.map((term) => (
                    <span
                      key={term}
                      className="px-2.5 py-1 rounded-full bg-[#F4F5F7] border border-[#E5E7EB] text-[11px] font-medium text-[#111827]"
                    >
                      #{term}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 存证数据卡片 (Evidence) */}
          <div className="crextio-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#111827]">{isZh ? '语义真实性存证 (Evidence Chain)' : 'Evidence Chain'}</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {product.evidence.map((ev, i) => (
                <div key={i} className="p-4 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-[#111827]">{ev.semantic_field}</span>
                    <span className="px-2 py-0.5 rounded-full bg-white text-[10px] font-semibold text-[#6B7280]">
                      {ev.evidence_type}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-[#111827]">{ev.field_value}</div>
                  <div className="text-[10px] text-[#9CA3AF] truncate" title={ev.evidence_source}>
                    {ev.evidence_source}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: 全渠道多平台同步 (Channels Sync) */}
      {activeTab === 'channels' && (
        <div className="space-y-6">
          <div className="crextio-card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-sm font-bold text-[#111827]">{isZh ? '全渠道库存与商品分发' : 'Multi-Channel Distribution'}</h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {isZh
                    ? '一键将商品主档、变体矩阵及 AI 语义数据实时同步至各大电商平台与 AI 搜索入口。'
                    : 'Real-time multi-channel inventory and semantic catalog synchronization.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => alert(isZh ? '全渠道同步指令已下发！' : 'Synced to all channels!')}
                className="px-4 py-2 rounded-full bg-[#111827] hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <RefreshCw size={13} />
                <span>{isZh ? '一键同步全渠道' : 'Sync All Channels'}</span>
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* 自营独立站 */}
              <ChannelCard
                name={isZh ? '自营独立站' : 'Online Store'}
                connected={product.channels.shopify}
                logo="S"
                color="#95BF47"
                statusText={product.channels.shopify ? (isZh ? '已同步 (206 件在售)' : 'Active (206 live)') : isZh ? '未连接' : 'Disconnected'}
                lastSync="2 分钟前"
              />

              {/* Amazon */}
              <ChannelCard
                name="Amazon Global"
                connected={product.channels.amazon}
                logo="a"
                color="#FF9900"
                statusText={product.channels.amazon ? (isZh ? '已同步 (400 件在售)' : 'Active (400 live)') : isZh ? '未连接' : 'Disconnected'}
                lastSync="10 分钟前"
              />

              {/* TikTok Shop */}
              <ChannelCard
                name="TikTok Shop"
                connected={product.channels.tiktok}
                logo="T"
                color="#000000"
                statusText={product.channels.tiktok ? (isZh ? '已同步 (视频挂车就绪)' : 'Active (Shoppable)') : isZh ? '未连接' : 'Disconnected'}
                lastSync="1 小时前"
              />

              {/* Google Shopping */}
              <ChannelCard
                name="Google Merchant"
                connected={product.channels.google}
                logo="G"
                color="#4285F4"
                statusText={product.channels.google ? (isZh ? '已同步 (AI搜索推荐)' : 'Active (AI Search)') : isZh ? '待授权' : 'Pending'}
                lastSync="未同步"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: AI Agent 对话模拟器 (Live Simulator) */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 左侧聊天界面 (8 cols) */}
          <div className="lg:col-span-8">
            <div className="crextio-card p-5 h-[580px] flex flex-col justify-between">
              {/* 聊天顶部 */}
              <div className="pb-3 border-b border-[#E5E7EB] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#111827] text-[#edbc40] flex items-center justify-center">
                    <Bot size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#111827]">
                      {isZh ? 'OmniCommerce AI 导购 Agent 模拟器' : 'OmniCommerce Agent Simulator'}
                    </h4>
                    <p className="text-[10px] text-[#9CA3AF]">
                      {isZh ? '实时基于此商品的语义知识节点进行交互问答' : 'Querying this product semantic node'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setChatMessages([
                      {
                        sender: 'agent',
                        text: isZh ? '对话已重置。请随时向我提问！' : 'Chat reset. Ask me anything!',
                      },
                    ])
                  }
                  className="text-[11px] text-[#6B7280] hover:text-[#111827]"
                >
                  {isZh ? '清空记录' : 'Clear'}
                </button>
              </div>

              {/* 消息滚动区 */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        msg.sender === 'user'
                          ? 'bg-[#111827] text-white'
                          : 'bg-[#edbc40]/20 text-[#111827] border border-[#edbc40]/40'
                      }`}
                    >
                      {msg.sender === 'user' ? <User size={13} /> : <Bot size={13} />}
                    </div>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#111827] text-white rounded-tr-none'
                          : 'bg-[#F4F5F7] border border-[#E5E7EB] text-[#111827] rounded-tl-none font-medium'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* 底部输入框 */}
              <div className="pt-3 border-t border-[#E5E7EB]">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendChat()
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={
                      isZh
                        ? '向 Agent 提问（例如：这款耳机适合跑步吗？续航多久？）...'
                        : 'Ask the Agent (e.g. Is it waterproof?)...'
                    }
                    className="flex-1 h-10 px-4 rounded-full bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
                  />
                  <button
                    type="submit"
                    className="w-10 h-10 rounded-full bg-[#111827] hover:bg-black text-white flex items-center justify-center shrink-0 shadow-sm"
                  >
                    <Send size={14} />
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* 右侧快捷预设问题 (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="crextio-card p-5 space-y-3">
              <h4 className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#8B5CF6]" />
                <span>{isZh ? '常见买家测试用例' : 'Sample Buyer Queries'}</span>
              </h4>
              <p className="text-[11px] text-[#6B7280]">
                {isZh ? '点击下方预设问题快速体验 Agent 的语义理解与解答能力：' : 'Click to test instant replies:'}
              </p>

              <div className="space-y-2">
                {product.agent_qa.map((qa, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSendChat(isZh ? qa.question : qa.question_en)}
                    className="w-full text-left p-3 rounded-xl bg-[#F4F5F7] hover:bg-[#E5E7EB] border border-[#E5E7EB] text-xs font-medium text-[#111827] transition-colors"
                  >
                    💬 {isZh ? qa.question : qa.question_en}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleSendChat(isZh ? `这款商品的售价和库存是多少？` : `What is the price and stock?`)}
                  className="w-full text-left p-3 rounded-xl bg-[#F4F5F7] hover:bg-[#E5E7EB] border border-[#E5E7EB] text-xs font-medium text-[#111827] transition-colors"
                >
                  💬 {isZh ? '这款商品的售价和库存是多少？' : 'What is the price and stock?'}
                </button>
              </div>
            </div>

            <div className="crextio-card p-5 space-y-2 text-xs">
              <h4 className="font-bold text-[#111827]">{isZh ? '测试提示' : 'Testing Tips'}</h4>
              <p className="text-[#6B7280] leading-relaxed">
                {isZh
                  ? 'Agent 能够根据已存储的属性、使用场景及说明文本进行自然语言推理，即便买家提问并非严格匹配字词也能准确定位推荐。'
                  : 'The Agent reasons over stored semantic features to answer complex queries even without exact keyword matches.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  badge?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
        active
          ? 'bg-[#111827] text-white shadow-sm'
          : 'bg-transparent text-[#6B7280] hover:text-[#111827] hover:bg-[#F4F5F7]'
      }`}
    >
      {icon}
      <span>{label}</span>
      {badge && (
        <span
          className={`px-1.5 py-0.2 rounded-md text-[9px] font-bold ${
            active ? 'bg-[#edbc40] text-[#111827]' : 'bg-[#edbc40]/20 text-[#111827]'
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  )
}

function ChannelCard({
  name,
  connected,
  logo,
  color,
  statusText,
  lastSync,
}: {
  name: string
  connected: boolean
  logo: string
  color: string
  statusText: string
  lastSync: string
}) {
  return (
    <div className="p-4 rounded-2xl bg-[#F4F5F7] border border-[#E5E7EB] flex flex-col justify-between gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            style={{ backgroundColor: `${color}15`, color }}
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
          >
            {logo}
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#111827]">{name}</h4>
            <span className="text-[10px] text-[#9CA3AF] block">{lastSync}</span>
          </div>
        </div>

        <span
          className={`w-2.5 h-2.5 rounded-full ${
            connected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-300'
          }`}
        />
      </div>

      <div className="pt-2 border-t border-[#E5E7EB]/80 flex items-center justify-between text-[11px]">
        <span className="text-[#6B7280] font-medium">{statusText}</span>
        <button type="button" className="text-[#111827] font-semibold hover:underline">
          管理
        </button>
      </div>
    </div>
  )
}
