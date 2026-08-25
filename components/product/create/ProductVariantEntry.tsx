'use client'

import React, { useState } from 'react'
import { Layers, ChevronDown, ChevronUp, Plus, X } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export interface VariantOptionDraft {
  name: string
  values: string[]
}

interface ProductVariantEntryProps {
  options: VariantOptionDraft[]
  onChange: (options: VariantOptionDraft[]) => void
  disabled?: boolean
}

export function ProductVariantEntry({
  options,
  onChange,
  disabled = false,
}: ProductVariantEntryProps) {
  const { isZh } = useLanguage()
  const [isOpen, setIsOpen] = useState(options.length > 0)
  const [newOptionName, setNewOptionName] = useState('')
  const [newValueInput, setNewValueInput] = useState<Record<number, string>>({})

  const handleAddOption = () => {
    if (!newOptionName.trim()) return
    onChange([...options, { name: newOptionName.trim(), values: [] }])
    setNewOptionName('')
  }

  const handleRemoveOption = (index: number) => {
    onChange(options.filter((_, idx) => idx !== index))
  }

  const handleAddValue = (optionIndex: number) => {
    const val = newValueInput[optionIndex]?.trim()
    if (!val) return

    const updated = [...options]
    if (!updated[optionIndex].values.includes(val)) {
      updated[optionIndex].values.push(val)
      onChange(updated)
    }
    setNewValueInput({ ...newValueInput, [optionIndex]: '' })
  }

  const handleRemoveValue = (optionIndex: number, valIndex: number) => {
    const updated = [...options]
    updated[optionIndex].values.splice(valIndex, 1)
    onChange(updated)
  }

  return (
    <div className="pt-2 border-t border-slate-100">
      {/* 轻量入口提示 */}
      <div className="flex items-center justify-between p-3 rounded-[4px] bg-slate-50 border border-slate-200">
        <div className="flex items-center gap-2">
          <Layers size={15} className="text-[#024AD8]" />
          <span className="text-xs font-semibold text-slate-800">
            {isZh ? '商品有多个规格（如颜色、尺码）？' : 'Has multiple variants (e.g. colors, sizes)?'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className="text-xs font-bold text-[#024AD8] hover:text-[#003198] px-2.5 py-1 rounded-[4px] hover:bg-[#EFF4FF] transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>{isOpen ? (isZh ? '收起规格' : 'Hide') : (isZh ? '设置规格' : 'Set Variants')}</span>
          {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {/* 展开的极轻量规格定义（不强制矩阵，只记录基础规格项） */}
      {isOpen && (
        <div className="mt-2.5 p-3.5 rounded-[4px] bg-white border border-slate-200 space-y-3 animate-in fade-in duration-150">
          <div className="text-[11px] text-slate-500">
            {isZh
              ? '可在此快速添加规格维度及选项值；多规格复杂库存矩阵也可在创建后进入商品详情页统一调整。'
              : 'Add variant options and values here. Full SKU matrices can also be managed in the edit page.'}
          </div>

          {/* 现有规格列表 */}
          {options.map((opt, optIdx) => (
            <div key={`opt-${optIdx}`} className="p-2.5 rounded-[4px] bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">{opt.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveOption(optIdx)}
                  className="text-slate-400 hover:text-[#D32F2F] text-xs cursor-pointer p-1"
                >
                  <X size={13} />
                </button>
              </div>

              {/* 规格值标签列表 */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {opt.values.map((v, vIdx) => (
                  <span
                    key={`val-${vIdx}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-white border border-slate-200 text-xs text-slate-800"
                  >
                    <span>{v}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveValue(optIdx, vIdx)}
                      className="text-slate-400 hover:text-[#D32F2F]"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}

                {/* 增加规格值 */}
                <div className="inline-flex items-center gap-1">
                  <input
                    type="text"
                    value={newValueInput[optIdx] || ''}
                    onChange={(e) => setNewValueInput({ ...newValueInput, [optIdx]: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddValue(optIdx)
                      }
                    }}
                    placeholder={isZh ? '输入选项值回车' : 'Add value'}
                    className="w-24 h-6 px-1.5 rounded-[2px] bg-white border border-slate-200 text-[11px] text-slate-900 focus:outline-none focus:border-[#024AD8]"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddValue(optIdx)}
                    className="px-1.5 py-0.5 rounded-[2px] bg-slate-200 hover:bg-[#EFF4FF] hover:text-[#024AD8] text-[11px] cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* 添加新规格名 */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={newOptionName}
              onChange={(e) => setNewOptionName(e.target.value)}
              placeholder={isZh ? '输入新规格名（如：颜色、尺码）' : 'e.g. Color, Size'}
              className="h-8 px-2.5 rounded-[4px] bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#024AD8]"
            />
            <button
              type="button"
              onClick={handleAddOption}
              disabled={!newOptionName.trim()}
              className="h-8 px-3 rounded-[4px] bg-white border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer disabled:opacity-40"
            >
              {isZh ? '添加规格组' : 'Add Option'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
