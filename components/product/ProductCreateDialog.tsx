'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, AlertCircle } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { ProductBasicInfo } from './create/ProductBasicInfo'
import { ProductEnhancementFields } from './create/ProductEnhancementFields'
import { ProductMediaUpload } from './create/ProductMediaUpload'
import { ProductVariantEntry, type VariantOptionDraft } from './create/ProductVariantEntry'
import { ProductCreateFooter } from './create/ProductCreateFooter'
import type { BasicProductFormData, EnhancementAttributeItem, ImageFileItem } from './create/types'

const INITIAL_FORM_DATA: BasicProductFormData = {
  title: '',
  sku: '',
  category: '',
  categoryId: null,
  price: '',
  currency: 'CNY',
  origin: '',
  inventory: '',
  description: '',
}

export function ProductCreateDialog() {
  const router = useRouter()
  const { isZh } = useLanguage()

  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<BasicProductFormData>(INITIAL_FORM_DATA)
  const [enhancementAttributes, setEnhancementAttributes] = useState<EnhancementAttributeItem[]>([])
  const [images, setImages] = useState<ImageFileItem[]>([])
  const [variantOptions, setVariantOptions] = useState<VariantOptionDraft[]>([])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMode, setSubmitMode] = useState<'draft' | 'active' | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleOpen = () => {
    setFormData(INITIAL_FORM_DATA)
    setEnhancementAttributes([])
    setImages([])
    setVariantOptions([])
    setErrorMessage(null)
    setIsOpen(true)
  }

  const handleClose = () => {
    if (isSubmitting) return
    // Clean up preview object URLs
    images.forEach((img) => {
      if (img.previewUrl) URL.revokeObjectURL(img.previewUrl)
    })
    setIsOpen(false)
  }

  const validateForm = (): boolean => {
    setErrorMessage(null)

    if (!formData.title.trim()) {
      setErrorMessage(isZh ? '请填写商品名称' : 'Please enter a product name')
      return false
    }

    if (!formData.sku.trim()) {
      setErrorMessage(isZh ? '请填写商品 SKU' : 'Please enter a SKU')
      return false
    }

    if (!formData.category.trim()) {
      setErrorMessage(isZh ? '请选择商品分类' : 'Please select a category')
      return false
    }

    const priceNum = parseFloat(formData.price)
    if (isNaN(priceNum) || priceNum < 0) {
      setErrorMessage(isZh ? '请填写有效的商品售价' : 'Please enter a valid price')
      return false
    }

    if (!formData.origin.trim()) {
      setErrorMessage(isZh ? '请填写商品产地' : 'Please enter the country of origin')
      return false
    }

    return true
  }

  const handleSubmit = async (targetStatus: 'draft' | 'active') => {
    if (!validateForm()) return

    setIsSubmitting(true)
    setSubmitMode(targetStatus)
    setErrorMessage(null)

    try {
      // 1. Build canonical attributes payload
      const validCanonicalAttributes = [
        {
          fieldKey: 'country_of_origin',
          label: isZh ? '产地' : 'Country of Origin',
          value: formData.origin.trim(),
          type: 'text' as const,
          unit: null,
          source: 'manual' as const,
          confidence: 1.0,
          isStandard: true,
        },
        ...enhancementAttributes
          .filter((a) => a.value.trim().length > 0)
          .map((a) => ({
            fieldKey: a.key.trim().toLowerCase().replace(/\s+/g, '_'),
            label: a.label.trim(),
            value: a.value.trim(),
            unit: a.unit?.trim() || null,
            type: a.type || ('text' as const),
            source: 'manual' as const,
            confidence: 1.0,
            isStandard: true,
          })),
      ]

      // 2. Call Product Creation API
      const res = await fetch('/api/merchant/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.title.trim(),
          sku: formData.sku.trim(),
          price: parseFloat(formData.price) || 0,
          currency: formData.currency,
          inventory: formData.inventory ? parseInt(formData.inventory, 10) : 0,
          description: formData.description.trim() || undefined,
          status: targetStatus,
          category: formData.category,
          category_id: formData.categoryId || undefined,
          origin: formData.origin.trim(),
          attributes: validCanonicalAttributes,
          options: variantOptions.length > 0 ? variantOptions : undefined,
          raw_data: {
            category: formData.category,
            category_id: formData.categoryId || undefined,
            origin: formData.origin.trim(),
            attributes: validCanonicalAttributes,
          },
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || (isZh ? '创建商品失败，请重试' : 'Failed to create product'))
      }

      const resData = await res.json()
      const createdProduct = resData.product || resData
      const createdId = createdProduct?.id

      if (!createdId) {
        throw new Error(isZh ? '无法获取新建商品 ID' : 'Could not retrieve created product ID')
      }

      // NOTE (P0, 2026-08-26): Origin is no longer faked as a `component_type = assembly`
      // entry on the product composition table. Origin lives on `products.raw_data.origin`
      // (canonical) and on the canonical attribute `country_of_origin` (line ~101 above).
      // A future Product Knowledge provenance task may introduce a real composition domain
      // for multi-component products; for now, do NOT POST /composition here.

      // 4. Upload product images sequentially if provided
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          try {
            const fileItem = images[i]
            const imgFormData = new FormData()
            imgFormData.append('file', fileItem.file)
            imgFormData.append('is_primary', i === 0 ? 'true' : 'false')
            imgFormData.append('position', String(i))

            await fetch(`/api/merchant/media/upload?product_id=${createdId}`, {
              method: 'POST',
              body: imgFormData,
            })
          } catch (uploadErr) {
            console.warn(`Image ${i + 1} upload note:`, uploadErr)
          }
        }
      }

      // 5. Close dialog and redirect to product edit/detail page
      handleClose()
      router.push(`/dashboard/products/${createdId}/edit`)
      router.refresh()
    } catch (err) {
      console.error('Product creation error:', err)
      setErrorMessage(err instanceof Error ? err.message : (isZh ? '保存失败，请检查必填项' : 'Save failed, please check required fields'))
    } finally {
      setIsSubmitting(false)
      setSubmitMode(null)
    }
  }

  return (
    <>
      {/* 页面触发按钮 - HP Primary Button 规范 */}
      <button
        type="button"
        id="btn-open-create-product"
        onClick={handleOpen}
        className="px-4 py-2 rounded-[4px] bg-[#024AD8] hover:bg-[#003198] active:bg-[#00226B] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#024AD8] focus-visible:outline-offset-2"
      >
        <Plus size={15} />
        <span>{isZh ? '新建商品' : 'New Product'}</span>
      </button>

      {/* 极简商品创建模态框 (Minimal, Quiet, Professional) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div
            className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-heading">
                  {isZh ? '新建商品' : 'Create New Product'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isZh ? '先让商品成立，详情与复杂规格可在后续逐步完善。' : 'Make the product valid first; enrich specifications later.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="w-8 h-8 rounded-[4px] text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                title={isZh ? '关闭' : 'Close'}
              >
                <X size={18} />
              </button>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mx-5 mt-4 p-3 rounded-[4px] bg-[#FFF2F2] border border-[#FFCDD2] flex items-center gap-2 text-xs text-[#D32F2F] shrink-0">
                <AlertCircle size={15} className="shrink-0" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Modal Body - 仅保留 01 商品信息 / 02 增强信息 / 03 商品图片 / 规格入口 */}
            <div className="p-5 overflow-y-auto space-y-6 flex-1">
              {/* 01 商品信息 */}
              <ProductBasicInfo
                formData={formData}
                onChange={(updates) => setFormData((prev) => ({ ...prev, ...updates }))}
                disabled={isSubmitting}
              />

              {/* 02 增强信息 */}
              <ProductEnhancementFields
                attributes={enhancementAttributes}
                onChange={setEnhancementAttributes}
                disabled={isSubmitting}
              />

              {/* 03 商品图片 */}
              <ProductMediaUpload
                images={images}
                onChange={setImages}
                disabled={isSubmitting}
              />

              {/* 轻量规格提示入口 */}
              <ProductVariantEntry
                options={variantOptions}
                onChange={setVariantOptions}
                disabled={isSubmitting}
              />
            </div>

            {/* 04 底部操作栏 */}
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 shrink-0">
              <ProductCreateFooter
                onSaveDraft={() => handleSubmit('draft')}
                onSaveAndPublish={() => handleSubmit('active')}
                onCancel={handleClose}
                isSubmitting={isSubmitting}
                submitMode={submitMode}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
