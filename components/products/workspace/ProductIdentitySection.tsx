'use client'

import React from 'react'
import { Tag, FileText, Info } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

/**
 * BACKEND CONTRACT REQUEST (Optional):
 * 
 * If a native category taxonomy DB table or hierarchical category endpoint is required:
 * GET /api/v1/merchant/categories
 * POST /api/v1/merchant/categories
 * 
 * Currently category is stored in local UI state or inside semantic_data.category.
 */

interface ProductIdentitySectionProps {
  name: string
  setName: (val: string) => void
  sku: string
  setSku: (val: string) => void
  category: string
  setCategory: (val: string) => void
  disabled?: boolean
}

const CATEGORY_OPTIONS = [
  'Electronics & Acoustics',
  'Eyewear & Optical',
  'Apparel & Fashion',
  'Home & Living',
  'Industrial & Hardware',
  'Accessories',
  'General Consumer Goods',
]

export function ProductIdentitySection({
  name,
  setName,
  sku,
  setSku,
  category,
  setCategory,
  disabled = false,
}: ProductIdentitySectionProps) {
  const { isZh } = useLanguage()

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold text-xs">
            1
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {isZh ? '商品基本标识 (Product Identity)' : 'Product Identity'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isZh
                ? '商品核心名称、全局唯一 SKU 与品类划分'
                : 'Core product name, SKU identifier, and category taxonomy'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Product Name */}
        <div className="md:col-span-2">
          <label htmlFor="workspace-name" className="block text-xs font-semibold text-slate-800 mb-1.5">
            {isZh ? '商品名称 *' : 'Product Name *'}
          </label>
          <input
            id="workspace-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={disabled}
            placeholder={
              isZh
                ? '例如：OmniVibe Max 空间音频降噪耳麦'
                : 'e.g. OmniVibe Max Spatial ANC Headset'
            }
            className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 disabled:opacity-50 transition-all"
          />
        </div>

        {/* SKU */}
        <div>
          <label htmlFor="workspace-sku" className="block text-xs font-semibold text-slate-800 mb-1.5">
            {isZh ? '商品 SKU / 货号' : 'Product SKU'}
          </label>
          <div className="relative">
            <input
              id="workspace-sku"
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              disabled={disabled}
              placeholder="e.g. OMNI-SKU-9021"
              className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 disabled:opacity-50 transition-all"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="workspace-category" className="block text-xs font-semibold text-slate-800 mb-1.5">
            {isZh ? '商品分类 (Category)' : 'Category'}
          </label>
          <div className="relative">
            <input
              id="workspace-category"
              type="text"
              list="category-suggestions"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={disabled}
              placeholder={isZh ? '选择或输入分类...' : 'Select or type category...'}
              className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 disabled:opacity-50 transition-all"
            />
            <datalist id="category-suggestions">
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>
        </div>
      </div>
    </div>
  )
}
