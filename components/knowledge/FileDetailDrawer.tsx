'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  X,
  FileText,
  FileCode,
  FileSpreadsheet,
  Trash2,
  Plus,
  Unlink,
  Sparkles,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Tag,
  Edit2,
  Save,
} from 'lucide-react'
import { DEMO_PRODUCTS } from '@/lib/products/demo-data'
import type {
  KnowledgeFileSource,
  KnowledgeProductBinding,
  AiSuggestedBindingMatch,
} from './types'

interface FileDetailDrawerProps {
  source: KnowledgeFileSource | null
  isOpen: boolean
  onClose: () => void
  bindings: KnowledgeProductBinding[]
  aiSuggestions: AiSuggestedBindingMatch[]
  onOpenAssociateModal: () => void
  onRemoveBinding: (sourceId: string, productId: string) => void
  onConfirmAiSuggestion: (suggestionId: string) => void
  onIgnoreAiSuggestion: (suggestionId: string) => void
  onDeleteFile: (sourceId: string) => void
  isZh: boolean
}

export function FileDetailDrawer({
  source,
  isOpen,
  onClose,
  bindings,
  aiSuggestions,
  onOpenAssociateModal,
  onRemoveBinding,
  onConfirmAiSuggestion,
  onIgnoreAiSuggestion,
  onDeleteFile,
  isZh,
}: FileDetailDrawerProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState('')

  if (!source) return null

  // Get bound products for this source
  const boundProductIds = bindings
    .filter((b) => b.sourceId === source.id)
    .map((b) => b.productId)

  const boundProducts = DEMO_PRODUCTS.filter((p) =>
    boundProductIds.includes(p.id)
  )

  // Get AI suggestions for this source
  const matchingSuggestions = aiSuggestions.filter(
    (s) => s.sourceId === source.id
  )

  const renderIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="text-red-500" size={20} />
      case 'markdown':
        return <FileCode className="text-blue-500" size={20} />
      case 'docx':
        return <FileText className="text-indigo-500" size={20} />
      case 'xlsx':
      case 'csv':
        return <FileSpreadsheet className="text-emerald-500" size={20} />
      default:
        return <FileText className="text-gray-500" size={20} />
    }
  }

  const renderStatusBadge = () => {
    switch (source.status) {
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <CheckCircle2 size={12} />
            <span>{isZh ? '已就绪' : 'Ready'}</span>
          </span>
        )
      case 'processing':
      case 'uploading':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
            <Loader2 size={12} className="animate-spin" />
            <span>{isZh ? '处理中' : 'Processing'}</span>
          </span>
        )
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60">
            <AlertCircle size={12} />
            <span>{isZh ? '失败' : 'Failed'}</span>
          </span>
        )
      default:
        return null
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/25 backdrop-blur-xs"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative w-full max-w-md bg-white/90 backdrop-blur-2xl border-l border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.08)] z-10 h-full flex flex-col overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="px-6 py-4.5 border-b border-gray-100/80 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-900">
                  {isZh ? '文件详情' : 'Document Details'}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Drawer Body - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* File Core Info */}
              <div className="p-4 rounded-2xl bg-white/70 border border-gray-200/60 shadow-2xs space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center justify-center shrink-0">
                    {renderIcon(source.type)}
                  </div>

                  <div className="min-w-0 flex-1">
                    {isEditingName ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="w-full h-7 px-2 text-xs rounded bg-white border border-gray-300 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            Object.assign(source, { name: editedName.trim() || source.name })
                            setIsEditingName(false)
                          }}
                          className="p-1 rounded bg-gray-900 text-white hover:bg-black"
                        >
                          <Save size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-gray-900 leading-snug break-all">
                          {source.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => {
                            setEditedName(source.name)
                            setIsEditingName(true)
                          }}
                          className="p-1 text-gray-400 hover:text-gray-700 transition-colors"
                          title={isZh ? '编辑' : 'Edit'}
                        >
                          <Edit2 size={12} />
                        </button>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {renderStatusBadge()}

                      {boundProducts.length === 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          🌐 {isZh ? '全店通用' : 'Global Scope'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200/50">
                          🎯 {isZh ? `绑定 ${boundProducts.length} 个商品` : `${boundProducts.length} Bound`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-[11px] text-gray-500">
                  <div>
                    <span className="text-gray-400 block">{isZh ? '大小' : 'Size'}</span>
                    <span className="font-medium text-gray-700">{source.size}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">{isZh ? '更新时间' : 'Updated'}</span>
                    <span className="font-medium text-gray-700">{source.updatedAt}</span>
                  </div>
                </div>
              </div>

              {/* 绑定商品 (Bound Products) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Tag size={14} className="text-gray-600" />
                    <h4 className="text-xs font-bold text-gray-900 tracking-wide">
                      {isZh ? '绑定商品' : 'Bound Products'}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenAssociateModal}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200/80 text-xs font-semibold text-gray-800 transition-colors cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>{isZh ? '关联商品' : 'Bind Product'}</span>
                  </button>
                </div>

                {/* Bound Product List */}
                {boundProducts.length === 0 ? (
                  <div className="p-4 rounded-xl bg-gray-50/70 border border-dashed border-gray-200 text-center space-y-1">
                    <p className="text-xs font-medium text-gray-600">
                      {isZh ? '当前为全店通用状态' : 'Global Document (Store-wide)'}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {isZh ? '若此文件专属于特定型号，请点击「关联商品」' : 'Click "Bind Product" to attach specific SKUs'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {boundProducts.map((product) => (
                      <div
                        key={product.id}
                        className="p-2.5 rounded-xl bg-white border border-gray-200/80 shadow-2xs flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-8 h-8 rounded-lg object-cover border border-gray-200/80 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-gray-900 block truncate">
                              {isZh ? product.name : product.name_en}
                            </span>
                            <span className="font-mono text-[10px] text-gray-500 font-semibold">
                              {product.sku}
                            </span>
                          </div>
                        </div>

                        {/* Unlink Action - Only deletes Document <-> Product relationship */}
                        <button
                          type="button"
                          onClick={() => onRemoveBinding(source.id, product.id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                          title={isZh ? '解除绑定' : 'Unlink'}
                        >
                          <Unlink size={12} />
                          <span>{isZh ? '解除' : 'Unlink'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Auto-Match Suggestions (UI State) */}
              {matchingSuggestions.length > 0 && (
                <div className="space-y-2.5 p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/70">
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={13} className="text-purple-600" />
                    <h4 className="text-xs font-bold text-purple-900">
                      {isZh ? 'AI 建议关联' : 'AI Suggested Match'}
                    </h4>
                  </div>

                  {matchingSuggestions.map((sug) => {
                    const matchedProd = DEMO_PRODUCTS.find((p) => p.id === sug.productId)
                    return (
                      <div
                        key={sug.id}
                        className="p-2.5 rounded-xl bg-white/90 border border-purple-100 shadow-2xs space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-xs font-bold text-gray-900 block">
                              {matchedProd ? (isZh ? matchedProd.name : matchedProd.name_en) : sug.productId}
                            </span>
                            <span className="text-[10px] text-purple-700 font-mono">
                              SKU: {matchedProd?.sku} · {Math.round(sug.confidence * 100)}% {isZh ? '匹配度' : 'Match'}
                            </span>
                          </div>
                        </div>

                        <p className="text-[11px] text-gray-600 leading-relaxed">
                          {isZh ? sug.reason : sug.reasonEn}
                        </p>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => onIgnoreAiSuggestion(sug.id)}
                            className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            {isZh ? '忽略' : 'Ignore'}
                          </button>
                          <button
                            type="button"
                            onClick={() => onConfirmAiSuggestion(sug.id)}
                            className="px-3.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                          >
                            {isZh ? '采纳' : 'Accept'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Danger Zone: Delete File */}
              <div className="pt-4 border-t border-gray-100">
                {confirmDelete ? (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-2.5">
                    <p className="text-xs font-bold text-rose-900">
                      {isZh ? '确定永久删除此文件？' : 'Delete this file permanently?'}
                    </p>
                    <p className="text-[11px] text-rose-700">
                      {isZh ? '删除文件将永久移除该文件及其所有商品关联。' : 'This will remove the file and all SKU bindings.'}
                    </p>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="px-3 py-1 rounded-lg bg-white border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        {isZh ? '取消' : 'Cancel'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteFile(source.id)
                          onClose()
                        }}
                        className="px-3.5 py-1 rounded-lg bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-xs font-semibold transition-colors cursor-pointer"
                      >
                        {isZh ? '删除' : 'Delete'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-[#D32F2F] hover:bg-[#FFF2F2] border border-[#FFCDD2] transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>{isZh ? '删除文件' : 'Delete File'}</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
