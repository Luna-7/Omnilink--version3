'use client'

import React from 'react'
import { DollarSign, Layers, PackageCheck } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

interface ProductCommercialSectionProps {
  price: string | number
  setPrice: (val: string | number) => void
  currency: string
  setCurrency: (val: string) => void
  inventory: string | number
  setInventory: (val: string | number) => void
  disabled?: boolean
}

export function ProductCommercialSection({
  price,
  setPrice,
  currency,
  setCurrency,
  inventory,
  setInventory,
  disabled = false,
}: ProductCommercialSectionProps) {
  const { isZh } = useLanguage()

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold text-xs">
            3
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {isZh ? '商业定价与库存 (Commercial)' : 'Commercial'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isZh
                ? '商品售价、结算币种与基础货架库存数'
                : 'Selling price, settlement currency, and available stock units'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Price */}
        <div>
          <label htmlFor="workspace-price" className="block text-xs font-semibold text-slate-800 mb-1.5">
            {isZh ? '基础售价 *' : 'Price *'}
          </label>
          <div className="relative">
            <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="workspace-price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
              disabled={disabled}
              className="w-full h-10 pl-8 pr-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 disabled:opacity-50 transition-all"
            />
          </div>
        </div>

        {/* Currency */}
        <div>
          <label htmlFor="workspace-currency" className="block text-xs font-semibold text-slate-800 mb-1.5">
            {isZh ? '结算币种' : 'Currency'}
          </label>
          <select
            id="workspace-currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            disabled={disabled}
            className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 disabled:opacity-50 transition-all"
          >
            <option value="CNY">CNY (人民币 ¥)</option>
            <option value="USD">USD (美元 $)</option>
            <option value="EUR">EUR (欧元 €)</option>
            <option value="GBP">GBP (英镑 £)</option>
            <option value="JPY">JPY (日元 ¥)</option>
          </select>
        </div>

        {/* Inventory */}
        <div>
          <label htmlFor="workspace-inventory" className="block text-xs font-semibold text-slate-800 mb-1.5">
            {isZh ? '库存数量' : 'Inventory'}
          </label>
          <input
            id="workspace-inventory"
            type="number"
            value={inventory}
            onChange={(e) => setInventory(e.target.value)}
            min="0"
            step="1"
            placeholder="100"
            disabled={disabled}
            className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 disabled:opacity-50 transition-all"
          />
        </div>
      </div>
    </div>
  )
}
