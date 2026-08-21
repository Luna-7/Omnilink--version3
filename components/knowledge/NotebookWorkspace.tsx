'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  ArrowLeft,
  Search,
  Plus,
  FileText,
  FileCode,
  Link2,
  Table,
  CheckSquare,
  Square,
  Sparkles,
  Send,
  Bot,
  User,
  Sliders,
  ExternalLink,
  ShieldCheck,
  Building2,
  Trash2,
  UploadCloud,
  Layers,
  Wand2,
  FileQuestion,
  HelpCircle,
  Clock,
  ChevronRight,
  BookOpen,
} from 'lucide-react'
import type {
  KnowledgeBaseItem,
  KnowledgeSource,
  ChatMessage,
  ChatCitation,
  SystemBaseId,
  SourceType,
} from './types'
import { StructuredKnowledgeModal } from './StructuredKnowledgeModal'
import {
  BrandBusinessStructuredData,
  ProductKnowledgeSupplementaryData,
  SupportPolicyStructuredData,
} from './types'
import { V2PreviewModalType } from './V2PreviewModals'

interface NotebookWorkspaceProps {
  base: KnowledgeBaseItem
  onBack: () => void
  isZh: boolean
  onOpenV2Preview: (type: V2PreviewModalType) => void
  brandData: BrandBusinessStructuredData
  productData: ProductKnowledgeSupplementaryData
  policyData: SupportPolicyStructuredData
  onSaveBrand: (data: BrandBusinessStructuredData) => void
  onSaveProduct: (data: ProductKnowledgeSupplementaryData) => void
  onSavePolicy: (data: SupportPolicyStructuredData) => void
}

