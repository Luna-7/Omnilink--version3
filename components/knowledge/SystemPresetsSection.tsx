'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Building2,
  ChevronDown,
  Trash2,
  Plus,
  Save,
  Check,
  Upload,
  Globe,
  Share2,
} from 'lucide-react'
import type { BrandBusinessStructuredData } from './types'

interface SystemPresetsSectionProps {
  brandData: BrandBusinessStructuredData
  onSaveBrand: (data: BrandBusinessStructuredData) => void
  isZh: boolean
}

const KNOWN_PLATFORMS = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'twitter', label: 'X (Twitter)' },
  { id: 'linkedin', label: 'LinkedIn' },
]

export function SystemPresetsSection({
  brandData: initialBrand,
  onSaveBrand,
  isZh,
}: SystemPresetsSectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState<BrandBusinessStructuredData>(initialBrand)
  const [saved, setSaved] = useState(false)
  const [showAddSocial, setShowAddSocial] = useState(false)
  const [newPlatform, setNewPlatform] = useState('instagram')
  const [newUrl, setNewUrl] = useState('')

  const logoInputRef = useRef<HTMLInputElement>(null)

  const handleSave = () => {
    onSaveBrand(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 1600)
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const objectUrl = URL.createObjectURL(file)
      setForm((prev) => ({ ...prev, logoUrl: objectUrl }))
    }
  }

  const handleRemoveSocial = (key: string) => {
    const nextSocial = { ...form.socialChannels }
    delete nextSocial[key]
    setForm((prev) => ({ ...prev, socialChannels: nextSocial }))
  }

  const handleAddSocial = () => {
    if (!newUrl.trim()) return
    setForm((prev) => ({
      ...prev,
      socialChannels: {
        ...prev.socialChannels,
        [newPlatform]: newUrl.trim(),
      },
    }))
    setNewUrl('')
    setShowAddSocial(false)
  }

  const activeSocialCount = Object.keys(form.socialChannels || {}).filter(
    (k) => !!form.socialChannels[k]
  ).length

  return (
    <section className="rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.03)] transition-all overflow-hidden">
      {/* Accordion Header - Always Compact */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-6 py-4 flex items-center justify-between gap-4 cursor-pointer select-none hover:bg-white/40 transition-colors"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Logo Thumbnail or Default Icon */}
          <div className="relative w-10 h-10 rounded-2xl bg-white border border-gray-200/80 p-0.5 shadow-xs shrink-0 overflow-hidden flex items-center justify-center">
            {form.logoUrl ? (
              <img
                src={form.logoUrl}
                alt={form.brandName}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <Building2 size={18} className="text-gray-700" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <h3 className="text-sm font-bold text-gray-900 truncate">
                {isZh ? '品牌与主体' : 'Brand & Business'}
              </h3>
              {/* Sync Status Badge */}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {isZh ? '已同步' : 'Synced'}
              </span>
            </div>
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {form.brandName || 'Omnilink Audio'} · {form.email || 'support@omnilink.store'} · {activeSocialCount} {isZh ? '个社交渠道' : 'channels'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 transition-transform"
          >
            <ChevronDown
              size={18}
              className={`transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-gray-900' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Accordion Expanded Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="border-t border-gray-100 px-6 py-5 space-y-6"
          >
            {/* A1: Brand & Identity */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-800 tracking-wide uppercase">
                  {isZh ? '主体与联系方式' : 'Identity & Contact'}
                </h4>
                <div className="flex items-center gap-2">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200/80 text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
                  >
                    <Upload size={12} />
                    <span>{isZh ? '上传' : 'Upload'}</span>
                  </button>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {/* 品牌 / 店铺名称 */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-gray-600">
                    {isZh ? '品牌 / 店铺名称' : 'Brand Name'}
                  </label>
                  <input
                    type="text"
                    value={form.brandName}
                    onChange={(e) => setForm({ ...form, brandName: e.target.value })}
                    className="w-full h-8 px-3 rounded-lg bg-gray-50/80 border border-gray-200/80 text-xs text-gray-900 focus:outline-none focus:bg-white focus:border-gray-400 transition-colors"
                  />
                </div>

                {/* 联系人 */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-gray-600">
                    {isZh ? '联系人' : 'Contact Person'}
                  </label>
                  <input
                    type="text"
                    value={form.contactPerson}
                    onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                    className="w-full h-8 px-3 rounded-lg bg-gray-50/80 border border-gray-200/80 text-xs text-gray-900 focus:outline-none focus:bg-white focus:border-gray-400 transition-colors"
                  />
                </div>

                {/* 客服邮箱 */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-gray-600">
                    {isZh ? '客服邮箱' : 'Support Email'}
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full h-8 px-3 rounded-lg bg-gray-50/80 border border-gray-200/80 text-xs text-gray-900 focus:outline-none focus:bg-white focus:border-gray-400 transition-colors"
                  />
                </div>

                {/* 服务电话 */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-gray-600">
                    {isZh ? '服务电话' : 'Phone'}
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full h-8 px-3 rounded-lg bg-gray-50/80 border border-gray-200/80 text-xs text-gray-900 focus:outline-none focus:bg-white focus:border-gray-400 transition-colors"
                  />
                </div>

                {/* WhatsApp */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-gray-600">
                    WhatsApp
                  </label>
                  <input
                    type="text"
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    className="w-full h-8 px-3 rounded-lg bg-gray-50/80 border border-gray-200/80 text-xs text-gray-900 focus:outline-none focus:bg-white focus:border-gray-400 transition-colors"
                  />
                </div>

                {/* 专属咨询链接 */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-gray-600">
                    {isZh ? '专属咨询链接' : 'Consultation URL'}
                  </label>
                  <input
                    type="url"
                    value={form.consultationUrl || ''}
                    placeholder="https://..."
                    onChange={(e) => setForm({ ...form, consultationUrl: e.target.value })}
                    className="w-full h-8 px-3 rounded-lg bg-gray-50/80 border border-gray-200/80 text-xs text-gray-900 focus:outline-none focus:bg-white focus:border-gray-400 transition-colors"
                  />
                </div>

                {/* 工作室 / 地址 (Span 2 or 3) */}
                <div className="space-y-1 md:col-span-2 lg:col-span-3">
                  <label className="block text-[11px] font-semibold text-gray-600">
                    {isZh ? '工作室 / 地址' : 'Address'}
                  </label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full h-8 px-3 rounded-lg bg-gray-50/80 border border-gray-200/80 text-xs text-gray-900 focus:outline-none focus:bg-white focus:border-gray-400 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* A2: Social Channels */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Share2 size={13} className="text-gray-500" />
                  <h4 className="text-xs font-bold text-gray-800 tracking-wide uppercase">
                    {isZh ? '社交渠道' : 'Social Channels'}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddSocial(!showAddSocial)}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200/80 text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
                >
                  <Plus size={12} />
                  <span>{isZh ? '添加' : 'Add'}</span>
                </button>
              </div>

              {/* Add Platform Drawer/Inline Row */}
              {showAddSocial && (
                <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-200/80">
                  <select
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value)}
                    className="h-8 px-2.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-900 font-medium focus:outline-none"
                  >
                    {KNOWN_PLATFORMS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="flex-1 min-w-[200px] h-8 px-3 rounded-lg bg-white border border-gray-200 text-xs text-gray-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddSocial}
                    className="h-8 px-3.5 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-black transition-colors cursor-pointer"
                  >
                    {isZh ? '确定' : 'Confirm'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddSocial(false)}
                    className="h-8 px-2.5 rounded-lg bg-gray-200/80 text-gray-700 text-xs hover:bg-gray-300 transition-colors cursor-pointer"
                  >
                    {isZh ? '取消' : 'Cancel'}
                  </button>
                </div>
              )}

              {/* Configured Social Rows */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {Object.entries(form.socialChannels || {}).map(([platformKey, urlValue]) => {
                  if (!urlValue) return null
                  const matched = KNOWN_PLATFORMS.find((p) => p.id === platformKey)
                  const label = matched ? matched.label : platformKey

                  return (
                    <div
                      key={platformKey}
                      className="group flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200/80 shadow-2xs hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Globe size={13} className="text-gray-400 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[11px] font-bold text-gray-900 block truncate">
                            {label}
                          </span>
                          <span className="text-[10px] text-gray-500 block truncate font-mono">
                            {urlValue}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveSocial(platformKey)}
                        className="p-1 rounded-md text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title={isZh ? '删除' : 'Delete'}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={handleSave}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  saved
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-900 hover:bg-black text-white'
                }`}
              >
                {saved ? <Check size={13} /> : <Save size={13} />}
                <span>{saved ? (isZh ? '已保存' : 'Saved') : (isZh ? '保存' : 'Save')}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
