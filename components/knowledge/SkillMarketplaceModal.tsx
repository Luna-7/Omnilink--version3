'use client'

import React, { useState } from 'react'
import { motion } from 'motion/react'
import {
  Compass,
  Search,
  Plus,
  Check,
  UploadCloud,
  Scale,
  Crosshair,
  Sparkles,
  ShoppingBag,
  Truck,
  ShieldCheck,
  TrendingUp,
  Bot,
  Layers,
  Lock,
  Zap,
  X,
  Star,
} from 'lucide-react'
import { AI_SKILLS_LIBRARY, type AiSkillItem } from './skillsData'

interface SkillMarketplaceModalProps {
  isOpen: boolean
  onClose: () => void
  activeSkillIds: string[]
  onToggleSkill: (skillId: string) => void
  isProUser: boolean
}

export function SkillMarketplaceModal({
  isOpen,
  onClose,
  activeSkillIds,
  onToggleSkill,
  isProUser,
}: SkillMarketplaceModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<'all' | 'recommended' | 'industry' | 'community'>('all')
  const [isUploadSkillModalOpen, setIsUploadSkillModalOpen] = useState(false)
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillDesc, setNewSkillDesc] = useState('')
  const [newSkillPrompt, setNewSkillPrompt] = useState('')

  if (!isOpen) return null

  const filteredSkills = AI_SKILLS_LIBRARY.filter((skill) => {
    const matchesSearch =
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.author.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory === 'all' || skill.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const recommendedSkills = filteredSkills.filter((s) => s.category === 'recommended')
  const industrySkills = filteredSkills.filter((s) => s.category === 'industry')
  const communitySkills = filteredSkills.filter((s) => s.category === 'community')

  const handleUploadSkill = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSkillName.trim()) return
    // In demo mode, close after toast
    setIsUploadSkillModalOpen(false)
    setNewSkillName('')
    setNewSkillDesc('')
    setNewSkillPrompt('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Main Glass Modal Window */}
      <div
        id="skill-marketplace-dialog"
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-[24px] bg-white/80 backdrop-blur-[24px] backdrop-saturate-[190%] border border-white/70 shadow-[0_16px_48px_rgba(0,0,0,0.14)] z-10 overflow-hidden animate-in fade-in zoom-in-95"
      >
        {/* Top Header */}
        <div className="p-5 border-b border-[#E5E7EB]/70 bg-white/50 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[14px] bg-[#111827] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles size={18} className="text-purple-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#111827] tracking-tight">
                  技能中心
                </h2>
                <span className="px-2 py-0.5 rounded-[6px] bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
                  AI 技能生态
                </span>
                {activeSkillIds.length > 0 && (
                  <span className="px-2 py-0.5 rounded-[6px] bg-gray-100 text-gray-700 text-[10px] font-semibold">
                    当前已挂载 {activeSkillIds.length} 个技能
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6B7280] mt-0.5">
                所有用户均可发布或挂载 Skill。挂载后，输入框可一键调用特定技能进行研报与内容生成。
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              id="upload-skill-btn"
              onClick={() => setIsUploadSkillModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-white hover:bg-gray-50 border border-[#E5E7EB] text-xs font-bold text-[#111827] transition-all cursor-pointer shadow-2xs"
            >
              <UploadCloud size={13} className="text-purple-600" />
              <span>上传技能</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="px-5 py-3 border-b border-[#E5E7EB]/60 bg-white/40 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 p-0.5 rounded-[10px] bg-gray-100/80 border border-[#E5E7EB]/60">
            {[
              { key: 'all', label: '全部技能' },
              { key: 'recommended', label: '推荐技能' },
              { key: 'industry', label: '行业技能' },
              { key: 'community', label: '社区技能' },
            ].map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveCategory(cat.key as any)}
                className={`px-3 py-1 rounded-[8px] text-xs font-semibold transition-all cursor-pointer ${
                  activeCategory === cat.key
                    ? 'bg-white text-[#111827] shadow-2xs font-bold'
                    : 'text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-60">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索技能名称或描述…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs rounded-[8px] bg-white border border-[#E5E7EB] text-[#111827] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#111827]"
            />
          </div>
        </div>

        {/* Skill Cards Grid Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scroll">
          {/* Recommended Skills */}
          {(activeCategory === 'all' || activeCategory === 'recommended') && recommendedSkills.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-3.5 rounded-full bg-purple-600" />
                <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wide">
                  推荐技能 (Official Recommended)
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {recommendedSkills.map((skill) => (
                  <SkillCard
                    key={skill.id}
                    skill={skill}
                    isActive={activeSkillIds.includes(skill.id)}
                    onToggle={() => onToggleSkill(skill.id)}
                    isProUser={isProUser}
                    hasOtherActive={activeSkillIds.length > 0 && !activeSkillIds.includes(skill.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Industry Skills */}
          {(activeCategory === 'all' || activeCategory === 'industry') && industrySkills.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-3.5 rounded-full bg-blue-600" />
                <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wide">
                  行业技能 (Industry Specialized)
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {industrySkills.map((skill) => (
                  <SkillCard
                    key={skill.id}
                    skill={skill}
                    isActive={activeSkillIds.includes(skill.id)}
                    onToggle={() => onToggleSkill(skill.id)}
                    isProUser={isProUser}
                    hasOtherActive={activeSkillIds.length > 0 && !activeSkillIds.includes(skill.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Community Skills */}
          {(activeCategory === 'all' || activeCategory === 'community') && communitySkills.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-3.5 rounded-full bg-emerald-600" />
                <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wide">
                  社区技能 (Community Ecosystem)
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {communitySkills.map((skill) => (
                  <SkillCard
                    key={skill.id}
                    skill={skill}
                    isActive={activeSkillIds.includes(skill.id)}
                    onToggle={() => onToggleSkill(skill.id)}
                    isProUser={isProUser}
                    hasOtherActive={activeSkillIds.length > 0 && !activeSkillIds.includes(skill.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredSkills.length === 0 && (
            <div className="py-12 text-center text-xs text-[#9CA3AF]">
              未检索到符合条件的技能，请调整搜索词或分类。
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E5E7EB]/60 bg-white/60 backdrop-blur-md flex items-center justify-between text-xs text-[#6B7280] shrink-0">
          <span>
            普通用户支持单技能挂载；Pro 用户支持多技能组合研报。
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-[8px] bg-[#111827] hover:bg-black text-white font-bold text-xs shadow-xs cursor-pointer"
          >
            完成
          </button>
        </div>
      </div>

      {/* Upload Custom Skill Modal */}
      {isUploadSkillModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setIsUploadSkillModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-[24px] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.16)] border border-[#E5E7EB] z-10 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
              <h3 className="text-sm font-bold text-[#111827]">上传发布新技能</h3>
              <button
                onClick={() => setIsUploadSkillModalOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSkill} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">
                  技能名称
                </label>
                <input
                  type="text"
                  placeholder="例如：TikTok 爆款脚本生成"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full h-8 px-3 rounded-[8px] bg-white border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">
                  技能描述与作用
                </label>
                <textarea
                  rows={2}
                  placeholder="简述该技能如何分析知识库内容…"
                  value={newSkillDesc}
                  onChange={(e) => setNewSkillDesc(e.target.value)}
                  className="w-full p-2.5 rounded-[8px] bg-white border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">
                  系统提示词模板 (System Prompt)
                </label>
                <textarea
                  rows={3}
                  placeholder="注入到 AI 研报推理引擎的指令规范…"
                  value={newSkillPrompt}
                  onChange={(e) => setNewSkillPrompt(e.target.value)}
                  className="w-full p-2.5 rounded-[8px] bg-white border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827] resize-none font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadSkillModalOpen(false)}
                  className="px-3 py-1.5 rounded-[8px] bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-[#111827]"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={!newSkillName.trim()}
                  className="px-4 py-1.5 rounded-[8px] bg-[#111827] hover:bg-black disabled:bg-gray-200 text-white disabled:text-gray-400 text-xs font-bold shadow-xs cursor-pointer"
                >
                  发布
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function SkillCard({
  skill,
  isActive,
  onToggle,
  isProUser,
  hasOtherActive,
}: {
  skill: AiSkillItem
  isActive: boolean
  onToggle: () => void
  isProUser: boolean
  hasOtherActive: boolean
}) {
  const isMultiLocked = hasOtherActive && !isProUser && !isActive

  return (
    <div
      id={`skill-card-${skill.id}`}
      className={`p-3.5 rounded-[16px] border transition-all flex flex-col justify-between space-y-2.5 ${
        isActive
          ? 'bg-purple-50/80 border-purple-300 shadow-xs'
          : 'bg-white hover:bg-gray-50/80 border-[#E5E7EB]'
      }`}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0 ${
                isActive ? 'bg-purple-600 text-white' : 'bg-gray-100 text-[#111827]'
              }`}
            >
              {renderSkillIcon(skill.icon)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-[#111827]">{skill.name}</h4>
                {skill.badge && (
                  <span className="px-1.5 py-0.2 rounded-[4px] bg-purple-100 text-purple-800 text-[9px] font-bold">
                    {skill.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-[#6B7280]">{skill.author}</span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-[#4B5563] leading-snug line-clamp-2">
          {skill.description}
        </p>
      </div>

      <div className="pt-2 border-t border-[#E5E7EB]/60 flex items-center justify-between text-[10px]">
        <span className="text-[#6B7280]">{skill.downloads || 100}+ 次调用</span>
        <button
          type="button"
          onClick={onToggle}
          className={`px-3 py-1 rounded-[6px] text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
            isActive
              ? 'bg-purple-600 text-white shadow-2xs'
              : 'bg-[#111827] hover:bg-black text-white'
          }`}
        >
          {isActive ? (
            <>
              <Check size={12} />
              <span>已添加</span>
            </>
          ) : isMultiLocked ? (
            <>
              <Lock size={11} className="text-amber-300" />
              <span>添加 (替换)</span>
            </>
          ) : (
            <>
              <Plus size={12} />
              <span>添加</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

function renderSkillIcon(icon: string) {
  switch (icon) {
    case 'Scale':
      return <Scale size={14} />
    case 'Crosshair':
      return <Crosshair size={14} />
    case 'Sparkles':
      return <Sparkles size={14} />
    case 'ShoppingBag':
      return <ShoppingBag size={14} />
    case 'Truck':
      return <Truck size={14} />
    case 'ShieldCheck':
      return <ShieldCheck size={14} />
    case 'TrendingUp':
      return <TrendingUp size={14} />
    default:
      return <Bot size={14} />
  }
}
