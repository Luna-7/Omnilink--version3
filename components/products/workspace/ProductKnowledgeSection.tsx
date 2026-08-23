'use client'

import React from 'react'
import { BookOpen, AlertCircle } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { ProductDocumentsSection } from '@/components/products/ProductDocumentsSection'

/**
 * BACKEND CONTRACT REQUEST:
 * 
 * To integrate full server-side Product Knowledge ingestion (Docling parsing + Vector DB indexing):
 * POST /api/v1/merchant/products/:id/knowledge/documents
 * Payload: FormData { file: File, visibility: 'public' | 'private', doc_category: 'manual' | 'spec_sheet' | 'certificate' }
 */

interface ProductKnowledgeSectionProps {
  productId?: string
}

export function ProductKnowledgeSection({ productId }: ProductKnowledgeSectionProps) {
  const { isZh } = useLanguage()

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[4px] bg-blue-50 text-[#024AD8] flex items-center justify-center font-mono font-bold text-xs">
            08
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {isZh ? '产品知识库与文档资料 (Product Knowledge)' : 'Product Knowledge'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isZh
                ? '上传产品说明书、认证资质、检测报告等文档，自动关联至商品 Agent 向量索引'
                : 'Upload user manuals, certifications, and test reports to automatically bind with LLM Agent reasoning'}
            </p>
          </div>
        </div>

        <div className="px-2.5 py-1 rounded-lg bg-violet-50 border border-violet-200 text-[11px] font-semibold text-violet-700 flex items-center gap-1">
          <BookOpen size={12} />
          <span>{isZh ? '知识域: product-knowledge' : 'Domain: product-knowledge'}</span>
        </div>
      </div>

      <ProductDocumentsSection productId={productId} />
    </div>
  )
}
