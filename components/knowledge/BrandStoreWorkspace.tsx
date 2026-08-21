'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Building2,
  ArrowLeft,
  UploadCloud,
  FileText,
  Trash2,
  Edit2,
  Check,
  X,
  Plus,
  Pin,
  Save,
  Globe,
  Share2,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  ChevronDown,
  Layers,
  FileCheck2,
} from 'lucide-react'
import type { KnowledgeSource, BrandBusinessStructuredData } from './types'

interface BrandStoreWorkspaceProps {
  onBack: () => void
  folderTitle?: string
  onRenameFolder?: (newTitle: string) => void
  brandData: BrandBusinessStructuredData
  onSaveBrand: (data: BrandBusinessStructuredData) => void
  sources: KnowledgeSource[]
  onUpdateSources: (sources: KnowledgeSource[]) => void
  isZh: boolean
}

export function BrandStoreWorkspace({
  onBack,
  folderTitle = '品牌与店铺信息',
  onRenameFolder,
  brandData,
  onSaveBrand,
  sources,
  onUpdateSources,
  isZh,
}: BrandStoreWorkspaceProps) {
  // Title linkage state
  const [isEditingFolderTitle, setIsEditingFolderTitle] = useState(false)
  const [localFolderTitle, setLocalFolderTitle] = useState(folderTitle)

  const handleSaveFolderTitle = () => {
    if (!localFolderTitle.trim()) {
      setIsEditingFolderTitle(false)
      return
    }
    if (onRenameFolder) {
      onRenameFolder(localFolderTitle.trim())
    }
    setIsEditingFolderTitle(false)
  }

  // Structured form state
  const [formData, setFormData] = useState<BrandBusinessStructuredData>(brandData)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [isSavedFeedback, setIsSavedFeedback] = useState(false)

  // Dropdown states for adding dynamic contact & social channels
  const [selectedContactType, setSelectedContactType] = useState<string>('email')
  const [newContactValue, setNewContactValue] = useState<string>('')
  const [selectedSocialType, setSelectedSocialType] = useState<string>('instagram')
  const [newSocialValue, setNewSocialValue] = useState<string>('')

  // Files state
  const [uploadFileName, setUploadFileName] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [editingFileId, setEditingFileId] = useState<string | null>(null)
  const [editingFileName, setEditingFileName] = useState('')

  // Auto popup on first entrance if not completed
  useEffect(() => {
    const hasSeenBrandTemplate = sessionStorage.getItem('omnilink_seen_brand_template')
    if (!hasSeenBrandTemplate) {
      setIsTemplateModalOpen(true)
      sessionStorage.setItem('omnilink_seen_brand_template', 'true')
    }
  }, [])

  const handleSaveForm = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    onSaveBrand(formData)
    setIsSavedFeedback(true)
    setTimeout(() => {
      setIsSavedFeedback(false)
      setIsTemplateModalOpen(false)
    }, 600)
  }

  // Dynamic Contact Channel Addition
  const handleAddContact = () => {
    if (!newContactValue.trim()) return
    if (selectedContactType === 'email') {
      setFormData((prev) => ({ ...prev, email: newContactValue.trim() }))
    } else if (selectedContactType === 'phone') {
      setFormData((prev) => ({ ...prev, phone: newContactValue.trim() }))
    } else if (selectedContactType === 'whatsapp') {
      setFormData((prev) => ({ ...prev, whatsapp: newContactValue.trim() }))
    } else {
      setFormData((prev) => ({
        ...prev,
        officialLinks: { ...prev.officialLinks, [selectedContactType]: newContactValue.trim() },
      }))
    }
    setNewContactValue('')
  }

  // Dynamic Social Media Addition
  const handleAddSocial = () => {
    if (!newSocialValue.trim()) return
    setFormData((prev) => ({
      ...prev,
      socialChannels: {
        ...prev.socialChannels,
        [selectedSocialType]: newSocialValue.trim(),
      },
    }))
    setNewSocialValue('')
  }

  // Delete file
  const handleDeleteFile = (sourceId: string) => {
    onUpdateSources(sources.filter((s) => s.id !== sourceId))
  }

  // Save renamed file
  const handleSaveRename = (sourceId: string) => {
    if (!editingFileName.trim()) {
      setEditingFileId(null)
      return
    }
    onUpdateSources(
      sources.map((s) => (s.id === sourceId ? { ...s, name: editingFileName.trim() } : s))
    )
    setEditingFileId(null)
  }

  // File Drag & Drop + Click Upload
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const processUploadedFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    if (fileArray.length === 0) return

    const newSources: KnowledgeSource[] = fileArray.map((file, idx) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf'
      return {
        id: `src-brand-${Date.now()}-${idx}`,
        name: file.name,
        type: ext === 'docx' ? 'docx' : ext === 'md' ? 'markdown' : 'pdf',
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        updatedAt: '刚刚',
        visibility: 'customer-facing',
        selected: true,
        summary: '品牌与店铺附加资料文档已完成安全解析。',
      }
    })
    onUpdateSources([...newSources, ...sources])
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFiles(e.dataTransfer.files)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processUploadedFiles(e.target.files)
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden space-y-4">
      {/* Top Navigation: Back Button + Title with Linkage */}
      <div className="flex items-center justify-between pb-3 border-b border-white/70">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] bg-white/85 hover:bg-white text-xs font-bold text-[#111827] transition-all cursor-pointer shadow-xs border border-white/90 hover:shadow-sm"
          >
            <ArrowLeft size={14} />
            <span>返回知识库列表</span>
          </button>
          <span className="text-gray-300 font-light">/</span>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[10px] bg-white/95 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs border border-white">
              <Building2 size={14} />
            </div>

            {isEditingFolderTitle ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={localFolderTitle}
                  onChange={(e) => setLocalFolderTitle(e.target.value)}
                  onBlur={handleSaveFolderTitle}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveFolderTitle()}
                  autoFocus
                  className="h-7 px-2 text-xs sm:text-sm font-extrabold rounded-[8px] bg-white border border-emerald-500 text-[#111827] focus:outline-none shadow-xs"
                />
                <button
                  type="button"
                  onClick={handleSaveFolderTitle}
                  className="px-2 py-1 rounded-[6px] bg-black hover:bg-black/80 text-white text-[10px] font-bold cursor-pointer transition-colors"
                >
                  保存
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group/title">
                <h3
                  onClick={() => setIsEditingFolderTitle(true)}
                  title="点击可修改知识库名称"
                  className="text-xs sm:text-sm font-extrabold text-[#111827] tracking-tight hover:text-emerald-700 cursor-text transition-colors"
                >
                  {localFolderTitle}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditingFolderTitle(true)}
                  className="opacity-0 group-hover/title:opacity-100 transition-opacity p-0.5 text-gray-400 hover:text-emerald-700 cursor-pointer"
                  title="重命名"
                >
                  <Edit2 size={11} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 1. TOP PINNED BASIC INFO CARD: 基础信息 (Clickable whole card, pure white, clean shadow) */}
      <div
        id="pinned-brand-template-card"
        onClick={() => setIsTemplateModalOpen(true)}
        className="group relative p-4 rounded-[16px] bg-white border border-[#E5E7EB] hover:border-emerald-400 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_16px_rgba(16,185,129,0.08)] transition-all cursor-pointer select-none"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[14px] bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Pin size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-extrabold text-[#111827]">
                  基础信息
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 text-[10px] font-bold border border-emerald-200/60">
                  点击编辑
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-[#6B7280] mt-1">
                <span>{formData.brandName || '未设置品牌名'}</span>
                {formData.email && (
                  <>
                    <span>·</span>
                    <span>{formData.email}</span>
                  </>
                )}
                {formData.phone && (
                  <>
                    <span>·</span>
                    <span>{formData.phone}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="w-7 h-7 rounded-full bg-white/90 border border-white flex items-center justify-center text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shadow-2xs">
            <Edit2 size={12} />
          </div>
        </div>
      </div>

      {/* 2. Brand Document Files List: Relaxed Spacing, File Size on Far Right */}
      <div className="space-y-2 flex-1 overflow-y-auto custom-scroll pr-1">
        <div className="flex items-center justify-between text-xs font-bold text-[#111827] px-1">
          <span>资料文件 ({sources.length})</span>
        </div>

        <div className="space-y-2">
          {sources.map((file) => {
            const isEditing = editingFileId === file.id
            return (
              <div
                key={file.id}
                className="group p-3.5 rounded-[16px] bg-white/80 hover:bg-white backdrop-blur-md border border-white/90 hover:border-emerald-200 transition-all flex items-center justify-between gap-3 shadow-[0_2px_10px_rgba(0,0,0,0.02),inset_0_1px_1px_rgba(255,255,255,1)]"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-[10px] bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100/60">
                    <FileText size={15} />
                  </div>
                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editingFileName}
                        onChange={(e) => setEditingFileName(e.target.value)}
                        className="w-full h-7 px-2 text-xs rounded-[8px] bg-white border border-emerald-400 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveRename(file.id)}
                        className="px-2.5 py-1 rounded-[8px] bg-emerald-600 text-white text-[11px] font-bold"
                      >
                        保存
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingFileId(null)}
                        className="p-1 text-gray-400 hover:text-gray-700"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-[#111827] truncate block">
                        {file.name}
                      </span>
                      <span className="text-[10px] text-[#6B7280] mt-0.5 block">
                        更新时间: {file.updatedAt}
                      </span>
                    </div>
                  )}
                </div>

                {/* Right side: File size badge placed on the far right + Action buttons */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="px-2.5 py-1 rounded-[8px] bg-white/90 text-[#374151] border border-white text-[11px] font-bold shadow-2xs">
                    {file.size}
                  </span>

                  {!isEditing && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingFileId(file.id)
                          setEditingFileName(file.name)
                        }}
                        className="p-1.5 rounded-[8px] text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                        title="编辑文件名"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteFile(file.id)}
                        className="p-1.5 rounded-[8px] text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="删除文件"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 长条长方形拖拽上传栏（内部仅加号，无任何文字） */}
      <div className="pt-2 border-t border-white/80">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`group w-full h-12 sm:h-13 rounded-[16px] border-2 border-dashed transition-all flex items-center justify-center cursor-pointer select-none ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/80 scale-[1.005] shadow-md'
              : 'border-white/90 hover:border-emerald-400 bg-white/50 hover:bg-white/85 shadow-2xs'
          }`}
          title="点击或拖拽文件上传"
        >
          <div className="w-8 h-8 rounded-full bg-white/90 group-hover:scale-110 flex items-center justify-center text-emerald-600 shadow-xs border border-white transition-transform">
            <Plus size={20} strokeWidth={2.5} />
          </div>
        </div>
      </div>

      {/* POPUP: Fixed Template Slide-over Panel (向左展开) */}
      <AnimatePresence>
        {isTemplateModalOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/20 backdrop-blur-xs"
              onClick={() => setIsTemplateModalOpen(false)}
            />

            {/* Slide-over Content: 纯白色 且 向左展开 */}
            <motion.div
              id="brand-template-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="relative w-full max-w-lg bg-white h-full shadow-2xl border-l border-gray-100 p-6 flex flex-col space-y-4 z-10"
            >
              {/* Top Bar: Title & Close Button */}
              <div className="flex items-center justify-between shrink-0 pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Building2 size={16} className="text-black" />
                  <span className="font-extrabold text-[#111827] text-sm sm:text-base">编辑基础身份与品牌资料</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTemplateModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 flex items-center justify-center cursor-pointer shadow-3xs transition-all"
                >
                  <X size={13} />
                </button>
              </div>

              {/* Scrollable Form */}
              <div className="flex-1 overflow-y-auto py-1 space-y-4 custom-scroll pr-1 text-xs">
                {/* 基础身份与 Logo */}
                <div className="space-y-2.5 pb-4 border-b border-gray-100">
                  <span className="font-extrabold text-[#111827] block text-xs sm:text-sm">基础身份与 Logo</span>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-[#4B5563] font-bold mb-1 text-[11px]">官方品牌名称</label>
                      <input
                        type="text"
                        value={formData.brandName}
                        onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                        placeholder="例如：Omnilink Acoustics"
                        className="w-full h-8 px-2.5 rounded-[8px] bg-gray-50 border border-gray-200 text-xs text-[#111827] focus:outline-none focus:bg-white focus:ring-1 focus:ring-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[#4B5563] font-bold mb-1 text-[11px]">Logo 图片 URL</label>
                      <input
                        type="text"
                        value={formData.logoUrl || ''}
                        onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                        placeholder="https://.../logo.png"
                        className="w-full h-8 px-2.5 rounded-[8px] bg-gray-50 border border-gray-200 text-xs text-[#111827] focus:outline-none focus:bg-white focus:ring-1 focus:ring-black"
                      />
                    </div>
                  </div>
                </div>

                {/* 官方联系方式 */}
                <div className="space-y-2.5 pt-1 pb-4 border-b border-gray-100">
                  <span className="font-extrabold text-[#111827] block text-xs sm:text-sm">官方联系方式（下拉选择加入）</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={selectedContactType}
                      onChange={(e) => setSelectedContactType(e.target.value)}
                      className="h-8 px-2 border border-gray-200 rounded-[8px] bg-gray-50 text-xs font-bold text-[#111827] focus:outline-none focus:bg-white"
                    >
                      <option value="email">服务邮箱 (Email)</option>
                      <option value="phone">官方电话 (Phone)</option>
                      <option value="whatsapp">官方 WhatsApp</option>
                      <option value="hotline">24/7 客服热线</option>
                    </select>
                    <input
                      type="text"
                      placeholder="输入联络信息"
                      value={newContactValue}
                      onChange={(e) => setNewContactValue(e.target.value)}
                      className="flex-1 min-w-[150px] h-8 px-2.5 rounded-[8px] bg-gray-50 border border-gray-200 text-xs text-[#111827] focus:outline-none focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddContact}
                      className="h-8 px-3 rounded-[8px] bg-black hover:bg-black/80 text-white text-xs font-bold cursor-pointer transition-all shadow-2xs"
                    >
                      添加
                    </button>
                  </div>

                  {/* Active Contacts Preview */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {formData.email && (
                      <span className="px-2.5 py-1 rounded-[6px] bg-gray-50 border border-gray-200 text-[11px] text-[#111827] flex items-center gap-1.5 animate-in fade-in duration-100">
                        <Mail size={12} className="text-black" />
                        <span>邮箱: {formData.email}</span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, email: '' })}
                          className="text-gray-400 hover:text-rose-600 font-bold ml-1"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {formData.phone && (
                      <span className="px-2.5 py-1 rounded-[6px] bg-gray-50 border border-gray-200 text-[11px] text-[#111827] flex items-center gap-1.5 animate-in fade-in duration-100">
                        <Phone size={12} className="text-black" />
                        <span>电话: {formData.phone}</span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, phone: '' })}
                          className="text-gray-400 hover:text-rose-600 font-bold ml-1"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {formData.whatsapp && (
                      <span className="px-2.5 py-1 rounded-[6px] bg-gray-50 border border-gray-200 text-[11px] text-[#111827] flex items-center gap-1.5 animate-in fade-in duration-100">
                        <Globe size={12} className="text-emerald-700" />
                        <span>WhatsApp: {formData.whatsapp}</span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, whatsapp: '' })}
                          className="text-gray-400 hover:text-rose-600 font-bold ml-1"
                        >
                          ×
                        </button>
                      </span>
                    )}
                  </div>
                </div>

                {/* 实体/注册经营地址 */}
                <div className="space-y-2 pt-1 pb-4 border-b border-gray-100">
                  <span className="font-extrabold text-[#111827] block text-xs sm:text-sm">实体/注册经营地址</span>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="例如：100 Innovation Way, Suite 400, San Francisco"
                    className="w-full h-8 px-2.5 rounded-[8px] bg-gray-50 border border-gray-200 text-xs text-[#111827] focus:outline-none focus:bg-white focus:ring-1 focus:ring-black"
                  />
                </div>

                {/* 官方社交媒体矩阵 */}
                <div className="space-y-2.5 pt-1 pb-4 border-b border-gray-100">
                  <span className="font-extrabold text-[#111827] block text-xs sm:text-sm">官方社交媒体矩阵</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={selectedSocialType}
                      onChange={(e) => setSelectedSocialType(e.target.value)}
                      className="h-8 px-2 border border-gray-200 rounded-[8px] bg-gray-50 text-xs font-bold text-[#111827] focus:outline-none focus:bg-white"
                    >
                      <option value="instagram">Instagram</option>
                      <option value="tiktok">TikTok</option>
                      <option value="facebook">Facebook</option>
                      <option value="twitter">Twitter / X</option>
                      <option value="youtube">YouTube</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="discord">Discord</option>
                    </select>
                    <input
                      type="text"
                      placeholder="输入主页链接"
                      value={newSocialValue}
                      onChange={(e) => setNewSocialValue(e.target.value)}
                      className="flex-1 min-w-[150px] h-8 px-2.5 rounded-[8px] bg-gray-50 border border-gray-200 text-xs text-[#111827] focus:outline-none focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddSocial}
                      className="h-8 px-3 rounded-[8px] bg-black hover:bg-black/80 text-white text-xs font-bold cursor-pointer transition-all shadow-2xs"
                    >
                      添加
                    </button>
                  </div>

                  {/* Active Social Channels Preview */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {Object.entries(formData.socialChannels).map(([platform, link]) => {
                      if (!link) return null
                      return (
                        <span
                          key={platform}
                          className="px-2.5 py-1 rounded-[6px] bg-gray-50 border border-gray-200 text-[11px] text-[#111827] flex items-center gap-1.5 animate-in fade-in duration-100"
                        >
                          <Share2 size={12} className="text-black" />
                          <span className="capitalize">{platform}: {link}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = { ...formData.socialChannels }
                              delete updated[platform]
                              setFormData({ ...formData, socialChannels: updated })
                            }}
                            className="text-gray-400 hover:text-rose-600 font-bold ml-1"
                          >
                            ×
                          </button>
                        </span>
                      )
                    })}
                  </div>
                </div>

                {/* 官方品牌介绍 */}
                <div className="space-y-2 pt-1">
                  <span className="font-extrabold text-[#111827] block text-xs sm:text-sm">官方品牌介绍 / Story</span>
                  <textarea
                    rows={3}
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="阐述品牌愿景、核心声学技术理念与全球化服务宗旨…"
                    className="w-full p-2.5 rounded-[8px] bg-gray-50 border border-gray-200 text-xs text-[#111827] focus:outline-none focus:bg-white focus:ring-1 focus:ring-black resize-none"
                  />
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between shrink-0">
                <span className="text-[11px] text-[#6B7280]">
                  自动同步至 24/7 AI 客服语料
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsTemplateModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-[8px] bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-[#111827] border border-gray-200 transition-all cursor-pointer"
                  >
                    关闭
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveForm}
                    className="px-5 py-1.5 rounded-[8px] bg-black hover:bg-black/90 text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                  >
                    {isSavedFeedback ? (
                      <>
                        <Check size={13} className="text-emerald-400" />
                        <span>已保存</span>
                      </>
                    ) : (
                      <>
                        <Save size={13} />
                        <span>保存模板</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
