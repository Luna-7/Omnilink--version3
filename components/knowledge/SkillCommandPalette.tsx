'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Search,
  Sparkles,
  Scale,
  Crosshair,
  ShoppingBag,
  Truck,
  ShieldCheck,
  TrendingUp,
  FileText,
  X,
  Zap,
} from 'lucide-react'
import { AI_SKILLS_LIBRARY, type AiSkillItem } from './skillsData'

interface SkillCommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onSelectSkill: (skill: AiSkillItem, executeImmediately?: boolean) => void
  activeSkillIds: string[]
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Scale: <Scale size={15} />,
  Crosshair: <Crosshair size={15} />,
  Sparkles: <Sparkles size={15} />,
  ShoppingBag: <ShoppingBag size={15} />,
  Truck: <Truck size={15} />,
  ShieldCheck: <ShieldCheck size={15} />,
  TrendingUp: <TrendingUp size={15} />,
  FileText: <FileText size={15} />,
}

export function SkillCommandPalette({
  isOpen,
  onClose,
  onSelectSkill,
  activeSkillIds,
}: SkillCommandPaletteProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  const filteredSkills = AI_SKILLS_LIBRARY.filter((skill) => {
    const matchesSearch =
      skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill.categoryLabel.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory =
      selectedCategory === 'all' || skill.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  useEffect(() => {
    setSelectedIndex(0)
  }, [searchTerm, selectedCategory])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) =>
        prev < filteredSkills.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredSkills[selectedIndex]) {
        onSelectSkill(filteredSkills[selectedIndex], true)
        onClose()
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Palette Container */}
      <div
        className="relative w-full max-w-xl bg-white border border-[#E5E7EB] rounded-2xl shadow-xl overflow-hidden text-[#111827] flex flex-col max-h-[75vh] animate-in fade-in zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#E5E7EB] gap-3 bg-[#F9FAFB] shrink-0">
          <Search size={18} className="text-[#024AD8] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索分析与研报生成技能（例如：竞品对标、合规审查、文案生成）..."
            className="flex-1 bg-transparent text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none"
          />
          <span className="text-[10px] bg-white text-[#6B7280] px-2 py-0.5 rounded-[4px] border border-[#E5E7EB] font-medium">
            ESC 退出
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-[#6B7280] hover:text-[#111827] p-1 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="px-4 py-2 border-b border-[#E5E7EB] bg-white flex items-center gap-1.5 overflow-x-auto shrink-0 custom-scroll text-xs">
          {[
            { id: 'all', label: '全部技能' },
            { id: 'recommended', label: '⭐ 推荐精选' },
            { id: 'industry', label: '🏢 行业合规' },
            { id: 'community', label: '🌐 社区创作' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-[#024AD8] text-white shadow-2xs'
                  : 'bg-[#F3F4F6] text-[#4B5563] hover:text-[#111827] hover:bg-[#E5E7EB]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scroll max-h-[380px] bg-white">
          {filteredSkills.length === 0 ? (
            <div className="py-12 text-center text-[#9CA3AF] text-xs">
              <Sparkles size={24} className="mx-auto mb-2 opacity-40 text-[#024AD8]" />
              <span>未检索到匹配的技能</span>
            </div>
          ) : (
            filteredSkills.map((skill, index) => {
              const isSelected = index === selectedIndex
              const isMounted = activeSkillIds.includes(skill.id)
              const icon = ICON_MAP[skill.icon] || <Sparkles size={15} />

              return (
                <div
                  key={skill.id}
                  onClick={() => {
                    onSelectSkill(skill, true)
                    onClose()
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`p-3 rounded-xl flex items-start gap-3 transition-all cursor-pointer select-none border ${
                    isSelected
                      ? 'bg-blue-50/70 border-[#024AD8]/40 text-[#111827]'
                      : 'bg-white border-transparent text-[#374151] hover:bg-[#F9FAFB]'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-[#024AD8] text-white shadow-2xs'
                        : 'bg-blue-50 text-[#024AD8]'
                    }`}
                  >
                    {icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#111827]">
                        {skill.name}
                      </span>
                      {skill.badge && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-50 text-[#024AD8] border border-blue-100 font-medium">
                          {skill.badge}
                        </span>
                      )}
                      {isMounted && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                          已挂载
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#6B7280] line-clamp-1 mt-0.5">
                      {skill.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 text-[#6B7280]">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectSkill(skill, false)
                        onClose()
                      }}
                      className="px-2 py-1 rounded-[4px] text-[10px] font-semibold bg-[#F3F4F6] hover:bg-[#024AD8] text-[#374151] hover:text-white border border-[#E5E7EB] transition-colors"
                      title="挂载到当前对话"
                    >
                      {isMounted ? '已挂载' : '+ 挂载'}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectSkill(skill, true)
                        onClose()
                      }}
                      className="p-1.5 rounded-[4px] text-[#024AD8] hover:text-white hover:bg-[#024AD8] transition-colors"
                      title="立即执行此技能"
                    >
                      <Zap size={14} />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-[#F9FAFB] border-t border-[#E5E7EB] flex items-center justify-between text-[11px] text-[#6B7280] shrink-0">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-white text-[#374151] border border-[#E5E7EB] text-[10px]">
                ↑↓
              </kbd>{' '}
              切换选择
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-white text-[#374151] border border-[#E5E7EB] text-[10px]">
                Enter
              </kbd>{' '}
              立即执行
            </span>
          </div>
          <span className="text-[#024AD8] font-bold">智能推理引擎</span>
        </div>
      </div>
    </div>
  )
}
