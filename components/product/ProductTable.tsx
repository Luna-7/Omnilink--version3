'use client'

import React, { useMemo, useState } from 'react'
import { Search, Package, Plus, ChevronRight } from 'lucide-react'
import { AiBadge, EmptyState, PrimaryLink } from '@/components/dashboard/kit'
import Link from 'next/link'

export type ProductRow = {
  id: string
  name: string
  category?: string | null
  price?: number | string | null
  image_url?: string | null
  semantic_data?: unknown
}

/* ============================================================
   产品结构化卡片网格（B2B 信息密度）
   图片 / 名称 / 分类 / 价格 / AI 状态（tiny indicator）
   AI 就绪 → 绿点 · 待解析 → 紫点
   ============================================================ */

export function ProductTable({ products }: { products: ProductRow[] }) {
  const [query, setQuery] = useState('')

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
    <div className="space-y-4">
      {/* 搜索 */}
      <div className="relative max-w-sm">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索产品名称或分类…"
          aria-label="搜索产品"
          className="field-input !pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title={query ? '没有匹配的产品' : '还没有产品'}
          description={
            query
              ? '换个关键词试试，或清除搜索条件。'
              : '导入或创建你的第一个产品，让 Omnilink 开始构建可被 AI 理解的商品数据。'
          }
          action={
            !query ? (
              <PrimaryLink href="/dashboard/products/new">
                <Plus size={14} />
                添加产品
              </PrimaryLink>
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
  return (
    <Link
      href={`/dashboard/products/${p.id}/node`}
      className="group glass-panel rounded-lg p-3.5 flex flex-col gap-3 hover-lift"
    >
      {/* 商品图：方形小圆角 */}
      <div className="relative">
        <div className="w-full aspect-square rounded-md overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
          {p.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.image_url}
              alt={p.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package size={26} strokeWidth={1.5} className="text-gray-300" />
          )}
        </div>
      </div>

      <div className="min-w-0">
        <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-[#8b5cf6] transition-colors">
          {p.name}
        </h3>
        <p className="text-xs text-gray-400 mt-0.5 truncate tnum">
          {p.category || '未分类'}
          {p.price != null && p.price !== '' ? ` · ¥${p.price}` : ''}
        </p>
      </div>

      <div className="flex items-center justify-between pt-0.5">
        <AiBadge ready={aiReady} />
        <span className="text-[11px] font-medium text-gray-400 opacity-0 group-hover:opacity-100 group-hover:text-[#8b5cf6] transition-all inline-flex items-center gap-0.5">
          查看节点
          <ChevronRight size={11} />
        </span>
      </div>
    </Link>
  )
}
