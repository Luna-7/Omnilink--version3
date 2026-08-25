'use client'

import React, { useRef } from 'react'
import Image from 'next/image'
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import type { ImageFileItem } from './types'

interface ProductMediaUploadProps {
  images: ImageFileItem[]
  onChange: (images: ImageFileItem[]) => void
  disabled?: boolean
  maxImages?: number
}

export function ProductMediaUpload({
  images,
  onChange,
  disabled = false,
  maxImages = 8,
}: ProductMediaUploadProps) {
  const { isZh } = useLanguage()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSelectFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const remainingSlots = maxImages - images.length
    if (remainingSlots <= 0) return

    const incoming = Array.from(files).slice(0, remainingSlots)
    const valid = incoming.filter((file) => {
      const isImage = file.type.startsWith('image/')
      const isUnderLimit = file.size <= 10 * 1024 * 1024 // 10MB
      return isImage && isUnderLimit
    })

    const newItems: ImageFileItem[] = valid.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }))

    onChange([...images, ...newItems])
  }

  const handleRemoveImage = (index: number) => {
    const target = images[index]
    if (target?.previewUrl) {
      URL.revokeObjectURL(target.previewUrl)
    }
    onChange(images.filter((_, idx) => idx !== index))
  }

  return (
    <div className="space-y-3.5">
      {/* 模块标题与指引说明 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-slate-100 gap-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#EFF4FF] text-[#024AD8] flex items-center justify-center font-bold text-xs">
            03
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {isZh ? '商品图片' : 'Product Media'}
            </h3>
          </div>
        </div>
        <span className="text-[11px] text-slate-400">
          {isZh ? `支持拖拽或选择上传，首张默认为商品主图（${images.length}/${maxImages}）` : `Drag & drop or click to upload, 1st is cover (${images.length}/${maxImages})`}
        </span>
      </div>

      {/* 隐藏的文件上传 input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp,image/jpg"
        onChange={(e) => {
          handleSelectFiles(e.target.files)
          e.target.value = ''
        }}
        className="hidden"
        disabled={disabled || images.length >= maxImages}
      />

      {/* 图片预览列表与上传区域 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {images.map((item, idx) => (
          <div
            key={item.previewUrl}
            className="group relative aspect-square rounded-[4px] border border-slate-200 overflow-hidden bg-slate-50 transition-all"
          >
            <Image
              src={item.previewUrl}
              alt={`Product preview ${idx + 1}`}
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
              unoptimized
            />

            {/* 主图角标 */}
            {idx === 0 && (
              <span className="absolute top-1.5 left-1.5 bg-[#024AD8] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-[2px] shadow-xs">
                {isZh ? '主图' : 'Cover'}
              </span>
            )}

            {/* 删除按钮 */}
            {!disabled && (
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-[2px] bg-black/60 hover:bg-[#D32F2F] text-white flex items-center justify-center transition-colors cursor-pointer"
                title={isZh ? '移除图片' : 'Remove image'}
              >
                <X size={12} />
              </button>
            )}

            <div className="absolute bottom-0 inset-x-0 bg-black/40 text-white text-[10px] px-1.5 py-0.5 truncate">
              {item.file.name}
            </div>
          </div>
        ))}

        {/* 待上传卡片/Dropzone */}
        {images.length < maxImages && (
          <div
            onClick={() => {
              if (!disabled) fileInputRef.current?.click()
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              if (!disabled) handleSelectFiles(e.dataTransfer.files)
            }}
            className={`aspect-square rounded-[4px] border-2 border-dashed flex flex-col items-center justify-center p-3 text-center transition-all cursor-pointer select-none ${
              disabled
                ? 'opacity-50 border-slate-200 bg-slate-50 cursor-not-allowed'
                : 'border-slate-300 hover:border-[#024AD8] bg-slate-50/50 hover:bg-[#EFF4FF]/30'
            }`}
          >
            <div className="w-8 h-8 rounded-[4px] bg-white border border-slate-200 text-slate-400 flex items-center justify-center mb-1.5 shadow-2xs">
              <UploadCloud size={16} className="text-[#024AD8]" />
            </div>
            <span className="text-xs font-bold text-slate-800">
              {isZh ? '上传图片' : 'Upload Images'}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              {isZh ? 'JPG, PNG, WebP ≤10M' : 'JPG, PNG, WebP ≤10M'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
