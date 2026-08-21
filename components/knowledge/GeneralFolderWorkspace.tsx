'use client'

import React, { useState } from 'react'
import {
  ArrowLeft,
  FileText,
  Trash2,
  Edit2,
  X,
  Plus,
  Folder,
  ShieldCheck,
  Cpu,
  Crosshair,
  TrendingUp,
  Search,
  Users,
} from 'lucide-react'
import type { KnowledgeSource, KnowledgeBaseItem } from './types'

interface GeneralFolderWorkspaceProps {
  folder: KnowledgeBaseItem
  onBack: () => void
  onDeleteFolder?: (folderId: string) => void
  onUpdateFolderSources: (folderId: string, sources: KnowledgeSource[]) => void
  onRenameFolder?: (folderId: string, newTitle: string) => void
  isZh: boolean
}

export function GeneralFolderWorkspace({
  folder,
  onBack,
  onDeleteFolder,
  onUpdateFolderSources,
  onRenameFolder,
  isZh: _isZh,
}: GeneralFolderWorkspaceProps) {
  const [uploadFileName, setUploadFileName] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [editingFileId, setEditingFileId] = useState<string | null>(null)
  const [editingFileName, setEditingFileName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Folder Title Editing
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [folderTitle, setFolderTitle] = useState(folder.title)

  const handleSaveTitle = () => {
    if (!folderTitle.trim()) {
      setIsEditingTitle(false)
      return
    }
    if (onRenameFolder) {
      onRenameFolder(folder.id, folderTitle.trim())
    }
    setIsEditingTitle(false)
  }

  // Delete file
  const handleDeleteFile = (sourceId: string) => {
    const updated = folder.sources.filter((s) => s.id !== sourceId)
    onUpdateFolderSources(folder.id, updated)
  }

  // Save renamed file
  const handleSaveRename = (sourceId: string) => {
    if (!editingFileName.trim()) {
      setEditingFileId(null)
      return
    }
    const updated = folder.sources.map((s) =>
      s.id === sourceId ? { ...s, name: editingFileName.trim() } : s
    )
    onUpdateFolderSources(folder.id, updated)
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
        id: `src-gen-${Date.now()}-${idx}`,
        name: file.name,
        type: ext === 'docx' ? 'docx' : ext === 'md' ? 'markdown' : 'pdf',
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        updatedAt: '刚刚',
        visibility: 'customer-facing',
        selected: true,
        summary: '文档已完成结构化提取与切片向量索引。',
      }
    })
    onUpdateFolderSources(folder.id, [...newSources, ...folder.sources])
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

  const filteredSources = folder.sources.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getFolderTheme = (id: string) => {
    switch (id) {
      case 'support-policy':
      case 'service-policy':
        return {
          wrapper: 'bg-gradient-to-br from-[#F0EAFA]/65 via-[#E8DCF8]/40 to-[#F6F0FC]/30 shadow-[0_8px_32px_rgba(168,85,247,0.05)]',
          iconBg: 'text-purple-700 bg-white/95',
          btnGrad: 'from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700',
          dashedBorder: 'border-purple-300/90 text-purple-600',
        }
      case 'res-product-private':
      case 'product-rd':
        return {
          wrapper: 'bg-gradient-to-br from-[#ECECFE]/65 via-[#E2E4FC]/40 to-[#F1F1FF]/30 shadow-[0_8px_32px_rgba(99,102,241,0.05)]',
          iconBg: 'text-indigo-700 bg-white/95',
          btnGrad: 'from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700',
          dashedBorder: 'border-indigo-300/90 text-indigo-600',
        }
      case 'res-competitor':
      case 'competitor-intel':
        return {
          wrapper: 'bg-gradient-to-br from-[#FEF4E4]/65 via-[#FDECD0]/40 to-[#FEF8ED]/30 shadow-[0_8px_32px_rgba(245,158,11,0.05)]',
          iconBg: 'text-amber-800 bg-white/95',
          btnGrad: 'from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700',
          dashedBorder: 'border-amber-300/90 text-amber-600',
        }
      case 'res-market':
      case 'market-research':
        return {
          wrapper: 'bg-gradient-to-br from-[#E5F7F3]/65 via-[#D7F2EC]/40 to-[#ECFAF6]/30 shadow-[0_8px_32px_rgba(16,185,129,0.05)]',
          iconBg: 'text-teal-700 bg-white/95',
          btnGrad: 'from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700',
          dashedBorder: 'border-teal-300/90 text-teal-600',
        }
      default:
        return {
          wrapper: 'bg-gradient-to-br from-[#E3F2FD]/65 via-[#D4ECFD]/40 to-[#EEF7FE]/30 shadow-[0_8px_32px_rgba(59,130,246,0.05)]',
          iconBg: 'text-blue-700 bg-white/95',
          btnGrad: 'from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700',
          dashedBorder: 'border-blue-300/90 text-blue-600',
        }
    }
  }

  const theme = getFolderTheme(folder.id)

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-5 rounded-[24px] bg-[linear-gradient(135deg,rgba(238,226,255,0.45)_0%,rgba(255,235,243,0.40)_30%,rgba(224,242,254,0.40)_65%,rgba(254,243,199,0.40)_100%)] backdrop-blur-[20px] backdrop-saturate-[180%] border border-white/75 shadow-[0_8px_32px_rgba(0,0,0,0.03)] space-y-4">
      {/* Top Navigation Bar: Back Button + Title on the SAME LINE + Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/70">
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="back-to-folders-btn"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] bg-white/85 hover:bg-white text-xs font-bold text-[#111827] transition-all cursor-pointer shadow-xs border border-white/90 hover:shadow-sm"
          >
            <ArrowLeft size={14} />
            <span>返回知识库列表</span>
          </button>
          <span className="text-gray-300 font-light">/</span>
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-[10px] ${theme.iconBg} flex items-center justify-center shrink-0 shadow-xs border border-white`}>
              {renderFolderIcon(folder.id)}
            </div>
            {isEditingTitle ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={folderTitle}
                  onChange={(e) => setFolderTitle(e.target.value)}
                  className="h-7 px-2 text-xs font-bold rounded-[8px] bg-white border border-purple-400 focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSaveTitle}
                  className="px-2 py-1 rounded-[6px] bg-black hover:bg-black/80 text-white text-[10px] font-bold cursor-pointer transition-colors"
                >
                  保存
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(false)}
                  className="p-1 text-gray-400"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-[#111827] tracking-tight">{folder.title}</h3>
                {onRenameFolder && !folder.isSystem && (
                  <button
                    type="button"
                    onClick={() => setIsEditingTitle(true)}
                    className="p-1 rounded-[6px] text-gray-400 hover:text-gray-700 hover:bg-white/60 transition-colors"
                    title="重命名"
                  >
                    <Edit2 size={12} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-56">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索此库中的文档…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 rounded-[12px] bg-white/85 border border-white/90 text-xs text-[#111827] placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-purple-400 shadow-2xs"
            />
          </div>

          {onDeleteFolder && !folder.isSystem && (
            <button
              type="button"
              onClick={() => {
                if (confirm(`确定要删除「${folder.title}」知识库吗？`)) {
                  onDeleteFolder(folder.id)
                }
              }}
              className="p-2 rounded-[10px] bg-white/80 hover:bg-rose-50 border border-white text-gray-400 hover:text-rose-600 transition-colors shadow-2xs"
              title="删除此知识库"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Files List: Relaxed Spacing, File Size on Far Right */}
      <div className="space-y-2 flex-1 overflow-y-auto max-h-[380px] custom-scroll pr-1">
        <div className="flex items-center justify-between text-xs font-bold text-[#111827] px-1">
          <span>文件列表 ({folder.sources.length})</span>
          <span className="text-[11px] text-[#6B7280] font-medium">已用存储: {folder.storageUsed || '3.2 MB'}</span>
        </div>

        {filteredSources.length === 0 ? (
          <div className="py-10 text-center text-xs text-gray-400 bg-white/50 backdrop-blur-xs rounded-[18px] border border-dashed border-white/90">
            暂无匹配文件，请在下方上传。
          </div>
        ) : (
          filteredSources.map((file) => {
            const isEditing = editingFileId === file.id
            return (
              <div
                key={file.id}
                className="group p-3.5 rounded-[16px] bg-white/80 hover:bg-white backdrop-blur-md border border-white/90 transition-all flex items-center justify-between gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.02),inset_0_1px_1px_rgba(255,255,255,1)]"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-[10px] bg-white text-purple-700 flex items-center justify-center shrink-0 border border-purple-100/60 shadow-2xs">
                    <FileText size={15} />
                  </div>
                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editingFileName}
                        onChange={(e) => setEditingFileName(e.target.value)}
                        className="w-full h-7 px-2 text-xs rounded-[8px] bg-white border border-purple-400 focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveRename(file.id)}
                        className="px-2.5 py-1 rounded-[8px] bg-black hover:bg-black/80 text-white text-[11px] font-bold cursor-pointer transition-colors"
                      >
                        确定
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingFileId(null)}
                        className="p-1 text-gray-400 hover:text-gray-700"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-[#111827] truncate block" title={file.name}>
                        {file.name}
                      </span>
                      <span className="text-[10px] text-[#6B7280] mt-0.5 block">
                        更新时间: {file.updatedAt}
                      </span>
                    </div>
                  )}
                </div>

                {/* Right side: File size badge on far right + Actions */}
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
                        className="p-1.5 rounded-[8px] text-gray-500 hover:text-[#111827] hover:bg-gray-100 transition-colors"
                        title="重命名文件"
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
          })
        )}
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
              ? 'border-purple-500 bg-purple-50/80 scale-[1.005] shadow-md'
              : 'border-white/90 hover:border-purple-400 bg-white/50 hover:bg-white/85 shadow-2xs'
          }`}
          title="点击或拖拽文件上传"
        >
          <div className="w-8 h-8 rounded-full bg-white/90 group-hover:scale-110 flex items-center justify-center text-purple-600 shadow-xs border border-white transition-transform">
            <Plus size={20} strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </div>
  )
}

function renderFolderIcon(id: string) {
  switch (id) {
    case 'support-policy':
    case 'service-policy':
      return <ShieldCheck size={15} className="text-purple-300" />
    case 'res-product-private':
    case 'product-rd':
      return <Cpu size={15} className="text-purple-300" />
    case 'res-competitor':
    case 'competitor-intel':
      return <Crosshair size={15} className="text-purple-300" />
    case 'res-market':
    case 'market-research':
      return <TrendingUp size={15} className="text-purple-300" />
    default:
      return <Folder size={15} className="text-purple-300" />
  }
}
