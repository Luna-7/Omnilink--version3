'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  updateProductAction,
} from '@/app/actions/products'
import { Sparkles, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { ProductDocumentsSection } from '@/components/products/ProductDocumentsSection'
import { ProductMediaUploader, ProductMediaUploaderRef, ExistingAsset } from '@/components/products/ProductMediaUploader'

interface ProductFormProps {
  productId?: string
  initialData?: {
    name: string
    description?: string
    price: number
    currency: string
    inventory: number
    sku?: string
  }
}

export function ProductForm({ productId, initialData }: ProductFormProps) {
  const router = useRouter()
  const { isZh } = useLanguage()
  const [isPending, startTransition] = useTransition()
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const mediaUploaderRef = useRef<ProductMediaUploaderRef>(null)
  const [existingAssets, setExistingAssets] = useState<ExistingAsset[]>([])

  // Fetch existing assets if editing
  useEffect(() => {
    if (!productId) return
    let isMounted = true

    async function loadAssets() {
      try {
        const res = await fetch(`/api/assets?product_id=${productId}`)
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && isMounted) {
            setExistingAssets(data.map((a) => ({ id: a.id, url: a.url, asset_type: a.asset_type })))
          }
        }
      } catch {
        // ignore
      }
    }

    loadAssets()
    return () => {
      isMounted = false
    }
  }, [productId])

  // Form state
  const [sku, setSku] = useState(initialData?.sku || '')
  const [name, setName] = useState(initialData?.name || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [price, setPrice] = useState<string | number>(initialData?.price || '')
  const [currency, setCurrency] = useState(initialData?.currency || 'CNY')
  const [inventory, setInventory] = useState<string | number>(initialData?.inventory ?? 100)

  const handleAIFill = () => {
    setSku(`OMNI-AI-${Math.floor(1000 + Math.random() * 9000)}`)
    setName(isZh ? 'OmniVibe Max 空间音频降噪耳麦' : 'OmniVibe Max Spatial ANC Headset')
    setDescription(
      isZh
        ? '搭载自主研发的空间音频声学引擎，内置自适应主动降噪算法与高通低延迟音频芯片，支持多设备秒级智能流转与 50 小时超长续航。'
        : 'Engineered with spatial acoustic processors, adaptive ANC algorithms, and 50-hour ultra battery life.'
    )
    setPrice(1599)
    setInventory(200)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsCreating(true)

    const formData = new FormData()
    formData.append('sku', String(sku || '').trim())
    formData.append('name', String(name || '').trim())
    formData.append('description', String(description || '').trim())
    formData.append('price', String(price || 0))
    formData.append('currency', String(currency || 'CNY'))
    formData.append('inventory', String(inventory || 0))

    if (productId) {
      startTransition(async () => {
        try {
          const result = await updateProductAction(productId, formData)
          if (result.success) {
            let mediaNotice = ''
            if (mediaUploaderRef.current?.hasPendingFiles()) {
              const uploadRes = await mediaUploaderRef.current.uploadPendingFiles(productId)
              if (uploadRes.failedCount > 0) {
                mediaNotice = isZh
                  ? ` (部分图片上传失败 ${uploadRes.failedCount} 张)`
                  : ` (${uploadRes.failedCount} images failed to upload)`
              }
            }
            setSuccess((isZh ? '商品信息已更新' : 'Product updated') + mediaNotice)
            router.refresh()
          } else {
            setError(result.error || (isZh ? '更新失败，请重试' : 'Unable to update product'))
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : (isZh ? '更新失败' : 'Unable to update product'))
        } finally {
          setIsCreating(false)
        }
      })
      return
    }

    // Create path
    const payload = {
      name: String(name || '').trim(),
      sku: String(sku || '').trim() || null,
      description: String(description || '').trim() || null,
      price: Number(price || 0),
      currency: String(currency || 'CNY'),
      inventory: Number(inventory || 0),
    }

    try {
      const res = await fetch('/api/merchant/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.status === 201 || res.ok) {
        const resData = await res.json()
        const createdId = resData.product?.id || resData.id

        let uploadMessage = ''
        if (createdId && mediaUploaderRef.current?.hasPendingFiles()) {
          const uploadRes = await mediaUploaderRef.current.uploadPendingFiles(createdId)
          if (uploadRes.failedCount > 0) {
            uploadMessage = isZh
              ? ` (图片成功 ${uploadRes.successCount} 张，失败 ${uploadRes.failedCount} 张)`
              : ` (${uploadRes.successCount} images uploaded, ${uploadRes.failedCount} failed)`
          }
        }

        setSuccess((isZh ? '商品创建成功！正在跳转...' : 'Product created! Redirecting...') + uploadMessage)
        router.refresh()
        setTimeout(() => router.push('/dashboard/products'), 800)
        return
      }

      let message = isZh ? '创建商品失败' : 'Unable to create product'
      try {
        const body = await res.json()
        if (body?.error) message = body.error
      } catch {
        // ignore
      }
      setError(message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setIsCreating(false)
    }
  }

  const busy = isPending || isCreating

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* 顶部 AI 快速生成提示 */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
        <span className="text-xs text-[#6B7280]">
          {isZh ? '支持人工录入或点击右侧按钮进行 AI 智能范例预填：' : 'Fill fields manually or use AI Pre-fill:'}
        </span>
        <button
          type="button"
          onClick={handleAIFill}
          className="px-3 py-1.5 rounded-full bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 text-[#8B5CF6] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Sparkles size={13} />
          <span>{isZh ? '✨ AI 智能填充范例' : '✨ AI Pre-fill Demo'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="sku" className="block text-xs font-semibold text-[#111827] mb-1.5">
            {isZh ? '商品货号 (SKU)' : 'Product SKU'}
          </label>
          <input
            type="text"
            id="sku"
            name="sku"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="例如：PROD-OMNI-001"
            disabled={busy}
            className="w-full h-10 px-3.5 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs font-mono text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827] disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor="name" className="block text-xs font-semibold text-[#111827] mb-1.5">
            {isZh ? '商品名称 *' : 'Product Name *'}
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder={isZh ? '例如：OmniFlow 智能降噪耳机' : 'e.g. OmniFlow ANC Headphones'}
            disabled={busy}
            className="w-full h-10 px-3.5 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs font-semibold text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827] disabled:opacity-50"
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-xs font-semibold text-[#111827] mb-1.5">
          {isZh ? '商品描述与核心功能' : 'Description & Selling Points'}
        </label>
        <textarea
          id="description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder={isZh ? '填写该商品的规格、适用人群及核心卖点...' : 'Enter product specs and key benefits...'}
          disabled={busy}
          className="w-full p-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827] leading-relaxed disabled:opacity-50"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="price" className="block text-xs font-semibold text-[#111827] mb-1.5">
            {isZh ? '基础售价 *' : 'Price *'}
          </label>
          <div className="relative">
            <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="number"
              id="price"
              name="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
              disabled={busy}
              className="w-full h-10 pl-8 pr-3.5 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs font-bold text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827] disabled:opacity-50"
            />
          </div>
        </div>

        <div>
          <label htmlFor="currency" className="block text-xs font-semibold text-[#111827] mb-1.5">
            {isZh ? '结算币种' : 'Currency'}
          </label>
          <select
            id="currency"
            name="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            disabled={busy}
            className="w-full h-10 px-3.5 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs font-medium text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827] disabled:opacity-50"
          >
            <option value="CNY">CNY (人民币 ¥)</option>
            <option value="USD">USD (美元 $)</option>
            <option value="EUR">EUR (欧元 €)</option>
            <option value="GBP">GBP (英镑 £)</option>
            <option value="JPY">JPY (日元 ¥)</option>
          </select>
        </div>

        <div>
          <label htmlFor="inventory" className="block text-xs font-semibold text-[#111827] mb-1.5">
            {isZh ? '库存数量' : 'Inventory'}
          </label>
          <input
            type="number"
            id="inventory"
            name="inventory"
            value={inventory}
            onChange={(e) => setInventory(e.target.value)}
            min="0"
            step="1"
            placeholder="100"
            disabled={busy}
            className="w-full h-10 px-3.5 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs font-bold text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827] disabled:opacity-50"
          />
        </div>
      </div>

      {/* Product Media Uploader (Images) */}
      <ProductMediaUploader
        ref={mediaUploaderRef}
        productId={productId}
        existingAssets={existingAssets}
        isZh={isZh}
      />

      {/* Product Documents Section (Public Customer-Facing + Private R&D) */}
      <ProductDocumentsSection productId={productId} />

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs flex items-center gap-2">
          <CheckCircle2 size={14} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full h-11 rounded-full bg-[#111827] hover:bg-black text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isCreating
          ? isZh
            ? '正在创建商品...'
            : 'Creating…'
          : productId
          ? isPending
            ? isZh
              ? '正在保存...'
              : 'Saving…'
            : isZh
            ? '保存修改'
            : 'Update Product'
          : isZh
          ? '立即创建商品'
          : 'Create Product'}
      </button>
    </form>
  )
}
