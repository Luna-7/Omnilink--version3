'use client'

import React, { RefObject } from 'react'
import { Image as ImageIcon, Shield } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import {
  ProductMediaUploader,
  ProductMediaUploaderRef,
  ExistingAsset,
} from '@/components/products/ProductMediaUploader'

interface ProductMediaSectionProps {
  productId?: string
  existingAssets?: ExistingAsset[]
  mediaUploaderRef: RefObject<ProductMediaUploaderRef | null>
  onFilesChange?: (files: File[]) => void
  onUploadSuccess?: () => void
}

export function ProductMediaSection({
  productId,
  existingAssets = [],
  mediaUploaderRef,
  onFilesChange,
  onUploadSuccess,
}: ProductMediaSectionProps) {
  const { isZh } = useLanguage()

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[4px] bg-blue-50 text-[#024AD8] flex items-center justify-center font-mono font-bold text-xs">
            02
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {isZh ? '商品展示媒体' : 'Product Media'}
            </h2>
          </div>
        </div>
      </div>

      <ProductMediaUploader
        ref={mediaUploaderRef}
        productId={productId}
        existingAssets={existingAssets}
        onFilesChange={onFilesChange}
        onUploadSuccess={onUploadSuccess}
        isZh={isZh}
      />
    </div>
  )
}
