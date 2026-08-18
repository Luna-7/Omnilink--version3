'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ProductForm } from './ProductForm'
import type { ProductOption, ProductVariant } from '@/lib/products/variants/types'
import { generateVariantCombinations } from '@/lib/products/variants/validation'
import { Plus, Trash2, Layers, Package, ArrowLeft, Check, AlertCircle } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

interface ProductWorkspaceProps {
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

type ProductType = 'single' | 'variant'

export function ProductWorkspace({ productId, initialData }: ProductWorkspaceProps) {
  const router = useRouter()
  const { isZh } = useLanguage()
  const [productType, setProductType] = useState<ProductType>('single')
  const [options, setOptions] = useState<ProductOption[]>([])
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Load existing options and variants if editing
  const loadProductData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [optionsRes, variantsRes] = await Promise.all([
        fetch(`/api/products/${productId}/options`),
        fetch(`/api/products/${productId}/variants`),
      ])

      if (optionsRes.ok) {
        const optionsData = await optionsRes.json()
        setOptions(optionsData.options || [])
        if (optionsData.options?.length > 0) {
          setProductType('variant')
        }
      }

      if (variantsRes.ok) {
        const variantsData = await variantsRes.json()
        setVariants(variantsData.variants || [])
      }
    } catch (err) {
      console.error('Error loading product data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [productId])

  useEffect(() => {
    if (productId) {
      loadProductData()
    }
  }, [productId, loadProductData])

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

  const generateVariants = () => {
    const validOptions = options
      .filter((opt) => opt.name && opt.code && opt.values.length > 0 && opt.values[0])
      .map((opt) => ({
        code: opt.code,
        values: opt.values.filter((v) => v.trim()),
      }))

    if (validOptions.length === 0) {
      setError(isZh ? '请至少添加一个带有效规格值的规格项' : 'Please add at least one option with values')
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

  const saveProduct = async () => {
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      if (productType === 'variant') {
        // Save options
        for (const option of options) {
          if (option.id.startsWith('temp-')) {
            await fetch(`/api/products/${productId}/options`, {
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

        // Save variants
        for (const variant of variants) {
          if (variant.id.startsWith('temp-')) {
            await fetch(`/api/products/${productId}/variants`, {
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
      }

      setSuccess(isZh ? '规格变体保存成功！' : 'Variants saved successfully')
      setTimeout(() => router.push('/dashboard/products'), 800)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 顶部标题与返回 */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/products"
          className="w-9 h-9 rounded-full bg-white border border-[#E5E7EB] hover:bg-[#F4F5F7] flex items-center justify-center text-[#111827] transition-colors shadow-sm"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[#111827]">
            {productId ? (isZh ? '编辑商品' : 'Edit Product') : isZh ? '新建商品' : 'New Product'}
          </h1>
          <p className="text-xs text-[#6B7280]">
            {isZh ? '录入商品主档与多规格变体，自动同步至大模型语义知识库' : 'Create product and variants'}
          </p>
        </div>
      </div>

      {/* 单品 vs 多规格类型选择 */}
      <div className="crextio-card p-6">
        <h3 className="text-sm font-bold text-[#111827] mb-3">
          {isZh ? '商品形态模式 (Product Type)' : 'Product Type'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setProductType('single')}
            className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
              productType === 'single'
                ? 'border-[#111827] bg-[#F4F5F7] ring-1 ring-[#111827]'
                : 'border-[#E5E7EB] bg-white hover:bg-[#F4F5F7]/50'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#111827] shrink-0">
              <Package size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-[#111827]">
                {isZh ? '单品模式 (Single SKU)' : 'Single SKU'}
              </div>
              <div className="text-[11px] text-[#6B7280] mt-0.5 leading-relaxed">
                {isZh
                  ? '适用于标准单款商品，无独立颜色/尺码等子规格。'
                  : 'Standard standalone product without option variants.'}
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setProductType('variant')}
            className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
              productType === 'variant'
                ? 'border-[#111827] bg-[#F4F5F7] ring-1 ring-[#111827]'
                : 'border-[#E5E7EB] bg-white hover:bg-[#F4F5F7]/50'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#111827] shrink-0">
              <Layers size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-[#111827]">
                {isZh ? '多规格变体模式 (Variants Matrix)' : 'Product with Variants'}
              </div>
              <div className="text-[11px] text-[#6B7280] mt-0.5 leading-relaxed">
                {isZh
                  ? '适用于具备颜色、尺寸、内存等多种子规格组合的复杂商品。'
                  : 'Complex products with combinations of color, size, etc.'}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* 基础信息表单 */}
      <div className="crextio-card p-6">
        <h3 className="text-sm font-bold text-[#111827] mb-4">
          {isZh ? '基础产品信息 (Basic Info)' : 'Product Information'}
        </h3>
        <ProductForm productId={productId} initialData={initialData} />
      </div>

      {/* 多规格配置 */}
      {productType === 'variant' && (
        <div className="space-y-5">
          {/* 规格维度定义 */}
          <div className="crextio-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#111827]">
                  {isZh ? '规格维度定义 (Options)' : 'Options'}
                </h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {isZh ? '配置颜色、版本等不同维度' : 'Define option dimensions'}
                </p>
              </div>
              <button
                type="button"
                onClick={addOption}
                className="px-3.5 py-1.5 rounded-full bg-[#111827] text-white text-xs font-semibold flex items-center gap-1 shadow-sm"
              >
                <Plus size={13} />
                <span>{isZh ? '添加规格' : 'Add Option'}</span>
              </button>
            </div>

            {options.map((option, optionIndex) => (
              <div
                key={option.id}
                className="p-4 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#111827] mb-1">
                      {isZh ? '规格名称 (如：机身颜色)' : 'Option Name'}
                    </label>
                    <input
                      type="text"
                      value={option.name}
                      onChange={(e) => updateOption(optionIndex, 'name', e.target.value)}
                      placeholder="e.g., Color"
                      className="w-full h-9 px-3 rounded-lg bg-white border border-[#E5E7EB] text-xs font-medium text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#111827] mb-1">
                      {isZh ? '规格编码 (如：color)' : 'Option Code'}
                    </label>
                    <input
                      type="text"
                      value={option.code}
                      onChange={(e) => updateOption(optionIndex, 'code', e.target.value)}
                      placeholder="e.g., color"
                      className="w-full h-9 px-3 rounded-lg bg-white border border-[#E5E7EB] text-xs font-mono text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#111827]">
                    {isZh ? '具体规格值' : 'Option Values'}
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
                          placeholder={isZh ? '例如：曜石黑' : 'e.g. Black'}
                          className="flex-1 h-8 px-2.5 rounded-lg bg-white border border-[#E5E7EB] text-xs font-medium text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
                        />
                        <button
                          type="button"
                          onClick={() => removeOptionValue(optionIndex, valueIndex)}
                          className="px-2 text-xs text-red-500 hover:text-red-700 font-medium"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => addOptionValue(optionIndex)}
                      className="text-xs font-bold text-[#111827] hover:underline"
                    >
                      + {isZh ? '添加规格值' : 'Add Value'}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeOption(optionIndex)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      {isZh ? '删除此规格项' : 'Remove Option'}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {options.length > 0 && (
              <button
                type="button"
                onClick={generateVariants}
                className="w-full py-2.5 bg-[#F4F5F7] hover:bg-[#E5E7EB] text-[#111827] text-xs font-bold rounded-xl transition-colors"
              >
                ⚡ {isZh ? '生成变体矩阵笛卡尔积' : 'Generate Variants Matrix'}
              </button>
            )}
          </div>

          {/* 变体矩阵 */}
          {variants.length > 0 && (
            <div className="crextio-card p-6 space-y-4">
              <h3 className="text-sm font-bold text-[#111827]">
                {isZh ? `变体明细矩阵 (${variants.length})` : `Variants (${variants.length})`}
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] text-[#6B7280] font-semibold">
                      <th className="pb-3 px-2">{isZh ? '规格组合' : 'Option Values'}</th>
                      <th className="pb-3 px-2">{isZh ? '变体 SKU' : 'SKU'}</th>
                      <th className="pb-3 px-2">{isZh ? '价格 (¥)' : 'Price'}</th>
                      <th className="pb-3 px-2">{isZh ? '库存' : 'Inventory'}</th>
                      <th className="pb-3 px-2 text-right">{isZh ? '操作' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]/60">
                    {variants.map((variant, index) => (
                      <tr key={variant.id}>
                        <td className="py-2.5 px-2 font-medium text-[#111827]">
                          {Object.entries(variant.option_values as Record<string, string>)
                            .map(([k, v]) => `${v}`)
                            .join(' / ')}
                        </td>
                        <td className="py-2.5 px-2">
                          <input
                            type="text"
                            value={variant.sku || ''}
                            onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                            placeholder="SKU"
                            className="h-8 px-2 rounded-lg bg-[#F4F5F7] border border-[#E5E7EB] text-xs font-mono text-[#111827] w-36"
                          />
                        </td>
                        <td className="py-2.5 px-2">
                          <input
                            type="number"
                            value={variant.price || ''}
                            onChange={(e) =>
                              updateVariant(index, 'price', parseFloat(e.target.value) || null)
                            }
                            placeholder="0.00"
                            className="h-8 px-2 rounded-lg bg-[#F4F5F7] border border-[#E5E7EB] text-xs font-bold text-[#111827] w-24"
                          />
                        </td>
                        <td className="py-2.5 px-2">
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
                            className="h-8 px-2 rounded-lg bg-[#F4F5F7] border border-[#E5E7EB] text-xs font-bold text-[#111827] w-20"
                          />
                        </td>
                        <td className="py-2.5 px-2 text-right">
                          <button
                            type="button"
                            onClick={() => removeVariant(index)}
                            className="p-1 text-gray-400 hover:text-red-600 rounded"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={saveProduct}
                disabled={isLoading}
                className="w-full h-11 rounded-full bg-[#111827] text-white text-xs font-bold hover:bg-black transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                {isLoading ? (isZh ? '正在保存...' : 'Saving...') : isZh ? '保存变体组合' : 'Save Variants'}
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs flex items-center gap-2">
          <Check size={14} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}
    </div>
  )
}