export function NotebookWorkspace({
  base,
  onBack,
  isZh,
  onOpenV2Preview,
  brandData,
  productData,
  policyData,
  onSaveBrand,
  onSaveProduct,
  onSavePolicy,
}: NotebookWorkspaceProps) {
  const [sources, setSources] = useState<KnowledgeSource[]>(base.sources)
  const [searchQuery, setSearchQuery] = useState('')
  const [isStructuredModalOpen, setIsStructuredModalOpen] = useState(false)
  const [isAddSourceModalOpen, setIsAddSourceModalOpen] = useState(false)
  const [newSourceTab, setNewSourceTab] = useState<'file' | 'url'>('file')
  const [newUrlInput, setNewUrlInput] = useState('')
  const [newFileNameInput, setNewFileNameInput] = useState('')

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    return getInitialWelcomeMessages(base.id, isZh)
  })
  const [inputPrompt, setInputPrompt] = useState('')
  const [isAiThinking, setIsAiThinking] = useState(false)
  const [activeCitationPreview, setActiveCitationPreview] = useState<ChatCitation | null>(null)

  // Filter sources
  const filteredSources = sources.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.summary && s.summary.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const selectedSources = sources.filter((s) => s.selected)
  const allSelected = sources.length > 0 && selectedSources.length === sources.length

  const toggleSelectAll = () => {
    const nextState = !allSelected
    setSources(sources.map((s) => ({ ...s, selected: nextState })))
  }

  const toggleSourceSelection = (id: string) => {
    setSources(
      sources.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s))
    )
  }

  const handleAddSource = (e: React.FormEvent) => {
    e.preventDefault()
    if (newSourceTab === 'url' && newUrlInput.trim()) {
      const newSource: KnowledgeSource = {
        id: `src-url-${Date.now()}`,
        name: newUrlInput.trim(),
        type: 'url',
        size: '1.2 MB',
        updatedAt: '刚刚',
        visibility: base.visibility,
        selected: true,
        tokensCount: 4500,
        summary: isZh ? '在线 Web 抓取索引镜像' : 'Scraped web content mirror',
      }
      setSources([newSource, ...sources])
      setNewUrlInput('')
      setIsAddSourceModalOpen(false)
    } else if (newSourceTab === 'file' && newFileNameInput.trim()) {
      const ext = newFileNameInput.split('.').pop()?.toLowerCase() || 'pdf'
      const type: SourceType = ext === 'md' ? 'markdown' : ext === 'docx' ? 'docx' : ext === 'json' ? 'structured' : 'pdf'
      const newSource: KnowledgeSource = {
        id: `src-file-${Date.now()}`,
        name: newFileNameInput.trim(),
        type,
        size: '1.8 MB',
        updatedAt: '刚刚',
        visibility: base.visibility,
        selected: true,
        tokensCount: 5200,
        summary: isZh ? '用户上传本地文档' : 'Uploaded document',
      }
      setSources([newSource, ...sources])
      setNewFileNameInput('')
      setIsAddSourceModalOpen(false)
    }
  }

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim()
    if (!query || isAiThinking) return

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setChatMessages((prev) => [...prev, userMsg])
    setInputPrompt('')
    setIsAiThinking(true)

    // Synthesize grounded response using selected sources
    setTimeout(() => {
      const response = generateGroundedAiResponse(base.id, query, selectedSources, isZh)
      setChatMessages((prev) => [...prev, response])
      setIsAiThinking(false)
    }, 900)
  }

  const promptSuggestions = getPromptSuggestions(base.id, isZh)

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[640px] bg-white rounded-3xl border border-[#E5E7EB] shadow-[0_4px_24px_rgba(0,0,0,0.03)] overflow-hidden">
      {/* Top Workspace Bar */}
      <div className="h-14 px-5 border-b border-[#E5E7EB] flex items-center justify-between shrink-0 bg-[#FAFAFA]/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#F4F5F7] border border-[#E5E7EB] text-xs font-semibold text-[#111827] transition-all cursor-pointer shadow-2xs"
          >
            <ArrowLeft size={13} />
            <span>{isZh ? '返回知识库' : 'Back to Bases'}</span>
          </button>
          <div className="h-4 w-[1px] bg-[#E5E7EB]" />
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-[#111827]">{isZh ? base.title : base.titleEn}</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold flex items-center gap-1">
              <ShieldCheck size={11} />
              <span>{isZh ? 'Customer-Facing · 生产就绪' : 'Customer-Facing · Live'}</span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsStructuredModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#111827] hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Layers size={13} className="text-[#A78BFA]" />
            <span>{isZh ? '编辑结构化知识' : 'Structured Knowledge'}</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenV2Preview('generate-faq')}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#F4F5F7] hover:bg-[#E5E7EB] text-[#6B7280] hover:text-[#111827] text-xs font-semibold transition-colors cursor-pointer"
          >
            <FileQuestion size={13} className="text-[#8B5CF6]" />
            <span>{isZh ? 'AI 生成 FAQ [V2]' : 'AI FAQ [V2]'}</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenV2Preview('review-publish')}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#F4F5F7] hover:bg-[#E5E7EB] text-[#6B7280] hover:text-[#111827] text-xs font-semibold transition-colors cursor-pointer"
          >
            <Sparkles size={13} className="text-amber-500" />
            <span>{isZh ? '审核与发布流水线 [V2]' : 'Publish Pipeline [V2]'}</span>
          </button>
        </div>
      </div>

      {/* Dual Column Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Column: Sources & Structured Entry (5 Cols) */}
        <div className="lg:col-span-5 border-r border-[#E5E7EB] flex flex-col bg-[#FBFBFC] overflow-hidden">
          {/* Sources Header & Controls */}
          <div className="p-4 border-b border-[#E5E7EB] space-y-3 bg-white shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-[#111827] uppercase tracking-wider">
                  {isZh ? '数据源列表 (Sources)' : 'Sources'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#F4F5F7] text-[#6B7280] text-[10px] font-bold">
                  {selectedSources.length} / {sources.length} {isZh ? '已勾选参与推理' : 'Active for AI'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddSourceModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 text-[#8B5CF6] text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus size={13} />
                <span>{isZh ? '添加数据源' : 'Add Source'}</span>
              </button>
            </div>

            {/* Search and Select All Bar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={isZh ? '搜索文件名称或关键词…' : 'Filter sources…'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 bg-[#F4F5F7] rounded-xl text-xs text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
                />
              </div>
              <button
                type="button"
                onClick={toggleSelectAll}
                className="h-8 px-2.5 rounded-xl bg-white border border-[#E5E7EB] hover:bg-[#F4F5F7] text-[11px] font-semibold text-[#6B7280] hover:text-[#111827] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                {allSelected ? (
                  <CheckSquare size={13} className="text-[#8B5CF6]" />
                ) : (
                  <Square size={13} />
                )}
                <span>{allSelected ? (isZh ? '全消' : 'None') : (isZh ? '全选' : 'All')}</span>
              </button>
            </div>
          </div>

          {/* Sources List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scroll">
            {filteredSources.map((source) => (
              <div
                key={source.id}
                onClick={() => toggleSourceSelection(source.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                  source.selected
                    ? 'bg-white border-[#8B5CF6]/40 shadow-xs ring-1 ring-[#8B5CF6]/20'
                    : 'bg-white/60 hover:bg-white border-[#E5E7EB] opacity-75'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleSourceSelection(source.id)
                    }}
                    className="mt-0.5 text-gray-400 hover:text-[#8B5CF6] transition-colors"
                  >
                    {source.selected ? (
                      <CheckSquare size={15} className="text-[#8B5CF6]" />
                    ) : (
                      <Square size={15} />
                    )}
                  </button>

                  <div className="w-7 h-7 rounded-lg bg-[#F4F5F7] flex items-center justify-center text-gray-600 shrink-0">
                    {getSourceIcon(source.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-[#111827] truncate" title={source.name}>
                        {source.name}
                      </h4>
                      <span className="text-[10px] text-gray-400 shrink-0">{source.size}</span>
                    </div>

                    {source.summary && (
                      <p className="text-[11px] text-[#6B7280] line-clamp-1 mt-0.5">
                        {source.summary}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="px-1.5 py-0.5 rounded-md bg-[#F4F5F7] text-[9px] font-semibold text-[#6B7280] uppercase">
                        {source.type}
                      </span>
                      {source.tokensCount && (
                        <span className="text-[9px] text-[#9CA3AF]">
                          ~{(source.tokensCount / 1000).toFixed(1)}k tokens
                        </span>
                      )}
                      <span className="text-[9px] text-emerald-600 font-semibold ml-auto">
                        ● {isZh ? '已索引就绪' : 'Indexed'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredSources.length === 0 && (
              <div className="py-12 text-center text-xs text-[#9CA3AF]">
                {isZh ? '未找到匹配的数据源' : 'No matching sources found.'}
              </div>
            )}
          </div>

          {/* Bottom Card for Structured Knowledge Quick Entry */}
          <div className="p-3 border-t border-[#E5E7EB] bg-white">
            <div
              onClick={() => setIsStructuredModalOpen(true)}
              className="p-3 rounded-2xl bg-linear-to-r from-purple-50 via-white to-blue-50 border border-[#8B5CF6]/20 hover:border-[#8B5CF6]/50 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#111827] text-white flex items-center justify-center">
                  <Layers size={15} />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                    <span>{isZh ? '结构化知识模版' : 'Structured Schema'}</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-purple-100 text-purple-700 font-bold">
                      {isZh ? '防幻觉' : 'Zero Hallucination'}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#6B7280]">
                    {isZh ? '已绑定 Storefront 官方展示字段' : 'Bound to official storefront parameters'}
                  </span>
                </div>
              </div>
              <ChevronRight size={14} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* Right Column: AI Chat & Reasoning Workspace (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col bg-white overflow-hidden">
          {/* Chat Stream Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scroll">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs leading-relaxed ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-[#8B5CF6] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Sparkles size={13} />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 space-y-2.5 ${
                    msg.sender === 'user'
                      ? 'bg-[#111827] text-white rounded-tr-xs'
                      : 'bg-[#F4F5F7] text-[#111827] rounded-tl-xs border border-[#E5E7EB]'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                  {/* Citations block if assistant provided sources */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="pt-2 border-t border-[#E5E7EB]/80 space-y-1.5">
                      <span className="text-[10px] font-bold text-[#8B5CF6] uppercase tracking-wider block">
                        {isZh ? '引用知识来源 (Grounding Sources):' : 'Grounding Citations:'}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.citations.map((cite) => (
                          <button
                            key={cite.id}
                            onClick={() => setActiveCitationPreview(cite)}
                            className="px-2 py-1 rounded-lg bg-white border border-[#8B5CF6]/30 hover:border-[#8B5CF6] text-[10px] font-medium text-[#111827] flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                          >
                            <BookOpen size={10} className="text-[#8B5CF6]" />
                            <span className="truncate max-w-[180px]">{cite.sourceName}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <span
                    className={`text-[9px] block text-right ${
                      msg.sender === 'user' ? 'text-gray-400' : 'text-gray-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-[#111827] text-white flex items-center justify-center shrink-0">
                    <User size={13} />
                  </div>
                )}
              </div>
            ))}

            {isAiThinking && (
              <div className="flex gap-3 items-center text-xs text-[#8B5CF6] p-3">
                <div className="w-7 h-7 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center shrink-0 animate-spin">
                  <Sparkles size={13} />
                </div>
                <span>
                  {isZh
                    ? `正在基于选中的 ${selectedSources.length} 个数据源进行交叉推理…`
                    : `Cross-referencing ${selectedSources.length} selected sources…`}
                </span>
              </div>
            )}
          </div>

          {/* Citation Popover Modal if clicked */}
          {activeCitationPreview && (
            <div className="mx-4 mb-2 p-3 bg-purple-50/90 border border-purple-200 rounded-2xl text-xs relative flex items-start justify-between gap-2 animate-in fade-in slide-in-from-bottom-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-purple-900">
                    {isZh ? '引用片段原文' : 'Source Excerpt'}:
                  </span>
                  <span className="text-[10px] text-purple-700 font-medium">
                    {activeCitationPreview.sourceName}
                  </span>
                </div>
                <p className="text-[11px] text-purple-950/80 leading-relaxed italic bg-white/70 p-2 rounded-lg border border-purple-200">
                  &ldquo;{activeCitationPreview.excerpt}&rdquo;
                </p>
              </div>
              <button
                onClick={() => setActiveCitationPreview(null)}
                className="text-purple-400 hover:text-purple-900 font-bold p-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* Preset Prompts Chips */}
          <div className="px-4 py-2 border-t border-[#E5E7EB] bg-[#FAFAFA] flex items-center gap-1.5 overflow-x-auto custom-scroll shrink-0">
            <span className="text-[10px] font-bold text-[#6B7280] shrink-0 uppercase tracking-wider">
              {isZh ? '快捷提问:' : 'Prompts:'}
            </span>
            {promptSuggestions.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="px-2.5 py-1 rounded-full bg-white hover:bg-[#F4F5F7] border border-[#E5E7EB] text-[11px] font-medium text-[#111827] whitespace-nowrap transition-colors cursor-pointer shadow-2xs shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 sm:p-4 border-t border-[#E5E7EB] bg-white shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={
                    selectedSources.length > 0
                      ? isZh
                        ? `向知识库提问（已挂载 ${selectedSources.length} 个数据源）…`
                        : `Ask with ${selectedSources.length} sources attached…`
                      : isZh
                      ? '请先勾选左侧数据源进行问答…'
                      : 'Select sources to query…'
                  }
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  disabled={isAiThinking}
                  className="w-full h-11 pl-4 pr-10 rounded-2xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#111827] transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={!inputPrompt.trim() || isAiThinking}
                className="h-11 px-4 rounded-2xl bg-[#111827] hover:bg-black disabled:bg-gray-200 text-white disabled:text-gray-400 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed shrink-0"
              >
                <Send size={13} />
                <span className="hidden sm:inline">{isZh ? '发送' : 'Send'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Structured Knowledge Modal */}
      <StructuredKnowledgeModal
        baseId={base.id as SystemBaseId}
        isOpen={isStructuredModalOpen}
        onClose={() => setIsStructuredModalOpen(false)}
        isZh={isZh}
        brandData={brandData}
        productData={productData}
        policyData={policyData}
        onSaveBrand={onSaveBrand}
        onSaveProduct={onSaveProduct}
        onSavePolicy={onSavePolicy}
      />

      {/* Add Source Modal */}
      {isAddSourceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsAddSourceModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#E5E7EB] z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <h3 className="text-sm font-bold text-[#111827]">
                {isZh ? '添加新数据源' : 'Add Knowledge Source'}
              </h3>
              <button
                onClick={() => setIsAddSourceModalOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="flex rounded-xl bg-[#F4F5F7] p-1 text-xs">
              <button
                type="button"
                onClick={() => setNewSourceTab('file')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                  newSourceTab === 'file' ? 'bg-white text-[#111827] shadow-xs' : 'text-[#6B7280]'
                }`}
              >
                {isZh ? '本地文件 (PDF / Markdown / DOCX)' : 'Local File'}
              </button>
              <button
                type="button"
                onClick={() => setNewSourceTab('url')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                  newSourceTab === 'url' ? 'bg-white text-[#111827] shadow-xs' : 'text-[#6B7280]'
                }`}
              >
                {isZh ? '在线 Web 链接 / 抓取' : 'Web Link URL'}
              </button>
            </div>

            <form onSubmit={handleAddSource} className="space-y-4">
              {newSourceTab === 'file' ? (
                <div className="space-y-2">
                  <div className="p-6 border-2 border-dashed border-[#E5E7EB] rounded-2xl text-center space-y-2 hover:border-[#8B5CF6] transition-colors">
                    <UploadCloud size={28} className="mx-auto text-[#8B5CF6]" />
                    <p className="text-xs font-semibold text-[#111827]">
                      {isZh ? '拖拽文件至此处，或点击选择' : 'Drag & drop or select file'}
                    </p>
                    <p className="text-[10px] text-[#6B7280]">
                      {isZh ? '支持 .pdf, .docx, .md, .txt (单个文件最大 50MB)' : 'Supports .pdf, .md, .docx up to 50MB'}
                    </p>
                  </div>
                  <input
                    type="text"
                    placeholder={isZh ? '输入文件名（例如：Product_Manual_v3.pdf）' : 'File name...'}
                    value={newFileNameInput}
                    onChange={(e) => setNewFileNameInput(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#111827]">
                    {isZh ? '网页 URL 抓取地址' : 'Target URL'}
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/support-terms"
                    value={newUrlInput}
                    onChange={(e) => setNewUrlInput(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddSourceModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-[#F4F5F7] text-xs font-semibold text-[#111827]"
                >
                  {isZh ? '取消' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-[#111827] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {isZh ? '添加至知识库' : 'Attach Source'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function getSourceIcon(type: SourceType) {
  switch (type) {
    case 'pdf':
      return <FileText size={14} className="text-red-500" />
    case 'markdown':
      return <FileCode size={14} className="text-blue-500" />
    case 'docx':
      return <FileText size={14} className="text-sky-600" />
    case 'url':
      return <Link2 size={14} className="text-emerald-500" />
    case 'structured':
      return <Table size={14} className="text-purple-600" />
  }
}

function getInitialWelcomeMessages(baseId: string, isZh: boolean): ChatMessage[] {
  switch (baseId) {
    case 'brand-business':
      return [
        {
          id: 'init-brand',
          sender: 'assistant',
          content: isZh
            ? '你好！我是品牌与企业知识专席助手。我已加载了本知识库内的品牌调性规范、企业历史及官方联系方式等 5 份数据源。你可以随时向我提问，例如品牌口吻审核、官方介绍文案或多渠道资料汇总。'
            : 'Hello! I am your Brand & Business AI workspace assistant. I have loaded 5 sources including brand identity guidelines, social matrices, and official company profiles.',
          timestamp: '刚刚',
        },
      ]
    case 'product-knowledge':
      return [
        {
          id: 'init-prod',
          sender: 'assistant',
          content: isZh
            ? '你好！我是产品深度知识助手。我已就绪包括声学白皮书、保养指南、全球合规认证在内的 7 份补充知识源。你可以向我咨询任何具体场景的导购解答与排障决策树。'
            : 'Hello! Product Knowledge Workspace is ready with acoustic whitepapers, care guides, and compliance matrices loaded.',
          timestamp: '刚刚',
        },
      ]
    case 'support-policy':
      return [
        {
          id: 'init-policy',
          sender: 'assistant',
          content: isZh
            ? '你好！我是客服与履约政策助手。当前已挂载全球物流时效、30 天退货细则及 2 年有限质保条款。你可以随时核对退换货条款或让我草拟标准客服应答话术。'
            : 'Hello! Support & Policy workspace is live with global shipping SLAs, return guidelines, and warranty terms attached.',
          timestamp: '刚刚',
        },
      ]
    default:
      return [
        {
          id: 'init-default',
          sender: 'assistant',
          content: isZh ? '知识库工作区已就绪，请选择左侧数据源进行问答。' : 'Workspace ready.',
          timestamp: '刚刚',
        },
      ]
  }
}

function getPromptSuggestions(baseId: string, isZh: boolean): string[] {
  switch (baseId) {
    case 'brand-business':
      return isZh
        ? [
            '提炼品牌核心 Slogan 与设计理念',
            '总结官方客服邮箱与 WhatsApp 联系方式',
            '以品牌调性起草一段新客欢迎词',
          ]
        : ['Summarize brand mission', 'List official contact channels', 'Draft brand greeting']
    case 'product-knowledge':
      return isZh
        ? [
            '耳罩保养与清洁注意事项有哪些？',
            '当近视戴眼镜买家咨询夹头时如何解答？',
            '有哪些官方安全与环保认证？',
          ]
        : ['Care & cleaning instructions', 'Answering eyeglass wearer inquiries', 'Compliance certificates']
    case 'support-policy':
      return isZh
        ? [
            '退货由谁承担运费？退款几天到账？',
            '满多少金额享受免运费？',
            '官方有限保修范围包括哪些？',
          ]
        : ['Who pays return shipping fee?', 'Free shipping threshold', 'Warranty coverage terms']
    default:
      return ['总结选中的数据源', '检查潜在矛盾点']
  }
}

function generateGroundedAiResponse(
  baseId: string,
  query: string,
  sources: KnowledgeSource[],
  isZh: boolean
): ChatMessage {
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  if (baseId === 'support-policy') {
    if (query.includes('运费') || query.includes('shipping') || query.includes('退货') || query.includes('return')) {
      return {
        id: `resp-${Date.now()}`,
        sender: 'assistant',
        content: isZh
          ? '根据《退换货细则》与《全球物流政策》规定：\n\n1. **退换货运费划分**：自签收之日起 30 天内，若因商品质量问题退货，由我司承担全部往返运费；若因个人喜好无理由退换，需由买家承担回寄运费。\n2. **退款到账时效**：仓库收到退回包裹并验收合格后，原路退款将在 1-3 个工作日内到账。\n3. **包邮门槛**：全场单笔订单满 ¥199 / $49 即享免运费。'
          : 'Based on Returns & Refund Procedure and Global Shipping Policy:\n\n1. 30-day window: Quality issues are fully covered by merchant; buyer preference returns are paid by buyer.\n2. Refund SLA: 1-3 business days after warehouse inspection.\n3. Free shipping threshold: $49 minimum order.',
        timestamp,
        citations: [
          {
            id: 'c1',
            sourceId: 'src-policy-2',
            sourceName: 'Returns_And_Refund_Procedure.md',
            excerpt: '自签收之日起 30 天无忧退换货保障。若因质量问题退货全额承担运费，个人原因需由买家承担回寄运费。',
            confidence: 0.98,
          },
          {
            id: 'c2',
            sourceId: 'src-policy-1',
            sourceName: 'Global_Shipping_And_Delivery_Policy_2026.md',
            excerpt: '全场单笔订单满 ¥199 / $49 免运费，现货 24 小时内发出。',
            confidence: 0.95,
          },
        ],
      }
    }
  }

  if (baseId === 'product-knowledge') {
    return {
      id: `resp-${Date.now()}`,
      sender: 'assistant',
      content: isZh
        ? '已检索《耳罩保养指引》与《AI 导购补充上下文》：\n\n- **保养注意**：耳机支持 IPX4 生活防泼溅，清洁耳罩时请使用微湿无绒软布，切勿使用酒精等有机溶剂。\n- **佩戴舒适度**：耳罩采用减压慢回弹蛋白皮与浮动转轴设计，近视佩戴眼镜者连续使用 6 小时无明显夹头压迫感。\n- **认证标准**：已通过欧盟 CE (EN 62368-1) 及 RoHS 2.0 环保认证。'
        : 'Based on Wearable Care Instructions & Supplementary AI Context:\n\n- Cleaning: IPX4 water splash resistant. Use soft damp lint-free cloth; avoid alcohol.\n- Eyeglass comfort: Memory foam protein leather cushions ensure zero pinch force for 6+ hours.\n- Certifications: Fully CE (EN 62368-1) and RoHS 2.0 certified.',
      timestamp,
      citations: [
        {
          id: 'c3',
          sourceId: 'src-prod-2',
          sourceName: 'Wearable_Care_Instructions_v2.md',
          excerpt: '清洁耳罩时请使用微湿的无绒软布轻轻擦拭，切勿使用酒精或强腐蚀溶剂。',
          confidence: 0.99,
        },
        {
          id: 'c4',
          sourceId: 'src-prod-7',
          sourceName: 'Supplementary_AI_Context.json',
          excerpt: '当顾客询问关于“近视戴眼镜是否夹头”时，AI 导购主动强调记忆慢回弹蛋白皮与减压转轴设计。',
          confidence: 0.97,
        },
      ],
    }
  }

  return {
    id: `resp-${Date.now()}`,
    sender: 'assistant',
    content: isZh
      ? `已基于已挂载的 ${sources.length} 份数据源完成语义检索：\n\n品牌官方定位为高保真声学与环境智能科技，联系邮箱为 support@omnilink.store，官方热线 +1 (800) 882-9102。所有数据均已同步至 Storefront 独立站。`
      : `Grounded across ${sources.length} attached sources. Official support email: support@omnilink.store. Synchronized to Storefront.`,
    timestamp,
    citations: [
      {
        id: 'c5',
        sourceId: 'src-brand-1',
        sourceName: 'Omnilink_Brand_Guidelines_2026.pdf',
        excerpt: '品牌视觉识别系统、Slogan、色盘规范与品牌调性指引。',
        confidence: 0.96,
      },
    ],
  }
}
