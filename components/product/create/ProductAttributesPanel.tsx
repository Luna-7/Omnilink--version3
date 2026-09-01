'use client'

import React, { useRef, useState } from 'react'
import { Plus, X, Layers, FileText } from 'lucide-react'
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
 * a dimension matrix). The UI keeps them in two clearly-labeled sections so
 * a merchant never has to choose a role per row — the section does that.
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

  const handleTraitValueChange = (id: string, value: string) => {
    onChange(rows.map((r) => (r.id === id ? { ...r, value } : r)))
  }

  const handleUnitChange = (id: string, unit: string) => {
    onChange(rows.map((r) => (r.id === id ? { ...r, unit } : r)))
  }

  const handleAddVariantValue = (id: string, raw: string, clear: () => void) => {
    const val = raw.trim()
    if (!val) return
    onChange(
      rows.map((r) =>
        r.id === id && !r.values.includes(val) ? { ...r, values: [...r.values, val] } : r,
      ),
    )
    clear()
  }

  const handleRemoveVariantValue = (id: string, index: number) => {
    onChange(
      rows.map((r) =>
        r.id === id ? { ...r, values: r.values.filter((_, i) => i !== index) } : r,
      ),
    )
  }

  const handleAddCustom = (
    role: AttributeRole,
    name: string,
    clear: () => void,
  ) => {
    const trimmed = name.trim()
    if (!trimmed) return
    onChange([
      ...rows,
      {
        id: nextId(),
        role,
        key:
          role === 'variant'
            ? trimmed.toLowerCase().replace(/\s+/g, '_')
            : `attr_${idSeq.current}_${trimmed.toLowerCase().replace(/\s+/g, '_')}`,
        label: trimmed,
        value: '',
        values: [],
        unit: undefined,
      },
    ])
    clear()
  }

  const variantRows = rows.filter((r) => r.role === 'variant')
  const traitRows = rows.filter((r) => r.role === 'trait')
  const filledVariantRows = variantRows.filter((r) => r.values.length > 0)
  const skuCount = filledVariantRows.reduce((acc, r) => acc * r.values.length, 1)

  const placeholderFor = (row: AttributeRow): string => {
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
            ? '「特征」展示在详情页参数表，「规格」用于生成 SKU——按用途填到对应区域即可。'
            : 'Traits appear in the spec table; variants generate SKUs. Pick the section by purpose.'}
        </span>
      </div>

      {/* ───── 子区域 1：商品特征（单值 + 单位） ───── */}
      <AttributeSection
        isZh={isZh}
        badge="A"
        titleZh="商品特征"
        titleEn="Product Traits"
        subtitleZh="整件商品共享的事实参数，展示在详情页参数表"
        subtitleEn="Product-wide facts, shown in the spec table"
        icon={<FileText size={14} />}
        accentClass="bg-[#EFF4FF] text-[#024AD8] border-[#024AD8]/20"
        rows={traitRows}
        disabled={disabled}
        renderRow={(row) => (
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
            <div className="w-16 sm:w-20 shrink-0">
              <input
                type="text"
                value={row.unit ?? ''}
                onChange={(e) => handleUnitChange(row.id, e.target.value)}
                placeholder={isZh ? '单位' : 'Unit'}
                disabled={disabled}
                className="w-full h-8 px-2 rounded-[4px] bg-white border border-slate-200 text-xs text-center text-slate-600 focus:outline-none focus:border-[#024AD8] focus:ring-1 focus:ring-[#024AD8] transition-all"
              />
            </div>
            <button
              type="button"
              onClick={() => handleRemove(row.id)}
              disabled={disabled}
              className="w-7 h-7 rounded-[4px] text-slate-400 hover:text-[#D32F2F] hover:bg-[#FFF2F2] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
              title={isZh ? '删除' : 'Remove'}
            >
              <X size={14} />
            </button>
          </div>
        )}
        quickDefs={QUICK_DEFS.filter((d) => d.role === 'trait')}
        onQuickAdd={(def) => handleAddQuick(def)}
        isQuickAdded={(def) => rows.some((r) => r.key === def.key)}
        onAddCustom={(name, clear) => handleAddCustom('trait', name, clear)}
        emptyHintZh="还没有商品特征。点击下方「+ 添加特征」或快捷标签开始。"
        emptyHintEn="No traits yet. Click + Add Trait or a quick chip below."
      />

      {/* ───── 子区域 2：销售规格（多值 + SKU 矩阵） ───── */}
      <AttributeSection
        isZh={isZh}
        badge="B"
        titleZh="销售规格"
        titleEn="Purchase Variants"
        subtitleZh="顾客可挑选的购买版本，自动生成 SKU 矩阵"
        subtitleEn="Customer-selectable purchase options; auto-generates SKUs"
        icon={<Layers size={14} />}
        accentClass="bg-[#FFF7E8] text-[#B26A00] border-[#F0B400]/30"
        rows={variantRows}
        disabled={disabled}
        renderRow={(row) => (
          <VariantRowEditor
            isZh={isZh}
            row={row}
            disabled={disabled}
            placeholder={placeholderFor(row)}
            onAddValue={(raw, clear) => handleAddVariantValue(row.id, raw, clear)}
            onRemoveValue={(idx) => handleRemoveVariantValue(row.id, idx)}
            onRemoveRow={() => handleRemove(row.id)}
          />
        )}
        quickDefs={QUICK_DEFS.filter((d) => d.role === 'variant')}
        onQuickAdd={(def) => handleAddQuick(def)}
        isQuickAdded={(def) => rows.some((r) => r.key === def.key)}
        onAddCustom={(name, clear) => handleAddCustom('variant', name, clear)}
        emptyHintZh="还没有销售规格。点击下方「+ 添加规格」开始，或选择快捷标签。"
        emptyHintEn="No variants yet. Click + Add Variant or pick a quick chip."
      />

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
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// 内部组件：单一区域（特征或规格共用）
// ─────────────────────────────────────────────────────────────────────────

