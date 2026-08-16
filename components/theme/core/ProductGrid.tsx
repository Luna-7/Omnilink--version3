/**
 * ProductGrid —— Theme System 核心展示组件。
 *
 * 职责仅限：products 布局 + 组合 ProductCard + 空态。
 * 商品视觉一律由 ProductCard 渲染（本组件零商品视觉复制）。
 * 列数/断点/间距由本组件决定；页面 section 节奏属于 Template（#46）。
 *
 * Server Component：无交互需求。
 */

import { PackageOpen } from 'lucide-react'
import type { StorefrontProduct } from '@/lib/storefront/types'
import ProductCard from './ProductCard'

type ProductGridProps = {
  products: StorefrontProduct[]
  emptyMessage?: string
}

export default function ProductGrid({
  products,
  emptyMessage = 'No products yet',
}: ProductGridProps) {
  // 空态：最小呈现，不建大型 EmptyState 抽象
  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-[var(--th-radius-card)] border border-dashed border-[var(--th-color-border)] py-16 text-[var(--th-color-muted)]">
        <PackageOpen size={24} strokeWidth={1.5} aria-hidden />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-[var(--th-spacing-grid)] sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
