'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Plus,
  Sparkles,
  DollarSign,
  Package,
  Layers,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Upload,
  X,
  Loader2,
  Check,
  Tag,
  ChevronDown,
  ChevronUp,
  Sliders,
  Truck,
  Search,
  Trash2,
  ImageIcon,
  Info,
} from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { analyzeProductClient } from '@/lib/product-ai/analyze-client'
import type { ProductDraft } from '@/lib/product-ai/types'
import { uploadProductMedia } from '@/lib/product-media/upload-client'
import { fetchWithRetry } from '@/lib/network/retry-client'
import type { ProductOption, ProductVariant } from '@/lib/products/variants/types'
import { generateVariantCombinations } from '@/lib/products/variants/validation'
import {
  suggestProductCategory,
  ProductCategorySuggestion,
  COMMON_CATEGORY_OPTIONS,
} from '@/lib/product/category-suggester'
import { getCategoryTemplate } from '@/lib/product/category-templates'

interface ImageFileItem {
  file: File
  previewUrl: string
}

interface CustomAttributeItem {
  id: string
  key: string
  label: string
  value: string
  unit: string
  type: 'text' | 'number' | 'boolean' | 'select'
}

export function ProductCreateDialog() {
  const router = useRouter()
  const { isZh } = useLanguage()
  const [open, setOpen] = useState(false)

  // Status flags
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [createdProductId, setCreatedProductId] = useState<string | null>(null)

  // ==========================================
  // 1. Basic Settings (双列排布，左列基础参数，右列商品图片)
  // ==========================================
  const [images, setImages] = useState<ImageFileItem[]>([])
  const [title, setTitle] = useState('')
  const [sku, setSku] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('1299')
  const [currency, setCurrency] = useState('CNY')
  const [inventory, setInventory] = useState('100')
  const [description, setDescription] = useState('')

  // Local category suggestion from deterministic rule engine (fast, predictable, no tokens)
  const [localCategorySuggestion, setLocalCategorySuggestion] = useState<ProductCategorySuggestion | null>(null)
  const [aiSuggestedCategory, setAiSuggestedCategory] = useState<string | null>(null)

  // Debounced rule engine suggestion on title change (150-250ms)
  useEffect(() => {
    if (!title || !title.trim()) {
      setLocalCategorySuggestion(null)
      return
    }
    const timer = setTimeout(() => {
      const res = suggestProductCategory(title)
      setLocalCategorySuggestion(res)
    }, 200)
    return () => clearTimeout(timer)
  }, [title])

  // AI Analysis Draft states
  const [aiDraft, setAiDraft] = useState<ProductDraft | null>(null)
  const [acceptedModules, setAcceptedModules] = useState<string[]>([])
  const [dismissedModules, setDismissedModules] = useState<string[]>([])
  const [editableAttributes, setEditableAttributes] = useState<
    Array<{
      key: string
      label: string
      value: string
      type: 'text' | 'number' | 'boolean' | 'select'
      unit: string | null
      confidence: number
    }>
  >([])
  const [analysisSource, setAnalysisSource] = useState<'text' | 'vision' | 'multimodal' | null>(null)

  // ==========================================
  // 2. More Settings (更多设置 - 卡片折叠向下扩展)
  // ==========================================
  const [moreSettingsExpanded, setMoreSettingsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<'attributes' | 'variants' | 'packaging' | 'seo'>('attributes')

  // Attributes / Specs
  const [coreMaterial, setCoreMaterial] = useState('')
  const [coreDimensions, setCoreDimensions] = useState('')
  const [coreWeight, setCoreWeight] = useState('')
  const [coreOrigin, setCoreOrigin] = useState('')
  const [customAttributes, setCustomAttributes] = useState<CustomAttributeItem[]>([])

  // Variants & Options
  const [options, setOptions] = useState<ProductOption[]>([])
  const [variants, setVariants] = useState<ProductVariant[]>([])

  // Packaging & Logistics
  const [pkgType, setPkgType] = useState<'carton' | 'bag' | 'crate' | 'pallet'>('carton')
  const [unitsPerPkg, setUnitsPerPkg] = useState('1')
  const [pkgLengthCm, setPkgLengthCm] = useState('')
  const [pkgWidthCm, setPkgWidthCm] = useState('')
  const [pkgHeightCm, setPkgHeightCm] = useState('')
  const [pkgWeightKg, setPkgWeightKg] = useState('')
  const [pkgFragile, setPkgFragile] = useState(false)
  const [pkgStackable, setPkgStackable] = useState(true)

  // SEO & Discoverability
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [seoSlug, setSeoSlug] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetForm = () => {
    images.forEach((item) => URL.revokeObjectURL(item.previewUrl))
    setImages([])
    setTitle('')
    setSku('')
    setCategory(isZh ? '音频声学' : 'Audio & Acoustics')
    setPrice('1299')
    setCurrency('CNY')
    setInventory('100')
    setDescription('')
    setError('')
    setSuccess('')
    setCreatedProductId(null)
    setAiDraft(null)
    setAcceptedModules([])
    setDismissedModules([])
    setEditableAttributes([])
    setAnalysisSource(null)
    setMoreSettingsExpanded(false)
    setActiveTab('attributes')

    setCoreMaterial('')
    setCoreDimensions('')
    setCoreWeight('')
    setCoreOrigin('')
    setCustomAttributes([])
    setOptions([])
    setVariants([])
    setPkgType('carton')
    setUnitsPerPkg('1')
    setPkgLengthCm('')
    setPkgWidthCm('')
    setPkgHeightCm('')
    setPkgWeightKg('')
    setPkgFragile(false)
    setPkgStackable(true)
    setSeoTitle('')
    setSeoDescription('')
    setSeoSlug('')
  }

  // Handle Image Selection
  const handleSelectFiles = (files: FileList | File[]) => {
    setError('')
    const newFiles = Array.from(files)

    if (images.length + newFiles.length > 8) {
      setError(isZh ? '最多允许上传 8 张商品图片。' : 'Maximum 8 images allowed.')
      return
    }

    const validItems: ImageFileItem[] = []
    for (const f of newFiles) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
        setError(
          isZh
            ? `图片格式不正确: ${f.name} (只支持 JPG, PNG, WebP)`
            : `Invalid format: ${f.name} (Only JPG, PNG, WebP supported)`
        )
        return
      }
      if (f.size > 10 * 1024 * 1024) {
        setError(
          isZh
            ? `图片文件过大: ${f.name} (不能超过 10MB)`
            : `File too large: ${f.name} (Max 10MB)`
        )
        return
      }
      validItems.push({
        file: f,
        previewUrl: URL.createObjectURL(f),
      })
    }

    setImages((prev) => [...prev, ...validItems])
  }

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const target = prev[index]
      if (target) {
        URL.revokeObjectURL(target.previewUrl)
      }
      return prev.filter((_, i) => i !== index)
    })
  }

  // Handle AI Analysis
  const handleRunAIAnalysis = async () => {
    setError('')
    setSuccess('')

    const imageFiles = images.map((i) => i.file)

    if (imageFiles.length === 0 && !title.trim()) {
      setError(isZh ? '请上传图片或填写商品名称以进行 AI 识别。' : 'Please upload images or enter a product name.')
      return
    }

    setIsAnalyzing(true)

    try {
      const res = await analyzeProductClient({
        productName: title,
        images: imageFiles,
      })

      if (res.success && res.draft) {
        const draft = res.draft
        setAiDraft(draft)

        if (draft.name && !title.trim()) {
          setTitle(draft.name)
        }
        if (draft.category) {
          setCategory(draft.category)
        }
        if (draft.description) {
          setDescription(draft.description)
        }

        setEditableAttributes(draft.attributes || [])
        setAcceptedModules([])
        setDismissedModules([])

        // Auto-fill some extended fields if found in draft
        draft.attributes?.forEach((attr) => {
          if (attr.key.toLowerCase().includes('material') || attr.label.includes('材质')) {
            setCoreMaterial(attr.value)
          } else if (attr.key.toLowerCase().includes('dimension') || attr.label.includes('尺寸')) {
            setCoreDimensions(attr.value)
          } else if (attr.key.toLowerCase().includes('weight') || attr.label.includes('重量')) {
            setCoreWeight(attr.value)
          } else if (attr.key.toLowerCase().includes('origin') || attr.label.includes('产地')) {
            setCoreOrigin(attr.value)
          }
        })

        if (imageFiles.length > 0 && title.trim()) {
          setAnalysisSource('multimodal')
        } else if (imageFiles.length > 0) {
          setAnalysisSource('vision')
        } else {
          setAnalysisSource('text')
        }

        setSuccess(
          isZh
            ? '✨ AI 识别完成！已自动填充基础草稿与关键属性。'
            : '✨ AI Analysis complete! Draft fields populated.'
        )
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isZh
          ? 'AI 分析失败，请重试。'
          : 'AI Analysis failed, please try again.'
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Generate Variant Matrix
  const handleGenerateVariants = () => {
    const validOptions = options
      .filter((opt) => opt.name && opt.code && opt.values.length > 0 && opt.values[0])
      .map((opt) => ({
        code: opt.code,
        values: opt.values.filter((v) => v.trim()),
      }))

    if (validOptions.length === 0) {
      setError(isZh ? '请至少添加一个包含有效值的规格项（如：颜色: 黑色, 白色）' : 'Add at least one valid option item')
      return
    }

    const combinations = generateVariantCombinations(validOptions)
    const baseSkuVal = sku.trim() || 'PROD'
    const basePriceVal = parseFloat(price) || 0
    const baseInventoryVal = parseInt(inventory) || 0

    const newVariants: ProductVariant[] = combinations.map((combo, idx) => {
      const optionValuesStr = Object.values(combo).join('-')
      return {
        id: `var-new-${Date.now()}-${idx}`,
        product_id: '',
        sku: `${baseSkuVal}-${optionValuesStr.toUpperCase().replace(/\s+/g, '')}`,
        price: basePriceVal,
        currency: currency,
        inventory: baseInventoryVal,
        status: 'active',
        option_values: combo,
        raw_data: null,
        semantic_data: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    })

    setVariants(newVariants)
  }

  // Add Custom Attribute
  const handleAddCustomAttribute = () => {
    setCustomAttributes((prev) => [
      ...prev,
      {
        id: `custom-attr-${Date.now()}`,
        key: '',
        label: '',
        value: '',
        unit: '',
        type: 'text',
      },
    ])
  }

  // Auto SEO Generator
  const handleAutoGenerateSEO = () => {
    const pName = title.trim() || (isZh ? '精选高品质商品' : 'Premium Product')
    setSeoTitle(`${pName} | Omnilink Official Store`)
    setSeoDescription(
      description.trim()
        ? description.trim().slice(0, 150)
        : isZh
        ? `探索全新 ${pName}，享受官方旗舰品质保障与极速交付服务。`
        : `Discover the all-new ${pName} with official warranty and fast shipping.`
    )
    setSeoSlug(
      pName
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
    )
  }

  // Submit Handler
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!title.trim()) {
      setError(isZh ? '请填写商品名称' : 'Product name is required')
      return
    }

    setIsSubmitting(true)
    let semanticFailed = false

    try {
      // Collect all consolidated attributes
      const allAttributes = [...editableAttributes]

      if (coreMaterial.trim()) {
        allAttributes.push({
          key: 'core_material',
          label: isZh ? '主要材质' : 'Material',
          value: coreMaterial.trim(),
          type: 'text',
          unit: null,
          confidence: 1.0,
        })
      }
      if (coreDimensions.trim()) {
        allAttributes.push({
          key: 'core_dimensions',
          label: isZh ? '尺寸规格' : 'Dimensions',
          value: coreDimensions.trim(),
          type: 'text',
          unit: null,
          confidence: 1.0,
        })
      }
      if (coreWeight.trim()) {
        allAttributes.push({
          key: 'core_weight',
          label: isZh ? '机身净重' : 'Net Weight',
          value: coreWeight.trim(),
          type: 'number',
          unit: 'g',
          confidence: 1.0,
        })
      }
      if (coreOrigin.trim()) {
        allAttributes.push({
          key: 'core_origin',
          label: isZh ? '制造产地' : 'Origin',
          value: coreOrigin.trim(),
          type: 'text',
          unit: null,
          confidence: 1.0,
        })
      }

      customAttributes.forEach((ca) => {
        if (ca.key.trim() && ca.value.trim()) {
          allAttributes.push({
            key: ca.key.trim(),
            label: ca.label.trim() || ca.key.trim(),
            value: ca.value.trim(),
            type: ca.type,
            unit: ca.unit.trim() || null,
            confidence: 1.0,
          })
        }
      })

      const activeModules = (aiDraft?.suggestedModules || []).filter((m) =>
        acceptedModules.includes(m.key)
      )

      const payload = {
        name: title.trim(),
        sku: sku.trim() || null,
        category: category.trim() || null,
        description: description.trim() || null,
        price: Number(price) || 0,
        currency: currency,
        inventory: Number(inventory) || 0,
        raw_data: {
          ai_draft: aiDraft,
          attributes: allAttributes,
          accepted_modules: activeModules,
          packaging: {
            pkgType,
            unitsPerPkg: Number(unitsPerPkg) || 1,
            lengthCm: Number(pkgLengthCm) || null,
            widthCm: Number(pkgWidthCm) || null,
            heightCm: Number(pkgHeightCm) || null,
            weightKg: Number(pkgWeightKg) || null,
            fragile: pkgFragile,
            stackable: pkgStackable,
          },
          seo: {
            title: seoTitle.trim() || null,
            description: seoDescription.trim() || null,
            slug: seoSlug.trim() || null,
          },
          options: options.filter((o) => o.name.trim()),
          variants: variants,
        },
      }

      // Step 1: Create Product
      const res = await fetchWithRetry(
        '/api/merchant/products',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
        {
          timeoutMs: 30_000,
          maxAttempts: 3,
        }
      )

      if (!res.ok) {
        let message = isZh ? '创建商品失败，请重试' : 'Unable to create product'
        try {
          const body = await res.json()
          if (body?.attribute_validation_failed && body?.product_id) {
            setCreatedProductId(body.product_id)
            const firstIssue = body.issues?.[0]?.message
            message = isZh
              ? `商品基础信息已创建，但属性校验未通过：${firstIssue || '请前往详情页核对属性'}`
              : `Product created, but attribute validation failed: ${firstIssue || 'Please fix attributes in details'}`
          } else if (body?.error) {
            message = body.error
          }
        } catch {
          // ignore
        }
        throw new Error(message)
      }

      const body = await res.json()
      const createdId = body.product?.id || body.id

      if (!createdId) {
        throw new Error(isZh ? '未收到商品创建 ID' : 'Missing created product ID')
      }

      setCreatedProductId(createdId)

      // Step 2: Apply Semantic Attributes
      if (allAttributes.length > 0) {
        try {
          const applyPayload = {
            attributes: allAttributes.map((attr) => ({
              key: attr.key,
              label: attr.label,
              value: attr.value,
              type: attr.type,
              unit: attr.unit || null,
              confidence: attr.confidence,
            })),
          }

          const applyRes = await fetchWithRetry(
            `/api/merchant/products/${createdId}/ai-draft/apply`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(applyPayload),
            },
            {
              timeoutMs: 30_000,
              maxAttempts: 3,
            }
          )

          if (!applyRes.ok) {
            semanticFailed = true
          }
        } catch {
          semanticFailed = true
        }
      }

      // Step 3: Media Upload
      let uploadSuccessCount = 0
      let uploadFailCount = 0

      if (images.length > 0) {
        for (const imgItem of images) {
          const assetId = crypto.randomUUID()
          const uploadRes = await uploadProductMedia({
            productId: createdId,
            assetId,
            file: imgItem.file,
          })

          if (uploadRes.success) {
            uploadSuccessCount++
          } else {
            uploadFailCount++
          }
        }
      }

      // Step 4: Feedback Notice
      let noticeText = isZh ? '商品创建成功！' : 'Product created successfully!'
      if (semanticFailed) {
        noticeText = isZh
          ? '商品已创建，语义数据保存中发生轻微延迟，已记录至草稿。'
          : 'Product created, semantic draft recorded.'
      }

      if (images.length > 0) {
        if (uploadFailCount > 0) {
          noticeText += isZh
            ? ` (${uploadSuccessCount}/${images.length} 张图片上传成功)`
            : ` (${uploadSuccessCount}/${images.length} images uploaded)`
        } else {
          noticeText += isZh
            ? ` 已同步上传 ${uploadSuccessCount} 张正式图片。`
            : ` Attached ${uploadSuccessCount} media assets.`
        }
      }

      setSuccess(noticeText)
      router.refresh()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isZh
          ? '创建商品过程发生错误'
          : 'Error creating product'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (isOpen) {
          resetForm()
        }
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          id="btn-create-product-dialog"
          className="px-4 py-2 rounded-full bg-[#111827] hover:bg-black text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus size={14} className="text-[#edbc40]" />
          <span>{isZh ? '新建商品' : 'Create Product'}</span>
        </button>
      </DialogTrigger>

      {/* 2.5倍宽度容器：max-w-6xl 确保大屏下一页完整呈现双列基础设置与展开的高级配置 */}
      <DialogContent className="max-w-5xl lg:max-w-6xl w-[95vw] p-0 overflow-hidden bg-white rounded-3xl border border-slate-200 shadow-2xl max-h-[92vh] flex flex-col">
        {/* 对话框头部 */}
        <div className="p-5 pb-4 bg-slate-50/90 border-b border-slate-200 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                <Package size={18} className="text-[#edbc40]" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>{isZh ? '新建商品' : 'Create Product'}</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                    Omnilink Studio
                  </span>
                </DialogTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isZh
                    ? '录入商品基础信息与多模态 AI 智能提取，支持展开更多高级设置'
                    : 'Enter product essentials with multimodal AI extraction, expandable with advanced settings'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 可滚动主内容区 */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* ============================================================
              第 1 部分：基础设置（双列排布，左列基础参数，右列商品图片）
              ============================================================ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* 左列 (7 cols): 基础信息输入 */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Package size={14} className="text-slate-600" />
                  <span>{isZh ? '基础信息与定价库存' : 'Essentials & Pricing'}</span>
                </h4>
                <span className="text-[11px] text-slate-400">
                  {isZh ? '星号 * 为必填项' : '* Required fields'}
                </span>
              </div>

              {/* 1. 商品名称 + AI 识别按钮 */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-900">
                  {isZh ? '商品名称 *' : 'Product Name *'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    id="create-product-name"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={isZh ? '例如：Ray-Ban Wayfarer 或 Sony WH-1000XM6' : 'e.g. Ray-Ban Wayfarer or Sony WH-1000XM6'}
                    disabled={isAnalyzing || isSubmitting}
                    className="flex-1 h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={handleRunAIAnalysis}
                    disabled={isAnalyzing || isSubmitting}
                    className="h-10 px-3.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                    title={isZh ? '智能分析名称与已选图片' : 'AI Analyze Name & Images'}
                  >
                    {isAnalyzing ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Sparkles size={13} className="text-[#edbc40]" />
                    )}
                    <span>
                      {isAnalyzing
                        ? isZh ? '分析中...' : 'Analyzing...'
                        : isZh ? 'AI 识别' : 'AI Extract'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Instant Rule-Based Category Suggestion Banner */}
              {localCategorySuggestion && (
                <div className="p-2.5 rounded-xl bg-violet-50/80 border border-violet-200/80 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={13} className="text-violet-600 shrink-0" />
                    <span className="font-bold text-violet-900">{isZh ? '✨ 建议分类:' : '✨ Suggested:'}</span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-violet-200 font-bold text-violet-800 shadow-2xs">
                      {localCategorySuggestion.path.join(' → ')}
                    </span>
                  </div>
                  {category !== localCategorySuggestion.category ? (
                    <button
                      type="button"
                      onClick={() => setCategory(localCategorySuggestion.category)}
                      className="px-2.5 py-1 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-bold cursor-pointer transition-all shadow-2xs"
                    >
                      {isZh ? '采用建议' : 'Apply'}
                    </button>
                  ) : (
                    <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                      <Check size={12} /> {isZh ? '已采用' : 'Applied'}
                    </span>
                  )}
                </div>
              )}

              {/* AI Suggestion vs Local Rule Diff */}
              {aiSuggestedCategory && localCategorySuggestion && aiSuggestedCategory !== localCategorySuggestion.category && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="font-bold">{isZh ? '分类建议对比：' : 'Category Comparison:'}</span>
                    <span className="ml-1 text-[11px]">
                      {isZh
                        ? `本地规则：${localCategorySuggestion.path.join(' → ')} | AI 推荐：${aiSuggestedCategory}`
                        : `Rule: ${localCategorySuggestion.path.join(' → ')} | AI: ${aiSuggestedCategory}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setCategory(localCategorySuggestion.category)}
                      className="px-2 py-0.5 rounded-md bg-white border border-amber-300 text-[11px] font-semibold hover:bg-amber-100/50 cursor-pointer"
                    >
                      {isZh ? '选本地' : 'Rule'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategory(aiSuggestedCategory)}
                      className="px-2 py-0.5 rounded-md bg-white border border-amber-300 text-[11px] font-semibold hover:bg-amber-100/50 cursor-pointer"
                    >
                      {isZh ? '选 AI' : 'AI'}
                    </button>
                  </div>
                </div>
              )}

              {/* AI 分析来源提示 */}
              {analysisSource && (
                <div className="flex items-center gap-2 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                  <Sparkles size={13} className="shrink-0 text-amber-600" />
                  <span>
                    {analysisSource === 'text' && (isZh ? '已基于商品名称生成草稿' : 'Generated from product name')}
                    {analysisSource === 'vision' && (isZh ? '已基于右侧图片视觉理解生成草稿' : 'Generated from vision analysis')}
                    {analysisSource === 'multimodal' && (isZh ? '已结合图片与名称完成多模态分析' : 'Multimodal analysis complete')}
                  </span>
                </div>
              )}

              {/* 2. SKU 与品类 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    {isZh ? '商品货号 (SKU)' : 'SKU'}
                  </label>
                  <input
                    type="text"
                    id="create-product-sku"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="例如：PROD-001"
                    disabled={isSubmitting}
                    className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-900">
                      {isZh ? '商品分类' : 'Product Category'}
                    </label>
                    <span className="text-[10px] text-slate-400">
                      {isZh ? '可直接输入或选建议' : 'Custom / suggestions'}
                    </span>
                  </div>
                  <input
                    type="text"
                    id="create-product-category"
                    list="dialog-category-suggestions"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder={isZh ? '输入分类（如：太阳镜、耳机）' : 'Type category...'}
                    disabled={isSubmitting}
                    className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                  />
                  <datalist id="dialog-category-suggestions">
                    {COMMON_CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* 3. 价格 / 币种 / 库存 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    {isZh ? '基础售价 *' : 'Price *'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                      {currency === 'USD' ? '$' : '¥'}
                    </span>
                    <input
                      type="number"
                      id="create-product-price"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      disabled={isSubmitting}
                      className="w-full h-9 pl-7 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    {isZh ? '店铺基础币种' : 'Store Currency'}
                  </label>
                  <div
                    id="create-product-currency-display"
                    className="w-full h-9 px-3 rounded-xl bg-slate-100/90 border border-slate-200 text-xs font-semibold text-slate-800 flex items-center justify-between select-none"
                    title={isZh ? '继承自店铺基础货币，无法在此单独修改' : 'Inherited from Store Base Currency'}
                  >
                    <span>{currency === 'USD' ? 'USD (美元 $)' : 'CNY (人民币 ¥)'}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-600 font-medium">
                      {isZh ? '店铺统一' : 'Store Base'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    {isZh ? '初始库存' : 'Inventory'}
                  </label>
                  <input
                    type="number"
                    id="create-product-inventory"
                    value={inventory}
                    onChange={(e) => setInventory(e.target.value)}
                    min="0"
                    step="1"
                    placeholder="100"
                    disabled={isSubmitting}
                    className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                  />
                </div>
              </div>

              {/* 4. 商品描述与卖点 */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  {isZh ? '商品描述与核心卖点' : 'Description & Key Features'}
                </label>
                <textarea
                  id="create-product-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder={isZh ? '输入商品核心卖点、设计亮点与适用场景...' : 'Enter key highlights, design features, and use cases...'}
                  disabled={isSubmitting}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 leading-relaxed"
                />
              </div>

              {/* 5. AI 识别草稿展示卡片（如果已分析） */}
              {editableAttributes.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-900 text-white space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[#edbc40] font-bold text-xs">
                      <Sparkles size={14} />
                      <span>{isZh ? 'AI 识别到的商品属性' : 'AI Extracted Attributes'}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {editableAttributes.length} {isZh ? '项已确认' : 'items'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {editableAttributes.map((attr, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs"
                      >
                        <div className="truncate pr-1">
                          <span className="text-slate-400 font-medium">{attr.label || attr.key}: </span>
                          <span className="text-white font-semibold">
                            {attr.value} {attr.unit || ''}
                          </span>
                        </div>
                        <span className="shrink-0 text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-300">
                          {(attr.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 右列 (5 cols): 商品图片与多媒体 */}
            <div className="lg:col-span-5 space-y-3 bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-slate-600" />
                  <span>{isZh ? '商品图片 (右列多媒体)' : 'Product Media (Right Column)'}</span>
                </h4>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200">
                  {images.length}/8
                </span>
              </div>

              {/* Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  if (e.dataTransfer.files) {
                    handleSelectFiles(e.dataTransfer.files)
                  }
                }}
                className="border-2 border-dashed border-slate-300 hover:border-slate-800 bg-white hover:bg-slate-50/80 rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      handleSelectFiles(e.target.files)
                      e.target.value = ''
                    }
                  }}
                />
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                  <Upload size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    {isZh ? '点击或拖拽上传图片' : 'Click or drag & drop to upload'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isZh ? '支持 JPG、PNG、WebP，单张 ≤10MB（最多 8 张）' : 'JPG, PNG, WebP ≤10MB (Up to 8)'}
                  </p>
                </div>
              </div>

              {/* Thumbnails preview with Cover badge */}
              {images.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-slate-600 flex items-center justify-between">
                    <span>{isZh ? '已选图片（首张为主图）:' : 'Selected Media (First is Cover):'}</span>
                    <button
                      type="button"
                      onClick={handleRunAIAnalysis}
                      disabled={isAnalyzing}
                      className="text-[11px] font-bold text-slate-900 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles size={11} className="text-[#edbc40]" />
                      <span>{isZh ? '视觉分析' : 'Vision Analyze'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {images.map((item, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-xl border border-slate-200 overflow-hidden group shadow-2xs bg-white"
                      >
                        <img
                          src={item.previewUrl}
                          alt={`upload-${idx}`}
                          className="w-full h-full object-cover"
                        />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded bg-slate-900/90 text-white text-[9px] font-bold shadow-xs">
                            {isZh ? '主图' : 'Cover'}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveImage(idx)
                          }}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-900/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-rose-600 transition-all cursor-pointer"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ============================================================
              第 2 部分：高级工作台合并 -> 更多设置（卡片折叠，点击向下扩展）
              ============================================================ */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
            {/* 折叠触发条 */}
            <div
              onClick={() => setMoreSettingsExpanded((prev) => !prev)}
              className="p-4 bg-slate-50/80 hover:bg-slate-100/80 transition-colors cursor-pointer flex items-center justify-between select-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                  <Sliders size={15} className="text-[#edbc40]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      {isZh ? '更多设置' : 'More Settings'}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 text-[10px] font-semibold">
                      {isZh ? '规格变体 · 物流包装 · SEO · 扩展属性' : 'Variants, Logistics, SEO, Specs'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {isZh
                      ? '包含高级工作台全部深度配置，按需展开填写，未填写项将使用系统默认值'
                      : 'Comprehensive advanced configurations merged into collapsible cards'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">
                  {moreSettingsExpanded ? (isZh ? '收起更多设置' : 'Collapse') : (isZh ? '展开更多设置' : 'Expand')}
                </span>
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700">
                  {moreSettingsExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </div>
              </div>
            </div>

            {/* 向下展开的内容面板 */}
            {moreSettingsExpanded && (
              <div className="p-5 border-t border-slate-200 space-y-5 animate-fadeIn">
                {/* 选项卡导航 */}
                <div className="flex items-center gap-1.5 border-b border-slate-100 pb-3 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTab('attributes')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'attributes'
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Tag size={13} />
                    <span>{isZh ? '1. 扩展属性与规格' : '1. Attributes & Specs'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('variants')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'variants'
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Layers size={13} />
                    <span>{isZh ? '2. 多规格矩阵 (Variants)' : '2. Variants Matrix'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('packaging')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'packaging'
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Truck size={13} />
                    <span>{isZh ? '3. 物流与包装规格' : '3. Packaging & Logistics'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('seo')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'seo'
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Search size={13} />
                    <span>{isZh ? '4. 搜索引擎优化 (SEO)' : '4. SEO & AI Discoverability'}</span>
                  </button>
                </div>

                {/* Tab 1: 扩展属性与规格参数 */}
                {activeTab === 'attributes' && (() => {
                  const activeTemplate = getCategoryTemplate(category)
                  return (
                    <div className="space-y-4">
                      {/* 通用基础物理属性 */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-800 mb-1">
                            {isZh ? '主要材质 (Material)' : 'Material'}
                          </label>
                          <input
                            type="text"
                            value={coreMaterial}
                            onChange={(e) => setCoreMaterial(e.target.value)}
                            placeholder={isZh ? '例如：钛合金 / TR90' : 'e.g. Titanium / TR90'}
                            className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-800 mb-1">
                            {isZh ? '机身尺寸 (Dimensions)' : 'Dimensions'}
                          </label>
                          <input
                            type="text"
                            value={coreDimensions}
                            onChange={(e) => setCoreDimensions(e.target.value)}
                            placeholder={isZh ? '例如：145 x 48 x 140 mm' : 'e.g. 145 x 48 x 140 mm'}
                            className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-800 mb-1">
                            {isZh ? '机身净重 (Weight)' : 'Net Weight'}
                          </label>
                          <input
                            type="text"
                            value={coreWeight}
                            onChange={(e) => setCoreWeight(e.target.value)}
                            placeholder={isZh ? '例如：28g' : 'e.g. 28g'}
                            className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-800 mb-1">
                            {isZh ? '制造产地 (Origin)' : 'Origin'}
                          </label>
                          <input
                            type="text"
                            value={coreOrigin}
                            onChange={(e) => setCoreOrigin(e.target.value)}
                            placeholder={isZh ? '例如：中国 (China)' : 'e.g. China'}
                            className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                          />
                        </div>
                      </div>

                      {/* 品类规格模板 */}
                      {activeTemplate ? (
                        <div className="p-3.5 rounded-xl bg-violet-50/50 border border-violet-200/80 space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="px-2 py-0.5 rounded-md bg-white border border-violet-200 text-violet-800 text-[11px] font-bold">
                              {isZh ? activeTemplate.titleZh : activeTemplate.titleEn}
                            </div>
                            <span className="text-[11px] text-slate-500">
                              {isZh ? activeTemplate.descriptionZh : activeTemplate.descriptionEn}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                            {activeTemplate.fields.map((field) => {
                              const existing = customAttributes.find((c) => c.key === field.key)
                              return (
                                <div key={field.key} className="bg-white p-2.5 rounded-lg border border-slate-200/80 space-y-1">
                                  <label className="text-[11px] font-bold text-slate-700 block">
                                    {isZh ? field.nameZh : field.nameEn}
                                    {field.unit ? ` (${field.unit})` : ''}
                                  </label>
                                  {field.type === 'select' ? (
                                    <select
                                      value={existing?.value || ''}
                                      onChange={(e) => {
                                        const val = e.target.value
                                        setCustomAttributes((prev) => {
                                          const filtered = prev.filter((c) => c.key !== field.key)
                                          if (!val) return filtered
                                          return [
                                            ...filtered,
                                            {
                                              id: `tpl-${field.key}`,
                                              key: field.key,
                                              label: isZh ? field.nameZh : field.nameEn,
                                              value: val,
                                              unit: field.unit || '',
                                              type: 'select',
                                            },
                                          ]
                                        })
                                      }}
                                      className="w-full h-7 px-2 rounded bg-slate-50 border border-slate-200 text-xs"
                                    >
                                      <option value="">{isZh ? '-- 请选择 --' : '-- Select --'}</option>
                                      {field.options?.map((opt) => (
                                        <option key={opt} value={opt}>
                                          {opt}
                                        </option>
                                      ))}
                                    </select>
                                  ) : (
                                    <input
                                      type={field.type === 'number' ? 'number' : 'text'}
                                      value={existing?.value || ''}
                                      onChange={(e) => {
                                        const val = e.target.value
                                        setCustomAttributes((prev) => {
                                          const filtered = prev.filter((c) => c.key !== field.key)
                                          if (!val) return filtered
                                          return [
                                            ...filtered,
                                            {
                                              id: `tpl-${field.key}`,
                                              key: field.key,
                                              label: isZh ? field.nameZh : field.nameEn,
                                              value: val,
                                              unit: field.unit || '',
                                              type: field.type,
                                            },
                                          ]
                                        })
                                      }}
                                      placeholder={
                                        (isZh ? field.placeholderZh : field.placeholderEn) ||
                                        (isZh ? '待输入' : 'Enter value')
                                      }
                                      className="w-full h-7 px-2 rounded bg-slate-50 border border-slate-200 text-xs"
                                    />
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="py-4 px-3 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 text-slate-500 text-xs space-y-1">
                          <p className="font-semibold text-slate-700">
                            {isZh ? '通用属性 (Custom Attributes)' : 'Custom Attributes'}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {isZh
                              ? '当前品类暂无专用属性模板，可自行添加商品规格。'
                              : 'No dedicated attribute template for this category yet. You may add custom product specifications.'}
                          </p>
                        </div>
                      )}

                      {/* 自定义键值对属性 */}
                      <div className="pt-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-900">
                            {activeTemplate
                              ? isZh
                                ? '其他自定义属性 (Additional Attributes)'
                                : 'Additional Attributes'
                              : isZh
                              ? '自定义键值对属性 (Custom Key-Value Attributes)'
                              : 'Custom Attributes'}
                          </span>
                          <button
                            type="button"
                            onClick={handleAddCustomAttribute}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Plus size={12} />
                            <span>{isZh ? '添加属性' : 'Add Field'}</span>
                          </button>
                        </div>

                        {customAttributes.filter(
                          (ca) => !activeTemplate?.fields.some((f) => f.key === ca.key)
                        ).length === 0 ? (
                          <p className="text-xs text-slate-400 italic">
                            {isZh ? '暂无其他自定义属性，点击上方按钮可添加特殊行业参数。' : 'No custom attributes added.'}
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {customAttributes
                              .filter((ca) => !activeTemplate?.fields.some((f) => f.key === ca.key))
                              .map((ca, idx) => (
                                <div key={ca.id} className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={ca.label}
                                    onChange={(e) => {
                                      const updated = [...customAttributes]
                                      const targetIdx = customAttributes.findIndex((c) => c.id === ca.id)
                                      if (targetIdx !== -1) {
                                        updated[targetIdx].label = e.target.value
                                        updated[targetIdx].key = e.target.value.toLowerCase().replace(/\s+/g, '_')
                                        setCustomAttributes(updated)
                                      }
                                    }}
                                    placeholder={isZh ? '属性名称（如：蓝牙版本）' : 'Field Name'}
                                    className="w-1/3 h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold"
                                  />
                                  <input
                                    type="text"
                                    value={ca.value}
                                    onChange={(e) => {
                                      const updated = [...customAttributes]
                                      const targetIdx = customAttributes.findIndex((c) => c.id === ca.id)
                                      if (targetIdx !== -1) {
                                        updated[targetIdx].value = e.target.value
                                        setCustomAttributes(updated)
                                      }
                                    }}
                                    placeholder={isZh ? '属性值（如：5.3）' : 'Field Value'}
                                    className="flex-1 h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                                  />
                                  <input
                                    type="text"
                                    value={ca.unit}
                                    onChange={(e) => {
                                      const updated = [...customAttributes]
                                      const targetIdx = customAttributes.findIndex((c) => c.id === ca.id)
                                      if (targetIdx !== -1) {
                                        updated[targetIdx].unit = e.target.value
                                        setCustomAttributes(updated)
                                      }
                                    }}
                                    placeholder={isZh ? '单位 (可选)' : 'Unit'}
                                    className="w-20 h-8 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-center"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setCustomAttributes((prev) => prev.filter((c) => c.id !== ca.id))
                                    }
                                    className="w-8 h-8 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })()}

                {/* Tab 2: 多规格矩阵 */}
                {activeTab === 'variants' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          {isZh ? '规格选项配置 (Options & Variants)' : 'Options & Variants'}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {isZh ? '例如：颜色（曜石黑、珍珠白）、尺码（S、M、L）' : 'Define option groups such as Color, Size'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const newOpt: ProductOption = {
                              id: `opt-${Date.now()}`,
                              product_id: '',
                              name: isZh ? '颜色' : 'Color',
                              code: 'color',
                              position: options.length,
                              values: [isZh ? '曜石黑' : 'Black', isZh ? '珍珠白' : 'White'],
                              created_at: new Date().toISOString(),
                            }
                            setOptions([...options, newOpt])
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus size={12} />
                          <span>{isZh ? '添加规格组' : 'Add Option Group'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleGenerateVariants}
                          className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-black text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles size={11} className="text-[#edbc40]" />
                          <span>{isZh ? '生成变体矩阵' : 'Generate Matrix'}</span>
                        </button>
                      </div>
                    </div>

                    {options.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">
                        {isZh ? '当前为单规格商品。如需多颜色/多尺码矩阵，请点击上方“添加规格组”。' : 'Single variant product. Add option groups above if multi-variant needed.'}
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {options.map((opt, optIdx) => (
                          <div key={opt.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={opt.name}
                                  onChange={(e) => {
                                    const updated = [...options]
                                    updated[optIdx].name = e.target.value
                                    updated[optIdx].code = e.target.value.toLowerCase().replace(/\s+/g, '_')
                                    setOptions(updated)
                                  }}
                                  placeholder={isZh ? '规格名（如：颜色）' : 'Option Name'}
                                  className="h-7 px-2 rounded-md bg-white border border-slate-200 text-xs font-bold text-slate-900"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => setOptions(options.filter((_, i) => i !== optIdx))}
                                className="text-slate-400 hover:text-rose-600 transition-colors"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5">
                              {opt.values.map((v, valIdx) => (
                                <div key={valIdx} className="flex items-center bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-xs">
                                  <input
                                    type="text"
                                    value={v}
                                    onChange={(e) => {
                                      const updated = [...options]
                                      updated[optIdx].values[valIdx] = e.target.value
                                      setOptions(updated)
                                    }}
                                    className="w-16 text-xs text-slate-800 focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...options]
                                      updated[optIdx].values = updated[optIdx].values.filter((_, i) => i !== valIdx)
                                      setOptions(updated)
                                    }}
                                    className="text-slate-400 hover:text-rose-600 ml-1"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...options]
                                  updated[optIdx].values.push('')
                                  setOptions(updated)
                                }}
                                className="px-2 py-0.5 rounded-lg border border-dashed border-slate-300 text-slate-500 hover:text-slate-800 text-xs font-semibold"
                              >
                                + {isZh ? '添加值' : 'Value'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 变体矩阵生成结果预览 */}
                    {variants.length > 0 && (
                      <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="w-full text-left text-xs bg-white">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                              <th className="py-2 px-3">{isZh ? '变体组合' : 'Variant Combination'}</th>
                              <th className="py-2 px-3">{isZh ? 'SKU 编码' : 'SKU'}</th>
                              <th className="py-2 px-3">{isZh ? '独立售价' : 'Price'}</th>
                              <th className="py-2 px-3">{isZh ? '库存' : 'Stock'}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {variants.map((v, vIdx) => (
                              <tr key={v.id} className="border-b border-slate-100">
                                <td className="py-2 px-3 font-semibold text-slate-900">
                                  {Object.entries(v.option_values)
                                    .map(([k, val]) => `${val}`)
                                    .join(' / ')}
                                </td>
                                <td className="py-2 px-3">
                                  <input
                                    type="text"
                                    value={v.sku ?? ''}
                                    onChange={(e) => {
                                      const updated = [...variants]
                                      updated[vIdx].sku = e.target.value
                                      setVariants(updated)
                                    }}
                                    className="h-7 px-2 rounded bg-slate-50 border border-slate-200 text-xs font-mono w-full"
                                  />
                                </td>
                                <td className="py-2 px-3">
                                  <input
                                    type="number"
                                    value={v.price ?? ''}
                                    onChange={(e) => {
                                      const updated = [...variants]
                                      updated[vIdx].price = parseFloat(e.target.value) || 0
                                      setVariants(updated)
                                    }}
                                    className="h-7 px-2 rounded bg-slate-50 border border-slate-200 text-xs font-bold w-24"
                                  />
                                </td>
                                <td className="py-2 px-3">
                                  <input
                                    type="number"
                                    value={v.inventory ?? ''}
                                    onChange={(e) => {
                                      const updated = [...variants]
                                      updated[vIdx].inventory = parseInt(e.target.value) || 0
                                      setVariants(updated)
                                    }}
                                    className="h-7 px-2 rounded bg-slate-50 border border-slate-200 text-xs font-bold w-20"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 3: 物流与包装规格 */}
                {activeTab === 'packaging' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-800 mb-1">
                          {isZh ? '外包装箱类型' : 'Package Type'}
                        </label>
                        <select
                          value={pkgType}
                          onChange={(e) => setPkgType(e.target.value as any)}
                          className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900"
                        >
                          <option value="carton">{isZh ? '瓦楞纸箱 (Carton Box)' : 'Carton Box'}</option>
                          <option value="bag">{isZh ? '快递/防尘袋 (Poly Bag)' : 'Poly Bag'}</option>
                          <option value="crate">{isZh ? '加强木箱 (Wooden Crate)' : 'Wooden Crate'}</option>
                          <option value="pallet">{isZh ? '标准托盘 (Pallet)' : 'Pallet'}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-800 mb-1">
                          {isZh ? '单箱装箱件数' : 'Units Per Package'}
                        </label>
                        <input
                          type="number"
                          value={unitsPerPkg}
                          onChange={(e) => setUnitsPerPkg(e.target.value)}
                          min="1"
                          className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-800 mb-1">
                          {isZh ? '单箱毛重 (Gross Weight, kg)' : 'Gross Weight (kg)'}
                        </label>
                        <input
                          type="number"
                          value={pkgWeightKg}
                          onChange={(e) => setPkgWeightKg(e.target.value)}
                          placeholder="例如：2.5"
                          step="0.1"
                          className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-800 mb-1">
                          {isZh ? '外箱长 (Length, cm)' : 'Length (cm)'}
                        </label>
                        <input
                          type="number"
                          value={pkgLengthCm}
                          onChange={(e) => setPkgLengthCm(e.target.value)}
                          placeholder="30"
                          className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-800 mb-1">
                          {isZh ? '外箱宽 (Width, cm)' : 'Width (cm)'}
                        </label>
                        <input
                          type="number"
                          value={pkgWidthCm}
                          onChange={(e) => setPkgWidthCm(e.target.value)}
                          placeholder="20"
                          className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-800 mb-1">
                          {isZh ? '外箱高 (Height, cm)' : 'Height (cm)'}
                        </label>
                        <input
                          type="number"
                          value={pkgHeightCm}
                          onChange={(e) => setPkgHeightCm(e.target.value)}
                          placeholder="15"
                          className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-6 pt-1">
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pkgFragile}
                          onChange={(e) => setPkgFragile(e.target.checked)}
                          className="w-4 h-4 rounded text-slate-900"
                        />
                        <span>{isZh ? '易碎品警示 (Fragile Goods)' : 'Fragile Goods'}</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pkgStackable}
                          onChange={(e) => setPkgStackable(e.target.checked)}
                          className="w-4 h-4 rounded text-slate-900"
                        />
                        <span>{isZh ? '允许仓库堆叠 (Stackable)' : 'Stackable in Warehouse'}</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Tab 4: SEO 优化 */}
                {activeTab === 'seo' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        {isZh ? '搜索引擎元数据与 AI 语义可索引性' : 'Search Engine Metadata & LLM Indexability'}
                      </span>
                      <button
                        type="button"
                        onClick={handleAutoGenerateSEO}
                        className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles size={12} className="text-[#edbc40]" />
                        <span>{isZh ? '一键生成 SEO TDK' : 'Auto Generate SEO'}</span>
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1">
                        {isZh ? 'SEO 网页标题 (Meta Title)' : 'Meta Title'}
                      </label>
                      <input
                        type="text"
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        placeholder="例如：OmniAudio Pro 降噪无线耳麦 | 官方旗舰店"
                        className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1">
                        {isZh ? 'SEO 网页描述 (Meta Description)' : 'Meta Description'}
                      </label>
                      <textarea
                        value={seoDescription}
                        onChange={(e) => setSeoDescription(e.target.value)}
                        rows={2}
                        placeholder="例如：官方正品保证，支持主动降噪与全天候续航，享受极速顺丰配送与 2 年联保服务。"
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1">
                        {isZh ? '自定义 URL 路径别名 (Slug)' : 'URL Handle / Slug'}
                      </label>
                      <input
                        type="text"
                        value={seoSlug}
                        onChange={(e) => setSeoSlug(e.target.value)}
                        placeholder="e.g. omniaudio-pro-wireless"
                        className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 错误提示框 */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0 text-rose-600" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* 成功提示框 */}
          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
                <span className="font-semibold">{success}</span>
              </div>
              {createdProductId && (
                <Link
                  href={`/dashboard/products/${createdProductId}/edit`}
                  onClick={() => {
                    setOpen(false)
                    resetForm()
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 hover:text-black bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs transition-colors shrink-0"
                >
                  <span>{isZh ? '在工作台中查看' : 'Open in Workspace'}</span>
                  <ExternalLink size={12} />
                </Link>
              )}
            </div>
          )}
        </div>

        {/* 底部操作栏 */}
        <div className="p-4 bg-slate-50/90 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <Info size={13} className="text-slate-400" />
            <span>
              {isZh
                ? '支持随时在商品列表中二次编辑或修改高级工作台参数'
                : 'Full workspace editing available anytime after creation'}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={isSubmitting || isAnalyzing}
              className="px-5 h-10 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              {isZh ? '取消' : 'Cancel'}
            </button>

            <button
              type="button"
              onClick={submit}
              disabled={isSubmitting || isAnalyzing}
              id="btn-submit-create-product"
              className="px-6 h-10 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Check size={15} />
              )}
              <span>
                {isSubmitting
                  ? isZh ? '正在创建并同步...' : 'Creating…'
                  : isZh ? '确认创建商品' : 'Create Product'}
              </span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