interface AttributeSectionProps {
  isZh: boolean
  badge: string
  titleZh: string
  titleEn: string
  subtitleZh: string
  subtitleEn: string
  icon: React.ReactNode
  accentClass: string
  rows: AttributeRow[]
  disabled: boolean
  renderRow: (row: AttributeRow) => React.ReactNode
  quickDefs: QuickDef[]
  onQuickAdd: (def: QuickDef) => void
  isQuickAdded: (def: QuickDef) => boolean
  onAddCustom: (name: string, clear: () => void) => void
  emptyHintZh: string
  emptyHintEn: string
}

function AttributeSection({
  isZh,
  badge,
  titleZh,
  titleEn,
  subtitleZh,
  subtitleEn,
  icon,
  accentClass,
  rows,
  disabled,
  renderRow,
  quickDefs,
  onQuickAdd,
  isQuickAdded,
  onAddCustom,
  emptyHintZh,
  emptyHintEn,
}: AttributeSectionProps) {
  const [showCustom, setShowCustom] = useState(false)
  const [customName, setCustomName] = useState('')

  const confirm = () => {
    onAddCustom(customName, () => {
      setCustomName('')
      setShowCustom(false)
    })
  }

  return (
    <div className="rounded-[6px] border border-slate-200 bg-white/60 overflow-hidden">
      {/* 区域头 */}
      <div className="flex items-start justify-between px-3 py-2 border-b border-slate-100">
        <div className="flex items-start gap-2 min-w-0">
          <div
            className={`w-5 h-5 rounded-md border flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${accentClass}`}
            aria-hidden="true"
          >
            {badge}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900">
                {isZh ? titleZh : titleEn}
              </span>
              <span className="text-slate-300">{icon}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">
              {isZh ? subtitleZh : subtitleEn}
            </div>
          </div>
        </div>
      </div>

      {/* 行列表 */}
      <div className="px-3 py-2 space-y-1.5">
        {rows.length === 0 ? (
          <div className="text-[11px] text-slate-400 py-2">
            {isZh ? emptyHintZh : emptyHintEn}
          </div>
        ) : (
          rows.map((row) => (
            <div
              key={row.id}
              className="flex items-center gap-2 py-1 px-2 -mx-2 rounded-[4px] hover:bg-slate-50 transition-colors group"
            >
              <span
                className="w-16 sm:w-20 shrink-0 text-[11px] font-semibold text-slate-700 truncate"
                title={row.label}
              >
                {row.label}
              </span>
              <div className="flex-1 min-w-0">{renderRow(row)}</div>
            </div>
          ))
        )}
      </div>

      {/* 快捷 + 自定义添加 */}
      <div className="px-3 py-2 border-t border-slate-100 bg-slate-50/50 space-y-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-semibold text-slate-400 shrink-0">
            {isZh ? '快捷:' : 'Quick:'}
          </span>
          {quickDefs.map((def) => {
            const added = isQuickAdded(def)
            return (
              <button
                key={def.key}
                type="button"
                onClick={() => onQuickAdd(def)}
                disabled={disabled || added}
                className={`text-[11px] px-2 py-0.5 rounded-[3px] border transition-all flex items-center gap-1 cursor-pointer ${
                  added
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-default opacity-60'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-[#024AD8] hover:text-[#024AD8] hover:bg-[#EFF4FF]'
                }`}
              >
                <Plus size={10} className={added ? 'hidden' : 'text-[#024AD8]'} />
                <span>{isZh ? def.labelZh : def.labelEn}</span>
              </button>
            )
          })}
        </div>

        {showCustom ? (
          <div className="flex items-center gap-1.5 pt-1">
            <input
              type="text"
              autoFocus
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  confirm()
                } else if (e.key === 'Escape') {
                  setCustomName('')
                  setShowCustom(false)
                }
              }}
              placeholder={
                isZh
                  ? `自定义${titleZh.replace('商品', '').replace('销售', '')}名称，回车添加`
                  : `Custom ${titleEn.toLowerCase()}, press Enter`
              }
              className="flex-1 min-w-0 h-7 px-2 rounded-[4px] bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#024AD8]"
            />
            <button
              type="button"
              onClick={confirm}
              disabled={!customName.trim()}
              className="px-2.5 h-7 bg-[#024AD8] hover:bg-[#003198] text-white text-[11px] font-bold rounded-[4px] cursor-pointer disabled:opacity-40"
            >
              {isZh ? '添加' : 'Add'}
            </button>
            <button
              type="button"
              onClick={() => {
                setCustomName('')
                setShowCustom(false)
              }}
              className="px-2 h-7 text-[11px] text-slate-500 hover:bg-white rounded-[4px] cursor-pointer"
            >
              {isZh ? '取消' : 'Cancel'}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowCustom(true)}
            disabled={disabled}
            className="text-[11px] font-medium text-[#024AD8] hover:text-[#003198] hover:bg-[#EFF4FF] px-2 py-1 rounded-[3px] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Plus size={11} />
            <span>
              {isZh
                ? `+ 添加${titleZh.replace('商品', '').replace('销售', '')}`
                : `+ Add ${titleEn.replace('Product ', '').replace('Purchase ', '')}`}
            </span>
          </button>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// 内部组件：销售规格行的多值编辑器（chip + 输入 + 添加）
