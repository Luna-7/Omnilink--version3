'use client'

import React, { useState } from 'react'
import { Plus, X, Tag } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import type { EnhancementAttributeItem } from './types'

interface ProductEnhancementFieldsProps {
  attributes: EnhancementAttributeItem[]
  onChange: (attributes: EnhancementAttributeItem[]) => void
  disabled?: boolean
}

interface QuickAttributeDef {
  key: string
  labelZh: string
  labelEn: string
  defaultUnit?: string
  placeholderZh: string
  placeholderEn: string
}

const QUICK_ATTRIBUTES: QuickAttributeDef[] = [
  { key: 'color', labelZh: '颜色', labelEn: 'Color', placeholderZh: '如：黑色、星光色', placeholderEn: 'e.g. Black, Silver' },
  { key: 'package', labelZh: '套餐', labelEn: 'Package', placeholderZh: '如：标准单机装、豪华套装', placeholderEn: 'e.g. Standard, Bundle' },
  { key: 'material', labelZh: '核心材质', labelEn: 'Material', placeholderZh: '如：925银、100%纯棉、铝合金', placeholderEn: 'e.g. 925 Silver, 100% Cotton' },
  { key: 'dimensions', labelZh: '尺寸', labelEn: 'Dimensions', defaultUnit: 'cm', placeholderZh: '如：15x10x5', placeholderEn: 'e.g. 15x10x5' },
  { key: 'weight', labelZh: '重量', labelEn: 'Weight', defaultUnit: 'g', placeholderZh: '如：250', placeholderEn: 'e.g. 250' },
]

