'use client'

import React, { useState, useRef } from 'react'
import {
  UploadCloud,
  FileText,
  FileCode,
  FileSpreadsheet,
  Trash2,
  Link as LinkIcon,
  Search,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Edit2,
  Plus,
} from 'lucide-react'
import type {
  KnowledgeFileSource,
  KnowledgeProductBinding,
  AiSuggestedBindingMatch,
} from './types'
import { AssociateProductModal } from './AssociateProductModal'
import { FileDetailDrawer } from './FileDetailDrawer'

interface KnowledgeSourcesSectionProps {
  sources: KnowledgeFileSource[]
  bindings: KnowledgeProductBinding[]
  aiSuggestions: AiSuggestedBindingMatch[]
  onUploadFile: (file: File) => void
  onDeleteFile: (sourceId: string) => void
  onToggleBinding: (sourceId: string, productId: string) => void
  onRemoveBinding: (sourceId: string, productId: string) => void
  onAddBinding: (sourceId: string, productId: string) => void
  onConfirmAiSuggestion: (suggestionId: string) => void
  onIgnoreAiSuggestion: (suggestionId: string) => void
  isZh: boolean
}

export function KnowledgeSourcesSection({
  sources,
  bindings,
  aiSuggestions,
  onUploadFile,
  onDeleteFile,
  onToggleBinding,
  onRemoveBinding,
  onConfirmAiSuggestion,
  onIgnoreAiSuggestion,
  isZh,
}: KnowledgeSourcesSectionProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all')
  const [isDragging, setIsDragging] = useState(false)

  // Drawer & Modal State
  const [activeDrawerSource, setActiveDrawerSource] = useState<KnowledgeFileSource | null>(null)
  const [associatingSource, setAssociatingSource] = useState<KnowledgeFileSource | null>(null)
  const [hoveredSourceId, setHoveredSourceId] = useState<string | null>(null)
  const [fileToDelete, setFileToDelete] = useState<KnowledgeFileSource | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      onUploadFile(droppedFile)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      onUploadFile(file)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Filter sources
  const filteredSources = sources.filter((source) => {
    const matchesSearch =
      source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (source.summary && source.summary.toLowerCase().includes(searchQuery.toLowerCase()))

    if (!matchesSearch) return false

    if (selectedTypeFilter === 'all') return true
    if (selectedTypeFilter === 'pdf') return source.type === 'pdf'
    if (selectedTypeFilter === 'markdown') return source.type === 'markdown'
    if (selectedTypeFilter === 'docx') return source.type === 'docx'
    if (selectedTypeFilter === 'sheets')
      return source.type === 'xlsx' || source.type === 'csv' || source.type === 'json'
    if (selectedTypeFilter === 'processing')
      return source.status === 'processing' || source.status === 'uploading'
    return true
  })

  // Get bound product count for source
  const getBoundCount = (sourceId: string) => {
    return bindings.filter((b) => b.sourceId === sourceId).length
  }

  // Render icon based on source type
  const renderSourceIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="text-red-500 shrink-0" size={16} />
      case 'markdown':
        return <FileCode className="text-blue-500 shrink-0" size={16} />
      case 'docx':
        return <FileText className="text-indigo-500 shrink-0" size={16} />
      case 'xlsx':
      case 'csv':
        return <FileSpreadsheet className="text-emerald-500 shrink-0" size={16} />
      default:
        return <FileText className="text-gray-500 shrink-0" size={16} />
    }
  }

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gray-900" />
          <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
            {isZh ? '知识源文件库' : 'Knowledge Sources'}
          </h3>
        </div>
        <span className="text-xs text-gray-500">
          {isZh ? `共 ${sources.length} 份文件` : `${sources.length} Files`}
        </span>
      </div>

      {/* 1. Global Compact Drag & Drop Upload Zone (长条长方形内部仅加号，无任何文字) */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.md,.markdown,.docx,.doc,.xlsx,.xls,.csv,.json,.txt"
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
            : 'border-white/90 hover:border-purple-400 bg-white/70 backdrop-blur-xl hover:bg-white/90 shadow-[0_8px_32px_rgba(0,0,0,0.02)]'
        }`}
        title="点击或拖拽文件上传"
      >
        <div className="w-8 h-8 rounded-full bg-white/90 group-hover:scale-110 flex items-center justify-center text-purple-600 shadow-xs border border-white transition-transform">
          <Plus size={20} strokeWidth={2.5} />
        </div>
      </div>

      {/* 2. File Library Container (Liquid Glass, High Density) */}
      <div className="rounded-3xl border border-white/60 bg-white/75 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Search & Filter Strip */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isZh ? '搜索文件名称...' : 'Search files...'}
              className="w-full h-8 pl-8 pr-3 rounded-lg bg-gray-50 border border-gray-200/80 text-xs text-gray-900 focus:outline-none focus:bg-white focus:border-gray-400 transition-colors"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-semibold text-gray-600">
            {[
              { id: 'all', label: isZh ? '全部' : 'All' },
              { id: 'pdf', label: 'PDF' },
              { id: 'markdown', label: 'Markdown' },
              { id: 'docx', label: 'DOCX' },
              { id: 'sheets', label: isZh ? '表格 / JSON' : 'Sheets/JSON' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedTypeFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  selectedTypeFilter === f.id
                    ? 'bg-gray-900 text-white'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3-Tier Progressive Disclosure File List */}
        <div className="divide-y divide-gray-100/80">
          {filteredSources.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400">
              {isZh ? '暂无匹配的知识源文件' : 'No documents found'}
            </div>
          ) : (
            filteredSources.map((source) => {
              const boundCount = getBoundCount(source.id)
              const isHovered = hoveredSourceId === source.id

              return (
                <div
                  key={source.id}
                  onMouseEnter={() => setHoveredSourceId(source.id)}
                  onMouseLeave={() => setHoveredSourceId(null)}
                  onClick={() => setActiveDrawerSource(source)}
                  className="group px-5 py-3 flex items-center justify-between gap-4 hover:bg-gray-50/70 transition-colors cursor-pointer select-none"
                >
                  {/* Level 1: Default Information */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200/60 flex items-center justify-center shrink-0">
                      {renderSourceIcon(source.type)}
                    </div>

                    <div className="min-w-0 flex-1 flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-900 truncate">
                        {source.name}
                      </span>

                      {/* Scope Badge (Low Saturation) */}
                      {boundCount === 0 ? (
                        <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600 shrink-0">
                          🌐 {isZh ? '全店通用' : 'Global'}
                        </span>
                      ) : (
                        <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200/50 shrink-0">
                          🎯 {isZh ? `绑定 ${boundCount} 个商品` : `${boundCount} Bound`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Level 1: Basic Status + Level 2: Hover Action Icons */}
                  <div className="flex items-center gap-3 shrink-0">
                    {/* Status Badge */}
                    {source.status === 'ready' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        <CheckCircle2 size={11} />
                        <span>{isZh ? '已就绪' : 'Ready'}</span>
                      </span>
                    )}

                    {source.status === 'processing' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60">
                        <Loader2 size={11} className="animate-spin" />
                        <span>{isZh ? '处理中' : 'Processing'}</span>
                      </span>
                    )}

                    {source.status === 'uploading' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
                        <Loader2 size={11} className="animate-spin" />
                        <span>{isZh ? '上传中' : 'Uploading'}</span>
                      </span>
                    )}

                    {source.status === 'failed' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200/60">
                        <AlertCircle size={11} />
                        <span>{isZh ? '失败' : 'Failed'}</span>
                      </span>
                    )}

                    {/* Level 2: Hover Actions (Fade in Minimal Icon Actions) */}
                    <div
                      className={`flex items-center gap-1 transition-opacity ${
                        isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* 关联 (Associate) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setAssociatingSource(source)
                        }}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-200/70 transition-colors cursor-pointer"
                        title={isZh ? '关联商品' : 'Associate Product'}
                      >
                        <LinkIcon size={13} />
                      </button>

                      {/* 编辑 / 详情 */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveDrawerSource(source)
                        }}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-200/70 transition-colors cursor-pointer"
                        title={isZh ? '编辑' : 'Edit'}
                      >
                        <Edit2 size={13} />
                      </button>

                      {/* 删除 */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setFileToDelete(source)
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title={isZh ? '删除' : 'Delete'}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Level 3: Right-Side File Detail Drawer */}
      <FileDetailDrawer
        source={activeDrawerSource}
        isOpen={!!activeDrawerSource}
        onClose={() => setActiveDrawerSource(null)}
        bindings={bindings}
        aiSuggestions={aiSuggestions}
        onOpenAssociateModal={() => {
          setAssociatingSource(activeDrawerSource)
        }}
        onRemoveBinding={onRemoveBinding}
        onConfirmAiSuggestion={onConfirmAiSuggestion}
        onIgnoreAiSuggestion={onIgnoreAiSuggestion}
        onDeleteFile={onDeleteFile}
        isZh={isZh}
      />

      {/* Associate Products Modal */}
      <AssociateProductModal
        isOpen={!!associatingSource}
        onClose={() => setAssociatingSource(null)}
        source={associatingSource}
        bindings={bindings}
        onToggleBinding={onToggleBinding}
        isZh={isZh}
      />

      {/* Delete Confirmation Dialog */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setFileToDelete(null)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-gray-200 z-10 space-y-3">
            <h4 className="text-sm font-bold text-gray-900">
              {isZh ? '确认删除文件？' : 'Delete File?'}
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              {isZh
                ? `「${fileToDelete.name}」将被永久删除，并自动解除所有商品的关联关系。`
                : `"${fileToDelete.name}" will be deleted and unlinked from all products.`}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                className="px-3.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200/80 text-gray-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                {isZh ? '取消' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteFile(fileToDelete.id)
                  setFileToDelete(null)
                }}
                className="px-4 py-1.5 rounded-lg bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                {isZh ? '删除' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
