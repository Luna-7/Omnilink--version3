'use client'

import React from 'react'
import { Package } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { CategorySelector } from '@/components/product/CategorySelector'
import type { BasicProductFormData } from './types'

interface ProductBasicInfoProps {
  formData: BasicProductFormData
  onChange: (updates: Partial<BasicProductFormData>) => void
  disabled?: boolean
}

export function ProductBasicInfo({
  formData,
  onChange,
  disabled = false,
}: ProductBasicInfoProps) {
  const { isZh } = useLanguage()

  return (
    <div className="space-y-4">
      {/* 模块标题与指引说明 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-slate-100 gap-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#EFF4FF] text-[#024AD8] flex items-center justify-center font-bold text-xs">
            01
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {isZh ? '商品信息' : 'Product Information'}
            </h3>
          </div>
        </div>
        <span className="text-[11px] text-slate-400">
          {isZh ? '先创建商品，详情和更多信息可以稍后完善。' : 'Create the product first; details can be refined later.'}
        </span>
      </div>

      {/* 1. 商品名称 */}
      <div className="space-y-1.5">
        <label htmlFor="create-product-name" className="block text-xs font-bold text-slate-900">
          {isZh ? '商品名称 *' : 'Product Name *'}
        </label>
        <input
          type="text"
          id="create-product-name"
          value={formData.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder={isZh ? '例如：Ray-Ban Wayfarer 太阳镜 或 纯棉连帽卫衣' : 'e.g. Ray-Ban Wayfarer Sunglasses or Cotton Hoodie'}
          disabled={disabled}
          className="w-full h-10 px-3.5 rounded-[4px] bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-[#024AD8] focus:ring-2 focus:ring-[#024AD8]/15 disabled:opacity-50 transition-all"
        />
      </div>

      {/* 2. SKU 与分类 (Desktop 双列, Mobile 单列) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1.5">
          <label htmlFor="create-product-sku" className="block text-xs font-bold text-slate-900">
            {isZh ? 'SKU *' : 'SKU *'}
          </label>
          <input
            type="text"
            id="create-product-sku"
            value={formData.sku}
            onChange={(e) => onChange({ sku: e.target.value })}
            placeholder={isZh ? '例如：PROD-001' : 'e.g. PROD-001'}
            disabled={disabled}
            className="w-full h-10 px-3 rounded-[4px] bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:bg-white focus:border-[#024AD8] focus:ring-2 focus:ring-[#024AD8]/15 disabled:opacity-50 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="create-product-category" className="block text-xs font-bold text-slate-900">
            {isZh ? '分类 *' : 'Category *'}
          </label>
          <CategorySelector
            id="create-product-category"
            value={formData.categoryId || formData.category}
            onChange={(res) => {
              onChange({
                category: res.categoryName,
                categoryId: res.categoryId || null,
              })
            }}
            onClear={() => {
              onChange({
                category: '',
                categoryId: null,
              })
            }}
            disabled={disabled}
            placeholder={isZh ? '点击选择分类...' : 'Select category...'}
          />
        </div>
      </div>

      {/* 3. 售价与产地 (Desktop 双列, Mobile 单列) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="create-product-price" className="block text-xs font-bold text-slate-900">
              {isZh ? '售价 *' : 'Price *'}
            </label>
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
              <button
                type="button"
                onClick={() => onChange({ currency: 'CNY' })}
                className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold cursor-pointer transition-colors ${
                  formData.currency === 'CNY'
                    ? 'bg-[#EFF4FF] text-[#024AD8] border border-[#024AD8]/30'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                ¥ CNY
              </button>
              <button
                type="button"
                onClick={() => onChange({ currency: 'USD' })}
                className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold cursor-pointer transition-colors ${
                  formData.currency === 'USD'
                    ? 'bg-[#EFF4FF] text-[#024AD8] border border-[#024AD8]/30'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                $ USD
              </button>
            </div>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
              {formData.currency === 'USD' ? '$' : '¥'}
            </span>
            <input
              type="number"
              id="create-product-price"
              value={formData.price}
              onChange={(e) => onChange({ price: e.target.value })}
              min="0"
              step="0.01"
              placeholder="0.00"
              disabled={disabled}
              className="w-full h-10 pl-7 pr-3 rounded-[4px] bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-[#024AD8] focus:ring-2 focus:ring-[#024AD8]/15 disabled:opacity-50 transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="create-product-origin" className="block text-xs font-bold text-slate-900">
            {isZh ? '产地 *' : 'Country of Origin *'}
          </label>
          <input
            type="text"
            id="create-product-origin"
            value={formData.origin}
            onChange={(e) => onChange({ origin: e.target.value })}
            placeholder={isZh ? '例如：中国、日本、德国、意大利' : 'e.g. China, Japan, Germany, Italy'}
            disabled={disabled}
            className="w-full h-10 px-3 rounded-[4px] bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#024AD8] focus:ring-2 focus:ring-[#024AD8]/15 disabled:opacity-50 transition-all"
          />
        </div>
      </div>

      {/* 4. 库存 (可选) 与 商品简介 (可选) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="space-y-1.5 sm:col-span-1">
          <div className="flex items-center justify-between">
            <label htmlFor="create-product-inventory" className="block text-xs font-bold text-slate-900">
              {isZh ? '库存' : 'Inventory'}
            </label>
            <span className="text-[10px] text-slate-400">{isZh ? '可选' : 'Optional'}</span>
          </div>
          <input
            type="number"
            id="create-product-inventory"
            value={formData.inventory}
            onChange={(e) => onChange({ inventory: e.target.value })}
            min="0"
            step="1"
            placeholder={isZh ? '默认为 0' : 'Default 0'}
            disabled={disabled}
            className="w-full h-10 px-3 rounded-[4px] bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-[#024AD8] focus:ring-2 focus:ring-[#024AD8]/15 disabled:opacity-50 transition-all"
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <div className="flex items-center justify-between">
            <label htmlFor="create-product-description" className="block text-xs font-bold text-slate-900">
              {isZh ? '商品简介' : 'Short Description'}
            </label>
            <span className="text-[10px] text-slate-400">{isZh ? '可选' : 'Optional'}</span>
          </div>
          <input
            type="text"
            id="create-product-description"
            value={formData.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder={isZh ? '一句话概括商品亮点（长文案与故事可在详情页编辑）' : 'Brief highlights (full story can be added in product details)'}
            disabled={disabled}
            className="w-full h-10 px-3 rounded-[4px] bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#024AD8] focus:ring-2 focus:ring-[#024AD8]/15 disabled:opacity-50 transition-all"
          />
        </div>
      </div>
    </div>
  )
}
