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
  currency = 'CNY',
  setCurrency,
  inventory,
  setInventory,
  disabled = false,
}: ProductCommercialSectionProps) {
  const { isZh } = useLanguage()
  const isUSD = currency === 'USD'
  const symbol = isUSD ? '$' : '¥'
  const currencyLabel = isUSD ? 'USD (美元 $)' : 'CNY (人民币 ¥)'

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
                ? '商品售价、店铺基础货币与基础货架库存数'
                : 'Selling price, store base currency, and available stock units'}
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
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">
              {symbol}
            </span>
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

        {/* Store Base Currency (Read-Only) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="workspace-currency-display" className="block text-xs font-semibold text-slate-800">
              {isZh ? '结算币种 (Store Base Currency)' : 'Store Base Currency'}
            </label>
          </div>
          <div
            id="workspace-currency-display"
            className="w-full h-10 px-3.5 rounded-xl bg-slate-100/90 border border-slate-200 text-xs font-semibold text-slate-800 flex items-center justify-between select-none"
            title={isZh ? '币种继承自店铺基础货币，可在店铺设置中修改' : 'Inherited from Store Base Currency'}
          >
            <span>{currencyLabel}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 font-medium">
              {isZh ? '店铺统一' : 'Store Base'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            {isZh ? '继承自店铺基础货币设置' : 'Inherited from Store Base Currency'}
          </p>
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
