'use client'

import React, { useState } from 'react'
import {
  FileText,
  Check,
  Edit2,
  Sparkles,
  ShieldCheck,
  Cpu,
  Crosshair,
  TrendingUp,
  Layers,
  Store,
  Clock,
} from 'lucide-react'

export interface FolderCardProps {
  id: string
  title: string
  description?: string
  sourceCount: number
  storageUsed?: string
  lastUpdated?: string
  isSelectedForAi?: boolean
  onToggleAiSelect?: (e: React.MouseEvent) => void
  onClick?: () => void
  onRename?: (id: string, newTitle: string) => void
  isSystem?: boolean
  index?: number
}

// 6 种更清透细腻的马卡龙低饱和度莫兰迪半透明亚克力渐变预设（调低透明度，增加边缘光）
export const PASTEL_SCHEMES = [
  {
    // 1. 淡绿 / 抹茶冰淇淋 (Mint Sage Pastel)
    bg: 'bg-gradient-to-br from-[#E6F8F0]/65 via-[#D6F5E8]/40 to-[#EDFAF4]/30',
    border: 'border-white/95',
    shadow: 'shadow-[0_8px_24px_rgba(20,184,166,0.05),inset_0_1px_2px_rgba(255,255,255,1),0_0_0_1px_rgba(255,255,255,0.8)]',
    iconBg: 'bg-emerald-500/10 text-emerald-700',
    accentColor: 'text-emerald-700',
    pillBorder: 'border-emerald-100/60',
  },
  {
    // 2. 天蓝 / 冰川蓝 (Glacier Sky Blue)
    bg: 'bg-gradient-to-br from-[#E3F2FD]/65 via-[#D4ECFD]/40 to-[#EEF7FE]/30',
    border: 'border-white/95',
    shadow: 'shadow-[0_8px_24px_rgba(59,130,246,0.05),inset_0_1px_2px_rgba(255,255,255,1),0_0_0_1px_rgba(255,255,255,0.8)]',
    iconBg: 'bg-blue-500/10 text-blue-700',
    accentColor: 'text-blue-700',
    pillBorder: 'border-blue-100/60',
  },
  {
    // 3. 淡紫 / 薰衣草 (Lavender Lilac)
    bg: 'bg-gradient-to-br from-[#F0EAFA]/65 via-[#E8DCF8]/40 to-[#F6F0FC]/30',
    border: 'border-white/95',
    shadow: 'shadow-[0_8px_24px_rgba(168,85,247,0.05),inset_0_1px_2px_rgba(255,255,255,1),0_0_0_1px_rgba(255,255,255,0.8)]',
    iconBg: 'bg-purple-500/10 text-purple-700',
    accentColor: 'text-purple-700',
    pillBorder: 'border-purple-100/60',
  },
  {
    // 4. 粉紫 / 浅长春花 (Periwinkle Powder)
    bg: 'bg-gradient-to-br from-[#ECECFE]/65 via-[#E2E4FC]/40 to-[#F1F1FF]/30',
    border: 'border-white/95',
    shadow: 'shadow-[0_8px_24px_rgba(99,102,241,0.05),inset_0_1px_2px_rgba(255,255,255,1),0_0_0_1px_rgba(255,255,255,0.8)]',
    iconBg: 'bg-indigo-500/10 text-indigo-700',
    accentColor: 'text-indigo-700',
    pillBorder: 'border-indigo-100/60',
  },
  {
    // 5. 暖黄 / 奶油杏仁 (Warm Butter Cream)
    bg: 'bg-gradient-to-br from-[#FEF4E4]/65 via-[#FDECD0]/40 to-[#FEF8ED]/30',
    border: 'border-white/95',
    shadow: 'shadow-[0_8px_24px_rgba(245,158,11,0.05),inset_0_1px_2px_rgba(255,255,255,1),0_0_0_1px_rgba(255,255,255,0.8)]',
    iconBg: 'bg-amber-500/10 text-amber-800',
    accentColor: 'text-amber-800',
    pillBorder: 'border-amber-100/60',
  },
  {
    // 6. 水绿 / 晨曦青 (Aqua Sage)
    bg: 'bg-gradient-to-br from-[#E5F7F3]/65 via-[#D7F2EC]/40 to-[#ECFAF6]/30',
    border: 'border-white/95',
    shadow: 'shadow-[0_8px_24px_rgba(16,185,129,0.05),inset_0_1px_2px_rgba(255,255,255,1),0_0_0_1px_rgba(255,255,255,0.8)]',
    iconBg: 'bg-teal-500/10 text-teal-700',
    accentColor: 'text-teal-700',
    pillBorder: 'border-teal-100/60',
  },
]

