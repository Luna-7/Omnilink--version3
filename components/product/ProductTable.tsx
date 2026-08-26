'use client'

import React, { useMemo, useState } from 'react'
import {
  Search,
  Package,
  Plus,
  ChevronRight,
  LayoutGrid,
  List,
  Sparkles,
  Cpu,
  CheckSquare,
  Square,
  Download,
} from 'lucide-react'
import { AiBadge, EmptyState } from '@/components/dashboard/kit'
import { useLanguage } from '@/context/LanguageContext'
import Link from 'next/link'

export type ProductRow = {
  id: string
  name: string
  category?: string | null
  price?: number | string | null
  inventory?: number | null
  sku?: string | null
  status?: string | null
  image_url?: string | null
  semantic_data?: unknown
  sales_count?: number
}

type FilterStatus = 'all' | 'active' | 'ai_ready' | 'low_stock'

export function ProductTable({ products }: { products: ProductRow[] }) {
  const [query, setQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const { t, isZh } = useLanguage()

  // 过滤逻辑
  const filtered = useMemo(() => {
    let list = products

    // 状态过滤
    if (filterStatus === 'active') {
      list = list.filter((p) => (p.status || 'active') === 'active')
    } else if (filterStatus === 'ai_ready') {
      list = list.filter((p) => Boolean(p.semantic_data))
    } else if (filterStatus === 'low_stock') {
      list = list.filter((p) => (Number(p.inventory) || 0) < 100)
    }

    // 搜索过滤
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        (p.category ?? '').toLowerCase().includes(q) ||
        (p.sku ?? '').toLowerCase().includes(q)
    )
  }, [products, query, filterStatus])

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filtered.map((p) => p.id))
    }
  }

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  return (
    <div className="space-y-5">
      {/* 搜索栏、状态过滤器与视图切换 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* 状态分类药丸 */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <FilterPill
            active={filterStatus === 'all'}
            onClick={() => setFilterStatus('all')}
            label={isZh ? '全部商品' : 'All'}
            count={products.length}
          />
          <FilterPill
            active={filterStatus === 'active'}
            onClick={() => setFilterStatus('active')}
            label={isZh ? '在售中' : 'Active'}
            count={products.filter((p) => (p.status || 'active') === 'active').length}
          />
          <FilterPill
            active={filterStatus === 'low_stock'}
            onClick={() => setFilterStatus('low_stock')}
            label={isZh ? '库存预警' : 'Low Stock'}
            count={products.filter((p) => (Number(p.inventory) || 0) < 100).length}
          />
        </div>

        {/* 搜索与视图切换 */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isZh ? '搜索商品名称 / SKU / 分类...' : 'Search name, SKU, category...'}
              aria-label="Search products"
              className="w-full h-9 pl-9 pr-4 rounded-full bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#111827] transition-all"
            />
          </div>

          <div className="flex items-center p-0.5 rounded-full bg-[#F4F5F7] border border-[#E5E7EB] shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-full transition-all ${
                viewMode === 'grid' ? 'bg-white text-[#111827] shadow-sm' : 'text-[#9CA3AF] hover:text-[#111827]'
              }`}
              title={isZh ? '网格视图' : 'Grid View'}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-full transition-all ${
                viewMode === 'table' ? 'bg-white text-[#111827] shadow-sm' : 'text-[#9CA3AF] hover:text-[#111827]'
              }`}
              title={isZh ? '表格视图' : 'Table View'}
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 批量操作工具条 (当有选择时浮现) */}
      {selectedIds.length > 0 && (
        <div className="p-3 rounded-2xl bg-[#111827] text-white flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-200 shadow-md">
          <div className="flex items-center gap-2 text-xs font-semibold pl-2">
            <CheckSquare size={16} className="text-[#edbc40]" />
            <span>
              {isZh ? `已选择 ${selectedIds.length} 项商品` : `Selected ${selectedIds.length} items`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => alert(isZh ? `已启动 ${selectedIds.length} 个商品的 AI 语义批量重构任务` : 'Triggered batch AI semantic generation')}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles size={13} className="text-[#edbc40]" />
              <span>{isZh ? 'AI 批量重构' : 'Batch AI Generate'}</span>
            </button>
            <button
              type="button"
              onClick={() => alert(isZh ? `正在导出 ${selectedIds.length} 项商品 CSV` : 'Exporting CSV')}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download size={13} />
              <span>{isZh ? '导出 CSV' : 'Export CSV'}</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 rounded-full bg-white text-[#111827] hover:bg-gray-100 text-xs font-bold transition-colors cursor-pointer"
            >
              {isZh ? '取消选择' : 'Deselect'}
            </button>
          </div>
        </div>
      )}

      {/* 内容区域: 网格视图 vs 列表视图 */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title={query ? (isZh ? '未找到匹配商品' : 'No matching products') : t.products.noProducts}
          description={
            query
              ? isZh
                ? '请尝试调整搜索关键词或清除筛选。'
                : 'Try adjusting your search keywords or clear the filter.'
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
      ) : viewMode === 'grid' ? (
        <div className="grid gap-3.5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5">
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              selected={selectedIds.includes(p.id)}
              onToggleSelect={(e) => toggleSelectOne(p.id, e)}
            />
          ))}
        </div>
      ) : (
        /* 表格视图 */
        <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB]">
          <table className="w-full text-left text-xs bg-white">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F4F5F7]/70 text-[#6B7280] font-semibold">
                <th className="py-3 px-4 w-10">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-[#9CA3AF] hover:text-[#111827]"
                  >
                    {selectedIds.length === filtered.length && filtered.length > 0 ? (
                      <CheckSquare size={16} className="text-[#111827]" />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4">{isZh ? '商品主档' : 'Product'}</th>
                <th className="py-3 px-4">{isZh ? 'SKU' : 'SKU'}</th>
                <th className="py-3 px-4">{isZh ? '分类' : 'Category'}</th>
                <th className="py-3 px-4">{isZh ? '售价' : 'Price'}</th>
                <th className="py-3 px-4">{isZh ? '库存' : 'Stock'}</th>
                <th className="py-3 px-4">{isZh ? 'AI 语义节点' : 'Semantic Status'}</th>
                <th className="py-3 px-4 text-right">{isZh ? '操作' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]/60">
              {filtered.map((p) => {
                const isSelected = selectedIds.includes(p.id)
                const aiReady = Boolean(p.semantic_data)
                return (
                  <tr key={p.id} className="hover:bg-[#F4F5F7]/50 transition-colors group">
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={(e) => toggleSelectOne(p.id, e)}
                        className="text-[#9CA3AF] hover:text-[#111827]"
                      >
                        {isSelected ? (
                          <CheckSquare size={16} className="text-[#111827]" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#F4F5F7] border border-[#E5E7EB] shrink-0 flex items-center justify-center">
                          {p.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package size={18} className="text-[#9CA3AF]" />
                          )}
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <Link
                            href={`/dashboard/products/${p.id}/edit`}
                            prefetch={true}
                            className="font-bold text-[#111827] hover:underline truncate block"
                          >
                            {p.name}
                          </Link>
                          <span className="text-[10px] text-[#9CA3AF]">ID: {p.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#6B7280]">{p.sku || '-'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-[#F4F5F7] text-[11px] font-medium text-[#111827]">
                        {p.category || '通用'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#111827]">
                      {p.price != null && p.price !== '' ? `¥${p.price}` : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          (Number(p.inventory) || 0) < 100
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {p.inventory ?? 0} 件
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <AiBadge ready={aiReady} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/dashboard/products/${p.id}/edit`}
                          prefetch={true}
                          className="px-2.5 py-1 rounded-[4px] bg-[#F4F5F7] hover:bg-[#EFF4FF] hover:text-[#024AD8] text-[11px] font-semibold text-[#111827] transition-colors focus-visible:outline-2 focus-visible:outline-[#024AD8] focus-visible:outline-offset-2"
                        >
                          {isZh ? '编辑' : 'Edit'}
                        </Link>
                        <Link
                          href={`/dashboard/products/${p.id}/node`}
                          prefetch={true}
                          className="p-1 rounded-[4px] hover:bg-[#F4F5F7] text-[#6B7280] hover:text-[#111827] focus-visible:outline-2 focus-visible:outline-[#024AD8] focus-visible:outline-offset-2"
                          title={isZh ? '查看语义节点' : 'View Node'}
                        >
                          <Cpu size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function FilterPill({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  label: string
  count?: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
        active
          ? 'bg-[#111827] text-white shadow-sm'
          : 'bg-[#F4F5F7] text-[#6B7280] hover:text-[#111827] hover:bg-[#E5E7EB]'
      }`}
    >
      <span>{label}</span>
      {count != null && (
        <span
          className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
            active ? 'bg-white/20 text-white' : 'bg-white text-[#111827]'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  )
}

function ProductCard({
  product: p,
  selected,
  onToggleSelect,
}: {
  product: ProductRow
  selected: boolean
  onToggleSelect: (e: React.MouseEvent) => void
}) {
  const { isZh } = useLanguage()

  return (
    <Link
      href={`/dashboard/products/${p.id}/edit`}
      prefetch={true}
      className={`group relative bg-white dark:bg-slate-900 border rounded-[8px] p-3 flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:border-[#024AD8] cursor-pointer ${
        selected
          ? 'border-[#024AD8] ring-2 ring-[#024AD8] shadow-xs'
          : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      {/* 顶部多选复选框 */}
      <button
        type="button"
        onClick={onToggleSelect}
        className="absolute top-2.5 left-2.5 z-10 p-1 rounded-[4px] bg-white/90 dark:bg-slate-800/90 backdrop-blur-xs text-[#111827] dark:text-white shadow-2xs hover:bg-white transition-all cursor-pointer"
        title={isZh ? '选择商品' : 'Select'}
      >
        {selected ? <CheckSquare size={14} className="text-[#024AD8]" /> : <Square size={14} className="text-slate-400" />}
      </button>

      <div>
        {/* 商品图：方形圆角 */}
        <div className="w-full aspect-square rounded-[6px] overflow-hidden bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 flex items-center justify-center relative">
          {p.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.image_url}
              alt={p.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <Package size={24} strokeWidth={1.5} className="text-slate-400" />
          )}
        </div>

        <div className="min-w-0 mt-2.5 space-y-1">
          <div className="flex items-center justify-between gap-1 text-[10px]">
            <span className="font-mono text-slate-400 uppercase truncate">{p.sku || 'SKU'}</span>
            <span className="font-semibold text-slate-500 dark:text-slate-400 truncate">{p.category || (isZh ? '通用' : 'General')}</span>
          </div>

          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-[#024AD8] transition-colors" title={p.name}>
            {p.name}
          </h4>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-extrabold text-[#024AD8] dark:text-[#5B8FF9] tnum">
              {p.price != null && p.price !== '' ? `¥${p.price}` : (isZh ? '未定价' : 'Unpriced')}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              {isZh ? `库存: ${p.inventory ?? 0}` : `Stock: ${p.inventory ?? 0}`}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
