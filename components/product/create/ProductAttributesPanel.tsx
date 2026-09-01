'use client'

import React, { useRef, useState } from 'react'
import { Plus, X, Layers } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

/**
 * A single attribute row carries ONE of two roles:
 *
 *  - `trait`   — a fact shared by the whole product (material, weight, ...).
 *                Holds a single `value` (+ optional `unit`). Rendered in the
 *                storefront "Specifications & Details" table.
 *  - `variant` — a purchasable axis the customer picks from (color, size, ...).
 *                Holds multiple `values`. Expanded into SKUs (cartesian product)
 *                and rendered as a variant selector that drives price/stock.
 *
 * The two roles MUST stay separate at the storage layer (flat key/value vs
 * a dimension matrix), but they share ONE input surface here so a merchant
 * never has to decide which "module" a field belongs to — only whether the
 * customer gets to choose it.
 */
export type AttributeRole = 'trait' | 'variant'

export interface AttributeRow {
  id: string
  role: AttributeRole
  /** Stable slug: canonical field key for traits, option code for variants. */
  key: string
  /** Display name (merchant-facing + storefront-facing). */
  label: string
  /** Trait value (single). */
  value: string
  /** Variant option values (multiple). */
  values: string[]
  unit?: string
  /** Optional input hint, e.g. prefilled from a category template. */
  placeholder?: string
}

interface QuickDef {
  key: string
  labelZh: string
  labelEn: string
  role: AttributeRole
  defaultUnit?: string
  placeholderZh: string
  placeholderEn: string
}

const QUICK_DEFS: QuickDef[] = [
  {
    key: 'color',
    labelZh: '颜色',
    labelEn: 'Color',
    role: 'variant',
    placeholderZh: '输入选项值后回车，如：黑色',
    placeholderEn: 'Type a value, press Enter',
  },
  {
    key: 'size',
    labelZh: '尺码',
    labelEn: 'Size',
    role: 'variant',
    placeholderZh: '输入选项值后回车，如：M',
    placeholderEn: 'Type a value, press Enter',
  },
  {
    key: 'package',
    labelZh: '套餐',
    labelEn: 'Package',
    role: 'variant',
    placeholderZh: '输入选项值后回车，如：标准装',
    placeholderEn: 'Type a value, press Enter',
  },
  {
    key: 'material',
    labelZh: '核心材质',
    labelEn: 'Material',
    role: 'trait',
    placeholderZh: '如：925银、100%纯棉、铝合金',
    placeholderEn: 'e.g. 925 Silver, 100% Cotton',
  },
  {
    key: 'dimensions',
    labelZh: '包装尺寸',
    labelEn: 'Package Size',
    role: 'trait',
    defaultUnit: 'cm',
    placeholderZh: '如：15x10x5',
    placeholderEn: 'e.g. 15x10x5',
  },
  {
    key: 'weight',
    labelZh: '重量',
    labelEn: 'Weight',
    role: 'trait',
    defaultUnit: 'g',
    placeholderZh: '如：250',
    placeholderEn: 'e.g. 250',
  },
]

interface ProductAttributesPanelProps {
  rows: AttributeRow[]
  onChange: (rows: AttributeRow[]) => void
  disabled?: boolean
}

