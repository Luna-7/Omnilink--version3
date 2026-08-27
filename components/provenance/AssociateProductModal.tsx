'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { X, PackagePlus, Check } from 'lucide-react'
import { AssociatedProduct } from './types'
import { AVAILABLE_CATALOG_PRODUCTS } from './mockData'

interface AssociateProductModalProps {
  isOpen: boolean
  onClose: () => void
  alreadyAssociatedIds: string[]
  onAssociate: (product: AssociatedProduct) => void
}

export function AssociateProductModal({
  isOpen,
  onClose,
  alreadyAssociatedIds,
  onAssociate,
}: AssociateProductModalProps) {
  const [selectedProd, setSelectedProd] = useState<AssociatedProduct | null>(null)

  if (!isOpen) return null

  const availableProducts = AVAILABLE_CATALOG_PRODUCTS.filter(
    (p) => !alreadyAssociatedIds.includes(p.id)
  )

  const handleConfirm = () => {
    if (selectedProd) {
      onAssociate(selectedProd)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[8px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackagePlus size={16} className="text-[#024AD8]" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              关联已有商品
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-[3px] flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-3 flex-1 text-xs">
          <p className="text-slate-500">
            选择店铺中已有商品建立出处映射关系：
          </p>

          {availableProducts.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              店铺中的全部可用商品均已建立关联。
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {availableProducts.map((p) => {
                const isSelected = selectedProd?.id === p.id
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProd(p)}
                    className={`p-3 rounded-[4px] border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#024AD8] bg-blue-50/40 dark:bg-blue-950/30 ring-1 ring-[#024AD8]'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[3px] overflow-hidden relative shrink-0 border border-slate-200 dark:border-slate-700">
                        <Image
                          src={p.image}
                          alt={p.name}
                          fill
                          className="object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          SKU: {p.sku} · ¥{p.price}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#024AD8] text-white flex items-center justify-center">
                        <Check size={12} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 bg-slate-50/50 dark:bg-slate-850/50">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-3 rounded-[4px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
          >
            取消
          </button>
          <button
            type="button"
            disabled={!selectedProd}
            onClick={handleConfirm}
            className="h-8 px-4 rounded-[4px] bg-[#024AD8] hover:bg-[#003198] active:bg-[#00226B] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-semibold transition-all cursor-pointer"
          >
            建立关联
          </button>
        </div>
      </div>
    </div>
  )
}
