'use client'

import React, { useState } from 'react'
import {
  ArrowLeft,
  Trash2,
  Edit2,
  X,
  Plus,
  Search,
  Check,
  UploadCloud,
  Download,
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
  const handleDeleteFile = (sourceId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
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

  // Toggle file inclusion
  const handleToggleFileSelect = (sourceId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const updated = folder.sources.map((s) =>
      s.id === sourceId ? { ...s, selected: s.selected === false ? true : false } : s
    )
    onUpdateFolderSources(folder.id, updated)
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

  const handleDownloadFile = (file: KnowledgeSource, e: React.MouseEvent) => {
    e.stopPropagation()
    const content = `# ${file.name}\n\n${file.summary || '文档已完成切片向量索引。'}`
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredSources = folder.sources.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedCount = folder.sources.filter((s) => s.selected !== false).length

  return (
    <div className="flex-1 flex flex-col h-full bg-white text-[#111827] justify-between overflow-hidden">
      {/* 
        TOP HEADER: NotebookLM-style Breadcrumb / Title Bar
        Pure white background, clean border divider
      */}
      <div className="p-3 border-b border-[#E5E7EB] bg-white space-y-2 shrink-0">
        {/* Row 1: Back Button + Title + Actions */}
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

            {isEditingTitle ? (
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <input
                  type="text"
                  value={folderTitle}
                  onChange={(e) => setFolderTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                  className="h-6 px-2 text-xs font-bold rounded-[4px] bg-white border border-[#024AD8] text-[#111827] focus:outline-none flex-1 min-w-0"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSaveTitle}
                  className="px-2 py-0.5 rounded-[4px] bg-[#024AD8] hover:bg-[#003198] text-white text-[10px] font-bold cursor-pointer transition-colors shrink-0"
                >
                  保存
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(false)}
                  className="p-1 text-[#9CA3AF] hover:text-[#111827] shrink-0"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <h3
                  onClick={() => onRenameFolder && !folder.isSystem && setIsEditingTitle(true)}
                  className="text-xs font-extrabold text-[#111827] truncate tracking-tight hover:text-[#024AD8] cursor-pointer transition-colors"
                  title={folder.title}
                >
                  {folder.title}
                </h3>

                {onRenameFolder && !folder.isSystem && (
                  <button
                    type="button"
                    onClick={() => setIsEditingTitle(true)}
                    className="p-0.5 text-[#9CA3AF] hover:text-[#024AD8] transition-colors cursor-pointer shrink-0"
                    title="重命名"
                  >
                    <Edit2 size={11} />
                  </button>
                )}

                <span className="px-1.5 py-0.2 rounded-full bg-blue-50 text-[#024AD8] border border-blue-100 text-[10px] font-bold shrink-0">
                  {folder.sources.length} 篇
                </span>
              </div>
            )}
          </div>

          {onDeleteFolder && !folder.isSystem && (
            <button
              type="button"
              onClick={() => {
                if (confirm(`确定要删除「${folder.title}」知识库吗？`)) {
                  onDeleteFolder(folder.id)
                }
              }}
              className="p-1 rounded-[4px] text-[#9CA3AF] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
              title="删除此知识库"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>

        {/* Row 2: Search input */}
        <div className="relative w-full">
          <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="搜索库中文档..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-6.5 pl-6 pr-2 rounded-[4px] bg-[#F9FAFB] border border-[#E5E7EB] text-[11px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:bg-white focus:border-[#024AD8] transition-all"
          />
        </div>
      </div>

      {/* 
        MAIN FILE LIST: NotebookLM-style Minimalist Card Rows (NO ICONS)
        Clean pure white rows, checkbox toggle, title, clean meta, hover actions
      */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scroll bg-white">
        {filteredSources.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#9CA3AF] flex flex-col items-center gap-1.5">
            <span className="font-medium">暂无匹配文档</span>
            <span className="text-[10px] text-[#9CA3AF]">
              请在下方拖拽或点击上传文件
            </span>
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
        Clean dashed border, theme blue highlight on hover, concise prompt text
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
          title="点击或拖拽上传文档"
        >
          <div className="w-5 h-5 rounded-[4px] bg-blue-50 text-[#024AD8] flex items-center justify-center shrink-0">
            <Plus size={13} strokeWidth={2.5} />
          </div>
          <span className="text-[11px] font-bold text-[#374151] group-hover:text-[#024AD8]">
            点击或拖拽上传文档
          </span>
        </div>
      </div>
    </div>
  )
}
