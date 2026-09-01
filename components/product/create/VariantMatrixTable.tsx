'use client'

import React, { useEffect, useRef } from 'react'
import { Layers } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

/**
 * A single purchasable combination row in the variant matrix.
 * All editable fields are strings so partially-typed input is never coerced.
 */
export interface VariantMatrixRow {
  /** Stable combination identity: sorted "code=value" pairs joined by "|". */
  key: string
  optionValues: Record<string, string>
  sku: string
  price: string
  inventory: string
}

export interface VariantMatrixAxis {
  code: string
  name: string
  values: string[]
}

interface VariantMatrixTableProps {
  /** Purchasable axes (code/name/values). The cartesian product drives rows. */
  axes: VariantMatrixAxis[]
  rows: VariantMatrixRow[]
  onChange: (rows: VariantMatrixRow[]) => void
  /** Defaults applied to newly generated combinations. */
  basePrice: string
  baseInventory: string
  baseSku: string
  currency?: string
  disabled?: boolean
}

/** Stable identity for a combination, independent of axis ordering. */
export function variantCombinationKey(optionValues: Record<string, string>): string {
  return Object.entries(optionValues)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('|')
}

function cartesian(axes: VariantMatrixAxis[]): Array<Record<string, string>> {
  return axes.reduce<Array<Record<string, string>>>(
    (acc, axis) => {
      const next: Array<Record<string, string>> = []
      for (const combo of acc) {
        for (const value of axis.values) {
          next.push({ ...combo, [axis.code]: value })
        }
      }
      return next
    },
    [{}],
  )
}

function generateSku(baseSku: string, optionValues: Record<string, string>): string {
  const base = (baseSku || 'SKU').trim() || 'SKU'
  const suffix = Object.keys(optionValues)
    .sort()
    .map((k) => optionValues[k].toUpperCase().replace(/\s+/g, ''))
    .join('-')
  const combined = `${base}-${suffix}`
  return combined.length > 100 ? combined.substring(0, 100) : combined
}

/**
 * Shopify-style variant matrix: the cartesian product of the configured
 * axes rendered as one row per SKU, each with editable price / inventory /
 * SKU. Fully controlled — the parent owns `rows`; when the axes change we
 * reconcile (preserving edits on surviving combinations, dropping removed
 * ones, appending new ones with base defaults) exactly once per axes change.
 */
export function VariantMatrixTable({
  axes,
  rows,
  onChange,
  basePrice,
  baseInventory,
  baseSku,
  currency = 'CNY',
  disabled = false,
}: VariantMatrixTableProps) {
  const { isZh } = useLanguage()

  // Refs let the reconcile effect read the latest rows/onChange without
  // listing them as deps (which would retrigger the effect after its own
  // onChange call and risk a loop). Refs may only be written inside an
  // effect (React Compiler rule) — this sync effect is declared BEFORE the
  // reconcile effect so it always runs first in the same commit.
  const rowsRef = useRef(rows)
  const onChangeRef = useRef(onChange)
  const defaultsRef = useRef({ basePrice, baseInventory, baseSku })
  useEffect(() => {
    rowsRef.current = rows
    onChangeRef.current = onChange
    defaultsRef.current = { basePrice, baseInventory, baseSku }
  })

  const filledAxes = axes.filter((a) => a.code && a.values.length > 0)
  const axesSig = JSON.stringify(filledAxes.map((a) => [a.code, a.values]))

  useEffect(() => {
    const parsed = JSON.parse(axesSig) as Array<[string, string[]]>
    const nextAxes: VariantMatrixAxis[] = parsed.map(([code, values]) => ({
      code,
      name: code,
      values,
    }))

    const previousByKey = new Map(rowsRef.current.map((r) => [r.key, r]))
    const combos = cartesian(nextAxes)
    const defaults = defaultsRef.current

    const reconciled: VariantMatrixRow[] = combos.map((optionValues) => {
      const key = variantCombinationKey(optionValues)
      const existing = previousByKey.get(key)
      if (existing) {
        return { ...existing, optionValues: { ...optionValues } }
      }
      return {
        key,
        optionValues: { ...optionValues },
        sku: generateSku(defaults.baseSku, optionValues),
        price: defaults.basePrice,
        inventory: defaults.baseInventory,
      }
    })

    // Only notify the parent when the shape actually changed, so typing in a
    // cell (which changes rows but not axes) never triggers a rewrite.
    const prev = rowsRef.current
    const sameShape =
      prev.length === reconciled.length &&
      prev.every((r, i) => r.key === reconciled[i].key)
    if (!sameShape) {
      onChangeRef.current(reconciled)
    }
  }, [axesSig])

  const updateRow = (key: string, field: 'sku' | 'price' | 'inventory', value: string) => {
    onChange(rows.map((r) => (r.key === key ? { ...r, [field]: value } : r)))
  }

  const currencySymbol = currency === 'USD' ? '$' : '¥'

  if (filledAxes.length === 0) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
        <Layers size={12} className="shrink-0 text-[#024AD8]" />
        <span>
          {isZh
            ? `按 ${filledAxes.map((a) => a.name).join(' × ')} 生成 ${rows.length} 个 SKU，可逐个调整价格 / 库存 / SKU`
            : `${rows.length} SKUs from ${filledAxes.map((a) => a.name).join(' × ')} — adjust price / stock / SKU per row`}
        </span>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-[4px]">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <th className="py-2 px-3">{isZh ? '规格组合' : 'Combination'}</th>
              <th className="py-2 px-3">{isZh ? 'SKU 编码' : 'SKU'}</th>
              <th className="py-2 px-3">{isZh ? `售价 (${currencySymbol})` : 'Price'}</th>
              <th className="py-2 px-3">{isZh ? '库存' : 'Stock'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.key} className="hover:bg-slate-50/60">
                <td className="py-2 px-3 font-semibold text-slate-900 whitespace-nowrap">
                  {filledAxes.map((a) => row.optionValues[a.code]).filter(Boolean).join(' / ')}
                </td>
                <td className="py-2 px-3">
                  <input
                    type="text"
                    value={row.sku}
                    onChange={(e) => updateRow(row.key, 'sku', e.target.value)}
                    disabled={disabled}
                    className="h-7 w-36 px-2 rounded-[4px] bg-white border border-slate-200 text-[11px] font-mono text-slate-900 focus:outline-none focus:border-[#024AD8]"
                  />
                </td>
                <td className="py-2 px-3">
                  <input
                    type="number"
                    value={row.price}
                    onChange={(e) => updateRow(row.key, 'price', e.target.value)}
                    min="0"
                    step="0.01"
                    placeholder={basePrice || '0.00'}
                    disabled={disabled}
                    className="h-7 w-24 px-2 rounded-[4px] bg-white border border-slate-200 text-[11px] font-bold text-slate-900 focus:outline-none focus:border-[#024AD8]"
                  />
                </td>
                <td className="py-2 px-3">
                  <input
                    type="number"
                    value={row.inventory}
                    onChange={(e) => updateRow(row.key, 'inventory', e.target.value)}
                    min="0"
                    step="1"
                    placeholder={baseInventory || '0'}
                    disabled={disabled}
                    className="h-7 w-20 px-2 rounded-[4px] bg-white border border-slate-200 text-[11px] text-slate-900 focus:outline-none focus:border-[#024AD8]"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
