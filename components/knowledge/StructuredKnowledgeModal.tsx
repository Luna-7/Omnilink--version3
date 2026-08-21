'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  X,
  Save,
  Check,
  Building2,
  Sparkles,
  ShieldCheck,
  Layers,
  Plus,
  Trash2,
  Globe,
  Share2,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
} from 'lucide-react'
import type {
  SystemBaseId,
  BrandBusinessStructuredData,
  ProductKnowledgeSupplementaryData,
  SupportPolicyStructuredData,
} from './types'

interface StructuredKnowledgeModalProps {
  baseId: SystemBaseId
  isOpen: boolean
  onClose: () => void
  isZh: boolean
  brandData: BrandBusinessStructuredData
  productData: ProductKnowledgeSupplementaryData
  policyData: SupportPolicyStructuredData
  onSaveBrand: (data: BrandBusinessStructuredData) => void
  onSaveProduct: (data: ProductKnowledgeSupplementaryData) => void
  onSavePolicy: (data: SupportPolicyStructuredData) => void
}

export function StructuredKnowledgeModal({
  baseId,
  isOpen,
  onClose,
  isZh,
  brandData: initialBrand,
  productData: initialProduct,
  policyData: initialPolicy,
  onSaveBrand,
  onSaveProduct,
  onSavePolicy,
}: StructuredKnowledgeModalProps) {
  const [brandForm, setBrandForm] = useState<BrandBusinessStructuredData>(initialBrand)
  const [productForm, setProductForm] = useState<ProductKnowledgeSupplementaryData>(initialProduct)
  const [policyForm, setPolicyForm] = useState<SupportPolicyStructuredData>(initialPolicy)
  const [isSaved, setIsSaved] = useState(false)

  if (!isOpen) return null

  const handleSave = () => {
    if (baseId === 'brand-business') {
      onSaveBrand(brandForm)
    } else if (baseId === 'product-knowledge') {
      onSaveProduct(productForm)
    } else if (baseId === 'support-policy') {
      onSavePolicy(policyForm)
    }
    setIsSaved(true)
    setTimeout(() => {
      setIsSaved(false)
      onClose()
    }, 800)
  }

  const getBaseTitle = () => {
    switch (baseId) {
      case 'brand-business':
        return isZh ? '品牌与企业结构化字段 (Brand & Business)' : 'Brand & Business Structured Schema'
      case 'product-knowledge':
        return isZh ? '产品知识补充字段 (Product Knowledge)' : 'Product Knowledge Supplementary Context'
      case 'support-policy':
        return isZh ? '客服与服务政策结构化配置 (Support & Policy)' : 'Support & Policy Structured Schema'
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-3xl bg-white rounded-3xl p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.18)] border border-[#E5E7EB] z-10 max-h-[90vh] flex flex-col"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#111827] text-white flex items-center justify-center font-bold">
                {baseId === 'brand-business' && <Building2 size={16} />}
                {baseId === 'product-knowledge' && <Sparkles size={16} />}
                {baseId === 'support-policy' && <ShieldCheck size={16} />}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#111827]">{getBaseTitle()}</h3>
                <span className="text-[11px] text-[#6B7280]">
                  {isZh
                    ? '结构化数据可由大模型直接解析，并支持后续自动同步至 Storefront 独立站'
                    : 'Machine-readable schema ready for instant AI consumption & Storefront sync'}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F4F5F7] hover:bg-[#E5E7EB] text-[#6B7280] hover:text-[#111827] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          {/* Form Scroll Area */}
          <div className="flex-1 overflow-y-auto py-5 pr-1 space-y-6 custom-scroll">
            {baseId === 'brand-business' && (
              <BrandBusinessForm form={brandForm} setForm={setBrandForm} isZh={isZh} />
            )}
            {baseId === 'product-knowledge' && (
              <ProductKnowledgeForm form={productForm} setForm={setProductForm} isZh={isZh} />
            )}
            {baseId === 'support-policy' && (
              <SupportPolicyForm form={policyForm} setForm={setPolicyForm} isZh={isZh} />
            )}
          </div>

          {/* Bottom Bar */}
          <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-xs text-[#6B7280]">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span>{isZh ? '模式：固定模板字段（防幻觉保护）' : 'Schema Mode: Template Guarded'}</span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full bg-[#F4F5F7] hover:bg-[#E5E7EB] text-[#111827] text-xs font-semibold transition-all cursor-pointer"
              >
                {isZh ? '取消' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 rounded-full bg-[#111827] hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                {isSaved ? (
                  <>
                    <Check size={14} className="text-green-400" />
                    <span>{isZh ? '已保存！' : 'Saved!'}</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>{isZh ? '保存结构化知识' : 'Save Schema'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

function BrandBusinessForm({
  form,
  setForm,
  isZh,
}: {
  form: BrandBusinessStructuredData
  setForm: React.Dispatch<React.SetStateAction<BrandBusinessStructuredData>>
  isZh: boolean
}) {
  return (
    <div className="space-y-5">
      {/* 基础身份 */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
          {isZh ? '1. 品牌与主体标识' : '1. Brand & Identity'}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              {isZh ? '官方品牌名称 (Brand Name)' : 'Brand Name'}
            </label>
            <input
              type="text"
              value={form.brandName}
              onChange={(e) => setForm({ ...form, brandName: e.target.value })}
              className="w-full h-9 px-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs font-medium text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              {isZh ? '独立站展示名 (Store Display Name)' : 'Store Display Name'}
            </label>
            <input
              type="text"
              value={form.storeDisplayName}
              onChange={(e) => setForm({ ...form, storeDisplayName: e.target.value })}
              className="w-full h-9 px-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs font-medium text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
            />
          </div>
        </div>
      </div>

      {/* 联系方式 */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
          {isZh ? '2. 官方联络方式 (Contact Channels)' : '2. Contact Channels'}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              {isZh ? '官方联系人' : 'Contact Person'}
            </label>
            <input
              type="text"
              value={form.contactPerson}
              onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
              className="w-full h-9 px-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              {isZh ? '官方服务邮箱' : 'Email Address'}
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full h-9 px-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              {isZh ? '电话 / 国际热线' : 'Phone Number'}
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full h-9 px-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              {isZh ? '官方 WhatsApp 客服' : 'WhatsApp Support'}
            </label>
            <input
              type="text"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              className="w-full h-9 px-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              {isZh ? '企业注册办公地址 (Address)' : 'Corporate Address'}
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full h-9 px-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
            />
          </div>
        </div>
      </div>

      {/* 社交媒体矩阵 */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
          {isZh ? '3. 社交矩阵与官方链接' : '3. Social Channels & Official Links'}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">Twitter / X</label>
            <input
              type="text"
              value={form.socialChannels.twitter || ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  socialChannels: { ...form.socialChannels, twitter: e.target.value },
                })
              }
              placeholder="https://x.com/username"
              className="w-full h-9 px-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">Instagram</label>
            <input
              type="text"
              value={form.socialChannels.instagram || ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  socialChannels: { ...form.socialChannels, instagram: e.target.value },
                })
              }
              placeholder="https://instagram.com/username"
              className="w-full h-9 px-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              {isZh ? '官方网站' : 'Official Website'}
            </label>
            <input
              type="text"
              value={form.officialLinks.website || ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  officialLinks: { ...form.officialLinks, website: e.target.value },
                })
              }
              placeholder="https://yourbrand.com"
              className="w-full h-9 px-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              {isZh ? '文档与帮助中心' : 'Docs / Help Center'}
            </label>
            <input
              type="text"
              value={form.officialLinks.documentation || ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  officialLinks: { ...form.officialLinks, documentation: e.target.value },
                })
              }
              placeholder="https://docs.yourbrand.com"
              className="w-full h-9 px-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function ProductKnowledgeForm({
  form,
  setForm,
  isZh,
}: {
  form: ProductKnowledgeSupplementaryData
  setForm: React.Dispatch<React.SetStateAction<ProductKnowledgeSupplementaryData>>
  isZh: boolean
}) {
  return (
    <div className="space-y-4">
      <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 leading-relaxed">
        {isZh
          ? '💡 提示：此处仅配置供 AI 学习的深度补充知识，不要重复录入商品主数据（如价格、SKU、基础库存）。'
          : '💡 Note: Supplementary intelligence only. Do not duplicate catalog master data like SKU, Price, or Inventory.'}
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#111827] mb-1">
          {isZh ? '1. 品牌/产品故事 (Product Story)' : '1. Product Story'}
        </label>
        <textarea
          rows={3}
          value={form.productStory}
          onChange={(e) => setForm({ ...form, productStory: e.target.value })}
          placeholder={isZh ? '产品的研发初衷、工业设计理念与背后的故事...' : 'Design philosophy, inspiration, and heritage story...'}
          className="w-full p-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827] leading-relaxed"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#111827] mb-1">
          {isZh ? '2. 使用与应用场景 (Usage / Application Scenarios)' : '2. Usage / Application'}
        </label>
        <textarea
          rows={3}
          value={form.usageScenarios}
          onChange={(e) => setForm({ ...form, usageScenarios: e.target.value })}
          placeholder={isZh ? '列出典型使用场景（如飞行差旅、静音办公、沉浸听音等）...' : 'Key user personas and application scenarios...'}
          className="w-full p-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827] leading-relaxed"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#111827] mb-1">
            {isZh ? '3. 保养与维护指南 (Care Instructions)' : '3. Care Instructions'}
          </label>
          <textarea
            rows={3}
            value={form.careInstructions}
            onChange={(e) => setForm({ ...form, careInstructions: e.target.value })}
            placeholder={isZh ? '防潮防泼溅级别、耳罩清洁方式、电池维护周期...' : 'Maintenance, cleaning, and storage recommendations...'}
            className="w-full p-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827] leading-relaxed"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#111827] mb-1">
            {isZh ? '4. 权威认证说明 (Certification Notes)' : '4. Certification Notes'}
          </label>
          <textarea
            rows={3}
            value={form.certificationNotes}
            onChange={(e) => setForm({ ...form, certificationNotes: e.target.value })}
            placeholder={isZh ? 'CE, FCC, RoHS, Bluetooth SIG 官方认证与质检标准...' : 'CE, FCC, RoHS, and safety compliance records...'}
            className="w-full p-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827] leading-relaxed"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#111827] mb-1">
            {isZh ? '5. 跨设备兼容性矩阵 (Compatibility Matrix)' : '5. Compatibility Matrix'}
          </label>
          <textarea
            rows={3}
            value={form.compatibilityMatrix}
            onChange={(e) => setForm({ ...form, compatibilityMatrix: e.target.value })}
            placeholder={isZh ? '支持的 OS 系统版本、蓝牙编解码协议与双设备流转...' : 'Supported OS, Bluetooth codecs, and dual pairing...'}
            className="w-full p-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827] leading-relaxed"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#111827] mb-1">
            {isZh ? '6. 额外 AI 导购上下文 (Additional AI Context)' : '6. Additional AI Context'}
          </label>
          <textarea
            rows={3}
            value={form.additionalAiContext}
            onChange={(e) => setForm({ ...form, additionalAiContext: e.target.value })}
            placeholder={isZh ? '给 AI 导购机器人的应答指引（例如近视戴眼镜买家解答口径）...' : 'Specific reasoning hints for the AI sales agent...'}
            className="w-full p-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827] leading-relaxed"
          />
        </div>
      </div>
    </div>
  )
}

function SupportPolicyForm({
  form,
  setForm,
  isZh,
}: {
  form: SupportPolicyStructuredData
  setForm: React.Dispatch<React.SetStateAction<SupportPolicyStructuredData>>
  isZh: boolean
}) {
  const [newFaqQ, setNewFaqQ] = useState('')
  const [newFaqA, setNewFaqA] = useState('')

  const addFaq = () => {
    if (!newFaqQ.trim() || !newFaqA.trim()) return
    setForm({
      ...form,
      faqs: [
        ...form.faqs,
        {
          id: `faq-${Date.now()}`,
          question: newFaqQ.trim(),
          answer: newFaqA.trim(),
          category: 'General',
        },
      ],
    })
    setNewFaqQ('')
    setNewFaqA('')
  }

  const removeFaq = (id: string) => {
    setForm({
      ...form,
      faqs: form.faqs.filter((f) => f.id !== id),
    })
  }

  return (
    <div className="space-y-6">
      {/* 1. FAQ 列表与新增 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
            {isZh ? `1. FAQ 问答库 (${form.faqs.length} 条)` : `1. FAQs (${form.faqs.length})`}
          </h4>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {form.faqs.map((faq) => (
            <div
              key={faq.id}
              className="p-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] flex items-start justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <span className="font-bold text-[#111827] block">Q: {faq.question}</span>
                <span className="text-[#6B7280] block">A: {faq.answer}</span>
              </div>
              <button
                type="button"
                onClick={() => removeFaq(faq.id)}
                className="p-1 text-gray-400 hover:text-red-600 rounded cursor-pointer"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>

        {/* 新增 FAQ */}
        <div className="p-3 rounded-xl bg-white border border-[#E5E7EB] space-y-2">
          <input
            type="text"
            placeholder={isZh ? '输入买家常见提问...' : 'Add question...'}
            value={newFaqQ}
            onChange={(e) => setNewFaqQ(e.target.value)}
            className="w-full h-8 px-3 rounded-lg bg-[#F4F5F7] text-xs text-[#111827] focus:outline-none"
          />
          <textarea
            rows={2}
            placeholder={isZh ? '输入标准官方解答口径...' : 'Add authoritative answer...'}
            value={newFaqA}
            onChange={(e) => setNewFaqA(e.target.value)}
            className="w-full p-2.5 rounded-lg bg-[#F4F5F7] text-xs text-[#111827] focus:outline-none leading-relaxed"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={addFaq}
              className="px-3 py-1 rounded-full bg-[#111827] text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus size={12} />
              <span>{isZh ? '添加 FAQ 条目' : 'Add FAQ'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. 物流规则 (Shipping) */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
          {isZh ? '2. 物流履约时效 (Shipping)' : '2. Shipping & Delivery'}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              {isZh ? '订单处理时效 (Processing Time)' : 'Processing Time'}
            </label>
            <input
              type="text"
              value={form.shipping.processingTime}
              onChange={(e) =>
                setForm({
                  ...form,
                  shipping: { ...form.shipping, processingTime: e.target.value },
                })
              }
              className="w-full h-9 px-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              {isZh ? '标准配送耗时 (Standard Delivery)' : 'Standard Delivery'}
            </label>
            <input
              type="text"
              value={form.shipping.standardDelivery}
              onChange={(e) =>
                setForm({
                  ...form,
                  shipping: { ...form.shipping, standardDelivery: e.target.value },
                })
              }
              className="w-full h-9 px-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              {isZh ? '免运费门槛 (Free Shipping Threshold)' : 'Free Shipping Threshold'}
            </label>
            <input
              type="text"
              value={form.shipping.freeShippingThreshold}
              onChange={(e) =>
                setForm({
                  ...form,
                  shipping: { ...form.shipping, freeShippingThreshold: e.target.value },
                })
              }
              className="w-full h-9 px-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              {isZh ? '支持承运商 (Carriers)' : 'Carriers'}
            </label>
            <input
              type="text"
              value={form.shipping.supportedCarriers}
              onChange={(e) =>
                setForm({
                  ...form,
                  shipping: { ...form.shipping, supportedCarriers: e.target.value },
                })
              }
              className="w-full h-9 px-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 3. 退换货政策 (Returns) */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
          {isZh ? '3. 退换货政策 (Returns & Refunds)' : '3. Returns & Refunds'}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              {isZh ? '退换货有效期 (天数)' : 'Return Window (Days)'}
            </label>
            <input
              type="number"
              value={form.returns.returnWindowDays}
              onChange={(e) =>
                setForm({
                  ...form,
                  returns: { ...form.returns, returnWindowDays: parseInt(e.target.value) || 0 },
                })
              }
              className="w-full h-9 px-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs font-bold text-[#111827] focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              {isZh ? '退货退款到账时效 (Refund SLA)' : 'Refund SLA'}
            </label>
            <input
              type="text"
              value={form.returns.refundSla}
              onChange={(e) =>
                setForm({
                  ...form,
                  returns: { ...form.returns, refundSla: e.target.value },
                })
              }
              className="w-full h-9 px-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#111827] mb-1">
            {isZh ? '退货条件与包装要求' : 'Return Conditions'}
          </label>
          <textarea
            rows={2}
            value={form.returns.conditions}
            onChange={(e) =>
              setForm({
                ...form,
                returns: { ...form.returns, conditions: e.target.value },
              })
            }
            className="w-full p-2.5 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none leading-relaxed"
          />
        </div>
      </div>

      {/* 4. 质保条款 (Warranty) */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
          {isZh ? '4. 售后质保条款 (Warranty)' : '4. Warranty'}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              {isZh ? '官方质保月数' : 'Warranty Duration (Months)'}
            </label>
            <input
              type="number"
              value={form.warranty.coverageMonths}
              onChange={(e) =>
                setForm({
                  ...form,
                  warranty: { ...form.warranty, coverageMonths: parseInt(e.target.value) || 0 },
                })
              }
              className="w-full h-9 px-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs font-bold text-[#111827] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              {isZh ? '质保申请方式' : 'Claim Procedure'}
            </label>
            <input
              type="text"
              value={form.warranty.claimProcedure}
              onChange={(e) =>
                setForm({
                  ...form,
                  warranty: { ...form.warranty, claimProcedure: e.target.value },
                })
              }
              className="w-full h-9 px-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 5. 客服运营与响应 (Customer Service) */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
          {isZh ? '5. 客服服务与升级通道 (Customer Service)' : '5. Customer Service SLA'}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              {isZh ? '客服工作时间 (Operating Hours)' : 'Operating Hours'}
            </label>
            <input
              type="text"
              value={form.customerService.operatingHours}
              onChange={(e) =>
                setForm({
                  ...form,
                  customerService: { ...form.customerService, operatingHours: e.target.value },
                })
              }
              className="w-full h-9 px-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              {isZh ? '响应承诺 (Response SLA)' : 'Response SLA'}
            </label>
            <input
              type="text"
              value={form.customerService.responseSla}
              onChange={(e) =>
                setForm({
                  ...form,
                  customerService: { ...form.customerService, responseSla: e.target.value },
                })
              }
              className="w-full h-9 px-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