export function ProductAttributesPanel({
  rows,
  onChange,
  disabled = false,
}: ProductAttributesPanelProps) {
  const { isZh } = useLanguage()
  // NOTE: a ref counter (instead of Date.now()/Math.random()) keeps id
  // generation out of render and avoids React-Compiler "impure function"
  // lint errors that the previous implementation tripped.
  const idSeq = useRef(0)
  const [showCustom, setShowCustom] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customRole, setCustomRole] = useState<AttributeRole>('trait')
  const [valueDraft, setValueDraft] = useState<Record<string, string>>({})

  const nextId = () => {
    idSeq.current += 1
    return `attr_${idSeq.current}`
  }

  const handleAddQuick = (def: QuickDef) => {
    if (rows.some((r) => r.key === def.key)) return
    onChange([
      ...rows,
      {
        id: nextId(),
        role: def.role,
        key: def.key,
        label: isZh ? def.labelZh : def.labelEn,
        value: '',
        values: [],
        unit: def.defaultUnit,
      },
    ])
  }

  const handleRemove = (id: string) => {
    onChange(rows.filter((r) => r.id !== id))
  }

  /**
   * Switching roles converts the payload instead of dropping it:
   *   trait -> variant: the single value becomes the first option value.
   *   variant -> trait: option values are joined into one readable value,
   *                     so nothing the merchant typed is silently lost.
   */
  const handleRoleChange = (id: string, role: AttributeRole) => {
    onChange(
      rows.map((r) => {
        if (r.id !== id || r.role === role) return r
        if (role === 'variant') {
          const carried = r.value.trim() ? [r.value.trim()] : []
          return { ...r, role, values: r.values.length > 0 ? r.values : carried }
        }
        return { ...r, role, value: r.value.trim() || r.values.join(' / ') }
      }),
    )
  }

  const handleTraitValueChange = (id: string, value: string) => {
    onChange(rows.map((r) => (r.id === id ? { ...r, value } : r)))
  }

  const handleUnitChange = (id: string, unit: string) => {
    onChange(rows.map((r) => (r.id === id ? { ...r, unit } : r)))
  }

  const handleAddVariantValue = (id: string) => {
    const val = (valueDraft[id] ?? '').trim()
    if (!val) return
    onChange(
      rows.map((r) =>
        r.id === id && !r.values.includes(val) ? { ...r, values: [...r.values, val] } : r,
      ),
    )
    setValueDraft((prev) => ({ ...prev, [id]: '' }))
  }

  const handleRemoveVariantValue = (id: string, index: number) => {
    onChange(
      rows.map((r) =>
        r.id === id ? { ...r, values: r.values.filter((_, i) => i !== index) } : r,
      ),
    )
  }

  const handleConfirmCustom = () => {
    const name = customName.trim()
    if (!name) return
    onChange([
      ...rows,
      {
        id: nextId(),
        role: customRole,
        key: name.toLowerCase().replace(/\s+/g, '_'),
        label: name,
        value: '',
        values: [],
      },
    ])
    setCustomName('')
    setCustomRole('trait')
    setShowCustom(false)
  }

  const variantRows = rows.filter((r) => r.role === 'variant')
  const filledVariantRows = variantRows.filter((r) => r.values.length > 0)
  const skuCount = filledVariantRows.reduce((acc, r) => acc * r.values.length, 1)

  const placeholderFor = (row: AttributeRow): string => {
    // A row-level hint (e.g. from a category template) wins over the
    // quick-add defaults.
    if (row.placeholder) return row.placeholder
    const def = QUICK_DEFS.find((q) => q.key === row.key)
    if (!def) return isZh ? '请输入属性值' : 'Enter value'
    return isZh ? def.placeholderZh : def.placeholderEn
  }

  return (
    <div className="space-y-3.5">
      {/* 模块标题与指引说明 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-slate-100 gap-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#EFF4FF] text-[#024AD8] flex items-center justify-center font-bold text-xs">
            02
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            {isZh ? '商品规格' : 'Product Specifications'}
          </h3>
        </div>
        <span className="text-[11px] text-slate-400">
          {isZh
            ? '每个属性只需选一个角色：整件商品共享的事实选「商品特征」（进详情页参数表）；顾客要挑选的购买版本选「销售规格」（自动生成 SKU）。同一属性只会出现在一处，不会重复。'
            : 'Pick one role per attribute: product-wide facts go to "Trait" (shown in the spec table); purchasable choices go to "Variant" (SKUs generated automatically). The same attribute is never stored twice.'}
        </span>
      </div>

      {/* 快捷添加（标签色区分默认角色） */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-semibold text-slate-400 shrink-0">
          {isZh ? '快捷添加:' : 'Quick Add:'}
        </span>
        {QUICK_DEFS.map((def) => {
          const isAdded = rows.some((r) => r.key === def.key)
          const isVariant = def.role === 'variant'
          return (
            <button
              key={def.key}
              type="button"
              onClick={() => handleAddQuick(def)}
              disabled={disabled || isAdded}
              className={`text-xs px-2.5 py-1 rounded-[4px] border transition-all flex items-center gap-1 cursor-pointer select-none ${
                isAdded
                  ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-default opacity-60'
                  : isVariant
                    ? 'bg-white text-slate-700 border-slate-200 hover:border-[#024AD8] hover:text-[#024AD8] hover:bg-[#EFF4FF]'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-[#024AD8] hover:text-[#024AD8] hover:bg-[#EFF4FF]'
              }`}
              title={
                isZh
                  ? isVariant
                    ? '销售规格：顾客可挑选，系统自动生成 SKU'
                    : '商品特征：整件商品共享，展示在参数表'
                  : isVariant
                    ? 'Variant: customers choose, SKUs generated'
                    : 'Trait: shared by the product, shown in the spec table'
              }
            >
              <Plus size={11} className={isAdded ? 'hidden' : 'text-[#024AD8]'} />
              <span>{isZh ? def.labelZh : def.labelEn}</span>
            </button>
          )
        })}
      </div>

      {/* 属性行列表 */}
      {rows.length > 0 && (
        <div className="space-y-2 pt-1">
          {rows.map((row) => (
            <div
              key={row.id}
              className="p-2.5 rounded-[4px] bg-slate-50/80 border border-slate-200/80 space-y-2 transition-all"
            >
              {/* 行头：角色开关 + 名称 + 删除 */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="inline-flex rounded-[4px] border border-slate-200 overflow-hidden shrink-0">
                  <button
                    type="button"
                    onClick={() => handleRoleChange(row.id, 'trait')}
                    disabled={disabled}
                    className={`px-2 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                      row.role === 'trait'
                        ? 'bg-[#024AD8] text-white'
                        : 'bg-white text-slate-500 hover:text-[#024AD8]'
                    }`}
                  >
                    {isZh ? '商品特征' : 'Trait'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleChange(row.id, 'variant')}
                    disabled={disabled}
                    className={`px-2 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                      row.role === 'variant'
                        ? 'bg-[#024AD8] text-white'
                        : 'bg-white text-slate-500 hover:text-[#024AD8]'
                    }`}
                  >
                    {isZh ? '销售规格' : 'Variant'}
                  </button>
                </div>

                <span className="text-xs font-bold text-slate-800 truncate" title={row.label}>
                  {row.label}
                </span>

                <span className="text-[10px] text-slate-400 shrink-0">
                  {row.role === 'trait'
                    ? isZh
                      ? '整件共享 · 进参数表'
                      : 'Shared · spec table'
                    : isZh
                      ? '顾客可选 · 生成 SKU'
                      : 'Selectable · generates SKUs'}
                </span>

                <button
                  type="button"
                  onClick={() => handleRemove(row.id)}
                  disabled={disabled}
                  className="ml-auto w-7 h-7 rounded-[4px] text-slate-400 hover:text-[#D32F2F] hover:bg-[#FFF2F2] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                  title={isZh ? '删除属性' : 'Remove'}
                >
                  <X size={14} />
                </button>
              </div>

              {/* 行体：按角色渲染不同形态的输入 */}
              {row.role === 'trait' ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={row.value}
                      onChange={(e) => handleTraitValueChange(row.id, e.target.value)}
                      placeholder={placeholderFor(row)}
                      disabled={disabled}
                      className="w-full h-8 px-2.5 rounded-[4px] bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#024AD8] focus:ring-1 focus:ring-[#024AD8] transition-all"
                    />
                  </div>
                  {row.unit !== undefined && (
                    <div className="w-16 sm:w-20 shrink-0">
                      <input
                        type="text"
                        value={row.unit}
                        onChange={(e) => handleUnitChange(row.id, e.target.value)}
                        placeholder={isZh ? '单位' : 'Unit'}
                        disabled={disabled}
                        className="w-full h-8 px-2 rounded-[4px] bg-white border border-slate-200 text-xs text-center text-slate-600 focus:outline-none focus:border-[#024AD8] focus:ring-1 focus:ring-[#024AD8] transition-all"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {row.values.map((v, vIdx) => (
                    <span
                      key={`${row.id}-val-${vIdx}`}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-white border border-slate-200 text-xs text-slate-800"
                    >
                      <span>{v}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariantValue(row.id, vIdx)}
                        disabled={disabled}
                        className="text-slate-400 hover:text-[#D32F2F]"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}

                  <div className="inline-flex items-center gap-1">
                    <input
                      type="text"
                      value={valueDraft[row.id] ?? ''}
                      onChange={(e) =>
                        setValueDraft((prev) => ({ ...prev, [row.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddVariantValue(row.id)
                        }
                      }}
                      placeholder={placeholderFor(row)}
                      disabled={disabled}
                      className="w-28 h-6 px-1.5 rounded-[2px] bg-white border border-slate-200 text-[11px] text-slate-900 focus:outline-none focus:border-[#024AD8]"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddVariantValue(row.id)}
                      disabled={disabled}
                      className="px-1.5 py-0.5 rounded-[2px] bg-slate-200 hover:bg-[#EFF4FF] hover:text-[#024AD8] text-[11px] cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* SKU 组合预览：规格维度会放大 SKU 数量，必须让商家可见 */}
      {variantRows.length > 0 && (
        <div
          className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-[4px] border ${
            skuCount > 50
              ? 'bg-[#FFF2F2] border-[#FFCDD2] text-[#D32F2F]'
              : 'bg-[#EFF4FF] border-[#024AD8]/20 text-[#024AD8]'
          }`}
        >
          <Layers size={12} className="shrink-0" />
          <span>
            {filledVariantRows.length === 0
              ? isZh
                ? `已添加 ${variantRows.length} 个销售规格，请为每个规格至少填写 1 个选项值`
                : `${variantRows.length} variant axis added — add at least one value to each`
              : isZh
                ? `将生成 ${skuCount} 个 SKU 组合（${filledVariantRows.length} 个规格维度）`
                : `${skuCount} SKU combinations across ${filledVariantRows.length} axes`}
            {skuCount > 50
              ? isZh
                ? ' · 组合过多，建议精简维度或选项值'
                : ' · too many combinations, consider trimming'
              : ''}
          </span>
        </div>
      )}

      {/* 自定义属性录入 */}
      {showCustom ? (
        <div className="p-3 rounded-[4px] bg-[#EFF4FF]/60 border border-[#024AD8]/20 space-y-2.5 animate-in fade-in duration-150">
          <div className="text-[11px] font-bold text-[#024AD8]">
            {isZh ? '添加自定义属性' : 'Add Custom Attribute'}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder={isZh ? '属性名称（如：绣法）' : 'Name (e.g. Embroidery)'}
              className="flex-1 min-w-[140px] h-8 px-2.5 rounded-[4px] bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#024AD8]"
            />
            <div className="inline-flex rounded-[4px] border border-slate-200 overflow-hidden shrink-0">
              <button
                type="button"
                onClick={() => setCustomRole('trait')}
                className={`px-2 py-1.5 text-[11px] font-semibold transition-colors cursor-pointer ${
                  customRole === 'trait'
                    ? 'bg-[#024AD8] text-white'
                    : 'bg-white text-slate-500 hover:text-[#024AD8]'
                }`}
              >
                {isZh ? '商品特征' : 'Trait'}
              </button>
              <button
                type="button"
                onClick={() => setCustomRole('variant')}
                className={`px-2 py-1.5 text-[11px] font-semibold transition-colors cursor-pointer ${
                  customRole === 'variant'
                    ? 'bg-[#024AD8] text-white'
                    : 'bg-white text-slate-500 hover:text-[#024AD8]'
                }`}
              >
                {isZh ? '销售规格' : 'Variant'}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setShowCustom(false)
                setCustomName('')
                setCustomRole('trait')
              }}
              className="px-2.5 py-1 text-xs text-slate-600 hover:bg-white rounded-[4px] cursor-pointer"
            >
              {isZh ? '取消' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleConfirmCustom}
              disabled={!customName.trim()}
              className="px-3 py-1 bg-[#024AD8] hover:bg-[#003198] text-white text-xs font-bold rounded-[4px] cursor-pointer disabled:opacity-40"
            >
              {isZh ? '确认添加' : 'Confirm'}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowCustom(true)}
          disabled={disabled}
          className="text-xs font-medium text-[#024AD8] hover:text-[#003198] hover:bg-[#EFF4FF] px-2.5 py-1.5 rounded-[4px] flex items-center gap-1 transition-colors cursor-pointer w-fit"
        >
          <Plus size={13} />
          <span>{isZh ? '+ 添加属性' : '+ Add Attribute'}</span>
        </button>
      )}
    </div>
  )
}
