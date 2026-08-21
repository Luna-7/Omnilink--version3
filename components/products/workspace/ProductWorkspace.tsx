'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, CheckCircle2, AlertCircle, Sparkles, Loader2 } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

import { ProductIdentitySection } from './ProductIdentitySection'
import { ProductMediaSection } from './ProductMediaSection'
import { ProductCommercialSection } from './ProductCommercialSection'
import { ProductDescriptionSection } from './ProductDescriptionSection'
import { ProductAttributesSection, CustomAttribute } from './ProductAttributesSection'
import { ProductVariantsSection } from './ProductVariantsSection'
import { ProductPackagingSection, PackagingState } from './ProductPackagingSection'
import { ProductKnowledgeSection } from './ProductKnowledgeSection'
import { ProductSeoSection } from './ProductSeoSection'

import { ProductMediaUploaderRef, ExistingAsset } from '@/components/products/ProductMediaUploader'
import type { ProductOption, ProductVariant } from '@/lib/products/variants/types'
import { updateProductAction } from '@/app/actions/products'

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
  }
}

export function ProductWorkspace({ productId, initialData }: ProductWorkspaceProps) {
  const router = useRouter()
  const { isZh } = useLanguage()

  // Primary form fields
  const [name, setName] = useState(initialData?.name || '')
  const [sku, setSku] = useState(initialData?.sku || '')
  const [category, setCategory] = useState(initialData?.category || 'Electronics & Acoustics')
  const [price, setPrice] = useState<string | number>(initialData?.price ?? '')
  const [currency, setCurrency] = useState(initialData?.currency || 'CNY')
  const [inventory, setInventory] = useState<string | number>(initialData?.inventory ?? 100)
  const [description, setDescription] = useState(initialData?.description || '')

  // Core Attributes & Custom Attributes
  const [coreMaterial, setCoreMaterial] = useState('')
  const [coreDimensions, setCoreDimensions] = useState('')
  const [coreWeight, setCoreWeight] = useState('')
  const [coreOrigin, setCoreOrigin] = useState('')
  const [customAttributes, setCustomAttributes] = useState<CustomAttribute[]>([])

  // Options & Variants
  const [options, setOptions] = useState<ProductOption[]>([])
  const [variants, setVariants] = useState<ProductVariant[]>([])

  // Packaging State
  const [packaging, setPackaging] = useState<PackagingState>({
    pkgType: 'carton',
    unitsPerPkg: 1,
    lengthCm: 25,
    widthCm: 20,
    heightCm: 12,
    weightKg: 0.8,
    stackable: true,
    fragile: false,
  })

  // SEO State
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')

  // Media state & Ref
  const mediaUploaderRef = useRef<ProductMediaUploaderRef>(null)
  const [existingAssets, setExistingAssets] = useState<ExistingAsset[]>([])

  // Status flags
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Fetch assets and variant data if editing existing product
  const loadProductDetails = useCallback(async () => {
    if (!productId) return
    setIsLoading(true)
    try {
      const [assetsRes, optionsRes, variantsRes] = await Promise.all([
        fetch(`/api/assets?product_id=${productId}`),
        fetch(`/api/products/${productId}/options`),
        fetch(`/api/products/${productId}/variants`),
      ])

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
    } catch (err) {
      console.error('Failed to load existing product assets or variants:', err)
    } finally {
      setIsLoading(false)
    }
  }, [productId])

  useEffect(() => {
    let isMounted = true
    if (productId) {
      loadProductDetails()
    }
    return () => {
      isMounted = false
    }
  }, [productId, loadProductDetails])

  // Save / Create handler
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setError('')
    setSuccess('')

    if (!name.trim()) {
      setError(isZh ? '请填写商品名称' : 'Product name is required')
      return
    }

    if (price === '' || price == null || isNaN(Number(price))) {
      setError(isZh ? '请填写有效的基础售价' : 'Valid price is required')
      return
    }

    setIsSaving(true)

    // Build payload
    const payload = {
      name: name.trim(),
      sku: sku.trim() || null,
      description: description.trim() || null,
      price: Number(price || 0),
      currency: currency || 'CNY',
      inventory: Number(inventory || 0),
      raw_data: {
        category,
        core_attributes: {
          material: coreMaterial,
          dimensions: coreDimensions,
          weight: coreWeight,
          country_of_origin: coreOrigin,
        },
        custom_attributes: customAttributes,
        packaging,
        seo: { title: seoTitle, description: seoDescription },
      },
      semantic_data: {
        category,
        attributes: {
          material: coreMaterial,
          dimensions: coreDimensions,
          weight: coreWeight,
          origin: coreOrigin,
        },
        confidence: 0.98,
      },
    }

    try {
      let targetProductId = productId

      if (productId) {
        // Edit flow via Server Action / API
        const formData = new FormData()
        formData.append('sku', String(sku || '').trim())
        formData.append('name', String(name || '').trim())
        formData.append('description', String(description || '').trim())
        formData.append('price', String(price || 0))
        formData.append('currency', String(currency || 'CNY'))
        formData.append('inventory', String(inventory || 0))

        const actionRes = await updateProductAction(productId, formData)
        if (!actionRes.success) {
          throw new Error(actionRes.error || (isZh ? '更新商品失败' : 'Failed to update product'))
        }
      } else {
        // Create flow via POST /api/merchant/products
        const createRes = await fetch('/api/merchant/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!createRes.ok) {
          const body = await createRes.json().catch(() => ({}))
          throw new Error(body?.error || (isZh ? '创建商品失败' : 'Failed to create product'))
        }

        const createData = await createRes.json()
        targetProductId = createData.product?.id || createData.id
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
      setError(err instanceof Error ? err.message : 'An error occurred during save')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Fixed/Sticky Top Navigation Header */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3.5 mb-6 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/products"
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-none">
              {productId
                ? name || (isZh ? '编辑商品' : 'Edit Product')
                : isZh
                ? '新建商品 (New Product Workspace)'
                : 'New Product Workspace'}
            </h1>
            <p className="text-[11px] text-slate-500 mt-1">
              {isZh
                ? '模块化录入商品全域主档、多媒体资产与多规格变体'
                : 'Modular workspace for product master data, media assets, and variants'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/products"
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors hidden sm:inline-block"
          >
            {isZh ? '取消' : 'Cancel'}
          </Link>
          <button
            type="submit"
            disabled={isSaving || isLoading}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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

      {/* Messages */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
          <AlertCircle size={16} className="shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
          <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
          <span className="font-semibold">{success}</span>
        </div>
      )}

      {/* 1. Product Identity Section */}
      <ProductIdentitySection
        name={name}
        setName={setName}
        sku={sku}
        setSku={setSku}
        category={category}
        setCategory={setCategory}
        disabled={isSaving}
      />

      {/* 2. Media Section */}
      <ProductMediaSection
        productId={productId}
        existingAssets={existingAssets}
        mediaUploaderRef={mediaUploaderRef}
      />

      {/* 3. Commercial Section */}
      <ProductCommercialSection
        price={price}
        setPrice={setPrice}
        currency={currency}
        setCurrency={setCurrency}
        inventory={inventory}
        setInventory={setInventory}
        disabled={isSaving}
      />

      {/* 4. Description Section */}
      <ProductDescriptionSection
        description={description}
        setDescription={setDescription}
        productName={name}
        category={category}
        disabled={isSaving}
      />

      {/* 5. Attributes Section */}
      <ProductAttributesSection
        productId={productId}
        coreMaterial={coreMaterial}
        setCoreMaterial={setCoreMaterial}
        coreDimensions={coreDimensions}
        setCoreDimensions={setCoreDimensions}
        coreWeight={coreWeight}
        setCoreWeight={setCoreWeight}
        coreOrigin={coreOrigin}
        setCoreOrigin={setCoreOrigin}
        customAttributes={customAttributes}
        setCustomAttributes={setCustomAttributes}
        disabled={isSaving}
      />

      {/* 6. Variants Section */}
      <ProductVariantsSection
        productId={productId}
        options={options}
        setOptions={setOptions}
        variants={variants}
        setVariants={setVariants}
        disabled={isSaving}
      />

      {/* 7. Packaging Section */}
      <ProductPackagingSection
        packaging={packaging}
        setPackaging={setPackaging}
        disabled={isSaving}
      />

      {/* 8. Product Knowledge Section */}
      <ProductKnowledgeSection productId={productId} />

      {/* 9. AI / SEO Section */}
      <ProductSeoSection
        seoTitle={seoTitle}
        setSeoTitle={setSeoTitle}
        seoDescription={seoDescription}
        setSeoDescription={setSeoDescription}
        productName={name}
        productDescription={description}
        disabled={isSaving}
      />

      {/* Bottom Action Footer Bar */}
      <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
        <Link
          href="/dashboard/products"
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          ← {isZh ? '返回商品列表' : 'Back to Products'}
        </Link>

        <button
          type="submit"
          disabled={isSaving || isLoading}
          className="h-11 px-8 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Save size={15} />
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
    </form>
  )
}
