'use client'

import React, { useState } from 'react'
import {
  Search,
  PanelRightClose,
  PanelRightOpen,
  Sparkles,
  Pin,
  PinOff,
  Download,
  Trash2,
  Plus,
  FileText,
  ChevronRight,
  Zap,
  Tag,
} from 'lucide-react'
import type { SavedArtifact } from './types'
import { AI_SKILLS_LIBRARY, type AiSkillItem } from './skillsData'
import { SkillCommandPalette } from './SkillCommandPalette'
import { ArtifactDetailModal } from './ArtifactDetailModal'

interface RightSkillsArtifactsDrawerProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
  artifacts: SavedArtifact[]
  onSelectArtifact?: (artifact: SavedArtifact) => void
  onDeleteArtifact?: (id: string) => void
  onTogglePinArtifact?: (id: string) => void
  onTriggerSkill: (skill: AiSkillItem, executeImmediately?: boolean) => void
  onOpenSkillMarketplace: () => void
  activeSkillIds: string[]
}

const QUICK_SKILL_PILLS = [
  { id: 'skill-competitor', name: '📊 竞品分析' },
  { id: 'skill-presentation', name: '📝 演示大纲' },
  { id: 'skill-compliance', name: '⚖️ 合规审查' },
  { id: 'skill-copywriting', name: '✨ 文案生成' },
  { id: 'skill-ecommerce-copy', name: '📦 电商商品描述' },
]

