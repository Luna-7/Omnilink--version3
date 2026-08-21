'use client'

import { useState, useRef } from 'react'
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
  Eye,
  FileText,
} from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { analyzeProductClient } from '@/lib/product-ai/analyze-client'
import type { ProductDraft } from '@/lib/product-ai/types'

const PRESET_CATEGORIES = [
  { zh: '音频声学', en: 'Audio & Acoustics' },
  { zh: '智能穿戴', en: 'Wearable Tech' },
  { zh: '消费电子', en: 'Consumer Electronics' },
  { zh: '数码周边', en: 'Digital Accessories' },
  { zh: '智能家居', en: 'Smart Home' },
]

interface ImageFileItem {
  file: File
  previewUrl: string
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

  // Input states
  const [images, setImages] = useState<ImageFileItem[]>([])
  const [title, setTitle] = useState('')
  const [sku, setSku] = useState('')
  const [category, setCategory] = useState(isZh ? '音频声学' : 'Audio & Acoustics')
  const [price, setPrice] = useState('1299')
  const [currency, setCurrency] = useState('CNY')
  const [inventory, setInventory] = useState('100')
  const [description, setDescription] = useState('')

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

  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetForm = () => {
    // Revoke old object URLs
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
  }

  // Handle Image Selection
  const handleSelectFiles = (files: FileList | File[]) => {
    setError('')
    const newFiles = Array.from(files)

    if (images.length + newFiles.length > 5) {
      setError(isZh ? '最多允许上传 5 张商品图片。' : 'Maximum 5 images allowed.')
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
      setError(isZh ? '请上传图片或填写商品名称。' : 'Please upload images or enter a product name.')
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

        if (imageFiles.length > 0 && title.trim()) {
          setAnalysisSource('multimodal')
        } else if (imageFiles.length > 0) {
          setAnalysisSource('vision')
        } else {
          setAnalysisSource('text')
        }

        setSuccess(
          isZh
            ? '✨ AI 分析完成！请确认或修改下方生成的商品草稿。'
            : '✨ AI Analysis complete! Please confirm or edit draft below.'
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

  // Accept or Dismiss Module
  const handleToggleModule = (key: string, accept: boolean) => {
    if (accept) {
      setAcceptedModules((prev) => [...prev.filter((k) => k !== key), key])
      setDismissedModules((prev) => prev.filter((k) => k !== key))
    } else {
      setDismissedModules((prev) => [...prev.filter((k) => k !== key), key])
      setAcceptedModules((prev) => prev.filter((k) => k !== key))
    }
  }

  // Confidence Badge Renderer
  const renderConfidenceBadge = (score: number) => {
    if (score >= 0.85) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
          {isZh ? '高' : 'High'} ({(score * 100).toFixed(0)}%)
        </span>
      )
    }
    if (score >= 0.6) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
          {isZh ? '待确认' : 'Pending'} ({(score * 100).toFixed(0)}%)
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold">
        {isZh ? '低' : 'Low'} ({(score * 100).toFixed(0)}%)
      </span>
    )
  }

