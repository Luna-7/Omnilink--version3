'use client'

import React from 'react'
import { FileText } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { ProductDocumentsSection } from '@/components/products/ProductDocumentsSection'

interface ProductKnowledgeSectionProps {
  productId?: string
  onOpenPreview?: (title: string) => void
}

export function ProductKnowledgeSection({ productId, onOpenPreview }: ProductKnowledgeSectionProps) {
  const { isZh } = useLanguage()

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
      {/* Real Functional Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[4px] bg-blue-50 text-[#024AD8] flex items-center justify-center font-mono font-bold text-xs">
            06
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {isZh ? '产品资料与关联文档' : 'Product Documents'}
            </h2>
          </div>
        </div>

        <div className="px-2.5 py-1 rounded-[4px] bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-600 flex items-center gap-1.5">
          <FileText size={13} />
          <span>{isZh ? '资料文档管理' : 'Doc Manager'}</span>
        </div>
      </div>

      {/* Real Feature: Product Documents Upload */}
      <ProductDocumentsSection productId={productId} />
    </div>
  )
}
