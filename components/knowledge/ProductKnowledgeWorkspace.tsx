'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Package,
  ArrowLeft,
  Search,
  FileText,
  Unlink,
  Link as LinkIcon,
  Link2,
  ArrowRightLeft,
  ShoppingBag,
  Plus,
  Trash2,
  Check,
  X,
  ChevronDown,
  Sparkles,
  Layers,
  FileCheck2,
  Edit2,
  Globe,
  Tag,
} from 'lucide-react'
import { DEMO_PRODUCTS, DemoProduct } from '@/lib/products/demo-data'
import type { KnowledgeFileSource, KnowledgeProductBinding } from './types'

interface ProductKnowledgeWorkspaceProps {
  onBack: () => void
  folderTitle?: string
  onRenameFolder?: (newTitle: string) => void
  sources: KnowledgeFileSource[]
  bindings: KnowledgeProductBinding[]
  onRemoveBinding: (sourceId: string, productId: string) => void
  onAddBinding: (sourceId: string, productId: string) => void
  onUploadFile: (fileName: string, productId?: string) => void
  isZh: boolean
}

export function ProductKnowledgeWorkspace({
  onBack,
  folderTitle = '产品知识与 SKU 绑定',
  onRenameFolder,
  sources,
  bindings,
  onRemoveBinding,
  onAddBinding,
  onUploadFile,
  isZh,
}: ProductKnowledgeWorkspaceProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'bound' | 'general'>('bound')

  // Title linkage state
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [localTitle, setLocalTitle] = useState(folderTitle)

  // Expanded file dropdowns for bound product files (点击小图 div 展开自动下拉)
  const [expandedFileIds, setExpandedFileIds] = useState<Set<string>>(new Set(['src-prod-101', 'src-prod-102']))

  // Upload state
  const [uploadTargetProductId, setUploadTargetProductId] = useState<string | null>(null)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [productSearchQuery, setProductSearchQuery] = useState('')

  // Drag & Drop + Click Upload
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Sync state with product page
  const [syncedDocs, setSyncedDocs] = useState<any[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('omnilink_synced_product_docs')
      if (stored) {
        setSyncedDocs(JSON.parse(stored))
      }
    } catch (e) {
      console.error(e)
    }

    const handleSync = () => {
      try {
        const stored = localStorage.getItem('omnilink_synced_product_docs')
        if (stored) {
          setSyncedDocs(JSON.parse(stored))
        }
      } catch (e) {
        console.error(e)
      }
    }
    window.addEventListener('storage', handleSync)
    const interval = setInterval(handleSync, 1000)
    return () => {
      window.removeEventListener('storage', handleSync)
      clearInterval(interval)
    }
  }, [])

  const processUploadedFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    if (fileArray.length === 0) return

    fileArray.forEach((file) => {
      onUploadFile(file.name, uploadTargetProductId || undefined)

      // Sync uploaded file to localStorage
      try {
        const stored = localStorage.getItem('omnilink_synced_product_docs')
        const currentDocs = stored ? JSON.parse(stored) : []
        const newDoc = {
          id: `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          uploadedAt: '刚刚',
          visibility: 'public',
          type: file.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'doc',
          productId: uploadTargetProductId || undefined
        }
        currentDocs.push(newDoc)
        localStorage.setItem('omnilink_synced_product_docs', JSON.stringify(currentDocs))
        setSyncedDocs(currentDocs)
      } catch (e) {
        console.error(e)
      }
    })
    setUploadTargetProductId(null)
  }

  const handleRemoveBinding = (sourceId: string, productId: string) => {
    try {
      const stored = localStorage.getItem('omnilink_synced_product_docs')
      if (stored) {
        const docs = JSON.parse(stored)
        const updatedDocs = docs.map((d: any) => {
          if (d.id === sourceId && d.productId === productId) {
            return { ...d, productId: undefined }
          }
          return d
        }).filter((d: any) => d.productId !== undefined || d.id.startsWith('src-prod-'))
        localStorage.setItem('omnilink_synced_product_docs', JSON.stringify(updatedDocs))
        setSyncedDocs(updatedDocs)
      }
    } catch (e) {
      console.error(e)
    }
    onRemoveBinding(sourceId, productId)
  }

  const handleAddBinding = (sourceId: string, productId: string) => {
    try {
      const stored = localStorage.getItem('omnilink_synced_product_docs')
      if (stored) {
        const docs = JSON.parse(stored)
        const existing = docs.find((d: any) => d.id === sourceId)
        if (existing) {
          existing.productId = productId
        } else {
          const fileSource = sources.find((s) => s.id === sourceId)
          if (fileSource) {
            docs.push({
              id: fileSource.id,
              name: fileSource.name,
              size: fileSource.size,
              uploadedAt: fileSource.updatedAt,
              visibility: 'public',
              type: fileSource.type,
              productId: productId
            })
          }
        }
        localStorage.setItem('omnilink_synced_product_docs', JSON.stringify(docs))
        setSyncedDocs(docs)
      }
    } catch (e) {
      console.error(e)
    }
    onAddBinding(sourceId, productId)
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

  const handleSaveTitle = () => {
    if (!localTitle.trim()) {
      setIsEditingTitle(false)
      return
    }
    if (onRenameFolder) {
      onRenameFolder(localTitle.trim())
    }
    setIsEditingTitle(false)
  }

  const toggleFileDropdown = (fileId: string) => {
    const next = new Set(expandedFileIds)
    if (next.has(fileId)) {
      next.delete(fileId)
    } else {
      next.add(fileId)
    }
    setExpandedFileIds(next)
  }

  // Combine prop sources and bindings with our local syncedDocs.
  const mergedSources = [...sources]
  const mergedBindings = [...bindings]

  syncedDocs.forEach((doc) => {
    if (!mergedSources.some((s) => s.id === doc.id)) {
      mergedSources.push({
        id: doc.id,
        name: doc.name,
        type: doc.type || 'pdf',
        size: doc.size || '1.5 MB',
        updatedAt: doc.uploadedAt || '刚刚',
        visibility: doc.visibility === 'public' ? 'customer-facing' : 'internal-private',
        status: 'ready',
        summary: '来自商品管理库上传的规格文件',
      })
    }
    if (doc.productId && !mergedBindings.some((b) => b.sourceId === doc.id && b.productId === doc.productId)) {
      mergedBindings.push({
        id: `bind-sync-${doc.id}-${doc.productId}`,
        sourceId: doc.id,
        productId: doc.productId,
        boundAt: doc.uploadedAt || '刚刚',
        matchType: 'manual',
      })
    }
  })

  // Filter sources based on search
  const filteredSources = mergedSources.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get bound products for a file source
  const getProductsForSource = (sourceId: string) => {
    const productIds = mergedBindings
      .filter((b) => b.sourceId === sourceId)
      .map((b) => b.productId)
    return DEMO_PRODUCTS.filter((p) => productIds.includes(p.id))
  }

  // Categorize files into Bound Files vs General Files
  const boundFileSources = filteredSources.filter((file) => {
    const boundProds = getProductsForSource(file.id)
    return boundProds.length > 0
  })

  const generalFileSources = filteredSources.filter((file) => {
    const boundProds = getProductsForSource(file.id)
    return boundProds.length === 0
  })



  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden space-y-4 relative">
      {/* Top Navigation: Back Button + Title with Linkage + Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/70">
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
            <div className="w-7 h-7 rounded-[10px] bg-white/95 text-blue-700 flex items-center justify-center shrink-0 shadow-xs border border-white">
              <Package size={14} />
            </div>

            {isEditingTitle ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={localTitle}
                  onChange={(e) => setLocalTitle(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                  autoFocus
                  className="h-7 px-2 text-xs sm:text-sm font-extrabold rounded-[8px] bg-white border border-purple-500 text-[#111827] focus:outline-none shadow-xs"
                />
                <button
                  type="button"
                  onClick={handleSaveTitle}
                  className="px-2 py-1 rounded-[6px] bg-black hover:bg-black/80 text-white text-[10px] font-bold cursor-pointer transition-colors"
                >
                  保存
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group/title">
                <h3
                  onClick={() => setIsEditingTitle(true)}
                  title="点击可修改知识库名称"
                  className="text-xs sm:text-sm font-extrabold text-[#111827] tracking-tight hover:text-purple-700 cursor-text transition-colors"
                >
                  {localTitle}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(true)}
                  className="opacity-0 group-hover/title:opacity-100 transition-opacity p-0.5 text-gray-400 hover:text-purple-700 cursor-pointer"
                  title="重命名"
                >
                  <Edit2 size={11} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-56">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索文件或绑定商品..."
            className="w-full h-8 pl-8 pr-3 rounded-[12px] bg-white/85 border border-white/90 text-xs text-[#111827] placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 shadow-2xs"
          />
        </div>
      </div>

      {/* Category Tabs: 商品关联 vs 全局通用 */}
      <div className="flex items-center justify-between border-b border-white/60 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('bound')}
            className={`px-3.5 py-1.5 rounded-[12px] text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'bound'
                ? 'bg-white text-blue-900 shadow-xs border border-white'
                : 'text-gray-600 hover:text-[#111827] hover:bg-white/50'
            }`}
          >
            <Layers size={13} className={activeTab === 'bound' ? 'text-blue-600' : ''} />
            <span>商品关联</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-3.5 py-1.5 rounded-[12px] text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'general'
                ? 'bg-white text-emerald-900 shadow-xs border border-white'
                : 'text-gray-600 hover:text-[#111827] hover:bg-white/50'
            }`}
          >
            <Globe size={13} className={activeTab === 'general' ? 'text-emerald-600' : ''} />
            <span>全局通用</span>
          </button>
        </div>

        <span className="text-[10px] text-[#6B7280] hidden sm:inline">
          {activeTab === 'bound'
            ? ''
            : '所有商品在深度研报推理时均可共享通用文件'}
        </span>
      </div>

      {/* FILE LIST SECTION */}
      <div className="flex-1 overflow-y-auto max-h-[480px] custom-scroll pr-1 space-y-3">
        {activeTab === 'bound' ? (
          /* SECTION 1: 绑定商品的文件 (纵向高度拉伸，显示商品小图，点击小图div自动下拉) */
          boundFileSources.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400 bg-white/40 rounded-[20px] border border-dashed border-white/80">
              暂无数据。可通过下方加号按钮上传。
            </div>
          ) : (
            <div className="space-y-3">
              {boundFileSources.map((file) => {
                const boundProducts = getProductsForSource(file.id)
                const isDropdownOpen = expandedFileIds.has(file.id)

                return (
                  <div
                    key={file.id}
                    className="p-4 rounded-[22px] bg-white/80 hover:bg-white/95 backdrop-blur-md border border-white/95 shadow-[0_4px_16px_rgba(0,0,0,0.02),inset_0_1px_1px_rgba(255,255,255,1)] transition-all space-y-3"
                  >
                    {/* Top Row: File Name + Size + Stretched Height Info */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-[12px] bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100/80 shadow-2xs">
                          <FileText size={17} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs sm:text-sm text-[#111827] truncate">
                              {file.name}
                            </span>
                            <span className="p-1 rounded-full bg-blue-50 border border-blue-200 shrink-0" title="Auto-Synced">
                              <ArrowRightLeft size={10} className="text-blue-600" />
                            </span>
                          </div>
                          <div className="text-[10px] text-[#6B7280] mt-0.5 flex items-center gap-3">
                            <span>大小: {file.size}</span>
                            <span>更新时间: {file.updatedAt}</span>
                          </div>
                        </div>
                      </div>

                      {/* CLICKABLE THUMBNAIL DIV (点击小图所在的div，自动下拉解绑/加入产品) */}
                      <div
                        onClick={() => toggleFileDropdown(file.id)}
                        className="group/thumbs flex items-center gap-2.5 px-3 py-2 rounded-[14px] bg-gradient-to-r from-blue-50/80 to-indigo-50/80 hover:from-blue-100/90 hover:to-indigo-100/90 border border-blue-200/80 text-xs font-bold text-[#111827] cursor-pointer shadow-xs transition-all select-none shrink-0"
                        title=""
                      >
                        {/* Stack of product thumbnails */}
                        <div className="flex items-center shrink-0">
                          {boundProducts.slice(0, 4).map((p) => (
                            <img
                              key={p.id}
                              src={p.image_url}
                              alt={p.name}
                              className="w-7 h-7 rounded-[8px] object-cover border-2 border-white shadow-2xs -ml-2 first:ml-0 group-hover/thumbs:scale-105 transition-transform"
                            />
                          ))}
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-800">
                          <Link2 size={13} className="text-blue-600" />
                          <span>({boundProducts.length})</span>
                          <ChevronDown
                            size={14}
                            className={`text-blue-600 transition-transform duration-200 ${
                              isDropdownOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* AUTO DROPDOWN ACCORDION (卡片自动下拉，选择解绑或者加入产品列表中的产品) */}
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden pt-3 border-t border-gray-100/90 space-y-3"
                        >
                          {/* 1. 已绑定商品列表 (包含解绑) */}
                          <div className="space-y-2">
                            <div className="text-[11px] font-bold text-[#374151] flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <ShoppingBag size={13} className="text-blue-600" />
                                <span>({boundProducts.length})</span>
                              </div>
                              <span className="text-[10px] text-[#6B7280]"></span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {boundProducts.map((p) => (
                                <div
                                  key={p.id}
                                  className="p-2.5 rounded-[12px] bg-white border border-gray-100 flex items-center justify-between gap-2 shadow-2xs"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <img
                                      src={p.image_url}
                                      alt={p.name}
                                      className="w-8 h-8 rounded-[8px] object-cover border border-gray-200 shrink-0"
                                    />
                                    <div className="min-w-0">
                                      <div className="text-[11px] font-bold text-[#111827] truncate">
                                        {p.name}
                                      </div>
                                      <div className="text-[9px] font-mono text-blue-700 font-semibold">
                                        {p.sku}
                                      </div>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveBinding(file.id, p.id)}
                                    className="p-1.5 rounded-[8px] bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-800 border border-rose-100 cursor-pointer shrink-0 transition-all active:scale-95"
                                    title="Disconnect"
                                  >
                                    <X size={12} strokeWidth={2.5} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 2. 加入产品列表中的产品 (追加绑定) */}
                          <div className="space-y-2 pt-2 border-t border-gray-100">
                            <div className="text-[11px] font-bold text-[#374151] flex items-center justify-between">
                              <span>加入产品列表中的产品</span>
                              <span className="text-[10px] text-[#6B7280]"></span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto custom-scroll pr-1">
                              {DEMO_PRODUCTS.filter(
                                (p) => !boundProducts.some((bp) => bp.id === p.id)
                              ).length === 0 ? (
                                <div className="col-span-2 py-3 text-center text-[10px] text-gray-400">
                                  所有商品均已绑定此文件
                                </div>
                              ) : (
                                DEMO_PRODUCTS.filter(
                                  (p) => !boundProducts.some((bp) => bp.id === p.id)
                                ).map((p) => (
                                  <div
                                    key={p.id}
                                    className="p-2.5 rounded-[12px] bg-gray-50/80 hover:bg-white border border-gray-200/80 flex items-center justify-between gap-2 transition-colors"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <img
                                        src={p.image_url}
                                        alt={p.name}
                                        className="w-8 h-8 rounded-[8px] object-cover border border-gray-200 shrink-0"
                                      />
                                      <div className="min-w-0">
                                        <div className="text-[11px] font-semibold text-[#111827] truncate">
                                          {p.name}
                                        </div>
                                        <div className="text-[9px] font-mono text-gray-500">
                                          {p.sku}
                                        </div>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleAddBinding(file.id, p.id)}
                                      className="p-1.5 rounded-[8px] bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 cursor-pointer shrink-0 transition-all active:scale-95"
                                    >
                                      <Plus size={12} strokeWidth={2.5} />
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          )
        ) : (
          /* SECTION 2: 通用文件 (全系适用，无特定绑定) */
          generalFileSources.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400 bg-white/40 rounded-[20px] border border-dashed border-white/80">
              暂无通用文件，通用文件将自动共享给所有产品的 AI 研报推理。
            </div>
          ) : (
            <div className="space-y-2.5">
              {generalFileSources.map((file) => (
                <div
                  key={file.id}
                  className="p-3.5 rounded-[18px] bg-white/85 hover:bg-white backdrop-blur-md border border-white/95 shadow-2xs transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-[10px] bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                      <FileText size={15} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-[#111827] truncate">
                          {file.name}
                        </span>
                        <span className="px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                          全系通用
                        </span>
                      </div>
                      <span className="text-[10px] text-[#6B7280] mt-0.5 block">
                        更新时间: {file.updatedAt} · {file.size}
                      </span>
                    </div>
                  </div>

                  {/* Action to bind to specific product */}
                  <button
                    type="button"
                    onClick={() => handleAddBinding(file.id, 'prod-opt-001')}
                    className="p-1.5 rounded-[8px] bg-white hover:bg-blue-50 border border-gray-100 text-blue-600 flex items-center justify-center cursor-pointer transition-all shadow-2xs shrink-0 active:scale-95"
                    title=""
                  >
                    <LinkIcon size={12} />
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Upload Zone */}
      <div className="pt-2 border-t border-white/80 space-y-1">
        {/* Grey counts text above the upload button on the right */}
        <div className="flex items-center justify-end px-1">
          <span className="text-[10px] text-gray-500 font-semibold tracking-wider">
            {activeTab === 'bound' ? `${boundFileSources.length} 项关联文件` : `${generalFileSources.length} 项通用文件`}
          </span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        
        {/*
          Plus-Only Glassmorphic Upload Button (Strictly No Text, Only Plus Symbol)
          Action toggles dynamically based on activeTab (bound vs. general)
        */}
        <button
          type="button"
          onClick={() => {
            if (activeTab === 'bound') {
              setProductSearchQuery('')
              setIsProductModalOpen(true)
            } else {
              setUploadTargetProductId(null)
              setTimeout(() => {
                fileInputRef.current?.click()
              }, 50)
            }
          }}
          className="group relative w-full h-13 sm:h-14 rounded-[16px] bg-white/45 hover:bg-white/80 border border-white/70 shadow-[0_16px_36px_rgba(0,0,0,0.13),inset_0_1px_1px_rgba(255,255,255,1)] hover:shadow-[0_22px_44px_rgba(0,0,0,0.20)] transition-all cursor-pointer flex items-center justify-center active:scale-[0.98]"
          title=""
        >
          <div className="w-9 h-9 rounded-full bg-white/95 text-blue-600 flex items-center justify-center shadow-md border border-white group-hover:scale-110 transition-transform">
            <Plus size={20} strokeWidth={3} />
          </div>
        </button>
      </div>

      {/* PRODUCT SELECTION MODAL */}
      <AnimatePresence>
        {isProductModalOpen && (
          <div className="absolute inset-0 z-50 flex flex-col bg-slate-900/60 backdrop-blur-md rounded-[24px] p-4 justify-between animate-fade-in">
            <div className="flex-1 flex flex-col min-h-0 bg-white/95 backdrop-blur-lg rounded-[20px] p-4 border border-white shadow-[0_16px_36px_rgba(0,0,0,0.15)]">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-xs sm:text-sm font-extrabold text-[#111827]">选择关联的商品</span>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative mt-3 mb-2.5">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  placeholder="按商品名、SKU 编号搜索..."
                  className="w-full h-8 pl-8 pr-3 rounded-[12px] bg-gray-50 border border-gray-100 text-xs text-[#111827] placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 shadow-3xs"
                  autoFocus
                />
              </div>

              {/* Product List */}
              <div className="flex-1 overflow-y-auto custom-scroll space-y-1.5 pr-0.5">
                {DEMO_PRODUCTS.filter((p) => {
                  const query = productSearchQuery.toLowerCase()
                  return (
                    p.name.toLowerCase().includes(query) ||
                    p.sku.toLowerCase().includes(query)
                  )
                }).length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400">
                    未找到相匹配的商品
                  </div>
                ) : (
                  DEMO_PRODUCTS.filter((p) => {
                    const query = productSearchQuery.toLowerCase()
                    return (
                      p.name.toLowerCase().includes(query) ||
                      p.sku.toLowerCase().includes(query)
                    )
                  }).map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setUploadTargetProductId(p.id)
                        setIsProductModalOpen(false)
                        setTimeout(() => {
                          fileInputRef.current?.click()
                        }, 120)
                      }}
                      className="p-2 rounded-[12px] hover:bg-blue-50/80 border border-transparent hover:border-blue-100 flex items-center gap-2.5 cursor-pointer transition-all active:scale-[0.99]"
                    >
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="w-9 h-9 rounded-[8px] object-cover border border-gray-100 shadow-3xs"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-[#111827] truncate">
                          {p.name}
                        </div>
                        <div className="text-[10px] font-mono text-gray-500 font-semibold mt-0.5">
                          {p.sku}
                        </div>
                      </div>
                      <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-[6px] shrink-0 border border-blue-100">
                        选择
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