  // Create Product Submit Handler
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!title.trim()) {
      setError(isZh ? '请填写商品名称' : 'Product name is required')
      return
    }

    setIsSubmitting(true)
    try {
      // Step 1: Create Product
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
          attributes: editableAttributes,
          accepted_modules: activeModules,
        },
      }

      const res = await fetch('/api/merchant/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        let message = isZh ? '创建商品失败，请重试' : 'Unable to create product'
        try {
          const body = await res.json()
          if (body?.error) message = body.error
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

      // Step 2: Upload images if present
      let uploadSuccessCount = 0
      let uploadFailCount = 0

      if (images.length > 0) {
        for (const imgItem of images) {
          try {
            const formData = new FormData()
            formData.append('product_id', createdId)
            formData.append('asset_id', crypto.randomUUID())
            formData.append('file', imgItem.file)

            const uploadRes = await fetch('/api/merchant/media/upload', {
              method: 'POST',
              body: formData,
            })

            if (uploadRes.ok) {
              uploadSuccessCount++
            } else {
              uploadFailCount++
            }
          } catch (uploadErr) {
            console.error('Failed to upload image:', uploadErr)
            uploadFailCount++
          }
        }
      }

      let noticeText = isZh
        ? '商品创建成功！'
        : 'Product created successfully!'
      if (images.length > 0) {
        if (uploadFailCount === 0) {
          noticeText += isZh
            ? ` 已包含 ${uploadSuccessCount} 张正式主图。`
            : ` Attached ${uploadSuccessCount} media assets.`
        } else {
          noticeText += isZh
            ? ` (${uploadSuccessCount} 张图片上传成功，${uploadFailCount} 张失败)`
            : ` (${uploadSuccessCount} uploaded, ${uploadFailCount} failed)`
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
          className="px-4 py-2 rounded-full bg-[#111827] hover:bg-black text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus size={14} className="text-[#edbc40]" />
          <span>{isZh ? '添加产品' : 'Add Product'}</span>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-xl p-0 overflow-hidden bg-white rounded-3xl border border-slate-200 shadow-2xl max-h-[90vh] flex flex-col">
        {/* 对话框头部 */}
        <div className="p-5 pb-4 bg-slate-50/80 border-b border-slate-200 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                <Package size={17} className="text-[#edbc40]" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900">
                  {isZh ? '快速新建商品 (AI Quick Create)' : 'Quick Create Product'}
                </DialogTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isZh
                    ? '上传图片或输入名称，Gemini 多模态 AI 智能提取属性与草稿'
                    : 'Upload images or name for Gemini Multimodal AI understanding'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 快捷直达高级工作台 link */}
        <div className="mx-5 mt-3 p-2.5 rounded-xl bg-slate-100/80 border border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Layers size={14} className="text-slate-800" />
            <span className="text-xs text-slate-700 font-medium">
              {isZh ? '需要复杂颜色/尺码多规格矩阵？' : 'Need multi-variant matrix?'}
            </span>
          </div>
          <Link
            href="/dashboard/products/new"
            onClick={() => setOpen(false)}
            className="text-xs font-bold text-slate-900 hover:text-violet-600 flex items-center gap-1 transition-colors"
          >
            <span>{isZh ? '前往高级工作台' : 'Open Workspace'}</span>
            <ExternalLink size={12} />
          </Link>
        </div>

        {/* 可滚动表单区域 */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* 1. 商品图片上传区域 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>{isZh ? '商品图片 (可选)' : 'Product Images (Optional)'}</span>
                <span className="text-[11px] font-normal text-slate-500">
                  {images.length}/5
                </span>
              </label>
              <span className="text-[11px] text-slate-400">
                {isZh ? '支持 JPG, PNG, WebP (≤10MB)' : 'JPG, PNG, WebP (≤10MB)'}
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
              className="border-2 border-dashed border-slate-200 hover:border-violet-400 bg-slate-50/50 hover:bg-violet-50/30 rounded-2xl p-4 text-center cursor-pointer transition-all"
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
              <div className="flex flex-col items-center gap-1.5 text-slate-500">
                <Upload size={20} className="text-slate-400" />
                <p className="text-xs font-semibold text-slate-700">
                  {isZh ? '拖入图片 或 点击选择文件上传' : 'Drag & drop or click to upload'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {isZh ? '最多 5 张。无图片亦可基于文字智能生成草稿' : 'Max 5 images. Optional.'}
                </p>
              </div>
            </div>

            {/* Image Thumbnails Preview */}
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2.5 mt-3">
                {images.map((item, idx) => (
                  <div
                    key={idx}
                    className="relative w-16 h-16 rounded-xl border border-slate-200 overflow-hidden group shadow-xs bg-white"
                  >
                    <img
                      src={item.previewUrl}
                      alt={`upload-${idx}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveImage(idx)
                      }}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-900/80 text-white flex items-center justify-center opacity-90 group-hover:opacity-100 hover:bg-rose-600 transition-colors cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. 商品名称输入 + AI 识别按钮 */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-900">
              {isZh ? '商品名称 (可选)' : 'Product Name (Optional)'}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isZh ? '例如：OmniVibe Max 降噪无线耳麦' : 'e.g. OmniVibe Max Wireless Headset'}
                disabled={isAnalyzing || isSubmitting}
                className="flex-1 h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 disabled:opacity-50"
              />

              <button
                type="button"
                onClick={handleRunAIAnalysis}
                disabled={isAnalyzing || isSubmitting}
                className="h-10 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isAnalyzing ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Sparkles size={14} className="text-amber-300" />
                )}
                <span>
                  {isAnalyzing
                    ? isZh
                      ? 'AI 识别中...'
                      : 'Analyzing...'
                    : isZh
                    ? '✨ AI 识别商品'
                    : '✨ AI Analyze'}
                </span>
              </button>
            </div>
          </div>

          {/* AI 分析来源提示标志 */}
          {analysisSource && (
            <div className="flex items-center gap-2 text-[11px] text-violet-700 bg-violet-50 border border-violet-200 px-3 py-1.5 rounded-xl">
              <Sparkles size={13} className="shrink-0" />
              <span>
                {analysisSource === 'text' && (isZh ? '已基于商品名称生成草稿' : 'Generated from product name')}
                {analysisSource === 'vision' && (isZh ? '已基于视觉理解生成草稿' : 'Generated from vision analysis')}
                {analysisSource === 'multimodal' && (isZh ? '已结合图片与名称完成多模态分析' : 'Multimodal analysis complete')}
              </span>
            </div>
          )}

          {/* 3. AI 识别结果展示 (Draft Results) */}
          {aiDraft && (
            <div className="p-3.5 rounded-2xl bg-slate-900 text-white space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                  <Sparkles size={14} />
                  <span>{isZh ? 'AI 识别草稿确认' : 'AI Draft Review'}</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {isZh ? '可以自由修改下方数据' : 'Editable draft'}
                </span>
              </div>

              {/* 识别到的属性列表 */}
              {editableAttributes.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-slate-300 mb-1.5">
                    {isZh ? '识别到的属性 (Identified Attributes):' : 'Identified Attributes:'}
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
                        <div className="shrink-0">
                          {renderConfidenceBadge(attr.confidence)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI 建议模块提案 */}
              {aiDraft.suggestedModules && aiDraft.suggestedModules.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-slate-300 mb-1.5">
                    {isZh ? 'AI 建议扩展模块 (Suggested Modules):' : 'Suggested Modules:'}
                  </div>
                  <div className="space-y-1.5">
                    {aiDraft.suggestedModules.map((mod) => {
                      const isAccepted = acceptedModules.includes(mod.key)
                      const isDismissed = dismissedModules.includes(mod.key)
                      return (
                        <div
                          key={mod.key}
                          className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <Tag size={13} className="text-violet-400" />
                            <span className="font-semibold text-slate-200">{mod.label}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleToggleModule(mod.key, true)}
                              className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                                isAccepted
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                              }`}
                            >
                              <Check size={11} />
                              <span>{isZh ? '接受' : 'Accept'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleModule(mod.key, false)}
                              className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                                isDismissed
                                  ? 'bg-rose-600/80 text-white'
                                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                              }`}
                            >
                              <X size={11} />
                              <span>{isZh ? '忽略' : 'Dismiss'}</span>
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. 基础字段与表单控制 */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  {isZh ? '商品货号 (SKU)' : 'SKU'}
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="例如：PROD-001"
                  disabled={isSubmitting}
                  className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  {isZh ? '商品品类' : 'Category'}
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder={isZh ? '例如：音频声学' : 'e.g. Audio'}
                  disabled={isSubmitting}
                  className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                />
              </div>
            </div>

            {/* 品类预设标签 */}
            <div className="flex flex-wrap gap-1.5">
              {PRESET_CATEGORIES.map((cat) => {
                const label = isZh ? cat.zh : cat.en
                const isSelected = category === label
                return (
                  <button
                    key={cat.zh}
                    type="button"
                    onClick={() => setCategory(label)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>

            {/* 价格 / 币种 / 库存 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  {isZh ? '基础售价 *' : 'Price *'}
                </label>
                <div className="relative">
                  <DollarSign size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    disabled={isSubmitting}
                    className="w-full h-9 pl-7 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  {isZh ? '币种' : 'Currency'}
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                >
                  <option value="CNY">CNY (¥)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  {isZh ? '初始库存' : 'Inventory'}
                </label>
                <input
                  type="number"
                  value={inventory}
                  onChange={(e) => setInventory(e.target.value)}
                  min="0"
                  step="1"
                  placeholder="100"
                  disabled={isSubmitting}
                  className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                {isZh ? '商品描述与卖点' : 'Description'}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder={isZh ? '详细商品介绍与关键卖点...' : 'Detailed description and key features...'}
                disabled={isSubmitting}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 leading-relaxed"
              />
            </div>
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
                  className="inline-flex items-center gap-1 text-xs font-bold text-violet-700 hover:text-violet-900 bg-white px-2.5 py-1 rounded-lg border border-violet-200 shadow-2xs transition-colors shrink-0"
                >
                  <span>{isZh ? '前往 Workspace 编辑' : 'Edit Workspace'}</span>
                  <ExternalLink size={12} />
                </Link>
              )}
            </div>
          )}
        </div>

        {/* 底部按钮栏 */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setOpen(false)}
            disabled={isSubmitting || isAnalyzing}
            className="flex-1 h-10 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            {isZh ? '取消' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={isSubmitting || isAnalyzing}
            className="flex-2 h-10 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Check size={15} />
            )}
            <span>
              {isSubmitting
                ? isZh
                  ? '正在提交创建...'
                  : 'Creating…'
                : isZh
                ? '创建商品'
                : 'Create Product'}
            </span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
