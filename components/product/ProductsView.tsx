'use client'

import React from 'react'
import { ProductCreateDialog } from '@/components/product/ProductCreateDialog'
import { ProductTable, type ProductRow } from '@/components/product/ProductTable'
import { Package, Sparkles, UploadCloud, Layers } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import Link from 'next/link'

export function ProductsView({ products }: { products: ProductRow[] }) {
  const { t, isZh } = useLanguage()
  const aiReadyCount = products.filter((p) => Boolean(p.semantic_data)).length
  const inStockCount = products.filter((p) => (p.inventory ?? 1) > 0).length

  return (
    <div className="space-y-5">
      {/* 顶部指标卡行（精简去重，节省空间） */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="crextio-card p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F4F5F7] border border-[#E5E7EB] text-[#111827] flex items-center justify-center shrink-0">
              <Package size={18} />
            </div>
            <div>
              <span className="text-xs text-[#6B7280] block font-medium">{t.products.totalCatalog}</span>
              <div className="text-xl font-bold text-[#111827] mt-0.5 tnum">
                {products.length} {t.products.units}
              </div>
            </div>
          </div>
        </div>

        <div className="crextio-card p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F4F5F7] border border-[#E5E7EB] text-[#111827] flex items-center justify-center shrink-0">
              <Layers size={18} />
            </div>
            <div>
              <span className="text-xs text-[#6B7280] block font-medium">
                {isZh ? '现货在售 SKU' : 'In Stock SKU'}
              </span>
              <div className="text-xl font-bold text-[#111827] mt-0.5 tnum">
                {inStockCount} / {products.length || 0}
              </div>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-200">
            {isZh ? '正常供货' : 'Normal'}
          </span>
        </div>
      </div>

      {/* 主体操作栏与产品列表 */}
      <div className="crextio-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-heading text-lg font-bold text-[#111827]">
              {t.products.catalogTitle}
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5">
              {t.products.catalogDesc}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/dashboard/products/import"
              className="px-4 py-2 rounded-full bg-[#F4F5F7] hover:bg-[#E5E7EB] text-[#111827] text-xs font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <UploadCloud size={13} className="text-[#111827]" />
              <span>{t.products.smartImport}</span>
            </Link>
            <ProductCreateDialog />
          </div>
        </div>

        <ProductTable products={products} />
      </div>
    </div>
  )
}
