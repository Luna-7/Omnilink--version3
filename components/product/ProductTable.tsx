'use client'

import React, { useMemo, useState } from 'react'
import { Search, Package, Plus, ChevronRight } from 'lucide-react'
import { AiBadge, EmptyState } from '@/components/dashboard/kit'
import { useLanguage } from '@/context/LanguageContext'
import Link from 'next/link'

export type ProductRow = {
  id: string
  name: string
  category?: string | null
  price?: number | string | null
  image_url?: string | null
  semantic_data?: unknown
}

export function ProductTable({ products }: { products: ProductRow[] }) {
  const [query, setQuery] = useState('')
  const { t, isZh } = useLanguage()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        (p.category ?? '').toLowerCase().includes(q)
    )
  }, [products, query])

  return (
    <div className="space-y-5">
      {/* 搜索框 */}
      <div className="relative max-w-md">
        <Search
          size={14}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.products.searchPlaceholder}
          aria-label="Search products"
          className="w-full h-10 pl-10 pr-4 rounded-full bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#111827] transition-all"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title={query ? (isZh ? '未找到匹配商品' : 'No matching products') : t.products.noProducts}
          description={
            query
              ? (isZh ? '请尝试调整搜索关键词或清除筛选。' : 'Try adjusting your search keywords or clear the filter.')
              : t.products.noProductsDesc
          }
          action={
            !query ? (
              <Link
                href="/dashboard/products/new"
                className="px-5 py-2.5 rounded-full bg-[#111827] hover:bg-black text-white text-xs font-semibold shadow-sm transition-all inline-flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>{t.products.addProduct}</span>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}

function ProductCard({ product: p }: { product: ProductRow }) {
  const aiReady = Boolean(p.semantic_data)
  const { isZh } = useLanguage()

  return (
    <Link
      href={`/dashboard/products/${p.id}/node`}
      className="group bg-[#F4F5F7]/70 hover:bg-white border border-[#E5E7EB] rounded-2xl p-4 flex flex-col gap-3 transition-all duration-200 hover:shadow-md hover:border-[#111827]/20"
    >
      {/* 商品图：方形圆角 */}
      <div className="relative">
        <div className="w-full aspect-square rounded-xl overflow-hidden bg-white border border-[#E5E7EB] flex items-center justify-center">
          {p.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.image_url}
              alt={p.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <Package size={28} strokeWidth={1.5} className="text-[#9CA3AF]" />
          )}
        </div>
      </div>

      <div className="min-w-0">
        <h4 className="text-xs font-bold text-[#111827] truncate group-hover:text-[#111827] transition-colors">
          {p.name}
        </h4>
        <p className="text-[11px] text-[#6B7280] mt-0.5 truncate tnum">
          {p.category || (isZh ? '通用分类' : 'General')}
          {p.price != null && p.price !== '' ? ` · ¥${p.price}` : ''}
        </p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB]/80">
        <AiBadge ready={aiReady} />
        <span className="text-[11px] font-semibold text-[#6B7280] group-hover:text-[#111827] transition-all inline-flex items-center gap-0.5">
          <span>{isZh ? '语义节点' : 'Node'}</span>
          <ChevronRight size={12} />
        </span>
      </div>
    </Link>
  )
}
