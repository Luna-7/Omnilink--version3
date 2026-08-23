'use client'

import React, { useState } from 'react'
import { createStoreAction } from '@/app/actions/onboarding'
import { StoreAvatarUpload } from './StoreAvatarUpload'
import { ProductCategorySelector } from './ProductCategorySelector'
import { ArrowRight, Loader2, Store } from 'lucide-react'

export function StoreCreateForm() {
  const [storeName, setStoreName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [productCategory, setProductCategory] = useState('3C数码 & 消费电子')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!storeName.trim()) {
      setError('请填写店铺名称')
      return
    }

    setIsSubmitting(true)
    setError('')

    const formData = new FormData()
    formData.set('store_name', storeName.trim())
    formData.set('industry_category', productCategory)
    formData.set('logo_url', logoUrl)
    formData.set('description', '')
    formData.set('currency', 'CNY')

    try {
      const res = await createStoreAction(formData)
      if (res?.success && res?.redirectUrl) {
        window.location.href = res.redirectUrl
        return
      }
      if (res?.error) {
        setError(res.error)
        setIsSubmitting(false)
      }
    } catch (err: any) {
      if (
        err?.message === 'NEXT_REDIRECT' ||
        err?.message?.includes('NEXT_REDIRECT') ||
        err?.digest?.startsWith('NEXT_REDIRECT')
      ) {
        window.location.href = '/dashboard'
        return
      }
      setError(err instanceof Error ? err.message : '创建店铺失败，请重试')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/90 shadow-[0_12px_36px_rgba(0,0,0,0.04)]">
        <div className="mb-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            设置你的专属店铺
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. 上传店铺头像 / Logo */}
          <StoreAvatarUpload value={logoUrl} onChange={setLogoUrl} />

          {/* 2. 店铺名称 */}
          <div className="space-y-1.5">
            <label htmlFor="store_name" className="text-xs font-bold text-[#111827] flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Store size={13} className="text-[#E11D48]" />
                <span>店铺名称 (Store Name)</span>
                <span className="text-rose-500">*</span>
              </span>
              <span className="text-[10px] font-normal text-[#9CA3AF]">
                {storeName.length}/40
              </span>
            </label>
            <input
              type="text"
              id="store_name"
              name="store_name"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              required
              maxLength={40}
              placeholder="例如：极光数码旗舰店"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FB7185] focus:ring-4 focus:ring-[#FB7185]/15 outline-none text-sm text-[#111827] placeholder-gray-400 bg-[#FAFAFC] focus:bg-white transition-all font-medium"
            />
          </div>

          {/* 3. 店铺主营行业 (Primary Industry) */}
          <ProductCategorySelector
            value={productCategory}
            onChange={setProductCategory}
          />

          {/* 错误提示 */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-4 py-3 rounded-xl animate-in fade-in flex items-center gap-2">
              <span className="font-bold">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* 提交按钮 */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !storeName.trim()}
              className="w-full py-3.5 px-6 rounded-[4px] bg-[#024AD8] hover:bg-[#003198] active:bg-[#00226B] text-white text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-[#E2E2E2] disabled:text-[#9E9E9E] disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[#024AD8] focus-visible:outline-offset-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>正在初始化店铺节点与数据库…</span>
                </>
              ) : (
                <>
                  <span>完成初始化设置 (Dashboard)</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
