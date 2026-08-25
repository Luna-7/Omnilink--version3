'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

interface ProductCreateFooterProps {
  onSaveDraft: () => void
  onSaveAndPublish: () => void
  onCancel: () => void
  isSubmitting: boolean
  submitMode: 'draft' | 'active' | null
  disabled?: boolean
}

export function ProductCreateFooter({
  onSaveDraft,
  onSaveAndPublish,
  onCancel,
  isSubmitting,
  submitMode,
  disabled = false,
}: ProductCreateFooterProps) {
  const { isZh } = useLanguage()

  return (
    <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
      {/* 左侧取消 / 提示 */}
      <button
        type="button"
        onClick={onCancel}
        disabled={isSubmitting}
        className="px-4 py-2 text-xs font-semibold text-[#1C1C1C] hover:text-slate-900 hover:bg-slate-100 rounded-[4px] transition-colors cursor-pointer disabled:opacity-50 text-left sm:text-center"
      >
        {isZh ? '取消并关闭' : 'Cancel & Close'}
      </button>

      {/* 右侧动作组: 保存草稿 (Secondary) + 保存并上架 (Primary) */}
      <div className="flex items-center gap-3">
        {/* 保存草稿 - HP Secondary Button */}
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={disabled || isSubmitting}
          className="flex-1 sm:flex-none px-4 py-2 rounded-[4px] bg-[#FFFFFF] border border-[#D1D1D1] hover:bg-[#F7F7F7] hover:border-[#B0B0B0] text-[#1C1C1C] text-xs font-bold transition-all disabled:bg-[#E2E2E2] disabled:text-[#9E9E9E] disabled:border-transparent disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5 focus-visible:outline-2 focus-visible:outline-[#024AD8] focus-visible:outline-offset-2"
        >
          {isSubmitting && submitMode === 'draft' && (
            <Loader2 size={13} className="animate-spin text-[#1C1C1C]" />
          )}
          <span>{isSubmitting && submitMode === 'draft' ? (isZh ? '保存中...' : 'Saving...') : (isZh ? '保存草稿' : 'Save Draft')}</span>
        </button>

        {/* 保存并上架 - HP Primary Button (核心唯一主按钮) */}
        <button
          type="button"
          onClick={onSaveAndPublish}
          disabled={disabled || isSubmitting}
          className="flex-1 sm:flex-none px-5 py-2 rounded-[4px] bg-[#024AD8] hover:bg-[#003198] active:bg-[#00226B] text-[#FFFFFF] text-xs font-bold transition-all disabled:bg-[#E2E2E2] disabled:text-[#9E9E9E] disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5 shadow-xs focus-visible:outline-2 focus-visible:outline-[#024AD8] focus-visible:outline-offset-2"
        >
          {isSubmitting && submitMode === 'active' && (
            <Loader2 size={13} className="animate-spin text-white" />
          )}
          <span>{isSubmitting && submitMode === 'active' ? (isZh ? '上架中...' : 'Publishing...') : (isZh ? '保存并上架' : 'Save & Publish')}</span>
        </button>
      </div>
    </div>
  )
}
