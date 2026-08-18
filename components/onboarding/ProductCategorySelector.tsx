'use client'

import React from 'react'
import { Check, Tag } from 'lucide-react'

// 简短通用的商品类型选项列表（包含“其他”）
export const PRODUCT_CATEGORY_OPTIONS = [
  { id: 'electronics', name: '3C数码', icon: '📱' },
  { id: 'fashion', name: '服饰鞋包', icon: '👗' },
  { id: 'beauty', name: '美妆个护', icon: '💄' },
  { id: 'home', name: '家居生活', icon: '🏠' },
  { id: 'food', name: '食品生鲜', icon: '☕' },
  { id: 'sports', name: '运动户外', icon: '🏃' },
  { id: 'baby', name: '母婴玩具', icon: '🧸' },
  { id: 'pets', name: '宠物生活', icon: '🐾' },
  { id: 'auto', name: '汽车用品', icon: '🚗' },
  { id: 'jewelry', name: '轻奢珠宝', icon: '💎' },
  { id: 'crafts', name: '文创手作', icon: '🎨' },
  { id: 'general', name: '综合百货', icon: '📦' },
  { id: 'other', name: '其他', icon: '🏷️' },
]

interface ProductCategorySelectorProps {
  value: string
  onChange: (category: string) => void
}

export function ProductCategorySelector({ value, onChange }: ProductCategorySelectorProps) {
  const selectedCategory = value || '3C数码'

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
          <Tag size={13} className="text-[#E11D48]" />
          <span>主营商品类型 / 品类</span>
        </label>
      </div>

      {/* 椭圆形按钮 / 品类胶囊选择网格 */}
      <div className="flex flex-wrap gap-2">
        {PRODUCT_CATEGORY_OPTIONS.map((opt) => {
          const isSelected = selectedCategory === opt.name
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.name)}
              className={`px-4 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border shadow-2xs ${
                isSelected
                  ? 'bg-gradient-to-r from-[#E11D48] to-[#FB7185] text-white border-transparent shadow-md scale-[1.02]'
                  : 'bg-white text-[#374151] border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="text-sm leading-none">{opt.icon}</span>
              <span>{opt.name}</span>
              {isSelected && <Check size={13} strokeWidth={3} className="ml-0.5" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
