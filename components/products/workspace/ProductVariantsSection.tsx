'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Trash2, AlertCircle, Sparkles, SlidersHorizontal, Check } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import type { ProductOption, ProductVariant } from '@/lib/products/variants/types'
import type { VariantDraft, VariantOptionInput } from '@/lib/products/domain-types'
import { reconcileVariantItems } from '@/lib/products/variants/reconcile'

interface ProductVariantsSectionProps {
  productId?: string
  options: ProductOption[]
  setOptions: React.Dispatch<React.SetStateAction<ProductOption[]>>
  variants: ProductVariant[]
  setVariants: React.Dispatch<React.SetStateAction<ProductVariant[]>>
  disabled?: boolean
}

const DIMENSION_PRESETS = [
  { nameZh: '颜色', nameEn: 'Color', code: 'color', defaultValues: ['黑色', '白色', '银色'] },
  { nameZh: '尺码', nameEn: 'Size', code: 'size', defaultValues: ['S', 'M', 'L', 'XL'] },
  { nameZh: '容量', nameEn: 'Capacity', code: 'capacity', defaultValues: ['128GB', '256GB', '512GB'] },
  { nameZh: '款式', nameEn: 'Style', code: 'style', defaultValues: ['标准款', '升级款'] },
  { nameZh: '版本', nameEn: 'Edition', code: 'edition', defaultValues: ['基础版', '专业版', '旗舰版'] },
]

