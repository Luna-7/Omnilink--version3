'use client'

import React, { useState } from 'react'
import { Plus, Search, X, Link2, Info } from 'lucide-react'
import type {
  ProductRelation,
  ProductRelationType,
} from '@/lib/products/product-relations'
import { PRODUCT_RELATION_LABELS } from '@/lib/products/product-relations'
import { useLanguage } from '@/context/LanguageContext'

interface ProductRelationsSectionProps {
  relations: ProductRelation[]
  onChange: (relations: ProductRelation[]) => void
  disabled?: boolean
}

const relationTypes: ProductRelationType[] = [
  'recommended',
  'complementary',
  'series',
  'accessory',
  'alternative',
]

export function ProductRelationsSection({
  relations,
  onChange,
  disabled = false,
}: ProductRelationsSectionProps) {
  const { isZh } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [relationType, setRelationType] = useState<ProductRelationType>('recommended')
  const [query, setQuery] = useState('')

  const handleRemove = (id: string) => {
    onChange(relations.filter((r) => r.id !== id))
  }

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[4px] bg-slate-900 text-white flex items-center justify-center font-mono font-extrabold text-sm shadow-xs shrink-0">
            07
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900">
                {isZh ? '关联商品' : 'Related Products'}
              </h2>
              <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-bold bg-slate-100 text-slate-700 font-mono">
                {relations.length} 项关联
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isZh
                ? '关联推荐、搭配、同系列、配件或替代商品，供 Storefront 与 AI 引擎精准推荐'
                : 'Link recommended, complementary, series, or accessory products for storefront recommendations'}
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(true)}
          className="px-3.5 py-2 rounded-[4px] bg-[#024AD8] hover:bg-[#003198] active:bg-[#00226B] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:bg-[#E2E2E2] disabled:text-[#9E9E9E] disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[#024AD8]"
        >
          <Plus size={14} />
          <span>{isZh ? '添加关联' : 'Add Relation'}</span>
        </button>
      </div>

      {/* List Area */}
      <div className="space-y-2">
        {relations.length > 0 ? (
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden bg-slate-50/50">
            {relations.map((rel) => (
              <div
                key={rel.id}
                className="flex items-center justify-between gap-4 px-4 py-3 bg-white hover:bg-slate-50 transition-colors"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {rel.targetProduct.thumbnailUrl ? (
                    <img
                      src={rel.targetProduct.thumbnailUrl}
                      alt={rel.targetProduct.name}
                      className="h-10 w-10 rounded-[4px] object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-[4px] bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                      <Link2 size={16} className="text-slate-400" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="truncate text-xs font-bold text-slate-900">
                      {rel.targetProduct.name}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px]">
                      <span className="px-1.5 py-0.2 rounded-[4px] bg-blue-50 text-[#024AD8] font-bold border border-blue-200 text-[10px]">
                        {PRODUCT_RELATION_LABELS[rel.relationType] || rel.relationType}
                      </span>
                      {rel.targetProduct.sku && (
                        <span className="text-slate-400 font-mono text-[10px]">
                          SKU: {rel.targetProduct.sku}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => handleRemove(rel.id)}
                  className="p-1.5 rounded-[4px] text-slate-400 hover:text-[#D32F2F] hover:bg-rose-50 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#024AD8]"
                  title={isZh ? '移除关联' : 'Remove relation'}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 space-y-1.5">
            <Link2 size={20} className="mx-auto text-slate-400 mb-1" />
            <p className="text-xs font-bold text-slate-700">
              {isZh ? '暂无关联商品' : 'No Related Products Linked'}
            </p>
            <p className="text-[11px] text-slate-500">
              {isZh
                ? '添加商品关联可用于 Storefront 推荐与 AI 交叉销售策略'
                : 'Add product relations for storefront recommendations and cross-selling'}
            </p>
          </div>
        )}
      </div>

      {/* Drawer Modal for Adding Relations */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end transition-opacity animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-250">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {isZh ? '添加关联商品' : 'Add Related Product'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isZh ? '搜索商品库并设定关联语义关系' : 'Search catalog and set relationship type'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-[4px] cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-[#024AD8]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form & Search */}
            <div className="p-5 space-y-4 flex-1 overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  {isZh ? '关联类型 (Relation Type)' : 'Relation Type'}
                </label>
                <select
                  value={relationType}
                  onChange={(e) => setRelationType(e.target.value as ProductRelationType)}
                  className="w-full h-9 rounded-[4px] border border-slate-200 px-3 text-xs bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#024AD8] focus:bg-white transition-all"
                >
                  {relationTypes.map((type) => (
                    <option key={type} value={type}>
                      {PRODUCT_RELATION_LABELS[type]} ({type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  {isZh ? '搜索目标商品' : 'Search Product'}
                </label>
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={isZh ? '输入商品名称或 SKU 搜索...' : 'Search by name or SKU...'}
                    className="w-full h-9 rounded-[4px] border border-slate-200 pl-9 pr-3 text-xs outline-none focus:border-[#024AD8] focus:ring-1 focus:ring-[#024AD8]/20 transition-all"
                  />
                </div>
              </div>

              {/* Backend Contract Status Placeholder */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-[#024AD8]">
                  <Info size={15} />
                  <span>{isZh ? '关联商品检索服务' : 'Product Relation Service'}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {isZh
                    ? '关联商品搜索与数据存储契约已打通（Backend Contract Ready）。接通后台数据表后将自动列出可关联的商品候选列表。'
                    : 'Backend Contract Ready. Candidate products will automatically list here once relation database table is provisioned.'}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-[4px] border border-[#D1D1D1] bg-white text-[#1C1C1C] text-xs font-medium hover:bg-[#F7F7F7] hover:border-[#B0B0B0] transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#024AD8]"
              >
                {isZh ? '关闭' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
