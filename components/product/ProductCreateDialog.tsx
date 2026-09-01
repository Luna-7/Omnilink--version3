'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, AlertCircle, LayoutTemplate } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { ProductBasicInfo } from './create/ProductBasicInfo'
import { ProductAttributesPanel, type AttributeRow } from './create/ProductAttributesPanel'
import { VariantMatrixTable, type VariantMatrixRow } from './create/VariantMatrixTable'
import { ProductMediaUpload } from './create/ProductMediaUpload'
import { ProductCreateFooter } from './create/ProductCreateFooter'
import type { BasicProductFormData, ImageFileItem } from './create/types'
import { getCategoryTemplate } from '@/lib/product/category-templates'

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
  // Product traits (spec table) and sale variants (SKU matrix) share ONE input
  // surface; each row carries a role and is split into the right payload field
  // at submit time.
  const [attributeRows, setAttributeRows] = useState<AttributeRow[]>([])
  const [variantMatrixRows, setVariantMatrixRows] = useState<VariantMatrixRow[]>([])
  const [images, setImages] = useState<ImageFileItem[]>([])

  // Category template prefill state
  const appliedTemplateRef = useRef<string | null>(null)
  const [templateNotice, setTemplateNotice] = useState<string | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMode, setSubmitMode] = useState<'draft' | 'active' | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleOpen = () => {
    setFormData(INITIAL_FORM_DATA)
    setAttributeRows([])
    setVariantMatrixRows([])
    setImages([])
    setErrorMessage(null)
    appliedTemplateRef.current = null
    setTemplateNotice(null)
    setIsOpen(true)
  }

  /** The same slug rule used when shipping option codes to the server. */
  const slugifyKey = (key: string) => key.trim().toLowerCase().replace(/\s+/g, '_')

  /**
   * Category template prefill (Taobao/Shopify-style): once the merchant picks
   * a category, the matching template pre-fills trait rows (spec-table facts)
   * and variant rows (purchasable axes with sensible default values).
   *
   * Merge rules:
   *  - Only keys not already present are appended — anything the merchant
   *    typed is never overwritten.
   *  - Re-selecting the same category is a no-op (appliedTemplateRef guard).
   *  - Switching categories appends the new template's missing rows.
   */
  useEffect(() => {
    const categoryKey = formData.categoryId || formData.category
    if (!categoryKey) return
    const template = getCategoryTemplate(categoryKey)
    if (!template) return
    if (appliedTemplateRef.current === template.id) return
    appliedTemplateRef.current = template.id

    setAttributeRows((prev) => {
      const existingKeys = new Set(prev.map((r) => r.key))
      const additions: AttributeRow[] = []

      for (const field of template.fields) {
        if (existingKeys.has(field.key)) continue
        additions.push({
          id: `tpl_${template.id}_${field.key}`,
          role: 'trait',
          key: field.key,
          label: isZh ? field.nameZh : field.nameEn,
          value: '',
          values: [],
          unit: field.unit,
          placeholder: isZh ? field.placeholderZh : field.placeholderEn,
        })
      }

      for (const preset of template.variantPresets ?? []) {
        if (existingKeys.has(preset.code)) continue
        additions.push({
          id: `tpl_${template.id}_${preset.code}`,
          role: 'variant',
          key: preset.code,
          label: isZh ? preset.nameZh : preset.nameEn,
          value: '',
          values: [...preset.defaultValues],
        })
      }

      if (additions.length === 0) return prev

      const traitCount = additions.filter((r) => r.role === 'trait').length
      const variantCount = additions.length - traitCount
      setTemplateNotice(
        isZh
          ? `已按「${template.titleZh}」品类模板预填 ${traitCount} 个商品特征${variantCount > 0 ? `、${variantCount} 个销售规格` : ''}，可直接修改或删除`
          : `Prefilled ${traitCount} traits${variantCount > 0 ? ` and ${variantCount} variant axes` : ''} from the "${template.titleEn}" template — edit freely`,
      )
      return [...prev, ...additions]
    })
  }, [formData.category, formData.categoryId, isZh])

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
      // 1. Split the unified attribute rows into the two payload fields:
      //      trait   -> canonical attributes (storefront spec table)
      //      variant -> product options (expanded into SKUs server-side)
      const traitAttributes = attributeRows.filter(
        (r) => r.role === 'trait' && r.value.trim().length > 0,
      )
      const variantOptions = attributeRows
        .filter((r) => r.role === 'variant' && r.values.length > 0)
        .map((r) => ({
          name: r.label.trim(),
          // Server-side `normalizeOptionCode(option.code)` calls `.trim()` on
          // this field, so it MUST be present — a missing code crashes every
          // variant creation with a TypeError. Derived from the stable slug.
          code: slugifyKey(r.key),
          values: r.values,
        }))

      // Per-SKU overrides from the variant matrix (price/stock/SKU per
      // combination). The server matches each entry to its generated
      // combination via normalized option_values, so no client key is needed.
      const variantOverrides =
        variantOptions.length > 0 && variantMatrixRows.length > 0
          ? variantMatrixRows.map((row) => ({
              option_values: row.optionValues,
              sku: row.sku.trim() || undefined,
              price: row.price.trim() ? parseFloat(row.price) : undefined,
              inventory: row.inventory.trim() ? parseInt(row.inventory, 10) : undefined,
            }))
          : undefined

      // 2. Build canonical attributes payload
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
        ...traitAttributes.map((a) => ({
          fieldKey: a.key.trim().toLowerCase().replace(/\s+/g, '_'),
          label: a.label.trim(),
          value: a.value.trim(),
          unit: a.unit?.trim() || null,
          type: 'text' as const,
          source: 'manual' as const,
          confidence: 1.0,
          isStandard: true,
        })),
      ]

      // 3. Call Product Creation API
      const res = await fetch('/api/merchant/products', {
        method: 'POST',
        // Same-origin requests send cookies by default, but being explicit
        // guards against any cross-origin/proxy deployment where credentials
        // would otherwise be dropped (a classic silent 401 cause).
        credentials: 'include',
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
          variants: variantOverrides,
          raw_data: {
            category: formData.category,
            category_id: formData.categoryId || undefined,
            origin: formData.origin.trim(),
            attributes: validCanonicalAttributes,
          },
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({} as { error?: string; code?: string }))
        // Surface the server's diagnostic code so we can tell apart
        //   NO_SESSION                  -> cookie didn't reach the API
        //   AUTH_CLIENT_INIT_FAILED     -> server-side env is misconfigured
        //   STORE_NOT_FOUND / 4xx codes -> product/data issue (rare)
        // The previous "throw new Error(errData.error)" swallowed `code`,
        // which made the 401 indistinguishable from any other failure.
        const code = errData.code || `HTTP_${res.status}`
        const baseMsg = errData.error || (isZh ? '创建商品失败，请重试' : 'Failed to create product')
        let friendly = baseMsg
        if (res.status === 401) {
          friendly = isZh
            ? '会话已失效或未送达服务器（code: ' + code + '）。请刷新页面或重新登录；若多域名访问，请确认当前域名与登录域名一致。'
            : 'Session is missing or expired (code: ' + code + '). Reload or sign in again; if you use multiple hostnames, the cookie must be set on the same hostname you are saving from.'
        } else if (code === 'AUTH_CLIENT_INIT_FAILED') {
          friendly = isZh
            ? '服务端 Supabase 配置缺失（env 未注入）。请检查部署环境的 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY。'
            : 'Server Supabase client failed to initialize (missing env). Check NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY on the deployment.'
        }
        throw new Error(friendly)
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

            {/* Modal Body - 01 商品信息 / 02 商品属性（特征+规格统一入口） / 03 商品图片 */}
            <div className="p-5 overflow-y-auto space-y-6 flex-1">
              {/* 01 商品信息 */}
              <ProductBasicInfo
                formData={formData}
                onChange={(updates) => setFormData((prev) => ({ ...prev, ...updates }))}
                disabled={isSubmitting}
              />

              {/* 品类模板预填提示 */}
              {templateNotice && (
                <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-[4px] bg-[#EFF4FF] border border-[#024AD8]/20 text-[11px] text-[#024AD8]">
                  <div className="flex items-center gap-1.5">
                    <LayoutTemplate size={13} className="shrink-0" />
                    <span className="font-medium">{templateNotice}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTemplateNotice(null)}
                    className="text-[#024AD8]/60 hover:text-[#024AD8] cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                </div>
              )}

              {/* 02 商品属性（商品特征 + 销售规格，统一入口） */}
              <ProductAttributesPanel
                rows={attributeRows}
                onChange={setAttributeRows}
                disabled={isSubmitting}
              />

              {/* 02b 变体矩阵（有销售规格时出现，逐 SKU 定价/库存） */}
              {attributeRows.some((r) => r.role === 'variant' && r.values.length > 0) && (
                <VariantMatrixTable
                  axes={attributeRows
                    .filter((r) => r.role === 'variant' && r.values.length > 0)
                    .map((r) => ({
                      code: slugifyKey(r.key),
                      name: r.label,
                      values: r.values,
                    }))}
                  rows={variantMatrixRows}
                  onChange={setVariantMatrixRows}
                  basePrice={formData.price}
                  baseInventory={formData.inventory || '0'}
                  baseSku={formData.sku}
                  currency={formData.currency}
                  disabled={isSubmitting}
                />
              )}

              {/* 03 商品图片 */}
              <ProductMediaUpload
                images={images}
                onChange={setImages}
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
