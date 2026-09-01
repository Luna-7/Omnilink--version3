'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

import { ProductIdentitySection } from './ProductIdentitySection'
import { ProductMediaSection } from './ProductMediaSection'
import { ProductCommercialSection } from './ProductCommercialSection'
import { ProductDescriptionSection } from './ProductDescriptionSection'
import { ProductKnowledgeSection } from './ProductKnowledgeSection'
import { ProductRelationsSection } from './ProductRelationsSection'
import { ProductAttributesSection, type ProductAttributeValue } from './ProductAttributesSection'
import { ProductVariantsSection } from './ProductVariantsSection'
import { FuturePreviewModal } from './FuturePreviewModal'

import { ProductMediaUploaderRef, ExistingAsset } from '@/components/products/ProductMediaUploader'
import type { ProductOption, ProductVariant } from '@/lib/products/variants/types'
import type { ProductRelation } from '@/lib/products/product-relations'
import { createProductSaveController, type ProductSaveSnapshot } from '@/lib/products/product-save-state'
import { getProductSaveMessage } from '@/lib/products/product-save-errors'
import { saveProductManagement } from '@/lib/products/product-management-save'
import type { ProductManagementModel } from '@/lib/products/product-management-model'
import { DEMO_PRODUCTS } from '@/lib/products/demo-data'

interface ProductWorkspaceProps {
  productId?: string
  initialData?: {
    name: string
    description?: string
    price: number
    currency: string
    inventory: number
    sku?: string
    category?: string
    categoryId?: string | null
    status?: 'active' | 'draft' | 'archived'
    options?: ProductOption[]
    variants?: ProductVariant[]
    existingAssets?: ExistingAsset[]
  }
}

