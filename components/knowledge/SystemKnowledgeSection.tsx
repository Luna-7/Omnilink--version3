'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Building2,
  ShieldCheck,
  ChevronDown,
  Plus,
  Trash2,
  Save,
  Check,
  Sparkles,
  ExternalLink,
  Globe,
  Share2,
  Mail,
  Phone,
  MapPin,
  HelpCircle,
  Clock,
  Truck,
  RotateCcw,
  ShieldAlert,
  Headphones,
} from 'lucide-react'
import type {
  BrandBusinessStructuredData,
  SupportPolicyStructuredData,
} from './types'

interface SystemKnowledgeSectionProps {
  brandData: BrandBusinessStructuredData
  policyData: SupportPolicyStructuredData
  onSaveBrand: (data: BrandBusinessStructuredData) => void
  onSavePolicy: (data: SupportPolicyStructuredData) => void
  isZh: boolean
}

export function SystemKnowledgeSection({
  brandData: initialBrand,
  policyData: initialPolicy,
  onSaveBrand,
  onSavePolicy,
  isZh,
}: SystemKnowledgeSectionProps) {
  // Accordion open states
  const [openBrand, setOpenBrand] = useState(false)
  const [openPolicy, setOpenPolicy] = useState(false)

  // Local form states
  const [brandForm, setBrandForm] = useState<BrandBusinessStructuredData>(initialBrand)
  const [policyForm, setPolicyForm] = useState<SupportPolicyStructuredData>(initialPolicy)

  // Save feedback state
  const [brandSaved, setBrandSaved] = useState(false)
  const [policySaved, setPolicySaved] = useState(false)

  // Dynamic social channel state for adding
  const [newSocialPlatform, setNewSocialPlatform] = useState('youtube')
  const [newSocialUrl, setNewSocialUrl] = useState('')

  // Dynamic official link state for adding
  const [newLinkKey, setNewLinkKey] = useState('blog')
  const [newLinkUrl, setNewLinkUrl] = useState('')

  // Dynamic FAQ state for adding
  const [newFaqQ, setNewFaqQ] = useState('')
  const [newFaqA, setNewFaqA] = useState('')
  const [newFaqCat, setNewFaqCat] = useState('General')

  const handleSaveBrand = () => {
    onSaveBrand(brandForm)
    setBrandSaved(true)
    setTimeout(() => setBrandSaved(false), 1500)
  }

  const handleSavePolicy = () => {
    onSavePolicy(policyForm)
    setPolicySaved(true)
    setTimeout(() => setPolicySaved(false), 1500)
  }

  const handleAddSocialChannel = () => {
    if (!newSocialUrl.trim()) return
    setBrandForm({
      ...brandForm,
      socialChannels: {
        ...brandForm.socialChannels,
        [newSocialPlatform]: newSocialUrl.trim(),
      },
    })
    setNewSocialUrl('')
  }

  const handleRemoveSocialChannel = (platform: string) => {
    const updated = { ...brandForm.socialChannels }
    delete updated[platform]
    setBrandForm({
      ...brandForm,
      socialChannels: updated,
    })
  }

  const handleAddOfficialLink = () => {
    if (!newLinkUrl.trim()) return
    setBrandForm({
      ...brandForm,
      officialLinks: {
        ...brandForm.officialLinks,
        [newLinkKey]: newLinkUrl.trim(),
      },
    })
    setNewLinkUrl('')
  }

  const handleRemoveOfficialLink = (key: string) => {
    const updated = { ...brandForm.officialLinks }
    delete updated[key]
    setBrandForm({
      ...brandForm,
      officialLinks: updated,
    })
  }

  const handleAddFaq = () => {
    if (!newFaqQ.trim() || !newFaqA.trim()) return
    setPolicyForm({
      ...policyForm,
      faqs: [
        ...policyForm.faqs,
        {
          id: `faq-${Date.now()}`,
          question: newFaqQ.trim(),
          answer: newFaqA.trim(),
          category: newFaqCat,
        },
      ],
    })
    setNewFaqQ('')
    setNewFaqA('')
  }

  const handleRemoveFaq = (id: string) => {
    setPolicyForm({
      ...policyForm,
      faqs: policyForm.faqs.filter((f) => f.id !== id),
    })
  }

  return (
    <div className="space-y-4">
      {/* Section Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
          <h3 className="text-sm font-extrabold text-[#111827] uppercase tracking-wider">
            {isZh ? '系统知识 (System Knowledge)' : 'System Knowledge'}
          </h3>
        </div>
        <span className="text-xs text-[#6B7280]">
          {isZh ? '全局生效 · 自动注入 Storefront 与 AI 机器人' : 'Global Scope · Auto-injected to Storefront & Agents'}
        </span>
      </div>

      {/* Accordion 1: Brand & Business */}
      <div className="rounded-3xl bg-white border border-[#E5E7EB] shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden transition-all">
        {/* Accordion Header */}
        <div
          onClick={() => setOpenBrand(!openBrand)}
          className="p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#F9FAFB]/70 transition-colors select-none"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-[#111827] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Building2 size={20} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h4 className="text-sm sm:text-base font-bold text-[#111827]">
                  {isZh ? '品牌与企业资料' : 'Brand & Business'}
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200/70 text-[#8B5CF6] text-[10px] font-bold">
                  {isZh ? '固定模板结构' : 'Structured Template'}
                </span>
              </div>
              <p className="text-xs text-[#6B7280] truncate mt-0.5">
                {isZh
                  ? '官方品牌形象、企业联系方式、社交矩阵与独立站全渠道官方资料'
                  : 'Official brand identity, corporate profile, contact channels & social accounts.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:inline text-xs font-semibold text-[#8B5CF6]">
              {openBrand ? (isZh ? '收起配置' : 'Collapse') : (isZh ? '展开编辑' : 'Expand')}
            </span>
            <div
              className={`w-8 h-8 rounded-full bg-[#F4F5F7] border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] transition-transform duration-200 ${
                openBrand ? 'rotate-180 text-[#111827]' : ''
              }`}
            >
              <ChevronDown size={16} />
            </div>
          </div>
        </div>

        {/* Accordion Body */}
        <AnimatePresence>
          {openBrand && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="border-t border-[#E5E7EB] bg-[#FAFAFC]"
            >
              <div className="p-6 sm:p-7 space-y-6">
                {/* 1. 品牌与主体标识 */}
                <div className="space-y-3 bg-white p-5 rounded-2xl border border-[#E5E7EB]">
                  <h5 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={13} className="text-[#8B5CF6]" />
                    <span>{isZh ? '1. 品牌与主体标识' : '1. Brand & Identity'}</span>
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#111827] mb-1">
                        {isZh ? '官方品牌名称 (Brand Name)' : 'Brand Name'}
                      </label>
                      <input
                        type="text"
                        value={brandForm.brandName}
                        onChange={(e) => setBrandForm({ ...brandForm, brandName: e.target.value })}
                        className="w-full h-9 px-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs font-medium text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#111827] mb-1">
                        {isZh ? '独立站展示名 (Store Display Name)' : 'Store Display Name'}
                      </label>
                      <input
                        type="text"
                        value={brandForm.storeDisplayName}
                        onChange={(e) =>
                          setBrandForm({ ...brandForm, storeDisplayName: e.target.value })
                        }
                        className="w-full h-9 px-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs font-medium text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. 官方联络方式 */}
                <div className="space-y-3 bg-white p-5 rounded-2xl border border-[#E5E7EB]">
                  <h5 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                    <Mail size={13} className="text-[#8B5CF6]" />
                    <span>{isZh ? '2. 官方联络方式 (Contact Channels)' : '2. Contact Channels'}</span>
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#111827] mb-1">
                        {isZh ? '官方联系人' : 'Contact Person'}
                      </label>
                      <input
                        type="text"
                        value={brandForm.contactPerson}
                        onChange={(e) =>
                          setBrandForm({ ...brandForm, contactPerson: e.target.value })
                        }
                        className="w-full h-9 px-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#111827] mb-1">
                        {isZh ? '官方服务邮箱' : 'Email Address'}
                      </label>
                      <input
                        type="email"
                        value={brandForm.email}
                        onChange={(e) => setBrandForm({ ...brandForm, email: e.target.value })}
                        className="w-full h-9 px-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#111827] mb-1">
                        {isZh ? '电话 / 国际热线' : 'Phone Number'}
                      </label>
                      <input
                        type="text"
                        value={brandForm.phone}
                        onChange={(e) => setBrandForm({ ...brandForm, phone: e.target.value })}
                        className="w-full h-9 px-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-[#111827] mb-1">
                        {isZh ? '官方 WhatsApp 客服' : 'WhatsApp Support'}
                      </label>
                      <input
                        type="text"
                        value={brandForm.whatsapp}
                        onChange={(e) =>
                          setBrandForm({ ...brandForm, whatsapp: e.target.value })
                        }
                        className="w-full h-9 px-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#111827] mb-1">
                        {isZh ? '企业注册办公地址 (Address)' : 'Corporate Address'}
                      </label>
                      <input
                        type="text"
                        value={brandForm.address}
                        onChange={(e) => setBrandForm({ ...brandForm, address: e.target.value })}
                        className="w-full h-9 px-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. 社交矩阵 (支持动态添加) */}
                <div className="space-y-3 bg-white p-5 rounded-2xl border border-[#E5E7EB]">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                      <Share2 size={13} className="text-[#8B5CF6]" />
                      <span>{isZh ? '3. 社交渠道矩阵 (Social Channels - 支持动态增删)' : '3. Social Channels'}</span>
                    </h5>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(brandForm.socialChannels || {}).map(([platform, url]) => (
                      <div
                        key={platform}
                        className="p-2.5 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-[#6B7280] uppercase block">
                            {platform}
                          </span>
                          <input
                            type="text"
                            value={url || ''}
                            onChange={(e) =>
                              setBrandForm({
                                ...brandForm,
                                socialChannels: {
                                  ...brandForm.socialChannels,
                                  [platform]: e.target.value,
                                },
                              })
                            }
                            className="w-full text-xs font-mono text-[#111827] bg-transparent focus:outline-none truncate"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSocialChannel(platform)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                          title={isZh ? '删除渠道' : 'Delete'}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* 动态添加社交渠道栏 */}
                  <div className="p-3 rounded-xl bg-[#FAFAFC] border border-dashed border-[#CBD5E1] flex flex-wrap items-center gap-2">
                    <select
                      value={newSocialPlatform}
                      onChange={(e) => setNewSocialPlatform(e.target.value)}
                      className="h-8 px-2.5 rounded-lg bg-white border border-[#E5E7EB] text-xs font-semibold text-[#111827] focus:outline-none"
                    >
                      <option value="youtube">YouTube</option>
                      <option value="tiktok">TikTok</option>
                      <option value="discord">Discord</option>
                      <option value="wechat">WeChat / 微信</option>
                      <option value="threads">Threads</option>
                      <option value="pinterest">Pinterest</option>
                      <option value="custom">Custom / 自定义</option>
                    </select>
                    <input
                      type="text"
                      placeholder={isZh ? '输入主页或官方账号链接...' : 'Input profile URL...'}
                      value={newSocialUrl}
                      onChange={(e) => setNewSocialUrl(e.target.value)}
                      className="flex-1 min-w-[200px] h-8 px-3 rounded-lg bg-white border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddSocialChannel}
                      className="px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-black text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus size={12} />
                      <span>{isZh ? '添加渠道' : 'Add Channel'}</span>
                    </button>
                  </div>
                </div>

                {/* 4. 官方链接矩阵 */}
                <div className="space-y-3 bg-white p-5 rounded-2xl border border-[#E5E7EB]">
                  <h5 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                    <Globe size={13} className="text-[#8B5CF6]" />
                    <span>{isZh ? '4. 官方链接矩阵 (Official Links)' : '4. Official Links'}</span>
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(brandForm.officialLinks || {}).map(([key, url]) => (
                      <div
                        key={key}
                        className="p-2.5 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-[#6B7280] uppercase block">
                            {key}
                          </span>
                          <input
                            type="text"
                            value={url || ''}
                            onChange={(e) =>
                              setBrandForm({
                                ...brandForm,
                                officialLinks: {
                                  ...brandForm.officialLinks,
                                  [key]: e.target.value,
                                },
                              })
                            }
                            className="w-full text-xs font-mono text-[#111827] bg-transparent focus:outline-none truncate"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveOfficialLink(key)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* 动态添加官方链接 */}
                  <div className="p-3 rounded-xl bg-[#FAFAFC] border border-dashed border-[#CBD5E1] flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      placeholder={isZh ? '链接标识 (如 helpCenter)' : 'Link identifier (e.g. helpCenter)'}
                      value={newLinkKey}
                      onChange={(e) => setNewLinkKey(e.target.value)}
                      className="w-32 h-8 px-2.5 rounded-lg bg-white border border-[#E5E7EB] text-xs font-semibold text-[#111827] focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder={isZh ? '输入官方链接 URL...' : 'Input link URL...'}
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                      className="flex-1 min-w-[200px] h-8 px-3 rounded-lg bg-white border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddOfficialLink}
                      className="px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-black text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus size={12} />
                      <span>{isZh ? '添加链接' : 'Add Link'}</span>
                    </button>
                  </div>
                </div>

                {/* Save Brand Form Button */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-[#6B7280]">
                    {isZh ? '保存后即时同步至全渠道' : 'Auto-synced to all channels after save'}
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveBrand}
                    className="px-5 py-2.5 rounded-full bg-[#111827] hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    {brandSaved ? (
                      <>
                        <Check size={14} className="text-emerald-400" />
                        <span>{isZh ? '品牌资料已保存' : 'Brand Profile Saved'}</span>
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        <span>{isZh ? '保存品牌与企业资料' : 'Save Brand Profile'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Accordion 2: Support & Policy */}
      <div className="rounded-3xl bg-white border border-[#E5E7EB] shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden transition-all">
        {/* Accordion Header */}
        <div
          onClick={() => setOpenPolicy(!openPolicy)}
          className="p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#F9FAFB]/70 transition-colors select-none"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-[#111827] text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck size={20} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h4 className="text-sm sm:text-base font-bold text-[#111827]">
                  {isZh ? '客服与服务政策' : 'Support & Policy'}
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-700 text-[10px] font-bold">
                  {isZh ? 'FAQ · 物流 · 退换 · 质保 · SLA' : 'FAQ · Shipping · Returns · Warranty · SLA'}
                </span>
              </div>
              <p className="text-xs text-[#6B7280] truncate mt-0.5">
                {isZh
                  ? 'FAQ 常见问答、全球物流时效、退换货政策、质保条款与客服响应 SLA'
                  : 'Structured FAQs, global shipping rates, return windows, warranty terms & support SLAs.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:inline text-xs font-semibold text-[#8B5CF6]">
              {openPolicy ? (isZh ? '收起配置' : 'Collapse') : (isZh ? '展开编辑' : 'Expand')}
            </span>
            <div
              className={`w-8 h-8 rounded-full bg-[#F4F5F7] border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] transition-transform duration-200 ${
                openPolicy ? 'rotate-180 text-[#111827]' : ''
              }`}
            >
              <ChevronDown size={16} />
            </div>
          </div>
        </div>

        {/* Accordion Body */}
        <AnimatePresence>
          {openPolicy && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="border-t border-[#E5E7EB] bg-[#FAFAFC]"
            >
              <div className="p-6 sm:p-7 space-y-6">
                {/* 1. FAQ 问答库 */}
                <div className="space-y-3 bg-white p-5 rounded-2xl border border-[#E5E7EB]">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                      <HelpCircle size={13} className="text-[#8B5CF6]" />
                      <span>
                        {isZh
                          ? `1. FAQ 常见问答库 (${policyForm.faqs.length} 条已配置)`
                          : `1. FAQs (${policyForm.faqs.length})`}
                      </span>
                    </h5>
                  </div>

                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 custom-scroll">
                    {policyForm.faqs.map((faq) => (
                      <div
                        key={faq.id}
                        className="p-3.5 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.2 rounded bg-purple-100 text-[#8B5CF6] text-[10px] font-bold">
                              {faq.category}
                            </span>
                            <span className="font-bold text-[#111827]">Q: {faq.question}</span>
                          </div>
                          <p className="text-[#6B7280] leading-relaxed">A: {faq.answer}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFaq(faq.id)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* 新增 FAQ */}
                  <div className="p-3.5 rounded-xl bg-[#FAFAFC] border border-dashed border-[#CBD5E1] space-y-2.5">
                    <div className="flex items-center gap-2">
                      <select
                        value={newFaqCat}
                        onChange={(e) => setNewFaqCat(e.target.value)}
                        className="h-8 px-2.5 rounded-lg bg-white border border-[#E5E7EB] text-xs font-semibold text-[#111827] focus:outline-none"
                      >
                        <option value="General">General / 通用</option>
                        <option value="Shipping">Shipping / 物流</option>
                        <option value="Returns">Returns / 退换</option>
                        <option value="Warranty">Warranty / 质保</option>
                        <option value="Product">Product / 产品</option>
                      </select>
                      <input
                        type="text"
                        placeholder={isZh ? '输入买家常见问题...' : 'Add question...'}
                        value={newFaqQ}
                        onChange={(e) => setNewFaqQ(e.target.value)}
                        className="flex-1 h-8 px-3 rounded-lg bg-white border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none"
                      />
                    </div>
                    <textarea
                      rows={2}
                      placeholder={isZh ? '输入权威官方解答口径...' : 'Add authoritative answer...'}
                      value={newFaqA}
                      onChange={(e) => setNewFaqA(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-white border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none leading-relaxed"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleAddFaq}
                        className="px-3.5 py-1.5 rounded-full bg-[#111827] hover:bg-black text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Plus size={12} />
                        <span>{isZh ? '添加 FAQ 条目' : 'Add FAQ'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. 物流履约时效 (Shipping) */}
                <div className="space-y-3 bg-white p-5 rounded-2xl border border-[#E5E7EB]">
                  <h5 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                    <Truck size={13} className="text-[#8B5CF6]" />
                    <span>{isZh ? '2. 物流履约时效 (Shipping & Delivery)' : '2. Shipping & Delivery'}</span>
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#111827] mb-1">
                        {isZh ? '订单处理时效 (Processing Time)' : 'Processing Time'}
                      </label>
                      <input
                        type="text"
                        value={policyForm.shipping.processingTime}
                        onChange={(e) =>
                          setPolicyForm({
                            ...policyForm,
                            shipping: { ...policyForm.shipping, processingTime: e.target.value },
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
                        value={policyForm.shipping.standardDelivery}
                        onChange={(e) =>
                          setPolicyForm({
                            ...policyForm,
                            shipping: { ...policyForm.shipping, standardDelivery: e.target.value },
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
                        value={policyForm.shipping.freeShippingThreshold}
                        onChange={(e) =>
                          setPolicyForm({
                            ...policyForm,
                            shipping: {
                              ...policyForm.shipping,
                              freeShippingThreshold: e.target.value,
                            },
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
                        value={policyForm.shipping.supportedCarriers}
                        onChange={(e) =>
                          setPolicyForm({
                            ...policyForm,
                            shipping: { ...policyForm.shipping, supportedCarriers: e.target.value },
                          })
                        }
                        className="w-full h-9 px-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. 退换货政策 (Returns) */}
                <div className="space-y-3 bg-white p-5 rounded-2xl border border-[#E5E7EB]">
                  <h5 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                    <RotateCcw size={13} className="text-[#8B5CF6]" />
                    <span>{isZh ? '3. 退换货政策 (Returns & Refunds)' : '3. Returns & Refunds'}</span>
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#111827] mb-1">
                        {isZh ? '退换货有效期 (天数)' : 'Return Window (Days)'}
                      </label>
                      <input
                        type="number"
                        value={policyForm.returns.returnWindowDays}
                        onChange={(e) =>
                          setPolicyForm({
                            ...policyForm,
                            returns: {
                              ...policyForm.returns,
                              returnWindowDays: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full h-9 px-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs font-bold text-[#111827] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#111827] mb-1">
                        {isZh ? '运费承担方' : 'Shipping Fee Coverage'}
                      </label>
                      <select
                        value={policyForm.returns.shippingFeeCoverage}
                        onChange={(e) =>
                          setPolicyForm({
                            ...policyForm,
                            returns: {
                              ...policyForm.returns,
                              shippingFeeCoverage: e.target.value as 'merchant' | 'buyer' | 'split',
                            },
                          })
                        }
                        className="w-full h-9 px-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs font-semibold text-[#111827] focus:outline-none"
                      >
                        <option value="merchant">{isZh ? '商家全包 (Merchant)' : 'Merchant'}</option>
                        <option value="buyer">{isZh ? '买家自理 (Buyer)' : 'Buyer'}</option>
                        <option value="split">{isZh ? '双方分摊 / 视质量判定 (Split)' : 'Split'}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#111827] mb-1">
                        {isZh ? '退款到账时效 (Refund SLA)' : 'Refund SLA'}
                      </label>
                      <input
                        type="text"
                        value={policyForm.returns.refundSla}
                        onChange={(e) =>
                          setPolicyForm({
                            ...policyForm,
                            returns: { ...policyForm.returns, refundSla: e.target.value },
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
                      value={policyForm.returns.conditions}
                      onChange={(e) =>
                        setPolicyForm({
                          ...policyForm,
                          returns: { ...policyForm.returns, conditions: e.target.value },
                        })
                      }
                      className="w-full p-2.5 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none leading-relaxed"
                    />
                  </div>
                </div>

                {/* 4. 售后质保条款 (Warranty) */}
                <div className="space-y-3 bg-white p-5 rounded-2xl border border-[#E5E7EB]">
                  <h5 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert size={13} className="text-[#8B5CF6]" />
                    <span>{isZh ? '4. 售后质保条款 (Warranty)' : '4. Warranty'}</span>
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#111827] mb-1">
                        {isZh ? '官方质保月数' : 'Warranty Duration (Months)'}
                      </label>
                      <input
                        type="number"
                        value={policyForm.warranty.coverageMonths}
                        onChange={(e) =>
                          setPolicyForm({
                            ...policyForm,
                            warranty: {
                              ...policyForm.warranty,
                              coverageMonths: parseInt(e.target.value) || 0,
                            },
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
                        value={policyForm.warranty.claimProcedure}
                        onChange={(e) =>
                          setPolicyForm({
                            ...policyForm,
                            warranty: {
                              ...policyForm.warranty,
                              claimProcedure: e.target.value,
                            },
                          })
                        }
                        className="w-full h-9 px-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#111827] mb-1">
                      {isZh ? '质保范围与非保免责说明' : 'Warranty Terms & Exclusions'}
                    </label>
                    <textarea
                      rows={2}
                      value={policyForm.warranty.terms}
                      onChange={(e) =>
                        setPolicyForm({
                          ...policyForm,
                          warranty: { ...policyForm.warranty, terms: e.target.value },
                        })
                      }
                      className="w-full p-2.5 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none leading-relaxed"
                    />
                  </div>
                </div>

                {/* 5. 客服运营与响应 (Customer Service) */}
                <div className="space-y-3 bg-white p-5 rounded-2xl border border-[#E5E7EB]">
                  <h5 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                    <Headphones size={13} className="text-[#8B5CF6]" />
                    <span>{isZh ? '5. 客服服务与响应 SLA (Customer Service)' : '5. Customer Service'}</span>
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#111827] mb-1">
                        {isZh ? '客服工作时间 (Operating Hours)' : 'Operating Hours'}
                      </label>
                      <input
                        type="text"
                        value={policyForm.customerService.operatingHours}
                        onChange={(e) =>
                          setPolicyForm({
                            ...policyForm,
                            customerService: {
                              ...policyForm.customerService,
                              operatingHours: e.target.value,
                            },
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
                        value={policyForm.customerService.responseSla}
                        onChange={(e) =>
                          setPolicyForm({
                            ...policyForm,
                            customerService: {
                              ...policyForm.customerService,
                              responseSla: e.target.value,
                            },
                          })
                        }
                        className="w-full h-9 px-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Policy Form Button */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-[#6B7280]">
                    {isZh ? '保存后自动更新 FAQ 问答库与买家政策' : 'Auto-updated FAQ & buyer policies on save'}
                  </span>
                  <button
                    type="button"
                    onClick={handleSavePolicy}
                    className="px-5 py-2.5 rounded-full bg-[#111827] hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    {policySaved ? (
                      <>
                        <Check size={14} className="text-emerald-400" />
                        <span>{isZh ? '政策配置已保存' : 'Policy Profile Saved'}</span>
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        <span>{isZh ? '保存客服与服务政策' : 'Save Support Policy'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