export function FolderCard({
  id,
  title,
  description = '知识库基础文档与核心知识配置，支持快速索引与多库联合推理。',
  sourceCount,
  storageUsed = '4.8 MB',
  lastUpdated = '10月13日',
  isSelectedForAi = false,
  onToggleAiSelect,
  onClick,
  onRename,
  isSystem = false,
  index = 0,
}: FolderCardProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState(title)

  // 映射对应的低饱和莫兰迪亚克力配色
  const schemeIndex = getSchemeIndex(id, index)
  const scheme = PASTEL_SCHEMES[schemeIndex % PASTEL_SCHEMES.length]

  const handleSaveTitle = (e: React.MouseEvent | React.FormEvent | React.FocusEvent) => {
    e.stopPropagation()
    if (editedTitle.trim() && editedTitle.trim() !== title) {
      if (onRename) {
        onRename(id, editedTitle.trim())
      }
    } else {
      setEditedTitle(title)
    }
    setIsEditingTitle(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveTitle(e)
    } else if (e.key === 'Escape') {
      setEditedTitle(title)
      setIsEditingTitle(false)
    }
  }

  return (
    <div
      id={`folder-card-${id}`}
      onClick={onClick}
      className={`knowledge-card ${
        isSelectedForAi ? 'selected' : ''
      } group relative w-full h-[115px] sm:h-[125px] cursor-pointer select-none transition-all duration-200 p-2.5 sm:p-3 flex flex-col justify-between`}
    >
      {/* 顶部栏：左上角纯白悬浮小圆角块 (Floating Icon Pill - 图标) + 右上角纯白小圆圈点 (选择框) */}
      <div className="flex items-center justify-between gap-1.5">
        {/* Floating Icon Pill */}
        <div className="bg-white/95 backdrop-blur-md rounded-[10px] p-1 shadow-[0_1px_4px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,1)] border border-white flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
          <div className={`w-5.5 h-5.5 rounded-[6px] flex items-center justify-center ${scheme.iconBg}`}>
            {renderFolderIcon(id)}
          </div>
        </div>

        {/* 右上角高对比度圈 (选择框) */}
        {onToggleAiSelect && (
          <button
            type="button"
            id={`folder-select-dot-${id}`}
            onClick={(e) => {
              e.stopPropagation()
              onToggleAiSelect(e)
            }}
            className={`w-6.5 h-6.5 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm ${
              isSelectedForAi
                ? 'bg-[#8B5CF6] border-2 border-[#8B5CF6] text-white scale-110 ring-2 ring-purple-100'
                : 'bg-white border-2 border-gray-300 hover:border-gray-400 text-transparent hover:scale-105'
            }`}
            title="勾选加入 AI 研报检索范围"
          >
            <Check size={12} strokeWidth={3.5} className={isSelectedForAi ? 'text-white' : 'text-transparent'} />
          </button>
        )}
      </div>

      {/* 卡片主体：仅保留标题，删除简介 */}
      <div className="flex-1 flex flex-col justify-center my-0.5">
        {isEditingTitle ? (
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 my-0.5"
          >
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-full h-5.5 px-1.5 text-[10px] sm:text-xs font-extrabold rounded-[5px] bg-white/95 border border-purple-500 text-[#111827] focus:outline-none shadow-3xs"
            />
          </div>
        ) : (
          <div className="flex items-center gap-1 group/title">
            <h4
              onClick={(e) => {
                e.stopPropagation()
                setIsEditingTitle(true)
              }}
              title="点击可直接重命名此知识库"
              className="text-[10px] sm:text-xs font-extrabold text-[#111827] tracking-tight group-hover:text-purple-700 transition-colors truncate cursor-text"
            >
              {title}
            </h4>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIsEditingTitle(true)
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-gray-400 hover:text-purple-700"
              title="修改名称"
            >
              <Edit2 size={8} />
            </button>
          </div>
        )}
      </div>

      {/* 底部信息栏：文件数量、更新时间 */}
      <div className="flex items-center justify-between pt-1 border-t border-white/60 text-[9px] text-[#6B7280]">
        {/* 文件数量胶囊 */}
        <div className="bg-white/80 backdrop-blur-md border border-white px-1.5 py-0.5 rounded-full text-[8.5px] font-bold text-[#374151] flex items-center gap-1 shadow-3xs">
          <FileText size={9} className="text-gray-400 animate-pulse" />
          <span>{sourceCount} 项文件</span>
        </div>

        {/* 更新时间 */}
        <div className="flex items-center gap-1 text-[8.5px] font-medium text-[#6B7280]/90">
          <Clock size={9} className="text-gray-400" />
          <span>{lastUpdated}</span>
        </div>
      </div>
    </div>
  )
}

function getSchemeIndex(id: string, index: number): number {
  switch (id) {
    case 'brand-business':
      return 0 // Mint Green
    case 'product-knowledge':
      return 1 // Sky Blue
    case 'support-policy':
      return 2 // Lavender Lilac
    case 'product-rd':
      return 3 // Periwinkle
    case 'competitor-intel':
      return 4 // Butter Cream
    case 'market-research':
      return 5 // Aqua Sage
    default:
      return index % 6
  }
}

function getCategoryCode(id: string): string {
  switch (id) {
    case 'brand-business':
      return 'BRAND'
    case 'product-knowledge':
      return 'PRODUCT'
    case 'support-policy':
      return 'POLICY'
    case 'product-rd':
      return 'R&D'
    case 'competitor-intel':
      return 'INTEL'
    case 'market-research':
      return 'MARKET'
    default:
      return 'REPO'
  }
}

function renderFolderIcon(id: string) {
  switch (id) {
    case 'brand-business':
      return <Store size={12} />
    case 'product-knowledge':
      return <Layers size={12} />
    case 'support-policy':
    case 'service-policy':
      return <ShieldCheck size={12} />
    case 'product-rd':
      return <Cpu size={12} />
    case 'competitor-intel':
      return <Crosshair size={12} />
    case 'market-research':
      return <TrendingUp size={12} />
    default:
      return <Sparkles size={12} />
  }
}