export function ProductWorkspace({ productId, initialData }: ProductWorkspaceProps) {
  const router = useRouter()
  const { isZh } = useLanguage()

  // Match demo product for instant zero-lag rendering
  const demoFallback = React.useMemo(() => {
    if (!productId) return undefined
    return DEMO_PRODUCTS.find(
      (p) => p.id === productId || p.sku.toLowerCase() === productId.toLowerCase()
    )
  }, [productId])

  // Primary form fields
  const [name, setName] = useState(initialData?.name || demoFallback?.name || '')
  const [sku, setSku] = useState(initialData?.sku || demoFallback?.sku || '')
  const [category, setCategory] = useState(initialData?.category || demoFallback?.category || '')
  const [categoryId, setCategoryId] = useState<string | null>(initialData?.categoryId || null)
  const [price, setPrice] = useState<string | number>(initialData?.price ?? demoFallback?.price ?? '')
  const [currency, setCurrency] = useState(initialData?.currency || demoFallback?.currency || 'CNY')
  const [inventory, setInventory] = useState<string | number>(initialData?.inventory ?? demoFallback?.inventory ?? 100)
  const [description, setDescription] = useState(initialData?.description || demoFallback?.description || '')
  const [status, setStatus] = useState<'active' | 'draft' | 'archived'>(initialData?.status || demoFallback?.status || 'active')

  // Options & Variants
  const [options, setOptions] = useState<ProductOption[]>(() => {
    if (initialData?.options && initialData.options.length > 0) {
      return initialData.options
    }
    if (demoFallback?.options && demoFallback.options.length > 0) {
      return demoFallback.options.map((opt, idx) => ({
        id: opt.id,
        product_id: productId || '',
        name: opt.name,
        code: opt.code,
        position: idx,
        values: opt.values,
        created_at: new Date().toISOString(),
      }))
    }
    return []
  })
  const [variants, setVariants] = useState<ProductVariant[]>(() => {
    if (initialData?.variants && initialData.variants.length > 0) {
      return initialData.variants
    }
    if (demoFallback?.variants && demoFallback.variants.length > 0) {
      return demoFallback.variants.map((v) => ({
        id: v.id,
        product_id: productId || '',
        sku: v.sku,
        price: v.price,
        currency: demoFallback.currency || 'CNY',
        inventory: v.inventory,
        status: (v.status || 'active') as 'draft' | 'active' | 'archived',
        option_values: v.option_values,
        raw_data: null,
        semantic_data: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))
    }
    return []
  })

  // Canonical attributes (category-template driven spec editing)
  const [attributeValues, setAttributeValues] = useState<ProductAttributeValue[]>([])
  const [attributesLoading, setAttributesLoading] = useState(false)
  const [attributesError, setAttributesError] = useState<string | null>(null)
  const [attributesLegacy, setAttributesLegacy] = useState(false)
  // Keys as last loaded from the server — the save routine diffs against
  // these to build the `deletions` list and to detect removed variants.
  const loadedAttributeKeysRef = useRef<string[]>([])
  const loadedVariantIdsRef = useRef<string[]>([])

  // Product Relations
  const [relations, setRelations] = useState<ProductRelation[]>([])

  // SEO State
  const [seoTitle, setSeoTitle] = useState(initialData?.name || demoFallback?.name || '')
  const [seoDescription, setSeoDescription] = useState(initialData?.description || demoFallback?.description || '')

  // Media state & Ref
  const mediaUploaderRef = useRef<ProductMediaUploaderRef>(null)
  const [existingAssets, setExistingAssets] = useState<ExistingAsset[]>(() => {
    if (initialData?.existingAssets && initialData.existingAssets.length > 0) {
      return initialData.existingAssets
    }
    if (demoFallback?.image_url) {
      return [{
        id: 'media-main',
        url: demoFallback.image_url,
        asset_type: 'image',
      }]
    }
    return []
  })

  // Future Preview Modal State
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [previewModalTitle, setPreviewModalTitle] = useState('')

  const handleOpenPreview = (title: string) => {
    setPreviewModalTitle(title)
    setPreviewModalOpen(true)
  }

  // Save State Controller
  const saveControllerRef = useRef<ReturnType<typeof createProductSaveController> | null>(null)
  const getSaveController = useCallback(() => {
    if (!saveControllerRef.current) {
      saveControllerRef.current = createProductSaveController(productId ? 'ready' : 'dirty')
    }
    return saveControllerRef.current
  }, [productId])

  const [saveSnapshot, setSaveSnapshot] = useState<ProductSaveSnapshot>(() =>
    createProductSaveController(productId ? 'ready' : 'dirty').reset()
  )

  // Status flags
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Fetch product model and details via canonical loader endpoint
  const loadProductDetails = useCallback(async () => {
    if (!productId) return

    // If it's a demo product, initial states are already set without needing any network calls
    if (demoFallback) {
      setIsLoading(false)
      return
    }

    // Progressive non-blocking background fetch for full management details
    if (!initialData) {
      setIsLoading(true)
    }
    setAttributesLoading(true)

    try {
      const [mgmtSettled, assetsSettled, optionsSettled, variantsSettled, relationsSettled, attributesSettled] = await Promise.allSettled([
        fetch(`/api/merchant/products/${productId}/management`),
        fetch(`/api/assets?product_id=${productId}`),
        fetch(`/api/products/${productId}/options`),
        fetch(`/api/products/${productId}/variants`),
        fetch(`/api/merchant/products/${productId}/relations`),
        fetch(`/api/merchant/products/${productId}/canonical-attributes`),
      ])

      if (mgmtSettled.status === 'fulfilled' && mgmtSettled.value.ok) {
        const { model } = (await mgmtSettled.value.json()) as { model: ProductManagementModel }
        if (model) {
          setName(model.name)
          setSku(model.sku || '')
          setDescription(model.description || '')
          setPrice(model.price)
          setCurrency(model.currency)
          setInventory(model.inventory)
          setStatus(model.status)
          setCategory(model.category || '')
          setCategoryId(model.categoryId || null)
          if (model.seo) {
            setSeoTitle(model.seo.title || '')
            setSeoDescription(model.seo.description || '')
          }
          setSaveSnapshot(getSaveController().reset())
        }
      }

      if (assetsSettled.status === 'fulfilled' && assetsSettled.value.ok) {
        const assetsData = await assetsSettled.value.json()
        if (Array.isArray(assetsData)) {
          setExistingAssets(
            assetsData.map((a: any) => ({
              id: a.id,
              url: a.url,
              asset_type: a.asset_type,
            }))
          )
        }
      }

      if (optionsSettled.status === 'fulfilled' && optionsSettled.value.ok) {
        const optionsData = await optionsSettled.value.json()
        if (Array.isArray(optionsData.options)) {
          setOptions(optionsData.options)
        }
      }

      if (variantsSettled.status === 'fulfilled' && variantsSettled.value.ok) {
        const variantsData = await variantsSettled.value.json()
        if (Array.isArray(variantsData.variants)) {
          setVariants(variantsData.variants)
          loadedVariantIdsRef.current = variantsData.variants.map((v: ProductVariant) => v.id)
        }
      }

      if (attributesSettled.status === 'fulfilled') {
        if (attributesSettled.value.ok) {
          const canonical = await attributesSettled.value.json()
          if (Array.isArray(canonical?.attributes)) {
            setAttributeValues(canonical.attributes)
            loadedAttributeKeysRef.current = canonical.attributes.map(
              (a: ProductAttributeValue) => a.fieldKey,
            )
            setAttributesLegacy(Boolean(canonical.is_legacy))
            setAttributesError(null)
          }
        } else {
          setAttributesError(
            isZh ? '商品属性加载失败，可重试' : 'Failed to load attributes — retry available',
          )
        }
        setAttributesLoading(false)
      }

      if (relationsSettled.status === 'fulfilled' && relationsSettled.value.ok) {
        const relData = await relationsSettled.value.json()
        if (Array.isArray(relData.relations)) {
          setRelations(relData.relations)
        }
      }
    } catch (err) {
      console.error('Failed to load product details in background:', err)
    } finally {
      setIsLoading(false)
    }
  }, [productId, demoFallback, initialData, getSaveController, isZh])

  useEffect(() => {
    let isMounted = true
    if (productId) {
      loadProductDetails()
    }
    return () => {
      isMounted = false
    }
  }, [productId, loadProductDetails])

  // Save / Create handler via saveProductManagement
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setError('')
    setSuccess('')

    if (!name.trim()) {
      const msg = isZh ? '请填写商品名称' : 'Product name is required'
      setError(msg)
      setSaveSnapshot(getSaveController().markFailed(msg))
      return
    }

    if (price === '' || price == null || isNaN(Number(price))) {
      const msg = isZh ? '请填写有效的基础售价' : 'Valid price is required'
      setError(msg)
      setSaveSnapshot(getSaveController().markFailed(msg))
      return
    }

    setIsSaving(true)
    setSaveSnapshot(getSaveController().startSaving())

    try {
      let targetProductId = productId

      if (!targetProductId) {
        // Create Product Shell
        const createRes = await fetch('/api/merchant/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            sku: sku.trim() || null,
            description: description.trim() || null,
            price: Number(price || 0),
            currency: currency || 'CNY',
            inventory: Number(inventory || 0),
            status,
            category: category || null,
            category_id: categoryId || null,
            raw_data: {
              category,
              category_id: categoryId || null,
              seo: { title: seoTitle, description: seoDescription },
            },
          }),
        })

        if (!createRes.ok) {
          const body = await createRes.json().catch(() => ({}))
          throw new Error(body?.error || (isZh ? '创建商品失败' : 'Failed to create product'))
        }

        const createData = await createRes.json()
        targetProductId = createData.product?.id || createData.id
      }

      if (!targetProductId) {
        throw new Error(isZh ? '无法获取目标商品ID' : 'Target product ID is missing')
      }

      // Save Product Management (Basic Fields + SEO)
      await saveProductManagement({
        productId: targetProductId,
        basic: {
          name: name.trim(),
          sku: sku.trim() || null,
          description: description.trim() || null,
          price: Number(price || 0),
          currency: currency || 'CNY',
          inventory: Number(inventory || 0),
          status,
        },
        category: category || null,
        categoryId: categoryId || null,
        seo: { title: seoTitle, description: seoDescription },
      })

      // Handle media file upload if there are pending files
      let mediaNotice = ''
      if (targetProductId && mediaUploaderRef.current?.hasPendingFiles()) {
        const uploadRes = await mediaUploaderRef.current.uploadPendingFiles(targetProductId)
        if (uploadRes.failedCount > 0) {
          mediaNotice = isZh
            ? ` (其中 ${uploadRes.failedCount} 张图片上传未成功)`
            : ` (${uploadRes.failedCount} images failed to upload)`
        }
      }

      // Handle Options & Variants persistence:
      //   - options/variants with a `temp-` id are NEW → POST
      //   - variants with a DB id are EXISTING → PATCH (price/stock/SKU edits)
      //   - variants present at load time but now missing → DELETE
      // (Options have no PATCH/DELETE endpoint yet; their edits are
      // intentionally out of scope here. The block also runs when options
      // were CLEARED — the deletion diff below then removes stale variants.)
      if (targetProductId && (options.length > 0 || loadedVariantIdsRef.current.length > 0)) {
        try {
          for (const option of options) {
            if (option.id.startsWith('temp-')) {
              await fetch(`/api/products/${targetProductId}/options`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: option.name,
                  code: option.code,
                  position: option.position,
                  values: option.values,
                }),
              })
            }
          }

          for (const variant of variants) {
            if (variant.id.startsWith('temp-')) {
              await fetch(`/api/products/${targetProductId}/variants`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  sku: variant.sku || null,
                  price: variant.price || null,
                  currency: variant.currency,
                  inventory: variant.inventory || null,
                  status: variant.status,
                  option_values: variant.option_values,
                }),
              })
            } else {
              await fetch(`/api/products/${targetProductId}/variants/${variant.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  sku: variant.sku || null,
                  price: variant.price || null,
                  currency: variant.currency,
                  inventory: variant.inventory ?? null,
                  status: variant.status,
                  option_values: variant.option_values,
                }),
              })
            }
          }

          const currentVariantIds = new Set(variants.map((v) => v.id))
          const removedVariantIds = loadedVariantIdsRef.current.filter(
            (id) => !currentVariantIds.has(id),
          )
          for (const removedId of removedVariantIds) {
            await fetch(`/api/products/${targetProductId}/variants/${removedId}`, {
              method: 'DELETE',
            })
          }
          loadedVariantIdsRef.current = variants
            .filter((v) => !v.id.startsWith('temp-'))
            .map((v) => v.id)
        } catch (vErr) {
          console.error('Error saving variants matrix:', vErr)
        }
      }

      // Persist canonical attributes (category-template spec fields) with an
      // explicit deletions diff so removed fields are actually dropped.
      if (targetProductId) {
        try {
          const currentKeys = attributeValues.map((a) => a.fieldKey)
          const deletions = loadedAttributeKeysRef.current.filter(
            (k) => !currentKeys.includes(k),
          )
          const putRes = await fetch(
            `/api/merchant/products/${targetProductId}/canonical-attributes`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                category: category || undefined,
                category_id: categoryId || undefined,
                attributes: attributeValues,
                deletions: deletions.length > 0 ? deletions : undefined,
              }),
            },
          )
          if (putRes.ok) {
            loadedAttributeKeysRef.current = currentKeys
            setAttributesLegacy(false)
          } else {
            console.error('Error saving canonical attributes:', await putRes.text())
          }
        } catch (aErr) {
          console.error('Error saving canonical attributes:', aErr)
        }
      }

      // Handle Relations persistence
      if (targetProductId) {
        try {
          await fetch(`/api/merchant/products/${targetProductId}/relations`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ relations }),
          })
        } catch (rErr) {
          console.error('Error saving product relations:', rErr)
        }
      }

      setSaveSnapshot(getSaveController().markSaved())
      setSuccess(
        (productId
          ? isZh
            ? '商品信息已成功更新！'
            : 'Product updated successfully!'
          : isZh
          ? '商品创建成功！已进入编辑模式'
          : 'Product created successfully! Entering edit mode...') + mediaNotice
      )

      router.refresh()
      if (!productId && targetProductId) {
        setTimeout(() => {
          router.push(`/dashboard/products/${targetProductId}/edit`)
        }, 800)
      }
    } catch (err) {
      console.error('Failed saving product:', err)
      const errorMsg = getProductSaveMessage(err)
      setError(errorMsg)
      setSaveSnapshot(getSaveController().markFailed(errorMsg))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="max-w-7xl mx-auto space-y-6 pb-24">
      {/* Top Fixed Header Bar */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/90 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3.5 mb-6 flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/products"
            className="w-8 h-8 rounded-[4px] bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#024AD8] focus-visible:outline-offset-2"
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base font-bold text-slate-900 leading-none">
              {productId
                ? name || (isZh ? '未命名商品' : 'Untitled Product')
                : isZh
                ? '新建商品'
                : 'New Product'}
            </h1>
            {/* SKU Badge */}
            <span className="px-2 py-0.5 rounded-[4px] bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-mono">
              {isZh ? '编号' : 'SKU'}: {sku || '—'}
            </span>
            {/* Product Status Badge */}
            {status === 'active' && (
              <span className="px-2 py-0.5 rounded-[4px] bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                {isZh ? '已上架' : 'Active'}
              </span>
            )}
            {status === 'draft' && (
              <span className="px-2 py-0.5 rounded-[4px] bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold">
                {isZh ? '草稿箱' : 'Draft'}
              </span>
            )}
            {status === 'archived' && (
              <span className="px-2 py-0.5 rounded-[4px] bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-bold">
                {isZh ? '已归档' : 'Archived'}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Save Status Indicator */}
          {isSaving || saveSnapshot.state === 'saving' ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-blue-50 text-[#024AD8] text-xs font-semibold border border-blue-200">
              <Loader2 size={12} className="animate-spin" />
              <span>{isZh ? '正在保存...' : 'Saving...'}</span>
            </span>
          ) : saveSnapshot.state === 'failed' || error ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-rose-50 text-[#D32F2F] text-xs font-semibold border border-rose-200">
              <AlertCircle size={12} />
              <span>{isZh ? '保存失败' : 'Save Failed'}</span>
            </span>
          ) : saveSnapshot.state === 'saved' || success ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              <CheckCircle2 size={12} />
              <span>{isZh ? '已保存' : 'Saved'}</span>
            </span>
          ) : saveSnapshot.dirty ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200">
              <span>{isZh ? '有未保存更改' : 'Unsaved Changes'}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
              <span>{isZh ? '就绪' : 'Ready'}</span>
            </span>
          )}

          {/* Cancel Button (HP Secondary) */}
          <Link
            href="/dashboard/products"
            className="px-3.5 py-1.5 rounded-[4px] border border-[#D1D1D1] bg-white text-[#1C1C1C] text-xs font-medium hover:bg-[#F7F7F7] hover:border-[#B0B0B0] transition-all hidden sm:inline-block focus-visible:outline-2 focus-visible:outline-[#024AD8] focus-visible:outline-offset-2"
          >
            {isZh ? '取消' : 'Cancel'}
          </Link>

          {/* Save Button (HP Primary Blue) */}
          <button
            type="submit"
            disabled={isSaving || isLoading}
            className="px-4 py-1.5 rounded-[4px] bg-[#024AD8] hover:bg-[#003198] active:bg-[#00226B] disabled:bg-[#E2E2E2] disabled:text-[#9E9E9E] disabled:cursor-not-allowed text-white text-xs font-medium transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#024AD8] focus-visible:outline-offset-2"
          >
            {isSaving ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Save size={13} />
            )}
            <span>
              {isSaving
                ? isZh
                  ? '正在保存...'
                  : 'Saving...'
                : productId
                ? isZh
                  ? '保存修改'
                  : 'Save Changes'
                : isZh
                ? '立即创建商品'
                : 'Create Product'}
            </span>
          </button>
        </div>
      </div>

      {/* Non-blocking Banners */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-[#D32F2F] text-xs flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError('')}
            className="text-[11px] font-semibold text-rose-700 hover:text-rose-900 cursor-pointer"
          >
            {isZh ? '忽略' : 'Dismiss'}
          </button>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
            <span className="font-semibold">{success}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccess('')}
            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            {isZh ? '关闭' : 'Close'}
          </button>
        </div>
      )}

      {/* Structured Section Grid with Defined Hierarchy */}
      <div className="space-y-6">
        {/* ZONE 1: PRODUCT CORE ZONE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 01 Product Identity [PRIMARY] */}
          <div className="lg:col-span-2">
            <ProductIdentitySection
              name={name}
              setName={setName}
              sku={sku}
              setSku={setSku}
              category={category}
              setCategory={setCategory}
              categoryId={categoryId}
              setCategoryId={setCategoryId}
              disabled={isSaving}
            />
          </div>

          {/* 02 Product Media [SECONDARY] */}
          <div className="lg:col-span-1">
            <ProductMediaSection
              productId={productId}
              existingAssets={existingAssets}
              mediaUploaderRef={mediaUploaderRef}
            />
          </div>

          {/* 03 Commercial [PRIMARY] */}
          <div className="lg:col-span-1">
            <ProductCommercialSection
              price={price}
              setPrice={setPrice}
              currency={currency}
              setCurrency={setCurrency}
              inventory={inventory}
              setInventory={setInventory}
              status={status}
              setStatus={setStatus}
              disabled={isSaving}
            />
          </div>

          {/* 04 Description [SECONDARY] */}
          <div className="lg:col-span-2">
            <ProductDescriptionSection
              description={description}
              setDescription={setDescription}
              productName={name}
              category={category}
              disabled={isSaving}
            />
          </div>
        </div>

        {/* ZONE 2: SPECIFICATIONS & SALES VARIANTS（与创建端同源：品类模板 + 变体矩阵） */}
        <div className="space-y-6">
          <ProductAttributesSection
            productId={productId}
            category={category}
            categoryId={categoryId}
            attributeValues={attributeValues}
            onChangeAttributeValues={setAttributeValues}
            isLoading={attributesLoading}
            isLegacyFallback={attributesLegacy}
            error={attributesError}
            onRetry={loadProductDetails}
            disabled={isSaving}
            onOpenPreview={handleOpenPreview}
          />

          <ProductVariantsSection
            productId={productId}
            options={options}
            setOptions={setOptions}
            variants={variants}
            setVariants={setVariants}
            disabled={isSaving}
          />
        </div>

        {/* ZONE 3: PRODUCT RELATIONSHIPS */}
        <div>
          <ProductRelationsSection
            productId={productId}
            relations={relations}
            onChange={setRelations}
            disabled={isSaving}
          />
        </div>

        {/* ZONE 4: PRODUCT DOCUMENTS & KNOWLEDGE */}
        <div>
          <ProductKnowledgeSection
            productId={productId}
            onOpenPreview={handleOpenPreview}
          />
        </div>
      </div>

      {/* Bottom Action Footer Bar */}
      <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
        <Link
          href="/dashboard/products"
          className="text-xs font-semibold text-slate-600 hover:text-[#024AD8] transition-colors"
        >
          ← {isZh ? '返回商品列表' : 'Back to Product List'}
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/products"
            className="px-4 py-2 rounded-[4px] border border-[#D1D1D1] bg-white text-[#1C1C1C] text-xs font-medium hover:bg-[#F7F7F7] hover:border-[#B0B0B0] transition-all focus-visible:outline-2 focus-visible:outline-[#024AD8] focus-visible:outline-offset-2"
          >
            {isZh ? '取消' : 'Cancel'}
          </Link>
          <button
            type="submit"
            disabled={isSaving || isLoading}
            className="px-6 py-2 rounded-[4px] bg-[#024AD8] hover:bg-[#003198] active:bg-[#00226B] disabled:bg-[#E2E2E2] disabled:text-[#9E9E9E] disabled:cursor-not-allowed text-white text-xs font-medium transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#024AD8] focus-visible:outline-offset-2"
          >
            {isSaving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            <span>
              {isSaving
                ? isZh
                  ? '正在保存...'
                  : 'Saving...'
                : productId
                ? isZh
                  ? '保存修改'
                  : 'Save Changes'
                : isZh
                ? '立即创建商品'
                : 'Create Product'}
            </span>
          </button>
        </div>
      </div>

      {/* Future Capability Preview Modal */}
      <FuturePreviewModal
        isOpen={previewModalOpen}
        title={previewModalTitle}
        onClose={() => setPreviewModalOpen(false)}
      />
    </form>
  )
}
