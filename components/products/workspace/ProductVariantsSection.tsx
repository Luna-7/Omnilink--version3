'use client'

import React, { useState } from 'react'
import { Layers, Plus, Trash2, ChevronDown, ChevronUp, AlertCircle, Sparkles } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import type { ProductOption, ProductVariant } from '@/lib/products/variants/types'
import { generateVariantCombinations } from '@/lib/products/variants/validation'

/**
 * BACKEND CONTRACT REQUEST:
 * 
 * If bulk variant price/inventory updates or matrix batch ops are required:
 * POST /api/v1/products/:id/variants/batch
 */

interface ProductVariantsSectionProps {
  productId?: string
  options: ProductOption[]
  setOptions: React.Dispatch<React.SetStateAction<ProductOption[]>>
  variants: ProductVariant[]
  setVariants: React.Dispatch<React.SetStateAction<ProductVariant[]>>
  disabled?: boolean
}

export function ProductVariantsSection({
  productId,
  options,
  setOptions,
  variants,
  setVariants,
  disabled = false,
}: ProductVariantsSectionProps) {
  const { isZh } = useLanguage()
  const [isExpanded, setIsExpanded] = useState(options.length > 0 || variants.length > 0)
  const [error, setError] = useState('')

  const handleToggle = () => {
    setIsExpanded((prev) => !prev)
  }

  const addOption = () => {
    const newOption: ProductOption = {
      id: `temp-${Date.now()}`,
      product_id: productId || '',
      name: '',
      code: '',
      position: options.length,
      values: [''],
      created_at: new Date().toISOString(),
    }
    setOptions([...options, newOption])
    if (!isExpanded) setIsExpanded(true)
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

  const handleGenerateVariants = () => {
    const validOptions = options
      .filter((opt) => opt.name && opt.code && opt.values.length > 0 && opt.values[0])
      .map((opt) => ({
        code: opt.code,
        values: opt.values.filter((v) => v.trim()),
      }))

    if (validOptions.length === 0) {
      setError(
        isZh
          ? '请至少添加一个包含有效值的规格项 (例如: 颜色: 黑色, 白色)'
          : 'Please add at least one option dimension with valid values'
      )
      return
    }

    const combinations = generateVariantCombinations(validOptions)

    const newVariants: ProductVariant[] = combinations.map((combo, index) => {
      const existing = variants.find((v) => {
        const vValues = v.option_values as Record<string, string>
        return Object.keys(combo).every((key) => vValues[key] === combo[key])
      })

      return (
        existing || {
          id: `temp-${Date.now()}-${index}`,
          product_id: productId || '',
          sku: '',
          price: null,
          currency: 'CNY',
          inventory: 100,
          status: 'active',
          option_values: combo,
          raw_data: null,
          semantic_data: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      )
    })

    setVariants(newVariants)
    setError('')
  }

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const updatedVariants = [...variants]
    updatedVariants[index] = { ...updatedVariants[index], [field]: value }
    setVariants(updatedVariants)
  }

  const removeVariant = (index: number) => {
    const updatedVariants = variants.filter((_, i) => i !== index)
    setVariants(updatedVariants)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[4px] bg-blue-50 text-[#024AD8] flex items-center justify-center font-mono font-bold text-xs">
            06
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {isZh ? '规格与变体 (Specifications & Variants)' : 'Specifications & Variants'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isZh
                ? '当商品存在颜色、尺寸、版本等多维度组合时启用变体矩阵'
                : 'Enable when the product has color, size, or edition variant combinations'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isExpanded ? (
            <button
              type="button"
              onClick={() => {
                setIsExpanded(true)
                if (options.length === 0) addOption()
              }}
              disabled={disabled}
              className="px-3.5 py-1.5 rounded-[4px] bg-[#024AD8] hover:bg-[#003198] active:bg-[#00226B] text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer focus-visible:outline-2 focus-visible:outline-[#024AD8] focus-visible:outline-offset-2"
            >
              <Plus size={13} />
              <span>{isZh ? '启用多规格 (Enable Variants)' : 'Enable Variants'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleToggle}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <span>{isZh ? '折叠面板' : 'Collapse'}</span>
              <ChevronUp size={14} />
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-5 transition-all">
          {/* Options Dimension Header */}
          <div className="flex items-center justify-between pt-1">
            <h3 className="text-xs font-bold text-slate-900">
              {isZh ? '规格维度定义 (Option Dimensions)' : 'Option Dimensions'}
            </h3>
            <button
              type="button"
              onClick={addOption}
              disabled={disabled}
              className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-black flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <Plus size={13} />
              <span>{isZh ? '添加规格维度' : 'Add Option Dimension'}</span>
            </button>
          </div>

          {/* Option Items List */}
          {options.map((option, optionIndex) => (
            <div
              key={option.id}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    {isZh ? '规格名称 (如: 颜色 / Color)' : 'Option Name'}
                  </label>
                  <input
                    type="text"
                    value={option.name}
                    onChange={(e) => updateOption(optionIndex, 'name', e.target.value)}
                    placeholder="e.g. Color"
                    disabled={disabled}
                    className="w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    {isZh ? '规格编码 (如: color)' : 'Option Code'}
                  </label>
                  <input
                    type="text"
                    value={option.code}
                    onChange={(e) => updateOption(optionIndex, 'code', e.target.value)}
                    placeholder="e.g. color"
                    disabled={disabled}
                    className="w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
              </div>

              {/* Option Values */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-800">
                  {isZh ? '规格值列表' : 'Option Values'}
                </label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {option.values.map((value, valueIndex) => (
                    <div key={valueIndex} className="flex gap-1.5">
                      <input
                        type="text"
                        value={value}
                        onChange={(e) =>
                          updateOptionValue(optionIndex, valueIndex, e.target.value)
                        }
                        placeholder={isZh ? '例如: 曜石黑' : 'e.g. Black'}
                        disabled={disabled}
                        className="flex-1 h-8 px-2.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-violet-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeOptionValue(optionIndex, valueIndex)}
                        className="px-2 text-xs text-rose-500 hover:text-rose-700 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => addOptionValue(optionIndex)}
                    className="text-xs font-bold text-violet-600 hover:underline cursor-pointer"
                  >
                    + {isZh ? '添加规格值' : 'Add Value'}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeOption(optionIndex)}
                    className="text-xs text-rose-600 hover:underline cursor-pointer"
                  >
                    {isZh ? '删除此维度' : 'Remove Option'}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {options.length > 0 && (
            <button
              type="button"
              onClick={handleGenerateVariants}
              disabled={disabled}
              className="w-full py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Sparkles size={14} />
              <span>{isZh ? '生成变体笛卡尔积矩阵' : 'Generate Variant Combinations'}</span>
            </button>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Variants Table */}
          {variants.length > 0 && (
            <div className="pt-2 space-y-3">
              <h4 className="text-xs font-bold text-slate-900">
                {isZh ? `已生成变体列表 (${variants.length})` : `Generated Variants (${variants.length})`}
              </h4>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-2.5 px-3">{isZh ? '规格组合' : 'Option Values'}</th>
                      <th className="py-2.5 px-3">{isZh ? '变体 SKU' : 'SKU'}</th>
                      <th className="py-2.5 px-3">{isZh ? '价格 (¥)' : 'Price'}</th>
                      <th className="py-2.5 px-3">{isZh ? '库存' : 'Inventory'}</th>
                      <th className="py-2.5 px-3 text-right">{isZh ? '操作' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {variants.map((variant, index) => (
                      <tr key={variant.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {Object.entries(variant.option_values as Record<string, string>)
                            .map(([_, v]) => `${v}`)
                            .join(' / ')}
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={variant.sku || ''}
                            onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                            placeholder="SKU"
                            disabled={disabled}
                            className="h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 w-36"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            value={variant.price || ''}
                            onChange={(e) =>
                              updateVariant(index, 'price', parseFloat(e.target.value) || null)
                            }
                            placeholder="0.00"
                            disabled={disabled}
                            className="h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 w-24"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            value={variant.inventory ?? ''}
                            onChange={(e) =>
                              updateVariant(
                                index,
                                'inventory',
                                e.target.value ? parseInt(e.target.value) : null
                              )
                            }
                            placeholder="100"
                            disabled={disabled}
                            className="h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 w-20"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => removeVariant(index)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
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
