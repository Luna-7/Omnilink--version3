'use client'

import { useState } from 'react'
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
} from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

const PRESET_CATEGORIES = [
  { zh: '音频声学', en: 'Audio & Acoustics' },
  { zh: '智能穿戴', en: 'Wearable Tech' },
  { zh: '消费电子', en: 'Consumer Electronics' },
  { zh: '数码周边', en: 'Digital Accessories' },
  { zh: '智能家居', en: 'Smart Home' },
]

export function ProductCreateDialog() {
  const router = useRouter()
  const { isZh } = useLanguage()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form State
  const [title, setTitle] = useState('')
  const [sku, setSku] = useState('')
  const [category, setCategory] = useState('音频声学')
  const [price, setPrice] = useState('1299')
  const [currency, setCurrency] = useState('CNY')
  const [inventory, setInventory] = useState('150')
  const [description, setDescription] = useState('')

  // AI 智能一键预填
  const handleAIFill = () => {
    const randomId = Math.floor(1000 + Math.random() * 9000)
    setSku(`PROD-AI-${randomId}`)
    setTitle(isZh ? 'OmniVibe Max 空间音频降噪耳麦' : 'OmniVibe Max Spatial ANC Headset')
    setCategory(isZh ? '音频声学' : 'Audio & Acoustics')
    setPrice('1599')
    setCurrency('CNY')
    setInventory('200')
    setDescription(
      isZh
        ? '搭载空间声学引擎，支持 48dB 深度混合降噪、高通超低延迟无线连接与 50 小时超长续航。'
        : 'Featuring spatial acoustics engine, 48dB hybrid ANC, ultra-low latency chip, and 50-hr battery life.'
    )
  }

  const resetForm = () => {
    setTitle('')
    setSku('')
    setCategory('音频声学')
    setPrice('1299')
    setCurrency('CNY')
    setInventory('150')
    setDescription('')
    setError('')
    setSuccess('')
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!title.trim()) {
      setError(isZh ? '请填写商品名称' : 'Product title is required')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/merchant/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: title.trim(),
          sku: sku.trim() || null,
          category: category.trim() || null,
          description: description.trim() || null,
          price: Number(price) || 0,
          currency: currency,
          inventory: Number(inventory) || 0,
        }),
      })

      if (res.status === 201 || res.ok) {
        setSuccess(isZh ? '商品创建成功！已录入商品库' : 'Product created successfully!')
        setTimeout(() => {
          setOpen(false)
          resetForm()
          router.refresh()
        }, 700)
        return
      }

      let message = isZh ? '创建商品失败，请重试' : 'Unable to create product'
      try {
        const body = await res.json()
        if (body?.error) message = body.error
      } catch {
        // ignore
      }
      setError(message)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isZh
          ? '网络连接异常，请重试'
          : 'Network error while creating product'
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
          setError('')
          setSuccess('')
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

      <DialogContent className="max-w-lg p-0 overflow-hidden bg-white rounded-3xl border border-[#E5E7EB] shadow-2xl">
        {/* 对话框头部 */}
        <div className="p-6 pb-4 bg-[#FAFAFA] border-b border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#111827] text-white flex items-center justify-center shadow-sm">
                <Package size={17} className="text-[#edbc40]" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-[#111827]">
                  {isZh ? '快速新建商品' : 'Quick Create Product'}
                </DialogTitle>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {isZh ? '录入基础信息，系统将自动生成 AI 语义节点' : 'Enter basic details for AI semantic node indexing'}
                </p>
              </div>
            </div>

            {/* AI 智能填充按钮 */}
            <button
              type="button"
              onClick={handleAIFill}
              className="px-3 py-1.5 rounded-full bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 text-[#8B5CF6] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles size={13} />
              <span>{isZh ? '✨ AI 智能填充' : '✨ AI Pre-fill'}</span>
            </button>
          </div>
        </div>

        {/* 快速直达多规格高级工作台 */}
        <div className="mx-6 mt-4 p-3 rounded-2xl bg-[#F4F5F7] border border-[#E5E7EB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={15} className="text-[#111827]" />
            <span className="text-xs text-[#111827] font-medium">
              {isZh ? '需要复杂颜色/尺码多规格矩阵？' : 'Need multi-variant matrix?'}
            </span>
          </div>
          <Link
            href="/dashboard/products/new"
            onClick={() => setOpen(false)}
            className="text-xs font-bold text-[#111827] hover:text-[#edbc40] flex items-center gap-1 transition-colors"
          >
            <span>{isZh ? '前往高级工作台' : 'Open Workspace'}</span>
            <ExternalLink size={12} />
          </Link>
        </div>

        {/* 表单内容 */}
        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                {isZh ? '商品货号 (SKU)' : 'Product SKU'}
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="例如：PROD-001"
                disabled={isSubmitting}
                className="w-full h-9 px-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs font-mono text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                {isZh ? '商品名称 *' : 'Product Name *'}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder={isZh ? '例如：无线降噪耳机' : 'e.g. Wireless Headset'}
                disabled={isSubmitting}
                className="w-full h-9 px-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs font-semibold text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
              />
            </div>
          </div>

          {/* 分类快捷标签 */}
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1.5">
              {isZh ? '商品品类' : 'Category'}
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRESET_CATEGORIES.map((cat) => {
                const label = isZh ? cat.zh : cat.en
                const isSelected = category === label
                return (
                  <button
                    key={cat.zh}
                    type="button"
                    onClick={() => setCategory(label)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#111827] text-white'
                        : 'bg-[#F4F5F7] text-[#6B7280] hover:bg-[#E5E7EB] hover:text-[#111827]'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder={isZh ? '自定义品类...' : 'Custom category...'}
              disabled={isSubmitting}
              className="w-full h-9 px-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                {isZh ? '销售价格 *' : 'Price *'}
              </label>
              <div className="relative">
                <DollarSign size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  disabled={isSubmitting}
                  className="w-full h-9 pl-7 pr-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs font-bold text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                {isZh ? '币种' : 'Currency'}
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                disabled={isSubmitting}
                className="w-full h-9 px-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs font-medium text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
              >
                <option value="CNY">CNY (¥)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
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
                className="w-full h-9 px-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs font-bold text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              {isZh ? '核心卖点与规格描述' : 'Description & Specs'}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder={isZh ? '输入商品特点，AI 将自动抽取结构化属性...' : 'Enter product features for AI extraction...'}
              disabled={isSubmitting}
              className="w-full p-2.5 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827] leading-relaxed"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs flex items-center gap-2">
              <CheckCircle2 size={14} className="shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="pt-2 flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
              className="flex-1 h-10 rounded-full bg-[#F4F5F7] hover:bg-[#E5E7EB] text-[#111827] text-xs font-semibold transition-colors cursor-pointer"
            >
              {isZh ? '取消' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-2 h-10 rounded-full bg-[#111827] hover:bg-black text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting
                ? isZh
                  ? '正在提交创建...'
                  : 'Creating…'
                : isZh
                ? '立即创建商品'
                : 'Create Product'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
