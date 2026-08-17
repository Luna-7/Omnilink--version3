'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ProductForm } from './ProductForm'
import type { ProductOption, ProductVariant } from '@/lib/products/variants/types'
import { generateVariantCombinations } from '@/lib/products/variants/validation'

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
  const [productType, setProductType] = useState<ProductType>('single')
  const [options, setOptions] = useState<ProductOption[]>([])
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Load existing options and variants if editing
  useEffect(() => {
    if (productId) {
      loadProductData()
    }
  }, [productId])

  const loadProductData = async () => {
    setIsLoading(true)
    try {
      const [optionsRes, variantsRes] = await Promise.all([
        fetch(`/api/products/${productId}/options`),
        fetch(`/api/products/${productId}/variants`)
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
  }

  const addOption = () => {
    const newOption: ProductOption = {
      id: `temp-${Date.now()}`,
      product_id: productId || '',
      name: '',
      code: '',
      position: options.length,
      values: [''],
      created_at: new Date().toISOString()
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
      values: [...updatedOptions[optionIndex].values, '']
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
    updatedOptions[optionIndex].values = updatedOptions[optionIndex].values.filter((_, i) => i !== valueIndex)
    setOptions(updatedOptions)
  }

  const generateVariants = () => {
    const validOptions = options
      .filter(opt => opt.name && opt.code && opt.values.length > 0 && opt.values[0])
      .map(opt => ({
        code: opt.code,
        values: opt.values.filter(v => v.trim())
      }))

    if (validOptions.length === 0) {
      setError('Please add at least one option with values')
      return
    }

    const combinations = generateVariantCombinations(validOptions)
    
    const newVariants: ProductVariant[] = combinations.map((combo, index) => {
      const existing = variants.find(v => {
        const vValues = v.option_values as Record<string, string>
        return Object.keys(combo).every(key => vValues[key] === combo[key])
      })

      return existing || {
        id: `temp-${Date.now()}-${index}`,
        product_id: productId || '',
        sku: '',
        price: null,
        currency: 'USD',
        inventory: null,
        status: 'draft',
        option_values: combo,
        raw_data: null,
        semantic_data: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
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
      // First, save the base product using the existing ProductForm logic
      // This would need to be integrated with the form submission
      // For now, this is a placeholder for the complete save logic
      
      if (productType === 'variant') {
        // Save options
        for (const option of options) {
          if (option.id.startsWith('temp-')) {
            // Create new option
            await fetch(`/api/products/${productId}/options`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: option.name,
                code: option.code,
                position: option.position,
                values: option.values
              })
            })
          }
        }

        // Save variants
        for (const variant of variants) {
          if (variant.id.startsWith('temp-')) {
            // Create new variant
            await fetch(`/api/products/${productId}/variants`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sku: variant.sku || null,
                price: variant.price || null,
                currency: variant.currency,
                inventory: variant.inventory || null,
                status: variant.status,
                option_values: variant.option_values
              })
            })
          }
        }
      }

      setSuccess('Product saved successfully')
      setTimeout(() => router.push('/dashboard/products'), 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Product Type Selection */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Type</h3>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setProductType('single')}
            className={`px-4 py-2 rounded-lg border ${
              productType === 'single'
                ? 'bg-iris text-white border-iris'
                : 'bg-white text-gray-700 border-gray-300 hover:border-iris'
            }`}
          >
            Single SKU
          </button>
          <button
            type="button"
            onClick={() => setProductType('variant')}
            className={`px-4 py-2 rounded-lg border ${
              productType === 'variant'
                ? 'bg-iris text-white border-iris'
                : 'bg-white text-gray-700 border-gray-300 hover:border-iris'
            }`}
          >
            Product with Variants
          </button>
        </div>
      </div>

      {/* Base Product Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h3>
        <ProductForm productId={productId} initialData={initialData} />
      </div>

      {/* Variant Management */}
      {productType === 'variant' && (
        <>
          {/* Options Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Options</h3>
              <button
                type="button"
                onClick={addOption}
                className="px-4 py-2 bg-iris text-white rounded-lg hover:bg-iris transition-colors"
              >
                Add Option
              </button>
            </div>

            {options.map((option, optionIndex) => (
              <div key={option.id} className="border-b border-gray-200 pb-4 mb-4 last:border-0">
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Option Name
                    </label>
                    <input
                      type="text"
                      value={option.name}
                      onChange={(e) => updateOption(optionIndex, 'name', e.target.value)}
                      placeholder="e.g., Color"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-iris focus:border-iris"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Option Code
                    </label>
                    <input
                      type="text"
                      value={option.code}
                      onChange={(e) => updateOption(optionIndex, 'code', e.target.value)}
                      placeholder="e.g., color"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-iris focus:border-iris"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Values
                  </label>
                  {option.values.map((value, valueIndex) => (
                    <div key={valueIndex} className="flex gap-2">
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => updateOptionValue(optionIndex, valueIndex, e.target.value)}
                        placeholder="e.g., Black"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-iris focus:border-iris"
                      />
                      <button
                        type="button"
                        onClick={() => removeOptionValue(optionIndex, valueIndex)}
                        className="px-3 py-2 text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addOptionValue(optionIndex)}
                    className="text-sm text-iris hover:text-iris"
                  >
                    + Add Value
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeOption(optionIndex)}
                  className="mt-2 text-sm text-red-600 hover:text-red-700"
                >
                  Remove Option
                </button>
              </div>
            ))}

            {options.length > 0 && (
              <button
                type="button"
                onClick={generateVariants}
                className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Generate Variants
              </button>
            )}
          </div>

          {/* Variants Matrix */}
          {variants.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Variants</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Option Values</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">SKU</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Price</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Inventory</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Status</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((variant, index) => (
                      <tr key={variant.id} className="border-b border-gray-100">
                        <td className="py-2 px-3 text-sm">
                          {Object.entries(variant.option_values as Record<string, string>)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(', ')}
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={variant.sku || ''}
                            onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                            placeholder="SKU"
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-iris focus:border-iris text-sm"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            value={variant.price || ''}
                            onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || null)}
                            placeholder="Price"
                            step="0.01"
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-iris focus:border-iris text-sm"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            value={variant.inventory ?? ''}
                            onChange={(e) => updateVariant(index, 'inventory', e.target.value ? parseInt(e.target.value) : null)}
                            placeholder="Inventory"
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-iris focus:border-iris text-sm"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <select
                            value={variant.status}
                            onChange={(e) => updateVariant(index, 'status', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-iris focus:border-iris text-sm"
                          >
                            <option value="draft">Draft</option>
                            <option value="active">Active</option>
                            <option value="archived">Archived</option>
                          </select>
                        </td>
                        <td className="py-2 px-3">
                          <button
                            type="button"
                            onClick={() => removeVariant(index)}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Semantic Data Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Semantic Data</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Product-Level Semantic</h4>
                <p className="text-sm text-gray-500">
                  Brand, Model, Category, Style, Shared Attributes
                </p>
                <textarea
                  placeholder="Product semantic data (JSON)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-iris focus:border-iris text-sm"
                  rows={3}
                />
              </div>
              {productType === 'variant' && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Variant-Level Semantic</h4>
                  <p className="text-sm text-gray-500">
                    Color, Size, Weight, Variant-specific attributes
                  </p>
                  <textarea
                    placeholder="Variant semantic data (JSON)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-iris focus:border-iris text-sm"
                    rows={3}
                  />
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && !error && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      {/* Save Button */}
      <button
        type="button"
        onClick={saveProduct}
        disabled={isLoading}
        className="w-full bg-iris text-white py-3 px-4 rounded-lg hover:bg-iris disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Saving...' : productId ? 'Update Product' : 'Create Product'}
      </button>
    </div>
  )
}