export function ProductVariantsSection({
  productId,
  options,
  setOptions,
  variants,
  setVariants,
  disabled = false,
}: ProductVariantsSectionProps) {
  const { isZh } = useLanguage()

  // Single Product vs Multi-Variant mode selection state
  const [variantMode, setVariantMode] = useState<'single' | 'multi'>(() => {
    return options.length > 0 || variants.length > 0 ? 'multi' : 'single'
  })

  const [error, setError] = useState('')
  const [batchPrice, setBatchPrice] = useState<string>('')
  const [batchInventory, setBatchInventory] = useState<string>('')
  const [showBatchToolbar, setShowBatchToolbar] = useState(false)
  const [variantItems, setVariantItems] = useState<VariantDraft[]>(() => {
    return variants.map((v) => ({
      key: v.id,
      optionValues: v.option_values as Record<string, string>,
      sku: v.sku || undefined,
      price: v.price || undefined,
      inventory: v.inventory ?? undefined,
      skuSource: v.sku ? 'manual' : undefined,
    }))
  })

  // Synchronize mode if external props change
  useEffect(() => {
    if ((options.length > 0 || variants.length > 0) && variantMode === 'single') {
      setVariantMode('multi')
    }
  }, [options.length, variants.length])

  // Sync variantItems with external variants prop
  useEffect(() => {
    setVariantItems(
      variants.map((v) => ({
        key: v.id,
        optionValues: v.option_values as Record<string, string>,
        sku: v.sku || undefined,
        price: v.price || undefined,
        inventory: v.inventory ?? undefined,
        skuSource: v.sku ? 'manual' : undefined,
      }))
    )
  }, [variants])

  // Sync variantItems back to ProductVariant format for external API
  useEffect(() => {
    const newVariants: ProductVariant[] = variantItems.map((v) => ({
      id: v.key,
      product_id: productId || '',
      sku: v.sku || null,
      price: v.price || null,
      currency: 'CNY',
      inventory: v.inventory ?? null,
      status: 'active',
      option_values: v.optionValues,
      raw_data: null,
      semantic_data: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))
    setVariants(newVariants)
  }, [variantItems, productId, setVariants])

  const handleModeChange = (mode: 'single' | 'multi') => {
    if (mode === 'single' && (options.length > 0 || variants.length > 0)) {
      if (
        window.confirm(
          isZh
            ? '切换为「单一商品」模式将重置已设置的销售维度和变体 SKU 列表，确认切换吗？'
            : 'Switching to Single Product mode will clear current sales dimensions and variants. Continue?'
        )
      ) {
        setOptions([])
        setVariants([])
        setVariantMode('single')
      }
    } else {
      setVariantMode(mode)
      if (mode === 'multi' && options.length === 0) {
        addOption()
      }
    }
  }

  const addOption = (preset?: typeof DIMENSION_PRESETS[0]) => {
    const name = preset ? (isZh ? preset.nameZh : preset.nameEn) : ''
    const code = preset ? preset.code : `dimension_${options.length + 1}`
    const values = preset ? preset.defaultValues : ['']

    const newOption: ProductOption = {
      id: `opt-${Date.now()}-${options.length}`,
      product_id: productId || '',
      name,
      code,
      position: options.length,
      values,
      created_at: new Date().toISOString(),
    }
    setOptions([...options, newOption])
    setError('')
  }

  const updateOption = (index: number, field: keyof ProductOption, value: any) => {
    const updatedOptions = [...options]
    updatedOptions[index] = { ...updatedOptions[index], [field]: value }
    setOptions(updatedOptions)
  }

  const removeOption = (index: number) => {
    const updatedOptions = options.filter((_, i) => i !== index)
    setOptions(updatedOptions)
  }

  const addOptionValue = (optionIndex: number) => {
    const updatedOptions = [...options]
    updatedOptions[optionIndex] = {
      ...updatedOptions[optionIndex],
      values: [...updatedOptions[optionIndex].values, ''],
    }
    setOptions(updatedOptions)
  }

  const updateOptionValue = (optionIndex: number, valueIndex: number, value: string) => {
    const updatedOptions = [...options]
    updatedOptions[optionIndex].values[valueIndex] = value
    setOptions(updatedOptions)
  }

  const removeOptionValue = (optionIndex: number, valueIndex: number) => {
    const updatedOptions = [...options]
    updatedOptions[optionIndex].values = updatedOptions[optionIndex].values.filter(
      (_, i) => i !== valueIndex
    )
    setOptions(updatedOptions)
  }

  // Calculate Cartesian Product combination stats
  const validOptions = options
    .filter((opt) => opt.name.trim() && opt.code.trim() && opt.values.some((v) => v.trim()))
    .map((opt) => ({
      code: opt.code.trim(),
      name: opt.name.trim(),
      values: opt.values.filter((v) => v.trim()),
    }))

  const totalPossibleCombinations = validOptions.reduce(
    (acc, opt) => acc * (opt.values.length || 1),
    validOptions.length > 0 ? 1 : 0
  )

  const handleGenerateVariants = () => {
    if (validOptions.length === 0) {
      setError(
        isZh
          ? '请至少设置一个销售维度并填写有效的选项值 (例如: 颜色 ➔ 黑色, 白色)'
          : 'Please add at least one sales dimension with valid option values'
      )
      return
    }

    // Generate new variant items using reconciliation
    setVariantItems((previous) =>
      reconcileVariantItems(
        validOptions.map((o) => ({ name: o.name, values: o.values })),
        previous,
        {
          defaultPrice: 100,
          defaultInventory: 0,
          generateSku: (combo) => {
            const vals = Object.values(combo.optionValues).join('-')
            return `SKU-${vals.toUpperCase().replace(/\s+/g, '')}`
          },
        },
      ),
    )

    setError('')
  }

  const updateVariant = (key: string, field: keyof VariantDraft, value: any) => {
    setVariantItems((prev) =>
      prev.map((v) => (v.key === key ? { ...v, [field]: value } : v))
    )
  }

  const removeVariant = (key: string) => {
    setVariantItems((prev) => prev.filter((v) => v.key !== key))
  }

  const handleBatchApplyPrice = () => {
    const priceNum = parseFloat(batchPrice)
    if (isNaN(priceNum) || priceNum < 0) return
    setVariantItems((prev) => prev.map((v) => ({ ...v, price: priceNum })))
  }

  const handleBatchApplyInventory = () => {
    const invNum = parseInt(batchInventory, 10)
    if (isNaN(invNum) || invNum < 0) return
    setVariantItems((prev) => prev.map((v) => ({ ...v, inventory: invNum })))
  }

  const handleAutoGenerateSkus = () => {
    setVariantItems((prev) =>
      prev.map((v) => {
        if (v.sku && v.sku.trim()) return v
        const vals = Object.values(v.optionValues).join('-')
        const generated = `SKU-${vals.toUpperCase().replace(/\s+/g, '')}`
        return { ...v, sku: generated, skuSource: 'generated' as const }
      })
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[4px] bg-blue-50 text-[#024AD8] flex items-center justify-center font-mono font-bold text-xs shrink-0">
            06
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900">
                {isZh ? '销售变体 (Sales Variants)' : 'Sales Variants'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isZh
                ? '描述顾客实际购买的不同可售版本（如颜色、尺码、容量等）。每个销售变体代表一个独立可购 SKU。'
                : 'Define sellable variations (e.g. Color, Size, Capacity). Each variant represents an actual purchasing SKU.'}
            </p>
          </div>
        </div>

        {/* Mode Selector Options */}
        <div className="flex items-center gap-1.5 p-1 rounded-[4px] bg-slate-100/90 border border-slate-200/80">
          <button
            type="button"
            onClick={() => handleModeChange('single')}
            disabled={disabled}
            className={`px-3 py-1 rounded-[4px] text-xs font-semibold transition-all cursor-pointer ${
              variantMode === 'single'
                ? 'bg-white text-[#024AD8] shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isZh ? '○ 单一商品' : '○ Single Product'}
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('multi')}
            disabled={disabled}
            className={`px-3 py-1 rounded-[4px] text-xs font-semibold transition-all cursor-pointer ${
              variantMode === 'multi'
                ? 'bg-[#024AD8] text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isZh ? '● 多种版本' : '● Multiple Variants'}
          </button>
        </div>
      </div>

      {/* Mode 1: Single Product Banner */}
      {variantMode === 'single' && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-center gap-3">
          <div className="w-8 h-8 rounded-[4px] bg-blue-50 text-[#024AD8] flex items-center justify-center shrink-0">
            <Check size={16} />
          </div>
          <div className="space-y-0.5">
            <p className="font-bold text-slate-800">
              {isZh ? '当前为「单一商品」模式' : 'Single Product Mode Active'}
            </p>
            <p className="text-[11px] text-slate-500">
              {isZh
                ? '商品将直接采用基本信息中的基础价格与初始库存作为全局唯一可售版本。无需配置销售维度。如需多颜色、多尺码版本，请选择「多种版本」。'
                : 'The base price and inventory in Product Info apply directly to this single item without extra variants.'}
            </p>
          </div>
        </div>
      )}

      {/* Mode 2: Multi-Variant Configuration */}
      {variantMode === 'multi' && (
        <div className="space-y-6">
          {/* Preset quick buttons */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                {isZh ? '快捷添加销售维度推荐' : 'Quick Add Recommended Sales Dimensions'}
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              {DIMENSION_PRESETS.map((preset) => {
                const isAdded = options.some(
                  (o) =>
                    o.code.toLowerCase() === preset.code ||
                    o.name.toLowerCase() === preset.nameZh.toLowerCase()
                )
                return (
                  <button
                    key={preset.code}
                    type="button"
                    disabled={disabled || isAdded}
                    onClick={() => addOption(preset)}
                    className={`px-2.5 py-1 rounded-[4px] text-xs font-medium border transition-all cursor-pointer flex items-center gap-1 ${
                      isAdded
                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-white border-[#D1D1D1] text-[#1C1C1C] hover:bg-[#F7F7F7] hover:border-[#B0B0B0]'
                    }`}
                  >
                    <Plus size={12} />
                    <span>{isZh ? preset.nameZh : preset.nameEn}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Option Items List (销售维度) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900">
                {isZh ? '销售维度定义 (Sales Dimensions)' : 'Sales Dimension Definitions'}
              </h3>
              <button
                type="button"
                onClick={() => addOption()}
                disabled={disabled}
                className="px-3 py-1.5 rounded-[4px] bg-[#024AD8] hover:bg-[#003198] active:bg-[#00226B] text-white text-xs font-medium flex items-center gap-1 cursor-pointer transition-all focus-visible:outline-2 focus-visible:outline-[#024AD8]"
              >
                <Plus size={13} />
                <span>{isZh ? '＋ 添加销售维度' : 'Add Sales Dimension'}</span>
              </button>
            </div>

            {options.map((option, optionIndex) => (
              <div
                key={option.id}
                className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3.5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 mb-1">
                      {isZh ? '销售维度名称 (如: 颜色, 尺码, 容量)' : 'Dimension Name'}
                    </label>
                    <input
                      type="text"
                      value={option.name}
                      onChange={(e) => updateOption(optionIndex, 'name', e.target.value)}
                      placeholder={isZh ? '例如: 颜色' : 'e.g. Color'}
                      disabled={disabled}
                      className="w-full h-8 px-2.5 rounded-[4px] bg-white border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#024AD8]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 mb-1">
                      {isZh ? '销售维度编码 (如: color, size)' : 'Dimension Code'}
                    </label>
                    <input
                      type="text"
                      value={option.code}
                      onChange={(e) => updateOption(optionIndex, 'code', e.target.value)}
                      placeholder={isZh ? '例如: color' : 'e.g. color'}
                      disabled={disabled}
                      className="w-full h-8 px-2.5 rounded-[4px] bg-white border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#024AD8]"
                    />
                  </div>
                </div>

                {/* Option Values */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-800">
                    {isZh ? '选项值列表' : 'Option Values'}
                  </label>
                  <div className="flex flex-wrap gap-2 items-center">
                    {option.values.map((value, valueIndex) => (
                      <div
                        key={valueIndex}
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-[4px] bg-white border border-slate-200 shadow-2xs"
                      >
                        <input
                          type="text"
                          value={value}
                          onChange={(e) =>
                            updateOptionValue(optionIndex, valueIndex, e.target.value)
                          }
                          placeholder={isZh ? '如: 黑色' : 'e.g. Black'}
                          disabled={disabled}
                          className="h-6 w-24 text-xs font-medium text-slate-900 bg-transparent focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeOptionValue(optionIndex, valueIndex)}
                          className="text-slate-400 hover:text-[#D32F2F] font-bold text-xs px-0.5 cursor-pointer"
                          title={isZh ? '删除选项值' : 'Remove value'}
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => addOptionValue(optionIndex)}
                      className="px-2.5 py-1 rounded-[4px] bg-blue-50 hover:bg-blue-100 text-[#024AD8] text-xs font-bold transition-all cursor-pointer border border-blue-200 flex items-center gap-1"
                    >
                      <Plus size={11} />
                      <span>{isZh ? '添加选项值' : 'Add Value'}</span>
                    </button>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => removeOption(optionIndex)}
                      className="text-xs text-[#D32F2F] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 size={12} />
                      <span>{isZh ? '删除此销售维度' : 'Remove Dimension'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Combination Preview & Generate Action Box */}
          {validOptions.length > 0 && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/80 to-slate-50 border border-blue-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">
                      {isZh ? '维度组合预览:' : 'Dimension Combination:'}
                    </span>
                    <span className="text-xs font-bold text-[#024AD8]">
                      {validOptions.map((o) => o.name).join(' × ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {isZh
                      ? `已设置 ${validOptions.length} 个销售维度，可产生 ${validOptions.map((o) => `${o.name}(${o.values.length})`).join(' × ')} = ${totalPossibleCombinations} 种销售版本`
                      : `${validOptions.length} dimensions configured resulting in ${totalPossibleCombinations} possible combinations`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateVariants}
                  disabled={disabled}
                  className="px-4 py-2 bg-[#024AD8] hover:bg-[#003198] active:bg-[#00226B] text-white text-xs font-bold rounded-[4px] transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer focus-visible:outline-2 focus-visible:outline-[#024AD8]"
                >
                  <Sparkles size={14} />
                  <span>{isZh ? '生成销售版本矩阵' : 'Generate Sales Variants Matrix'}</span>
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-[#D32F2F] text-xs flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Variants Matrix Table */}
          {variantItems.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-900">
                    {isZh
                      ? `已生成销售版本矩阵 (${variantItems.length} SKU)`
                      : `Generated Sales Variants (${variantItems.length} SKUs)`}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setShowBatchToolbar((prev) => !prev)}
                  className="text-xs text-[#024AD8] font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <SlidersHorizontal size={13} />
                  <span>
                    {showBatchToolbar
                      ? isZh
                        ? '隐藏批量工具'
                        : 'Hide Batch Tools'
                      : isZh
                      ? '显示批量改价/改库存/生成 SKU'
                      : 'Batch Operations'}
                  </span>
                </button>
              </div>

              {/* Batch Operations Bar */}
              {showBatchToolbar && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={batchPrice}
                      onChange={(e) => setBatchPrice(e.target.value)}
                      placeholder={isZh ? '统一价格 (¥)' : 'Uniform Price'}
                      className="h-8 px-2.5 rounded-[4px] bg-white border border-slate-200 text-xs w-28"
                    />
                    <button
                      type="button"
                      onClick={handleBatchApplyPrice}
                      className="h-8 px-2.5 rounded-[4px] bg-[#024AD8] text-white text-xs font-medium hover:bg-[#003198]"
                    >
                      {isZh ? '套用价格' : 'Apply'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={batchInventory}
                      onChange={(e) => setBatchInventory(e.target.value)}
                      placeholder={isZh ? '统一库存' : 'Uniform Inventory'}
                      className="h-8 px-2.5 rounded-[4px] bg-white border border-slate-200 text-xs w-24"
                    />
                    <button
                      type="button"
                      onClick={handleBatchApplyInventory}
                      className="h-8 px-2.5 rounded-[4px] bg-[#024AD8] text-white text-xs font-medium hover:bg-[#003198]"
                    >
                      {isZh ? '套用库存' : 'Apply'}
                    </button>
                  </div>

                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={handleAutoGenerateSkus}
                      className="h-8 px-3 rounded-[4px] bg-white border border-[#D1D1D1] text-[#1C1C1C] text-xs font-medium hover:bg-[#F7F7F7]"
                    >
                      {isZh ? '⚡ 自动生成所有空 SKU' : 'Auto Generate SKUs'}
                    </button>
                  </div>
                </div>
              )}

              {/* Matrix Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                      <th className="py-2.5 px-3.5">
                        {isZh ? '销售版本 (维度组合)' : 'Sales Variant Combination'}
                      </th>
                      <th className="py-2.5 px-3.5">{isZh ? 'SKU 编码' : 'SKU Code'}</th>
                      <th className="py-2.5 px-3.5">{isZh ? '售价 (¥)' : 'Price'}</th>
                      <th className="py-2.5 px-3.5">{isZh ? '库存' : 'Inventory'}</th>
                      <th className="py-2.5 px-3.5">{isZh ? '状态' : 'Status'}</th>
                      <th className="py-2.5 px-3.5 text-right">{isZh ? '操作' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {variantItems.map((variant) => (
                      <tr key={variant.key} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3.5 font-bold text-slate-900">
                          {Object.entries(variant.optionValues)
                            .map(([_, v]) => `${v}`)
                            .join(' / ')}
                        </td>
                        <td className="py-2.5 px-3.5">
                          <input
                            type="text"
                            value={variant.sku || ''}
                            onChange={(e) => updateVariant(variant.key, 'sku', e.target.value)}
                            placeholder="SKU-001"
                            disabled={disabled}
                            className="h-8 px-2.5 rounded-[4px] bg-white border border-slate-200 text-xs font-mono text-slate-900 w-36 focus:outline-none focus:ring-1 focus:ring-[#024AD8]"
                          />
                        </td>
                        <td className="py-2.5 px-3.5">
                          <input
                            type="number"
                            value={variant.price || ''}
                            onChange={(e) =>
                              updateVariant(variant.key, 'price', parseFloat(e.target.value) || undefined)
                            }
                            placeholder="0.00"
                            disabled={disabled}
                            className="h-8 px-2.5 rounded-[4px] bg-white border border-slate-200 text-xs font-bold text-slate-900 w-24 focus:outline-none focus:ring-1 focus:ring-[#024AD8]"
                          />
                        </td>
                        <td className="py-2.5 px-3.5">
                          <input
                            type="number"
                            value={variant.inventory ?? ''}
                            onChange={(e) =>
                              updateVariant(
                                variant.key,
                                'inventory',
                                e.target.value ? parseInt(e.target.value, 10) : undefined
                              )
                            }
                            placeholder="100"
                            disabled={disabled}
                            className="h-8 px-2.5 rounded-[4px] bg-white border border-slate-200 text-xs font-bold text-slate-900 w-20 focus:outline-none focus:ring-1 focus:ring-[#024AD8]"
                          />
                        </td>
                        <td className="py-2.5 px-3.5">
                          <select
                            value="active"
                            disabled={disabled}
                            className="h-8 px-2 rounded-[4px] bg-white border border-slate-200 text-xs font-medium text-slate-800"
                          >
                            <option value="active">{isZh ? '在售' : 'Active'}</option>
                          </select>
                        </td>
                        <td className="py-2.5 px-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => removeVariant(variant.key)}
                            className="p-1 text-slate-400 hover:text-[#D32F2F] rounded-[4px] cursor-pointer transition-colors"
                            title={isZh ? '删除此不售版本' : 'Remove variant'}
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

