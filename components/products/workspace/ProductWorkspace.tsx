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
import { ProductAttributesSection, ProductAttributeValue } from './ProductAttributesSection'
import { ProductVariantsSection } from './ProductVariantsSection'
import { ProductKnowledgeSection } from './ProductKnowledgeSection'
import { ProductSeoSection } from './ProductSeoSection'
import { ProductRelationsSection } from './ProductRelationsSection'
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
    status?: 'active' | 'draft' | 'archived'
  }
}

export function ProductWorkspace({ productId, initialData }: ProductWorkspaceProps) {
  const router = useRouter()
  const { isZh } = useLanguage()

  // Primary form fields
  const [name, setName] = useState(initialData?.name || '')
  const [sku, setSku] = useState(initialData?.sku || '')
  const [category, setCategory] = useState(initialData?.category || '')
  const [price, setPrice] = useState<string | number>(initialData?.price ?? '')
  const [currency, setCurrency] = useState(initialData?.currency || 'CNY')
  const [inventory, setInventory] = useState<string | number>(initialData?.inventory ?? 100)
  const [description, setDescription] = useState(initialData?.description || '')
  const [status, setStatus] = useState<'active' | 'draft' | 'archived'>(initialData?.status || 'active')

  // Unified Canonical Attribute View Model State
  const [attributeValues, setAttributeValues] = useState<ProductAttributeValue[]>([])
  const [attributesLoading, setAttributesLoading] = useState(false)
  const [attributesError, setAttributesError] = useState<string | null>(null)
  const [isUsingLegacyFallback, setIsUsingLegacyFallback] = useState(false)
  const initialAttributeKeysRef = useRef<Set<string>>(new Set())

  // Options & Variants
  const [options, setOptions] = useState<ProductOption[]>([])
  const [variants, setVariants] = useState<ProductVariant[]>([])

  // Product Relations
  const [relations, setRelations] = useState<ProductRelation[]>([])

  // SEO State
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')

  // Media state & Ref
  const mediaUploaderRef = useRef<ProductMediaUploaderRef>(null)
  const [existingAssets, setExistingAssets] = useState<ExistingAsset[]>([])

  // Future Preview Modal State
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [previewModalTitle, setPreviewModalTitle] = useState('')

  const handleOpenPreview = (title: string) => {
    setPreviewModalTitle(title)
    setPreviewModalOpen(true)
  }

  // Save State Controller
  const saveControllerRef = useRef(createProductSaveController(productId ? 'ready' : 'dirty'))
  const [saveSnapshot, setSaveSnapshot] = useState<ProductSaveSnapshot>(saveControllerRef.current.reset())

  // Status flags
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Fetch product model and details via canonical loader endpoint
  const loadProductDetails = useCallback(async () => {
    if (!productId) return
    setIsLoading(true)
    setAttributesLoading(true)
    setAttributesError(null)

    // Check if it matches a predefined demo product to avoid slow/failing API calls
    const demoProduct = DEMO_PRODUCTS.find(
      (p) => p.id === productId || p.sku.toLowerCase() === productId.toLowerCase()
    )
    if (demoProduct) {
      setName(demoProduct.name)
      setSku(demoProduct.sku || '')
      setDescription(demoProduct.description || '')
      setPrice(demoProduct.price)
      setCurrency(demoProduct.currency)
      setInventory(demoProduct.inventory)
      setStatus(demoProduct.status)
      setCategory(demoProduct.category || '')
      
      const attributes = Object.entries(demoProduct.semantic_data?.attributes || {}).map(([key, val]) => ({
        fieldKey: key,
        label: key,
        value: String(val),
        type: 'text' as const,
        isStandard: true,
      }))
      setAttributeValues(attributes)
      initialAttributeKeysRef.current = new Set(attributes.map((a) => a.fieldKey.toLowerCase()))
      
      setSeoTitle(demoProduct.name)
      setSeoDescription(demoProduct.description || '')
      
      const assets = demoProduct.image_url ? [{
        id: 'media-main',
        url: demoProduct.image_url,
        asset_type: 'image',
      }] : []
      setExistingAssets(assets)
      
      const mappedOptions = (demoProduct.options || []).map((opt, idx) => ({
        id: opt.id,
        product_id: productId,
        name: opt.name,
        code: opt.code,
        position: idx,
        values: opt.values,
        created_at: new Date().toISOString(),
      }))
      setOptions(mappedOptions)

      const mappedVariants = (demoProduct.variants || []).map((v) => ({
        id: v.id,
        product_id: productId,
        sku: v.sku,
        price: v.price,
        currency: demoProduct.currency || 'CNY',
        inventory: v.inventory,
        status: v.status as 'draft' | 'active' | 'archived',
        option_values: v.option_values,
        raw_data: null,
        semantic_data: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))
      setVariants(mappedVariants)
      setRelations([])
      
      setIsLoading(false)
      setAttributesLoading(false)
      return
    }

    try {
      const [mgmtRes, assetsRes, optionsRes, variantsRes] = await Promise.all([
        fetch(`/api/merchant/products/${productId}/management`),
        fetch(`/api/assets?product_id=${productId}`),
        fetch(`/api/products/${productId}/options`),
        fetch(`/api/products/${productId}/variants`),
      ])

      if (mgmtRes.ok) {
        const { model } = (await mgmtRes.json()) as { model: ProductManagementModel }
        if (model) {
          setName(model.name)
          setSku(model.sku || '')
          setDescription(model.description || '')
          setPrice(model.price)
          setCurrency(model.currency)
          setInventory(model.inventory)
          setStatus(model.status)
          setCategory(model.category || '')
          setAttributeValues(model.attributes || [])
          initialAttributeKeysRef.current = new Set(
            (model.attributes || []).map((a) => a.fieldKey.toLowerCase())
          )
          setIsUsingLegacyFallback(Boolean(model.metadata?.isLegacy))
          if (model.seo) {
            setSeoTitle(model.seo.title || '')
            setSeoDescription(model.seo.description || '')
          }
          setSaveSnapshot(saveControllerRef.current.reset())
        }
      } else {
        setAttributesError(isZh ? '加载商品详情失败' : 'Failed to load product model')
      }

      if (assetsRes.ok) {
        const assetsData = await assetsRes.json()
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

      if (optionsRes.ok) {
        const optionsData = await optionsRes.json()
        setOptions(optionsData.options || [])
      }

      if (variantsRes.ok) {
        const variantsData = await variantsRes.json()
        setVariants(variantsData.variants || [])
      }

      try {
        const relationsRes = await fetch(`/api/merchant/products/${productId}/relations`)
        if (relationsRes.ok) {
          const relData = await relationsRes.json()
          setRelations(relData.relations || [])
        }
      } catch (relErr) {
        console.error('Failed to load relations:', relErr)
      }
    } catch (err) {
      console.error('Failed to load existing product details:', err)
      setAttributesError(isZh ? '加载商品详情失败' : 'Failed to load product details')
    } finally {
      setIsLoading(false)
      setAttributesLoading(false)
    }
  }, [productId, isZh])

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
      setSaveSnapshot(saveControllerRef.current.markFailed(msg))
      return
    }

    if (price === '' || price == null || isNaN(Number(price))) {
      const msg = isZh ? '请填写有效的基础售价' : 'Valid price is required'
      setError(msg)
      setSaveSnapshot(saveControllerRef.current.markFailed(msg))
      return
    }

    setIsSaving(true)
    setSaveSnapshot(saveControllerRef.current.startSaving())

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
            raw_data: {
              category,
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

      // Compute valid attributes and explicit deletions
      const currentKeys = new Set(attributeValues.map((a) => a.fieldKey.toLowerCase()))
      const missingKeys = Array.from(initialAttributeKeysRef.current).filter((k) => !currentKeys.has(k))
      const emptyKeys = attributeValues.filter((a) => !a.value || !a.value.trim()).map((a) => a.fieldKey)
      const allDeletions = Array.from(new Set([...missingKeys, ...emptyKeys]))
      const validAttributes = attributeValues
        .filter((a) => a.value && a.value.trim().length > 0)
        .map((a) => ({
          ...a,
          isStandard: Boolean(a.isStandard),
        }))

      // Save Product Management (Basic + Canonical Attributes)
      const saveResult = await saveProductManagement({
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
        attributes: validAttributes,
        deletions: allDeletions.length > 0 ? allDeletions : undefined,
        seo: { title: seoTitle, description: seoDescription },
      })

      if (saveResult.canonical?.attributes) {
        setAttributeValues(saveResult.canonical.attributes)
        initialAttributeKeysRef.current = new Set(
          saveResult.canonical.attributes.map((a: ProductAttributeValue) => a.fieldKey.toLowerCase())
        )
        setIsUsingLegacyFallback(Boolean(saveResult.canonical.is_legacy))
      }

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

      // Handle Options & Variants persistence if options exist
      if (targetProductId && options.length > 0) {
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
            }
          }
        } catch (vErr) {
          console.error('Error saving variants matrix:', vErr)
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

      setSaveSnapshot(saveControllerRef.current.markSaved())
      setSuccess(
        (productId
          ? isZh
            ? '商品信息已成功更新！'
            : 'Product updated successfully!'
          : isZh
          ? '商品创建成功！正在跳转...'
          : 'Product created successfully! Redirecting...') + mediaNotice
      )

      router.refresh()
      setTimeout(() => {
        router.push('/dashboard/products')
      }, 1000)
    } catch (err) {
      console.error('Failed saving product:', err)
      const errorMsg = getProductSaveMessage(err)
      setError(errorMsg)
      setSaveSnapshot(saveControllerRef.current.markFailed(errorMsg))
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
                ? '新建商品 (New Product)'
                : 'New Product'}
            </h1>
            {/* SKU Badge */}
            <span className="px-2 py-0.5 rounded-[4px] bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-mono">
              SKU: {sku || '—'}
            </span>
            {/* Product Status Badge */}
            {status === 'active' && (
              <span className="px-2 py-0.5 rounded-[4px] bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                {isZh ? '已上架 (Active)' : 'Active'}
              </span>
            )}
            {status === 'draft' && (
              <span className="px-2 py-0.5 rounded-[4px] bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold">
                {isZh ? '草稿箱 (Draft)' : 'Draft'}
              </span>
            )}
            {status === 'archived' && (
              <span className="px-2 py-0.5 rounded-[4px] bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-bold">
                {isZh ? '已归档 (Archived)' : 'Archived'}
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

        {/* ZONE 2: PRODUCT SPECIFICATIONS (⭐ CORE WORKSPACE FOCUS) */}
        <div>
          <ProductAttributesSection
            productId={productId}
            category={category}
            attributeValues={attributeValues}
            onChangeAttributeValues={setAttributeValues}
            isLoading={isLoading || attributesLoading}
            isLegacyFallback={isUsingLegacyFallback}
            error={attributesError}
            onRetry={loadProductDetails}
            disabled={isSaving}
            onOpenPreview={handleOpenPreview}
          />
        </div>

        {/* ZONE 3: SPECIFICATIONS AND VARIANTS MATRIX */}
        <div>
          <ProductVariantsSection
            productId={productId}
            options={options}
            setOptions={setOptions}
            variants={variants}
            setVariants={setVariants}
            disabled={isSaving}
          />
        </div>

        {/* ZONE 3.5: PRODUCT RELATIONSHIPS */}
        <div>
          <ProductRelationsSection
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

        {/* ZONE 6: SEO & META */}
        <div>
          <ProductSeoSection
            seoTitle={seoTitle}
            setSeoTitle={setSeoTitle}
            seoDescription={seoDescription}
            setSeoDescription={setSeoDescription}
            productName={name}
            productDescription={description}
            disabled={isSaving}
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