export function RightSkillsArtifactsDrawer({
  isCollapsed,
  onToggleCollapse,
  artifacts,
  onSelectArtifact,
  onDeleteArtifact,
  onTogglePinArtifact,
  onTriggerSkill,
  onOpenSkillMarketplace,
  activeSkillIds,
}: RightSkillsArtifactsDrawerProps) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [previewingArtifact, setPreviewingArtifact] = useState<SavedArtifact | null>(null)

  const handlePillClick = (skillId: string) => {
    const found = AI_SKILLS_LIBRARY.find((s) => s.id === skillId)
    if (found) {
      onTriggerSkill(found, true)
    } else if (skillId === 'skill-presentation') {
      onTriggerSkill(
        {
          id: 'skill-presentation',
          name: '演示大纲',
          category: 'recommended',
          categoryLabel: '推荐技能',
          description: '生成针对新品发布会、海外路演及商务对接的结构化演讲大纲。',
          author: 'Omnilink 官方',
          icon: 'FileText',
          systemPromptModifier: '输出结构清晰的演讲与发布会大纲方案。',
        },
        true
      )
    }
  }

  const handleExportArtifact = (artifact: SavedArtifact, e: React.MouseEvent) => {
    e.stopPropagation()
    const blob = new Blob([artifact.content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${artifact.title.replace(/\s+/g, '_')}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const sortedArtifacts = [...artifacts].sort(
    (a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)
  )

  return (
    <>
      {/* Main Drawer Container - Solid White Base */}
      <aside
        id="right-skills-artifacts-drawer"
        className={`h-full bg-white border-l border-[#E5E7EB] text-[#111827] flex flex-col justify-between shrink-0 transition-all duration-300 ease-in-out relative z-20 ${
          isCollapsed ? 'w-[48px] overflow-hidden' : 'w-[260px] xl:w-[280px]'
        }`}
      >
        {/* COLLAPSED STATE (48px Slim Icon Sidebar) */}
        {isCollapsed ? (
          <div className="flex flex-col items-center py-3.5 h-full justify-between select-none bg-white">
            {/* Top expand trigger */}
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                id="expand-right-drawer-btn"
                onClick={onToggleCollapse}
                className="w-8 h-8 rounded-[4px] bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#374151] hover:text-[#111827] flex items-center justify-center cursor-pointer transition-colors"
                title="展开技能与资产面板"
              >
                <PanelRightOpen size={16} />
              </button>

              <div className="w-5 h-[1px] bg-[#E5E7EB]" />

              {/* Quick search icon in collapsed mode */}
              <button
                type="button"
                onClick={() => setIsCommandPaletteOpen(true)}
                className="w-8 h-8 rounded-[4px] bg-blue-50 hover:bg-blue-100 text-[#024AD8] flex items-center justify-center cursor-pointer transition-colors"
                title="快捷检索技能"
              >
                <Search size={15} />
              </button>

              {/* Skills Trigger Icon */}
              <button
                type="button"
                onClick={onOpenSkillMarketplace}
                className="w-8 h-8 rounded-[4px] bg-[#F9FAFB] hover:bg-blue-50 text-[#374151] hover:text-[#024AD8] flex items-center justify-center cursor-pointer transition-colors relative border border-[#E5E7EB]"
                title="技能中心"
              >
                <Sparkles size={15} />
                {activeSkillIds.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#024AD8] text-[9px] font-bold text-white flex items-center justify-center">
                    {activeSkillIds.length}
                  </span>
                )}
              </button>

              {/* Artifacts Icon with badge */}
              <button
                type="button"
                onClick={onToggleCollapse}
                className="w-8 h-8 rounded-[4px] bg-[#F9FAFB] hover:bg-[#F3F4F6] text-[#374151] flex items-center justify-center cursor-pointer transition-colors relative border border-[#E5E7EB]"
                title="沉淀文件"
              >
                <FileText size={15} />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-600 text-[9px] font-bold text-white flex items-center justify-center">
                  {artifacts.length}
                </span>
              </button>
            </div>

            {/* Bottom collapsed vertical label */}
            <div
              onClick={onToggleCollapse}
              className="rotate-180 [writing-mode:vertical-rl] text-[11px] font-bold text-[#6B7280] hover:text-[#024AD8] tracking-widest cursor-pointer py-2"
            >
              技能与资产
            </div>
          </div>
        ) : (
          /* EXPANDED FULL STATE - PURE WHITE CANVAS */
          <div className="flex flex-col h-full overflow-hidden bg-white">
            {/* Top Layer 1: Header & Skill Search Box */}
            <div className="p-3 border-b border-[#E5E7EB] bg-white space-y-2 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-[4px] bg-blue-50 text-[#024AD8] flex items-center justify-center">
                    <Sparkles size={12} />
                  </div>
                  <h3 className="text-xs font-extrabold text-[#111827] tracking-tight">
                    技能与资产
                  </h3>
                </div>

                <button
                  type="button"
                  id="collapse-right-drawer-btn"
                  onClick={onToggleCollapse}
                  className="p-1 rounded-[4px] text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
                  title="收起右侧面板"
                >
                  <PanelRightClose size={15} />
                </button>
              </div>

              {/* Search Bar Input */}
              <div
                onClick={() => setIsCommandPaletteOpen(true)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#F9FAFB] hover:bg-white border border-[#E5E7EB] hover:border-[#024AD8]/40 text-[#6B7280] hover:text-[#111827] transition-all cursor-pointer shadow-2xs group"
              >
                <Search size={13} className="text-[#024AD8] shrink-0" />
                <span className="text-xs flex-1 text-[#6B7280] truncate">
                  搜索技能或快捷指令...
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white text-[#9CA3AF] border border-[#E5E7EB] font-medium shrink-0">
                  快捷
                </span>
              </div>
            </div>

            {/* Top Layer 2: Dynamic Skill Capsule Pills */}
            <div className="px-3 py-2 border-b border-[#E5E7EB] bg-white shrink-0 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
                <span className="font-semibold text-[#374151]">常用技能</span>
                <button
                  type="button"
                  onClick={onOpenSkillMarketplace}
                  className="text-[#024AD8] hover:text-[#003198] font-bold flex items-center gap-0.5 transition-colors cursor-pointer"
                >
                  <span>技能中心</span>
                  <ChevronRight size={11} />
                </button>
              </div>

              <div className="flex flex-wrap gap-1">
                {QUICK_SKILL_PILLS.map((pill) => (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => handlePillClick(pill.id)}
                    className="bg-blue-50 hover:bg-blue-100 text-[#024AD8] border border-blue-100 rounded-full px-2 py-0.5 text-[11px] transition-all cursor-pointer font-medium active:scale-95 whitespace-nowrap"
                  >
                    {pill.name}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={onOpenSkillMarketplace}
                  className="bg-[#F3F4F6] text-[#4B5563] hover:text-[#111827] border border-[#E5E7EB] rounded-full px-2 py-0.5 text-[11px] hover:bg-[#E5E7EB] transition-all cursor-pointer font-medium flex items-center gap-0.5 whitespace-nowrap"
                >
                  <Plus size={10} />
                  <span>更多分类</span>
                </button>
              </div>
            </div>

            {/* Main Layer 3: File Artifacts List (No "Saved Artifacts" header div, no detailed summary paragraphs, only title & keywords) */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-2 custom-scroll bg-white">
              {sortedArtifacts.length === 0 ? (
                <div className="py-12 text-center text-[#9CA3AF] text-xs flex flex-col items-center gap-2">
                  <FileText size={24} className="opacity-40 text-[#024AD8]" />
                  <span>暂无沉淀文件</span>
                  <span className="text-[10px] text-[#9CA3AF]">
                    点击上方技能即可生成研报与文案
                  </span>
                </div>
              ) : (
                sortedArtifacts.map((art) => {
                  return (
                    <div
                      key={art.id}
                      onClick={() => {
                        setPreviewingArtifact(art)
                        if (onSelectArtifact) onSelectArtifact(art)
                      }}
                      className={`group relative p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                        art.pinned
                          ? 'bg-blue-50/20 border-blue-200 hover:border-[#024AD8] shadow-2xs'
                          : 'bg-white hover:bg-[#F9FAFB] border-[#E5E7EB] hover:border-[#024AD8]/40'
                      }`}
                    >
                      {/* Card Header: Tag badge, keywords & hover actions */}
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1 min-w-0 flex-wrap">
                          <span className="px-1.5 py-0.2 rounded-[4px] bg-blue-50 text-[#024AD8] border border-blue-100 text-[10px] font-bold truncate">
                            {art.typeLabel}
                          </span>
                          {art.pinned && (
                            <span className="px-1 py-0.2 rounded-[4px] bg-amber-50 text-amber-600 border border-amber-200 text-[9px] font-bold">
                              置顶
                            </span>
                          )}
                        </div>

                        {/* Hover Action Buttons */}
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          {onTogglePinArtifact && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                onTogglePinArtifact(art.id)
                              }}
                              className={`p-1 rounded-[3px] hover:bg-[#F3F4F6] transition-colors cursor-pointer ${
                                art.pinned ? 'text-amber-600' : 'text-[#6B7280] hover:text-[#111827]'
                              }`}
                              title={art.pinned ? '取消置顶' : '置顶'}
                            >
                              {art.pinned ? <PinOff size={11} /> : <Pin size={11} />}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => handleExportArtifact(art, e)}
                            className="p-1 rounded-[3px] text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
                            title="导出文件"
                          >
                            <Download size={11} />
                          </button>

                          {onDeleteArtifact && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (confirm(`确认删除「${art.title}」？`)) {
                                  onDeleteArtifact(art.id)
                                }
                              }}
                              className="p-1 rounded-[3px] text-[#6B7280] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="删除"
                            >
                              <Trash2 size={11} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Card Body: Title only (No detailed summary paragraph) */}
                      <h4 className="text-xs font-bold text-[#111827] group-hover:text-[#024AD8] transition-colors line-clamp-2 leading-snug">
                        {art.title}
                      </h4>

                      {/* Keywords Chips */}
                      {art.keywords && art.keywords.length > 0 && (
                        <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                          {art.keywords.map((kw, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.2 rounded bg-[#F3F4F6] text-[#4B5563] text-[10px] font-medium"
                            >
                              #{kw}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Bottom meta */}
                      <div className="mt-1.5 pt-1.5 border-t border-[#F3F4F6] flex items-center justify-between text-[10px] text-[#9CA3AF]">
                        <span>{art.createdAt}</span>
                        <span className="text-[#024AD8] group-hover:underline flex items-center gap-0.5 font-medium">
                          <span>查看</span>
                          <ChevronRight size={10} />
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Command Palette Modal */}
      <SkillCommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectSkill={(skill, executeImmediately) => {
          onTriggerSkill(skill, executeImmediately)
        }}
        activeSkillIds={activeSkillIds}
      />

      {/* Artifact Detail Modal */}
      <ArtifactDetailModal
        artifact={previewingArtifact}
        isOpen={!!previewingArtifact}
        onClose={() => setPreviewingArtifact(null)}
        onTogglePin={onTogglePinArtifact}
        onInsertToChat={(art) => {
          if (onSelectArtifact) onSelectArtifact(art)
        }}
      />
    </>
  )
}