export function ProductEnhancementFields({
  attributes,
  onChange,
  disabled = false,
}: ProductEnhancementFieldsProps) {
  const { isZh } = useLanguage()
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customKey, setCustomKey] = useState('')
  const [customValue, setCustomValue] = useState('')
  const [customUnit, setCustomUnit] = useState('')

  // Add an attribute from quick pills
  const handleAddQuickAttribute = (quick: QuickAttributeDef) => {
    if (attributes.some((a) => a.key === quick.key)) return

    const newItem: EnhancementAttributeItem = {
      id: `attr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      key: quick.key,
      label: isZh ? quick.labelZh : quick.labelEn,
      value: '',
      unit: quick.defaultUnit || undefined,
      type: 'text',
    }
    onChange([...attributes, newItem])
  }

  // Update an attribute
  const handleUpdateAttribute = (id: string, updates: Partial<EnhancementAttributeItem>) => {
    onChange(
      attributes.map((attr) => (attr.id === id ? { ...attr, ...updates } : attr))
    )
  }

  // Remove an attribute
  const handleRemoveAttribute = (id: string) => {
    onChange(attributes.filter((attr) => attr.id !== id))
  }

  // Add custom attribute
  const handleConfirmCustomAttribute = () => {
    if (!customKey.trim()) return

    const newItem: EnhancementAttributeItem = {
      id: `attr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      key: customKey.trim().toLowerCase().replace(/\s+/g, '_'),
      label: customKey.trim(),
      value: customValue.trim(),
      unit: customUnit.trim() || undefined,
      type: 'text',
    }
    onChange([...attributes, newItem])
    setCustomKey('')
    setCustomValue('')
    setCustomUnit('')
    setShowCustomInput(false)
  }

  return (
    <div className="space-y-3.5">
      {/* 模块标题与指引说明 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-slate-100 gap-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#EFF4FF] text-[#024AD8] flex items-center justify-center font-bold text-xs">
            02
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {isZh ? '增强信息' : 'Enhancement Info'}
            </h3>
          </div>
        </div>
        <span className="text-[11px] text-slate-400">
          {isZh ? '补充后有助于提高商品理解与推荐准确度。' : 'Adding these helps improve product understanding and recommendation accuracy.'}
        </span>
      </div>

      {/* 常用快捷属性推荐标签 */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-semibold text-slate-400 shrink-0">
          {isZh ? '快捷添加:' : 'Quick Add:'}
        </span>
        {QUICK_ATTRIBUTES.map((quick) => {
          const isAdded = attributes.some((a) => a.key === quick.key)
          return (
            <button
              key={quick.key}
              type="button"
              onClick={() => handleAddQuickAttribute(quick)}
              disabled={disabled || isAdded}
              className={`text-xs px-2.5 py-1 rounded-[4px] border transition-all flex items-center gap-1 cursor-pointer select-none ${
                isAdded
                  ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-default opacity-60'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-[#024AD8] hover:text-[#024AD8] hover:bg-[#EFF4FF]'
              }`}
            >
              <Plus size={11} className={isAdded ? 'hidden' : 'text-[#024AD8]'} />
              <span>{isZh ? quick.labelZh : quick.labelEn}</span>
            </button>
          )
        })}
      </div>

      {/* 属性行列表 (轻量行式，无 ERP 压力) */}
      {attributes.length > 0 && (
        <div className="space-y-2 pt-1">
          {attributes.map((attr) => {
            const quickDef = QUICK_ATTRIBUTES.find((q) => q.key === attr.key)
            const placeholder = quickDef
              ? (isZh ? quickDef.placeholderZh : quickDef.placeholderEn)
              : (isZh ? '请输入属性值' : 'Enter value')

            return (
              <div
                key={attr.id}
                className="p-2.5 rounded-[4px] bg-slate-50/80 border border-slate-200/80 flex items-center gap-2.5 transition-all"
              >
                {/* 属性名 */}
                <div className="w-24 sm:w-28 shrink-0">
                  <span className="text-xs font-bold text-slate-800 truncate block" title={attr.label}>
                    {attr.label}
                  </span>
                </div>

                {/* 属性值输入 */}
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={attr.value}
                    onChange={(e) => handleUpdateAttribute(attr.id, { value: e.target.value })}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="w-full h-8 px-2.5 rounded-[4px] bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#024AD8] focus:ring-1 focus:ring-[#024AD8] transition-all"
                  />
                </div>

                {/* 单位 (可选) */}
                {attr.unit !== undefined && (
                  <div className="w-16 sm:w-20 shrink-0">
                    <input
                      type="text"
                      value={attr.unit}
                      onChange={(e) => handleUpdateAttribute(attr.id, { unit: e.target.value })}
                      placeholder={isZh ? '单位' : 'Unit'}
                      disabled={disabled}
                      className="w-full h-8 px-2 rounded-[4px] bg-white border border-slate-200 text-xs text-center text-slate-600 focus:outline-none focus:border-[#024AD8] focus:ring-1 focus:ring-[#024AD8] transition-all"
                    />
                  </div>
                )}

                {/* 删除按钮 */}
                <button
                  type="button"
                  onClick={() => handleRemoveAttribute(attr.id)}
                  disabled={disabled}
                  className="w-7 h-7 rounded-[4px] text-slate-400 hover:text-[#D32F2F] hover:bg-[#FFF2F2] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                  title={isZh ? '删除属性' : 'Remove'}
                >
                  <X size={14} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* 自定义属性录入 */}
      {showCustomInput ? (
        <div className="p-3 rounded-[4px] bg-[#EFF4FF]/60 border border-[#024AD8]/20 space-y-2.5 animate-in fade-in duration-150">
          <div className="text-[11px] font-bold text-[#024AD8]">
            {isZh ? '添加自定义属性' : 'Add Custom Attribute'}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <div className="sm:col-span-4">
              <input
                type="text"
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                placeholder={isZh ? '属性名称（如：绣法）' : 'Name (e.g. Embroidery)'}
                className="w-full h-8 px-2.5 rounded-[4px] bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#024AD8]"
              />
            </div>
            <div className="sm:col-span-5">
              <input
                type="text"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                placeholder={isZh ? '属性值（如：苏绣平针）' : 'Value (e.g. Hand stitched)'}
                className="w-full h-8 px-2.5 rounded-[4px] bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#024AD8]"
              />
            </div>
            <div className="sm:col-span-3">
              <input
                type="text"
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value)}
                placeholder={isZh ? '单位 (可选)' : 'Unit (opt)'}
                className="w-full h-8 px-2 rounded-[4px] bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#024AD8]"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setShowCustomInput(false)
                setCustomKey('')
                setCustomValue('')
                setCustomUnit('')
              }}
              className="px-2.5 py-1 text-xs text-slate-600 hover:bg-white rounded-[4px] cursor-pointer"
            >
              {isZh ? '取消' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleConfirmCustomAttribute}
              disabled={!customKey.trim()}
              className="px-3 py-1 bg-[#024AD8] hover:bg-[#003198] text-white text-xs font-bold rounded-[4px] cursor-pointer disabled:opacity-40"
            >
              {isZh ? '确认添加' : 'Confirm'}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowCustomInput(true)}
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
