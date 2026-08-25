'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  ArrowLeft,
  Trash2,
  Edit2,
  Check,
  X,
  Plus,
  Save,
  Globe,
  Share2,
  Mail,
  Phone,
  Download,
  Search,
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
  isZh: _isZh,
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
  const [editingFileId, setEditingFileId] = useState<string | null>(null)
  const [editingFileName, setEditingFileName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

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
  const handleDeleteFile = (sourceId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
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

  // Toggle file inclusion
  const handleToggleFileSelect = (sourceId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    onUpdateSources(
      sources.map((s) =>
        s.id === sourceId ? { ...s, selected: s.selected === false ? true : false } : s
      )
    )
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

  const handleDownloadFile = (file: KnowledgeSource, e: React.MouseEvent) => {
    e.stopPropagation()
    const content = `# ${file.name}\n\n${file.summary || '品牌附加资料已完成安全解析。'}`
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredSources = sources.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex-1 flex flex-col h-full bg-white text-[#111827] justify-between overflow-hidden">
      {/* 
        TOP HEADER: NotebookLM-style Breadcrumb / Title Bar
        Pure white background, clean border divider
      */}
      <div className="p-3 border-b border-[#E5E7EB] bg-white space-y-2 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              type="button"
              id="back-to-sources-btn"
              onClick={onBack}
              className="p-1 rounded-[4px] bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#374151] hover:text-[#111827] transition-colors cursor-pointer shrink-0"
              title="返回知识库列表"
            >
              <ArrowLeft size={14} />
            </button>

            {isEditingFolderTitle ? (
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <input
                  type="text"
                  value={localFolderTitle}
                  onChange={(e) => setLocalFolderTitle(e.target.value)}
                  onBlur={handleSaveFolderTitle}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveFolderTitle()}
                  autoFocus
                  className="h-6 px-2 text-xs font-bold rounded-[4px] bg-white border border-[#024AD8] text-[#111827] focus:outline-none flex-1 min-w-0"
                />
                <button
                  type="button"
                  onClick={handleSaveFolderTitle}
                  className="px-2 py-0.5 rounded-[4px] bg-[#024AD8] hover:bg-[#003198] text-white text-[10px] font-bold cursor-pointer transition-colors shrink-0"
                >
                  保存
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <h3
                  onClick={() => setIsEditingFolderTitle(true)}
                  className="text-xs font-extrabold text-[#111827] truncate tracking-tight hover:text-[#024AD8] cursor-pointer transition-colors"
                  title={localFolderTitle}
                >
                  {localFolderTitle}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditingFolderTitle(true)}
                  className="p-0.5 text-[#9CA3AF] hover:text-[#024AD8] transition-colors cursor-pointer shrink-0"
                  title="重命名"
                >
                  <Edit2 size={11} />
                </button>
                <span className="px-1.5 py-0.2 rounded-full bg-blue-50 text-[#024AD8] border border-blue-100 text-[10px] font-bold shrink-0">
                  {sources.length + 1} 项
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Search input */}
        <div className="relative w-full">
          <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="搜索品牌资料..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-6.5 pl-6 pr-2 rounded-[4px] bg-[#F9FAFB] border border-[#E5E7EB] text-[11px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:bg-white focus:border-[#024AD8] transition-all"
          />
        </div>
      </div>

      {/* 
        MAIN CONTENT: NotebookLM-style Minimalist Card Rows (NO ICONS)
      */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scroll bg-white">
        {/* 1. Basic Brand Information Card (Pinned at top) */}
        <div
          id="pinned-brand-template-card"
          onClick={() => setIsTemplateModalOpen(true)}
          className="group relative p-2.5 rounded-xl bg-white hover:bg-[#F9FAFB] border border-blue-200 hover:border-[#024AD8] transition-all cursor-pointer select-none shadow-2xs"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-1.5 py-0.2 rounded-[4px] bg-blue-50 text-[#024AD8] border border-blue-100 text-[10px] font-bold">
                  核心基座
                </span>
                <h4 className="text-xs font-bold text-[#111827] group-hover:text-[#024AD8] transition-colors">
                  基础身份与品牌信息
                </h4>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-[#6B7280] truncate">
                <span className="font-medium text-[#111827]">
                  {formData.brandName || '未设置品牌名'}
                </span>
                {formData.email && (
                  <>
                    <span>·</span>
                    <span className="truncate">{formData.email}</span>
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

            <button
              type="button"
              className="px-2 py-0.5 rounded-[4px] bg-white border border-[#D1D5DB] group-hover:border-[#024AD8] group-hover:text-[#024AD8] text-[10px] font-bold text-[#4B5563] transition-colors shrink-0"
            >
              编辑
            </button>
          </div>
        </div>

        {/* 2. File list (NO ICONS) */}
        {filteredSources.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#9CA3AF]">
            暂无附加文件，可在下方上传
          </div>
        ) : (
          filteredSources.map((file) => {
            const isEditing = editingFileId === file.id
            const isSelected = file.selected !== false
            const fileExt = file.name.split('.').pop()?.toUpperCase() || 'FILE'

            return (
              <div
                key={file.id}
                onClick={() => handleToggleFileSelect(file.id)}
                className={`group relative p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'bg-blue-50/15 border-blue-200 hover:border-[#024AD8] shadow-2xs'
                    : 'bg-white hover:bg-[#F9FAFB] border-[#E5E7EB] opacity-75'
                }`}
              >
                <div className="flex items-start gap-2 min-w-0">
                  {/* Selection Checkbox */}
                  <div
                    className="pt-0.5 shrink-0"
                    onClick={(e) => handleToggleFileSelect(file.id, e)}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-[3px] flex items-center justify-center transition-colors cursor-pointer border ${
                        isSelected
                          ? 'bg-[#024AD8] border-[#024AD8] text-white'
                          : 'bg-white border-[#D1D5DB] hover:border-[#9CA3AF]'
                      }`}
                    >
                      {isSelected && <Check size={10} strokeWidth={3} />}
                    </div>
                  </div>

                  {/* Main File Details (NO ICON) */}
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <div
                        className="flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          value={editingFileName}
                          onChange={(e) => setEditingFileName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(file.id)}
                          className="w-full h-6 px-1.5 text-xs font-bold rounded-[4px] bg-white border border-[#024AD8] focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveRename(file.id)}
                          className="px-2 py-0.5 rounded-[4px] bg-[#024AD8] hover:bg-[#003198] text-white text-[10px] font-bold cursor-pointer shrink-0"
                        >
                          确定
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingFileId(null)}
                          className="p-1 text-[#9CA3AF] hover:text-[#111827] shrink-0"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <h4
                          className="text-xs font-bold text-[#111827] group-hover:text-[#024AD8] transition-colors leading-snug line-clamp-2"
                          title={file.name}
                        >
                          {file.name}
                        </h4>

                        {/* File Meta Tags */}
                        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-[#6B7280] flex-wrap">
                          <span className="px-1.5 py-0.2 rounded bg-[#F3F4F6] text-[#4B5563] font-bold text-[9px] uppercase tracking-wide">
                            {fileExt}
                          </span>
                          <span>{file.size}</span>
                          <span>·</span>
                          <span>{file.updatedAt}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Hover Action Buttons */}
                  {!isEditing && (
                    <div
                      className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 pt-0.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={(e) => handleDownloadFile(file, e)}
                        className="p-1 rounded-[3px] text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
                        title="下载/预览文档"
                      >
                        <Download size={11} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingFileId(file.id)
                          setEditingFileName(file.name)
                        }}
                        className="p-1 rounded-[3px] text-[#6B7280] hover:text-[#024AD8] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
                        title="重命名"
                      >
                        <Edit2 size={11} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteFile(file.id, e)}
                        className="p-1 rounded-[3px] text-[#6B7280] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="删除文档"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* 
        BOTTOM UPLOAD AREA: NotebookLM-style Pure White Upload Card
      */}
      <div className="p-2.5 border-t border-[#E5E7EB] bg-white shrink-0">
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
          className={`w-full py-2.5 px-2 rounded-xl border border-dashed transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none text-center ${
            isDragging
              ? 'border-[#024AD8] bg-blue-50/50 scale-[1.01]'
              : 'border-[#D1D5DB] hover:border-[#024AD8] bg-white hover:bg-blue-50/20'
          }`}
          title="点击或拖拽上传品牌文件"
        >
          <div className="w-5 h-5 rounded-[4px] bg-blue-50 text-[#024AD8] flex items-center justify-center shrink-0">
            <Plus size={13} strokeWidth={2.5} />
          </div>
          <span className="text-[11px] font-bold text-[#374151] group-hover:text-[#024AD8]">
            上传品牌附加文件
          </span>
        </div>
      </div>

      {/* POPUP: Fixed Template Slide-over Panel */}
      <AnimatePresence>
        {isTemplateModalOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30 backdrop-blur-xs"
              onClick={() => setIsTemplateModalOpen(false)}
            />

            <motion.div
              id="brand-template-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="relative w-full max-w-lg bg-white h-full shadow-2xl border-l border-[#E5E7EB] p-6 flex flex-col space-y-4 z-10"
            >
              {/* Top Bar: Title & Close Button */}
              <div className="flex items-center justify-between shrink-0 pb-3 border-b border-[#E5E7EB]">
                <span className="font-extrabold text-[#111827] text-sm sm:text-base">
                  编辑基础身份与品牌资料
                </span>
                <button
                  type="button"
                  onClick={() => setIsTemplateModalOpen(false)}
                  className="p-1 rounded-[4px] bg-white hover:bg-[#F3F4F6] border border-[#D1D5DB] text-[#6B7280] flex items-center justify-center cursor-pointer transition-all"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Scrollable Form */}
              <div className="flex-1 overflow-y-auto py-1 space-y-4 custom-scroll pr-1 text-xs">
                {/* 基础身份与 Logo */}
                <div className="space-y-2.5 pb-4 border-b border-[#E5E7EB]">
                  <span className="font-extrabold text-[#111827] block text-xs sm:text-sm">
                    基础身份与标识
                  </span>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-[#4B5563] font-bold mb-1 text-[11px]">
                        官方品牌名称
                      </label>
                      <input
                        type="text"
                        value={formData.brandName}
                        onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                        placeholder="例如：Omnilink Acoustics"
                        className="w-full h-8 px-2.5 rounded-[4px] bg-[#F9FAFB] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:bg-white focus:border-[#024AD8]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#4B5563] font-bold mb-1 text-[11px]">
                        标识图片链接 (Logo URL)
                      </label>
                      <input
                        type="text"
                        value={formData.logoUrl || ''}
                        onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                        placeholder="https://.../logo.png"
                        className="w-full h-8 px-2.5 rounded-[4px] bg-[#F9FAFB] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:bg-white focus:border-[#024AD8]"
                      />
                    </div>
                  </div>
                </div>

                {/* 官方联系方式 */}
                <div className="space-y-2.5 pt-1 pb-4 border-b border-[#E5E7EB]">
                  <span className="font-extrabold text-[#111827] block text-xs sm:text-sm">
                    官方联系方式
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={selectedContactType}
                      onChange={(e) => setSelectedContactType(e.target.value)}
                      className="h-8 px-2 border border-[#E5E7EB] rounded-[4px] bg-[#F9FAFB] text-xs font-bold text-[#111827] focus:outline-none focus:bg-white focus:border-[#024AD8]"
                    >
                      <option value="email">服务邮箱</option>
                      <option value="phone">官方电话</option>
                      <option value="whatsapp">官方 WhatsApp</option>
                      <option value="hotline">客服热线</option>
                    </select>
                    <input
                      type="text"
                      placeholder="输入联络信息"
                      value={newContactValue}
                      onChange={(e) => setNewContactValue(e.target.value)}
                      className="flex-1 min-w-[150px] h-8 px-2.5 rounded-[4px] bg-[#F9FAFB] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:bg-white focus:border-[#024AD8]"
                    />
                    <button
                      type="button"
                      onClick={handleAddContact}
                      className="h-8 px-3 rounded-[4px] bg-[#024AD8] hover:bg-[#003198] text-white text-xs font-bold cursor-pointer transition-all shadow-2xs"
                    >
                      添加
                    </button>
                  </div>

                  {/* Active Contacts Preview */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {formData.email && (
                      <span className="px-2.5 py-1 rounded-[4px] bg-[#F9FAFB] border border-[#E5E7EB] text-[11px] text-[#111827] flex items-center gap-1.5">
                        <Mail size={12} className="text-[#024AD8]" />
                        <span>邮箱: {formData.email}</span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, email: '' })}
                          className="text-[#9CA3AF] hover:text-rose-600 font-bold ml-1 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {formData.phone && (
                      <span className="px-2.5 py-1 rounded-[4px] bg-[#F9FAFB] border border-[#E5E7EB] text-[11px] text-[#111827] flex items-center gap-1.5">
                        <Phone size={12} className="text-[#024AD8]" />
                        <span>电话: {formData.phone}</span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, phone: '' })}
                          className="text-[#9CA3AF] hover:text-rose-600 font-bold ml-1 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {formData.whatsapp && (
                      <span className="px-2.5 py-1 rounded-[4px] bg-[#F9FAFB] border border-[#E5E7EB] text-[11px] text-[#111827] flex items-center gap-1.5">
                        <Globe size={12} className="text-emerald-600" />
                        <span>WhatsApp: {formData.whatsapp}</span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, whatsapp: '' })}
                          className="text-[#9CA3AF] hover:text-rose-600 font-bold ml-1 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    )}
                  </div>
                </div>

                {/* 实体/注册经营地址 */}
                <div className="space-y-2 pt-1 pb-4 border-b border-[#E5E7EB]">
                  <span className="font-extrabold text-[#111827] block text-xs sm:text-sm">
                    实体/注册经营地址
                  </span>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="例如：100 Innovation Way, Suite 400, San Francisco"
                    className="w-full h-8 px-2.5 rounded-[4px] bg-[#F9FAFB] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:bg-white focus:border-[#024AD8]"
                  />
                </div>

                {/* 官方社交媒体矩阵 */}
                <div className="space-y-2.5 pt-1 pb-4 border-b border-[#E5E7EB]">
                  <span className="font-extrabold text-[#111827] block text-xs sm:text-sm">
                    官方社交媒体渠道
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={selectedSocialType}
                      onChange={(e) => setSelectedSocialType(e.target.value)}
                      className="h-8 px-2 border border-[#E5E7EB] rounded-[4px] bg-[#F9FAFB] text-xs font-bold text-[#111827] focus:outline-none focus:bg-white focus:border-[#024AD8]"
                    >
                      <option value="instagram">Instagram</option>
                      <option value="tiktok">TikTok</option>
                      <option value="facebook">Facebook</option>
                      <option value="twitter">Twitter / X</option>
                      <option value="youtube">YouTube</option>
                      <option value="linkedin">LinkedIn</option>
                    </select>
                    <input
                      type="text"
                      placeholder="输入主页链接"
                      value={newSocialValue}
                      onChange={(e) => setNewSocialValue(e.target.value)}
                      className="flex-1 min-w-[150px] h-8 px-2.5 rounded-[4px] bg-[#F9FAFB] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:bg-white focus:border-[#024AD8]"
                    />
                    <button
                      type="button"
                      onClick={handleAddSocial}
                      className="h-8 px-3 rounded-[4px] bg-[#024AD8] hover:bg-[#003198] text-white text-xs font-bold cursor-pointer transition-all shadow-2xs"
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
                          className="px-2.5 py-1 rounded-[4px] bg-[#F9FAFB] border border-[#E5E7EB] text-[11px] text-[#111827] flex items-center gap-1.5"
                        >
                          <Share2 size={12} className="text-[#024AD8]" />
                          <span className="capitalize">{platform}: {link}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = { ...formData.socialChannels }
                              delete updated[platform]
                              setFormData({ ...formData, socialChannels: updated })
                            }}
                            className="text-[#9CA3AF] hover:text-rose-600 font-bold ml-1 cursor-pointer"
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
                  <span className="font-extrabold text-[#111827] block text-xs sm:text-sm">
                    官方品牌介绍与愿景
                  </span>
                  <textarea
                    rows={3}
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="阐述品牌愿景、核心声学技术理念与全球化服务宗旨…"
                    className="w-full p-2.5 rounded-[4px] bg-[#F9FAFB] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:bg-white focus:border-[#024AD8] resize-none"
                  />
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between shrink-0">
                <span className="text-[11px] text-[#6B7280]">
                  自动同步至客服与推理基座
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsTemplateModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-[4px] bg-white hover:bg-[#F3F4F6] text-xs font-semibold text-[#111827] border border-[#D1D5DB] transition-all cursor-pointer"
                  >
                    关闭
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveForm}
                    className="px-5 py-1.5 rounded-[4px] bg-[#024AD8] hover:bg-[#003198] text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                  >
                    {isSavedFeedback ? (
                      <>
                        <Check size={13} className="text-white" />
                        <span>已保存</span>
                      </>
                    ) : (
                      <>
                        <Save size={13} />
                        <span>保存配置</span>
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
