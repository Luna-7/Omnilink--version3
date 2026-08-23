'use client'

import React from 'react'
import { Package, ShieldAlert, Layers } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

/**
 * LOGISTICS PREPARATION (UI State Only):
 * 
 * Future logistics/packaging API contract (if required):
 * POST /api/v1/merchant/products/:id/packaging
 */

export interface PackagingState {
  pkgType: 'carton' | 'bag' | 'crate' | 'pallet'
  unitsPerPkg: number
  lengthCm: number
  widthCm: number
  heightCm: number
  weightKg: number
  stackable: boolean
  fragile: boolean
}

interface ProductPackagingSectionProps {
  packaging: PackagingState
  setPackaging: React.Dispatch<React.SetStateAction<PackagingState>>
  disabled?: boolean
}

export function ProductPackagingSection({
  packaging,
  setPackaging,
  disabled = false,
}: ProductPackagingSectionProps) {
  const { isZh } = useLanguage()

  const updateField = <K extends keyof PackagingState>(key: K, val: PackagingState[K]) => {
    setPackaging((prev) => ({ ...prev, [key]: val }))
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[4px] bg-blue-50 text-[#024AD8] flex items-center justify-center font-mono font-bold text-xs">
            07
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {isZh ? '物流与包装预留 (Packaging & Logistics)' : 'Packaging & Logistics'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isZh
                ? '用于未来跨境物流运费估算、外箱尺寸规格与出口包装规划'
                : 'For future logistics estimation, carton dimensions, and export packaging planning'}
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-600">
          {isZh ? '物流模块预留' : 'Logistics Spec Ready'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Packaging Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1.5">
            {isZh ? '外包装类型 (Packaging Type)' : 'Packaging Type'}
          </label>
          <select
            value={packaging.pkgType}
            onChange={(e) => updateField('pkgType', e.target.value as any)}
            disabled={disabled}
            className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 disabled:opacity-50"
          >
            <option value="carton">{isZh ? '瓦楞纸箱 (Carton Box)' : 'Carton Box'}</option>
            <option value="bag">{isZh ? '防尘/快递袋 (Poly Bag)' : 'Poly Bag'}</option>
            <option value="crate">{isZh ? '木箱/强化框架 (Wooden Crate)' : 'Wooden Crate'}</option>
            <option value="pallet">{isZh ? '标准托盘 (Pallet)' : 'Pallet'}</option>
          </select>
        </div>

        {/* Units Per Package */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1.5">
            {isZh ? '每箱装箱数 (Units/Pkg)' : 'Units per Package'}
          </label>
          <input
            type="number"
            value={packaging.unitsPerPkg}
            onChange={(e) => updateField('unitsPerPkg', parseInt(e.target.value) || 1)}
            min="1"
            disabled={disabled}
            className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 disabled:opacity-50"
          />
        </div>

        {/* Package Weight */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1.5">
            {isZh ? '整箱毛重 (Weight kg)' : 'Gross Weight (kg)'}
          </label>
          <input
            type="number"
            step="0.01"
            value={packaging.weightKg}
            onChange={(e) => updateField('weightKg', parseFloat(e.target.value) || 0)}
            disabled={disabled}
            placeholder="0.00"
            className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 disabled:opacity-50"
          />
        </div>

        {/* Package Dimensions L x W x H */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1.5">
            {isZh ? '包装外箱长度 (Length cm)' : 'Package Length (cm)'}
          </label>
          <input
            type="number"
            step="0.1"
            value={packaging.lengthCm}
            onChange={(e) => updateField('lengthCm', parseFloat(e.target.value) || 0)}
            disabled={disabled}
            placeholder="0.0"
            className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1.5">
            {isZh ? '包装外箱宽度 (Width cm)' : 'Package Width (cm)'}
          </label>
          <input
            type="number"
            step="0.1"
            value={packaging.widthCm}
            onChange={(e) => updateField('widthCm', parseFloat(e.target.value) || 0)}
            disabled={disabled}
            placeholder="0.0"
            className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1.5">
            {isZh ? '包装外箱高度 (Height cm)' : 'Package Height (cm)'}
          </label>
          <input
            type="number"
            step="0.1"
            value={packaging.heightCm}
            onChange={(e) => updateField('heightCm', parseFloat(e.target.value) || 0)}
            disabled={disabled}
            placeholder="0.0"
            className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 disabled:opacity-50"
          />
        </div>
      </div>

      {/* Checkbox Flags */}
      <div className="flex flex-wrap items-center gap-6 pt-2">
        <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={packaging.stackable}
            onChange={(e) => updateField('stackable', e.target.checked)}
            disabled={disabled}
            className="rounded border-slate-300 text-violet-600 focus:ring-violet-500 w-4 h-4"
          />
          <span>{isZh ? '允许码垛堆叠 (Stackable)' : 'Stackable Container'}</span>
        </label>

        <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={packaging.fragile}
            onChange={(e) => updateField('fragile', e.target.checked)}
            disabled={disabled}
            className="rounded border-slate-300 text-violet-600 focus:ring-violet-500 w-4 h-4"
          />
          <span className="text-rose-700">{isZh ? '易碎品警示 (Fragile Item)' : 'Fragile / Handle With Care'}</span>
        </label>
      </div>
    </div>
  )
}