// ─────────────────────────────────────────────────────────────────────────

interface VariantRowEditorProps {
  isZh: boolean
  row: AttributeRow
  disabled: boolean
  placeholder: string
  onAddValue: (raw: string, clear: () => void) => void
  onRemoveValue: (idx: number) => void
  onRemoveRow: () => void
}

function VariantRowEditor({
  isZh,
  row,
  disabled,
  placeholder,
  onAddValue,
  onRemoveValue,
  onRemoveRow,
}: VariantRowEditorProps) {
  const [draft, setDraft] = useState('')

  const clear = () => setDraft('')

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {row.values.map((v, vIdx) => (
        <span
          key={`${row.id}-val-${vIdx}`}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[3px] bg-white border border-slate-200 text-[11px] text-slate-800"
        >
          <span>{v}</span>
          <button
            type="button"
            onClick={() => onRemoveValue(vIdx)}
            disabled={disabled}
            className="text-slate-400 hover:text-[#D32F2F] cursor-pointer"
          >
            <X size={10} />
          </button>
        </span>
      ))}

      <div className="inline-flex items-center gap-1">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onAddValue(draft, clear)
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="w-28 h-6 px-1.5 rounded-[2px] bg-white border border-slate-200 text-[11px] text-slate-900 focus:outline-none focus:border-[#024AD8]"
        />
        <button
          type="button"
          onClick={() => onAddValue(draft, clear)}
          disabled={disabled}
          className="px-1.5 py-0.5 rounded-[2px] bg-slate-200 hover:bg-[#EFF4FF] hover:text-[#024AD8] text-[11px] cursor-pointer"
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={onRemoveRow}
        disabled={disabled}
        className="ml-auto w-6 h-6 rounded-[3px] text-slate-400 hover:text-[#D32F2F] hover:bg-[#FFF2F2] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
        title={isZh ? '删除该规格' : 'Remove variant'}
      >
        <X size={12} />
      </button>
    </div>
  )
}