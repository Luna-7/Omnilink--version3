'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  X,
  Search,
  Check,
  Link as LinkIcon,
} from 'lucide-react'
import { DEMO_PRODUCTS } from '@/lib/products/demo-data'
import type { KnowledgeFileSource, KnowledgeProductBinding } from './types'

interface AssociateProductModalProps {
  isOpen: boolean
  onClose: () => void
  source: KnowledgeFileSource | null
  bindings: KnowledgeProductBinding[]
  onToggleBinding: (sourceId: string, productId: string) => void
  isZh: boolean
}

export function AssociateProductModal({
  isOpen,
  onClose,
  source,
  bindings,
  onToggleBinding,
  isZh,
}: AssociateProductModalProps) {
  const [searchQuery, setSearchQuery] = useState('')

  if (!isOpen || !source) return null

  // Find currently bound product IDs for this source
  const boundProductIds = new Set(
    bindings.filter((b) => b.sourceId === source.id).map((b) => b.productId)
  )

  const filteredProducts = DEMO_PRODUCTS.filter((product) => {
    const q = searchQuery.toLowerCase()
    return (
      product.name.toLowerCase().includes(q) ||
      product.name_en.toLowerCase().includes(q) ||
      product.sku.toLowerCase().includes(q) ||
      product.category.toLowerCase().includes(q)
    )
  })

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-xs"
        />

        {/* Dialog Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-2xl p-5 shadow-2xl border border-gray-200/80 z-10 max-h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-3 border-b border-gray-100">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <LinkIcon size={15} className="text-gray-900" />
                <h3 className="text-sm font-bold text-gray-900">
                  {isZh ? '关联商品' : 'Associate Products'}
                </h3>
              </div>
              <p className="text-xs text-gray-500 truncate max-w-[340px]">
                {source.name}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Search Box */}
          <div className="relative my-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isZh ? '搜索商品名称或 SKU...' : 'Search product or SKU...'}
              className="w-full h-8 pl-8 pr-3 rounded-lg bg-gray-50 border border-gray-200/80 text-xs text-gray-900 focus:outline-none focus:bg-white focus:border-gray-400 transition-colors"
            />
          </div>

          {/* Products List (Combobox multi-select) */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[340px]">
            {filteredProducts.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">
                {isZh ? '无匹配商品' : 'No products found'}
              </div>
            ) : (
              filteredProducts.map((product) => {
                const isBound = boundProductIds.has(product.id)
                return (
                  <div
                    key={product.id}
                    onClick={() => onToggleBinding(source.id, product.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isBound
                        ? 'bg-purple-50/60 border-purple-200 shadow-2xs'
                        : 'bg-white hover:bg-gray-50/80 border-gray-200/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Product Thumbnail */}
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-9 h-9 rounded-lg object-cover border border-gray-200/80 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-gray-900 block truncate">
                          {isZh ? product.name : product.name_en}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[10px] text-gray-500 font-semibold">
                            {product.sku}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {isZh ? product.category : product.category_en}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Checkbox indicator */}
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-all shrink-0 ${
                        isBound
                          ? 'bg-gray-900 text-white'
                          : 'border border-gray-300 text-transparent hover:border-gray-500'
                      }`}
                    >
                      <Check size={12} className={isBound ? 'opacity-100' : 'opacity-0'} />
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer - Strictly 取消 / 确定 */}
          <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {boundProductIds.size} {isZh ? '个已关联' : 'selected'}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200/80 text-gray-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                {isZh ? '取消' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-gray-900 hover:bg-black text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                {isZh ? '确定' : 'Confirm'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
