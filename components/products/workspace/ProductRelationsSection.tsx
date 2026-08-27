'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Search, X, Link2, Check, Package, Loader2 } from 'lucide-react'
import type {
  ProductRelation,
  ProductRelationType,
} from '@/lib/products/product-relations'
import { PRODUCT_RELATION_LABELS } from '@/lib/products/product-relations'
import { useLanguage } from '@/context/LanguageContext'
import { DEMO_PRODUCTS } from '@/lib/products/demo-data'

interface ProductRelationsSectionProps {
  productId?: string
  relations: ProductRelation[]
  onChange: (relations: ProductRelation[]) => void
  disabled?: boolean
}

interface CatalogProduct {
  id: string
  name: string
  sku?: string
  price?: number
  currency?: string
  image_url?: string
  category?: string
}

const relationTypes: ProductRelationType[] = [
  'recommended',
  'complementary',
  'series',
  'accessory',
  'alternative',
]

export function ProductRelationsSection({
  productId,
  relations,
  onChange,
  disabled = false,
}: ProductRelationsSectionProps) {
  const { isZh } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [relationType, setRelationType] = useState<ProductRelationType>('recommended')
  const [query, setQuery] = useState('')
  const [catalogProducts, setCatalogProducts] = useState<CatalogProduct[]>([])
  const [loadingCatalog, setLoadingCatalog] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    let isMounted = true
    setLoadingCatalog(true)

    async function loadCatalog() {
      let apiProducts: CatalogProduct[] = []
      try {
        const res = await fetch('/api/merchant/products')
        if (res.ok) {
          const data = await res.json()
          if (data.products && Array.isArray(data.products)) {
            apiProducts = data.products.map((p: any) => ({
              id: p.id,
              name: p.name,
              sku: p.sku || '',
              price: p.price || 0,
              currency: p.currency || 'CNY',
              image_url: p.image_url || p.raw_data?.image_url || '',
              category: p.category || p.raw_data?.category || '',
            }))
          }
        }
      } catch {
        // Fallback to demo products if API fails
      }

      const demoMapped: CatalogProduct[] = DEMO_PRODUCTS.map((d) => ({
        id: d.id,
        name: d.name,
        sku: d.sku,
        price: d.price,
        currency: d.currency,
        image_url: d.image_url,
        category: d.category,
      }))

      const combinedMap = new Map<string, CatalogProduct>()
      for (const p of [...apiProducts, ...demoMapped]) {
        if (productId && (p.id === productId || p.sku?.toLowerCase() === productId.toLowerCase())) {
          continue
        }
        if (!combinedMap.has(p.id)) {
          combinedMap.set(p.id, p)
        }
      }

      if (isMounted) {
        setCatalogProducts(Array.from(combinedMap.values()))
        setLoadingCatalog(false)
      }
    }

    loadCatalog()
    return () => {
      isMounted = false
    }
  }, [isOpen, productId])

  const handleRemove = (id: string) => {
    onChange(relations.filter((r) => r.id !== id))
  }

  const handleAddRelation = (candidate: CatalogProduct) => {
    const isAlreadyLinked = relations.some(
      (r) => r.targetProductId === candidate.id && r.relationType === relationType
    )
    if (isAlreadyLinked) return

    const newRel: ProductRelation = {
      id: `rel-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sourceProductId: productId || '',
      targetProductId: candidate.id,
      relationType: relationType,
      position: relations.length,
      targetProduct: {
        id: candidate.id,
        name: candidate.name,
        sku: candidate.sku || '',
        thumbnailUrl: candidate.image_url || '',
        price: candidate.price || 0,
      },
    }
    onChange([...relations, newRel])
  }

  const filteredCandidates = catalogProducts.filter((p) => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return (
      p.name.toLowerCase().includes(q) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q))
    )
  })

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[4px] bg-slate-900 text-white flex items-center justify-center font-mono font-extrabold text-sm shadow-xs shrink-0">
            05
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
                ? '关联推荐、搭配、同系列、配件或替代商品，从商品库中灵活选择关联组合'
                : 'Link recommended, complementary, series, or accessory products from catalog'}
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
          <span>{isZh ? '添加关联商品' : 'Add Related Product'}</span>
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
                          {isZh ? '编号' : 'SKU'}: {rel.targetProduct.sku}
                        </span>
                      )}
                      {rel.targetProduct.price != null && rel.targetProduct.price > 0 && (
                        <span className="text-slate-600 font-semibold text-[10px]">
                          ¥{rel.targetProduct.price}
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
                ? '点击“添加关联商品”，直接关联商品库已有的商品作为推荐或配件'
                : 'Click "Add Related Product" to link products from your catalog'}
            </p>
          </div>
        )}
      </div>

      {/* Drawer Modal for Adding Relations */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end transition-opacity animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-250">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {isZh ? '选择关联商品' : 'Select Related Product from Library'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isZh ? '直接从店铺商品库选择商品并建立关联类型' : 'Select products from catalog and specify relationship type'}
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

            {/* Modal Controls & Product Catalog List */}
            <div className="p-5 space-y-4 flex-1 overflow-y-auto">
              {/* Relation Type Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  {isZh ? '关联类型' : 'Relation Type'}
                </label>
                <select
                  value={relationType}
                  onChange={(e) => setRelationType(e.target.value as ProductRelationType)}
                  className="w-full h-9 rounded-[4px] border border-slate-200 px-3 text-xs bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#024AD8] focus:bg-white transition-all font-medium text-slate-900"
                >
                  {relationTypes.map((type) => (
                    <option key={type} value={type}>
                      {PRODUCT_RELATION_LABELS[type]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Bar */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  {isZh ? '检索商品库' : 'Search Product Catalog'}
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
                    placeholder={isZh ? '按商品名称、编号或分类搜索...' : 'Search by name, SKU or category...'}
                    className="w-full h-9 rounded-[4px] border border-slate-200 pl-9 pr-3 text-xs outline-none focus:border-[#024AD8] focus:ring-1 focus:ring-[#024AD8]/20 transition-all bg-white"
                  />
                </div>
              </div>

              {/* Catalog Product Selection List */}
              <div className="space-y-2 pt-2">
                <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>{isZh ? '商品库列表' : 'Catalog Products'}</span>
                  <span className="text-slate-400 font-normal text-[11px]">
                    {filteredCandidates.length} {isZh ? '个可选商品' : 'available'}
                  </span>
                </div>

                {loadingCatalog ? (
                  <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                    <Loader2 size={20} className="animate-spin text-[#024AD8]" />
                    <span className="text-xs">{isZh ? '加载商品库中...' : 'Loading catalog...'}</span>
                  </div>
                ) : filteredCandidates.length > 0 ? (
                  <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden bg-white max-h-80 overflow-y-auto">
                    {filteredCandidates.map((candidate) => {
                      const isLinked = relations.some(
                        (r) => r.targetProductId === candidate.id && r.relationType === relationType
                      )

                      return (
                        <div
                          key={candidate.id}
                          className="flex items-center justify-between gap-3 p-3 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {candidate.image_url ? (
                              <img
                                src={candidate.image_url}
                                alt={candidate.name}
                                className="h-10 w-10 rounded-[4px] object-cover border border-slate-200 shrink-0"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-[4px] bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                                <Package size={16} className="text-slate-400" />
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {candidate.name}
                              </p>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                {candidate.sku && (
                                  <span className="font-mono text-[10px]">
                                    {isZh ? '编号' : 'SKU'}: {candidate.sku}
                                  </span>
                                )}
                                {candidate.price !== undefined && (
                                  <span className="font-medium text-slate-700">
                                    {candidate.currency || '¥'}
                                    {candidate.price}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAddRelation(candidate)}
                            disabled={isLinked}
                            className={`px-3 py-1.5 rounded-[4px] text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                              isLinked
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                : 'bg-[#024AD8] hover:bg-[#003198] active:bg-[#00226B] text-white shadow-xs focus-visible:outline-2 focus-visible:outline-[#024AD8]'
                            }`}
                          >
                            {isLinked ? (
                              <>
                                <Check size={13} />
                                <span>{isZh ? '已关联' : 'Added'}</span>
                              </>
                            ) : (
                              <>
                                <Plus size={13} />
                                <span>{isZh ? '关联' : 'Link'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="py-10 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 text-slate-500 text-xs">
                    {isZh ? '未找到符合条件的商品' : 'No products found'}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {isZh ? `已选中 ${relations.length} 项关联` : `${relations.length} relations linked`}
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-[4px] bg-[#024AD8] hover:bg-[#003198] active:bg-[#00226B] text-white text-xs font-bold transition-all shadow-xs cursor-pointer focus-visible:outline-2 focus-visible:outline-[#024AD8]"
              >
                {isZh ? '完成' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

