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
          <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold text-xs">
            2
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {isZh ? '商品展示媒体 (Product Media)' : 'Product Media'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isZh
                ? '商品公开展示与 AI 视觉理解所使用的资产'
                : 'Assets used for public storefront display and AI visual recognition'}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-600">
          <Shield size={12} className="text-emerald-600" />
          <span>{isZh ? '自动生成 WebP & 隐私脱敏' : 'Auto WebP & Privacy Protected'}</span>
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
