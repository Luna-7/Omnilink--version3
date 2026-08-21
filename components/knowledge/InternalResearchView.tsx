'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Lock,
  Shield,
  Sparkles,
  User,
  Send,
  CheckSquare,
  Square,
  FileText,
  BarChart3,
  Crosshair,
  Scale,
  Cpu,
  ChevronDown,
  ArrowLeft,
  UploadCloud,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  FileSpreadsheet,
  FileCode,
  FolderLock,
  Compass,
  Zap,
  Truck,
  TrendingUp,
  ShieldCheck,
  FileCheck2,
  Leaf,
  Bookmark,
  Share2,
  ShoppingBag,
  Bot,
  Layers,
  Sparkle,
} from 'lucide-react'
import type { KnowledgeBaseItem, KnowledgeSource, ChatMessage, ChatCitation } from './types'
import {
  INTERNAL_RESEARCH_BASES,
  CENTER_KNOWLEDGE_BASES_DATA,
  AI_RESEARCH_MODELS_DATA,
  AiResearchModelOption,
} from './mockData'
import { AI_SKILLS_LIBRARY, type AiSkillItem } from './skillsData'
import { SkillMarketplaceModal } from './SkillMarketplaceModal'

interface InternalResearchViewProps {
  isZh: boolean
  addedCenterBaseIds?: string[]
  onToggleAddCenterBase?: (id: string) => void
  onNavigateToCenter?: () => void
}

export function InternalResearchView({
  isZh,
  addedCenterBaseIds = ['hub-eu-reg'],
  onToggleAddCenterBase,
  onNavigateToCenter,
}: InternalResearchViewProps) {
  // Base internal knowledge bases
  const [customBases, setCustomBases] = useState<KnowledgeBaseItem[]>(() => {
    return [
      {
        ...INTERNAL_RESEARCH_BASES[0],
        title: '产品研发资料',
        titleEn: 'Product R&D',
      },
      {
        ...INTERNAL_RESEARCH_BASES[2],
        title: '竞品情报',
        titleEn: 'Competitor Intel',
      },
      {
        ...INTERNAL_RESEARCH_BASES[3],
        title: '法规资料',
        titleEn: 'Compliance & Legal',
      },
      {
        ...INTERNAL_RESEARCH_BASES[1],
        title: '市场研究',
        titleEn: 'Market Research',
      },
    ]
  })

  // Dynamic center bases that are added
  const centerBasesMapped: KnowledgeBaseItem[] = CENTER_KNOWLEDGE_BASES_DATA.filter((c) =>
    addedCenterBaseIds.includes(c.id)
  ).map((c) => ({
    id: c.id,
    title: c.title,
    titleEn: c.titleEn,
    description: c.description,
    descriptionEn: c.descriptionEn,
    icon: c.icon,
    visibility: 'internal-private',
    sourceCount: c.sourcesCount,
    storageUsed: '5.2 MB',
    lastSynced: '已从知识库中心同步',
    activeConnections: ['Internal Deep Research Agent'],
    isSystem: false,
    isCenterBase: true,
    sources: c.sources || [],
  }))

  // Combined all active bases in Private Cloud Library
  const bases: KnowledgeBaseItem[] = [...customBases, ...centerBasesMapped]

  // Multi-base checkboxes selection for AI Engine
  const [selectedBaseIds, setSelectedBaseIds] = useState<string[]>([
    'res-product-private',
    'res-competitor',
  ])

  // Active workspace (null = grid view; baseId = entered single workspace)
  const [activeWorkspaceBaseId, setActiveWorkspaceBaseId] = useState<string | null>(null)

  // Pro Subscription / Permission State
  const [isProUser, setIsProUser] = useState<boolean>(false)

  // AI Model Selection State
  const [selectedModelId, setSelectedModelId] = useState<string>('gemini-2-5-pro')
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState<boolean>(false)
  const modelDropdownRef = useRef<HTMLDivElement>(null)

  // Skill System State
  const [activeSkillIds, setActiveSkillIds] = useState<string[]>(['skill-compliance'])
  const [isSkillMarketplaceOpen, setIsSkillMarketplaceOpen] = useState<boolean>(false)
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState<boolean>(false)
  const plusMenuRef = useRef<HTMLDivElement>(null)

  // Quick Inline Upload inside AI Input
  const [isQuickUploadModalOpen, setIsQuickUploadModalOpen] = useState<boolean>(false)
  const [quickUploadName, setQuickUploadName] = useState<string>('')
  const [quickUploadTargetBase, setQuickUploadTargetBase] = useState<string>('res-product-private')

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modelDropdownRef.current &&
        !modelDropdownRef.current.contains(event.target as Node)
      ) {
        setIsModelDropdownOpen(false)
      }
      if (
        plusMenuRef.current &&
        !plusMenuRef.current.contains(event.target as Node)
      ) {
        setIsPlusMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentModel =
    AI_RESEARCH_MODELS_DATA.find((m) => m.id === selectedModelId) ||
    AI_RESEARCH_MODELS_DATA[0]

  // File detail preview
  const [activeFileDetail, setActiveFileDetail] = useState<{
    file: KnowledgeSource
    baseTitle: string
  } | null>(null)

  // File rename state
  const [editingFileId, setEditingFileId] = useState<string | null>(null)
  const [editingFileName, setEditingFileName] = useState('')

  // Upload simulation inside Workspace
  const [uploadFileName, setUploadFileName] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  // Create new knowledge base modal
  const [isNewBaseModalOpen, setIsNewBaseModalOpen] = useState(false)
  const [newBaseTitle, setNewBaseTitle] = useState('')

  // Saved / Published feedback toast
  const [actionFeedback, setActionFeedback] = useState<{ message: string; id: string } | null>(null)

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'res-init-msg',
      sender: 'assistant',
      content:
        '🔒 **私有云库独立沙盒已挂载。**\n\n资料已完全隔离。您可在输入框左侧通过「＋」挂载专属技能 (Skills) 或上传文件。当前已接入【知识库中心】同步网络，已勾选知识库将进行多文档联合研报推理。',
      timestamp: '刚刚',
    },
  ])
  const [inputPrompt, setInputPrompt] = useState('')
  const [isAiThinking, setIsAiThinking] = useState(false)
  const [activeCitationPreview, setActiveCitationPreview] = useState<ChatCitation | null>(null)

  // Toggle Skill handler
  const handleToggleSkill = (skillId: string) => {
    if (activeSkillIds.includes(skillId)) {
      setActiveSkillIds(activeSkillIds.filter((id) => id !== skillId))
    } else {
      if (!isProUser && activeSkillIds.length >= 1) {
        // Free user: single skill replace
        setActiveSkillIds([skillId])
      } else {
        setActiveSkillIds([...activeSkillIds, skillId])
      }
    }
  }

  // Remove skill badge
  const handleRemoveSkill = (skillId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveSkillIds(activeSkillIds.filter((id) => id !== skillId))
  }

  // Checkbox toggle (controls right side AI research scope)
  const toggleBaseCheckbox = (baseId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (selectedBaseIds.includes(baseId)) {
      if (selectedBaseIds.length > 1) {
        setSelectedBaseIds(selectedBaseIds.filter((id) => id !== baseId))
      }
    } else {
      setSelectedBaseIds([...selectedBaseIds, baseId])
    }
  }

  // Active workspace base object
  const currentWorkspaceBase = bases.find((b) => b.id === activeWorkspaceBaseId) || null

  // Delete file from active base
  const handleDeleteFile = (sourceId: string) => {
    if (!activeWorkspaceBaseId) return
    setCustomBases((prev) =>
      prev.map((b) => {
        if (b.id === activeWorkspaceBaseId) {
          return {
            ...b,
            sources: b.sources.filter((s) => s.id !== sourceId),
          }
        }
        return b
      })
    )
    if (activeFileDetail?.file.id === sourceId) {
      setActiveFileDetail(null)
    }
  }

  // Save renamed file
  const handleSaveRename = (sourceId: string) => {
    if (!editingFileName.trim() || !activeWorkspaceBaseId) {
      setEditingFileId(null)
      return
    }
    setCustomBases((prev) =>
      prev.map((b) => {
        if (b.id === activeWorkspaceBaseId) {
          return {
            ...b,
            sources: b.sources.map((s) =>
              s.id === sourceId ? { ...s, name: editingFileName.trim() } : s
            ),
          }
        }
        return b
      })
    )
    setEditingFileId(null)
  }

  // File Drag & Drop + Click Upload
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const processUploadedFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    if (fileArray.length === 0 || !activeWorkspaceBaseId) return

    const newSources: KnowledgeSource[] = fileArray.map((file, idx) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf'
      return {
        id: `src-custom-${Date.now()}-${idx}`,
        name: file.name,
        type: ext === 'xlsx' || ext === 'csv' ? 'structured' : ext === 'md' ? 'markdown' : 'pdf',
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        updatedAt: '刚刚',
        visibility: 'internal-private',
        selected: true,
        summary: '最新上传的私密文档资料已完成沙盒解析与索引。',
      }
    })

    setCustomBases((prev) =>
      prev.map((b) => {
        if (b.id === activeWorkspaceBaseId) {
          return {
            ...b,
            sources: [...newSources, ...b.sources],
          }
        }
        return b
      })
    )
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFiles(e.dataTransfer.files)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processUploadedFiles(e.target.files)
    }
  }

  // Quick upload simulation from AI input '+' menu
  const handleQuickUpload = (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickUploadName.trim()) return

    const ext = quickUploadName.split('.').pop()?.toLowerCase() || 'pdf'
    const newSource: KnowledgeSource = {
      id: `src-quick-${Date.now()}`,
      name: quickUploadName.trim(),
      type: ext === 'xlsx' || ext === 'csv' ? 'structured' : ext === 'md' ? 'markdown' : 'pdf',
      size: '1.8 MB',
      updatedAt: '刚刚',
      visibility: 'internal-private',
      selected: true,
      summary: '已通过快捷通道上传至私密知识库并就绪。',
    }

    setCustomBases((prev) =>
      prev.map((b) => {
        if (b.id === quickUploadTargetBase) {
          return {
            ...b,
            sources: [newSource, ...b.sources],
          }
        }
        return b
      })
    )

    // Ensure target base is checked for retrieval
    if (!selectedBaseIds.includes(quickUploadTargetBase)) {
      setSelectedBaseIds([...selectedBaseIds, quickUploadTargetBase])
    }

    setIsQuickUploadModalOpen(false)
    setQuickUploadName('')
    showActionFeedback('文件已成功上传并挂载至检索空间', 'upload-ok')
  }

  // Create new private base
  const handleCreateNewBase = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBaseTitle.trim()) return

    const newBase: KnowledgeBaseItem = {
      id: `res-custom-${Date.now()}`,
      title: newBaseTitle.trim(),
      titleEn: newBaseTitle.trim(),
      description: '自定义企业内部私密知识库沙盒',
      descriptionEn: 'Custom internal private sandbox',
      icon: 'FolderLock',
      visibility: 'internal-private',
      sourceCount: 0,
      storageUsed: '0 MB',
      lastSynced: '刚刚',
      activeConnections: ['Private AI Engine'],
      isSystem: false,
      sources: [],
    }

    setCustomBases([newBase, ...customBases])
    setSelectedBaseIds([...selectedBaseIds, newBase.id])
    setNewBaseTitle('')
    setIsNewBaseModalOpen(false)
    setActiveWorkspaceBaseId(newBase.id)
  }

  // Feedback toast helper
  const showActionFeedback = (message: string, id: string) => {
    setActionFeedback({ message, id })
    setTimeout(() => setActionFeedback(null), 2500)
  }

  // Save AI Output locally
  const handleSaveOutput = (msgId: string) => {
    showActionFeedback('已保存至本地研报草稿箱', msgId)
  }

  // Publish AI Output to "我的知识" (Customer & GEO Knowledge Hub)
  const handlePublishToMyKnowledge = (msgId: string) => {
    showActionFeedback('已发布至「我的知识库 (Customer & GEO Hub)」', msgId)
  }

  // AI Chat submission with skills synthesis
  const handleSendMessage = (customPrompt?: string) => {
    const query = (customPrompt || inputPrompt).trim()
    if (!query || isAiThinking) return

    // Pro Check: If multi-base selected and user is NOT Pro, guide user
    const isMultiBase = selectedBaseIds.length > 1
    if (isMultiBase && !isProUser) {
      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'user',
        content: query,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setChatMessages((prev) => [
        ...prev,
        userMsg,
        {
          id: `msg-locked-${Date.now()}`,
          sender: 'assistant',
          content:
            '🔒 **多知识库联合检索受限**\n\n您当前勾选了 ' +
            selectedBaseIds.length +
            ' 个知识库。普通用户仅支持单库问答，跨库联合推理需升级 Pro。\n\n已自动切换为单库【' +
            (bases.find((b) => b.id === selectedBaseIds[0])?.title || '产品研发资料') +
            '】进行分析，或点击上方「升级 Pro」体验多库联合研究。',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
      setInputPrompt('')
      return
    }

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setChatMessages((prev) => [...prev, userMsg])
    setInputPrompt('')
    setIsAiThinking(true)

    // Active skills list
    const activeSkillObjects = AI_SKILLS_LIBRARY.filter((s) => activeSkillIds.includes(s.id))

    // Synthesize research response with selected model and active skills
    setTimeout(() => {
      const response = generateSynthesisResponse(query, selectedBaseIds, bases, currentModel, activeSkillObjects)
      setChatMessages((prev) => [...prev, response])
      setIsAiThinking(false)
    }, 950)
  }

  // Preset question prompts
  const presetQuestions = [
    '分析我们与 Bose QC Ultra 在 BOM 物料成本上的差距',
    '汇总欧洲 GPSR 与电池护照法规对我司产线的要求',
    '结合国际物流 HS Code 规则分析关税税率优化方案',
  ]

  // Selected bases names for right header
  const selectedBaseObjects = bases.filter((b) => selectedBaseIds.includes(b.id))
  const isMultiSelected = selectedBaseIds.length > 1

  // Active skill objects for chips in input
  const activeSkillObjects = AI_SKILLS_LIBRARY.filter((s) => activeSkillIds.includes(s.id))

  return (
    <div className="space-y-4">
      {/* 1. Module Top Identity & Security Sandbox Banner */}
      <div
        id="private-cloud-header"
        className="p-5 rounded-[24px] bg-white/65 backdrop-blur-[20px] backdrop-saturate-[180%] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-[16px] bg-[#111827] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Lock size={18} className="text-purple-300" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-sm sm:text-base font-bold text-[#111827] tracking-tight">
                私有云库
              </h2>
              <span className="px-2.5 py-0.5 rounded-[8px] bg-purple-50 text-purple-700 border border-purple-200/60 text-[10px] font-semibold flex items-center gap-1">
                <Shield size={11} />
                <span>完全私密隔离</span>
              </span>
              {addedCenterBaseIds.length > 0 && (
                <span className="px-2 py-0.5 rounded-[8px] bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200/50 flex items-center gap-1">
                  <Compass size={11} />
                  <span>已关联 {addedCenterBaseIds.length} 个中心库</span>
                </span>
              )}
            </div>
            <p className="text-xs text-[#6B7280] mt-0.5">
              知识库负责提供资料，AI 分析空间负责调用资料与技能，知识库中心与技能中心构成生态入口。
            </p>
          </div>
        </div>

        {/* Action Buttons: Pro Switch */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="pro-toggle-btn"
            onClick={() => setIsProUser(!isProUser)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[8px] text-xs font-semibold transition-all cursor-pointer ${
              isProUser
                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                : 'bg-white hover:bg-gray-50 border border-[#E5E7EB] text-[#111827]'
            }`}
          >
            <Zap size={13} className={isProUser ? 'text-amber-300' : 'text-purple-600'} />
            <span>{isProUser ? 'Pro 已激活 (多库/多技能)' : '升级 Pro 解锁多库多技能'}</span>
          </button>
        </div>
      </div>

      {/* Action Feedback Toast */}
      {actionFeedback && (
        <div className="p-3 rounded-[12px] bg-purple-600 text-white text-xs font-bold flex items-center justify-between shadow-md animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Check size={14} className="text-amber-300" />
            <span>{actionFeedback.message}</span>
          </div>
          <span className="text-[10px] text-purple-200">已生效</span>
        </div>
      )}

      {/* 2. Main NotebookLM Split Layout: Left Knowledge Base Cards Grid / Workspace; Right AI Research Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[620px]">
        {/* ================= LEFT COLUMN (5 Cols): Knowledge Base Sandbox Cards OR Entered Workspace ================= */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <AnimatePresence mode="wait">
            {!activeWorkspaceBaseId ? (
              /* VIEW A: Knowledge Base Cards Grid */
              <motion.div
                key="grid-view"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="flex-1 flex flex-col p-4 rounded-[24px] bg-white/65 backdrop-blur-[20px] backdrop-saturate-[180%] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] space-y-3.5"
              >
                {/* Section Header: [知识库中心] (入口迁移至此，原新建库按钮移至底部特殊卡片) */}
                <div className="flex items-center justify-between pb-1 border-b border-[#E5E7EB]/60">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#111827] tracking-wide">
                      知识库列表
                    </span>
                    <span className="px-2 py-0.5 rounded-[8px] bg-gray-100 text-gray-600 text-[10px] font-semibold">
                      {bases.length} 个库
                    </span>
                  </div>
                  {onNavigateToCenter && (
                    <button
                      type="button"
                      id="knowledge-center-nav-btn"
                      onClick={onNavigateToCenter}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-white hover:bg-gray-50 border border-[#E5E7EB] text-xs font-semibold text-[#111827] transition-all cursor-pointer shadow-2xs"
                      title="前往知识库中心浏览并添加行业公共库"
                    >
                      <Compass size={13} className="text-purple-600" />
                      <span>知识库中心</span>
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-[#6B7280]">
                  勾选复选框可调整右侧 AI 检索范围；点击卡片进入该库管理文件。
                </p>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                  {bases.map((base) => {
                    const isChecked = selectedBaseIds.includes(base.id)
                    const isCenter = !!(base as any).isCenterBase

                    return (
                      <div
                        key={base.id}
                        id={`base-card-${base.id}`}
                        onClick={() => setActiveWorkspaceBaseId(base.id)}
                        className={`group relative p-3.5 rounded-[16px] border transition-all cursor-pointer flex flex-col justify-between select-none ${
                          isChecked
                            ? 'bg-purple-50/70 border-purple-300 shadow-xs'
                            : isCenter
                            ? 'bg-white/90 hover:bg-purple-50/30 border-purple-200/80 shadow-2xs'
                            : 'bg-white hover:bg-gray-50/80 border-[#E5E7EB]'
                        }`}
                      >
                        {/* Top: Icon + Title + Checkbox */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 ${
                                isCenter ? 'bg-purple-900 text-purple-200' : 'bg-[#111827] text-white'
                              }`}
                            >
                              {renderBaseIcon(base.id, base.icon)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1">
                                <h4 className="text-xs font-bold text-[#111827] truncate leading-tight">
                                  {base.title}
                                </h4>
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                {isCenter ? (
                                  <span className="px-1.5 py-0.2 rounded-[4px] bg-purple-100 text-purple-800 text-[9px] font-bold">
                                    中心库
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-[#6B7280]">私密沙盒</span>
                                )}
                                <span className="text-[11px] text-[#6B7280]">
                                  {base.sources.length} 个文件
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Checkbox (Controls AI retrieval scope) */}
                          <button
                            type="button"
                            id={`checkbox-${base.id}`}
                            onClick={(e) => toggleBaseCheckbox(base.id, e)}
                            className="p-1 text-gray-400 hover:text-purple-600 transition-colors shrink-0 cursor-pointer"
                            title="勾选加入 AI 检索范围"
                          >
                            {isChecked ? (
                              <CheckSquare size={16} className="text-purple-600" />
                            ) : (
                              <Square size={16} />
                            )}
                          </button>
                        </div>

                        {/* Bottom: Minimal status & actions */}
                        <div className="pt-2.5 mt-2 border-t border-[#E5E7EB]/60 flex items-center justify-between text-[10px] text-[#6B7280]">
                          <span className="text-purple-700 font-medium">
                            {isCenter ? '已接入检索' : '点击进入库'}
                          </span>
                          <div className="flex items-center gap-2">
                            {isCenter && onToggleAddCenterBase && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onToggleAddCenterBase(base.id)
                                }}
                                className="text-gray-400 hover:text-rose-600 transition-colors"
                                title="从私有云库移除"
                              >
                                移除
                              </button>
                            )}
                            <span className="group-hover:translate-x-0.5 transition-transform text-[#111827] font-semibold">
                              管理 →
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {/* 特殊创建卡片：半透明彩色 Liquid Glass 卡片 (新建库入口位于列表最底部) */}
                  <div
                    id="new-base-special-card"
                    onClick={() => setIsNewBaseModalOpen(true)}
                    className="p-4 rounded-[16px] border-2 border-dashed border-purple-300/80 hover:border-purple-500 bg-gradient-to-br from-purple-500/10 via-white/50 to-indigo-500/10 backdrop-blur-[16px] backdrop-saturate-[180%] shadow-[0_8px_24px_rgba(139,92,246,0.08)] hover:shadow-[0_12px_32px_rgba(139,92,246,0.16)] flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:scale-[1.01] group min-h-[110px]"
                  >
                    <div className="w-9 h-9 rounded-[12px] bg-purple-100/90 text-purple-700 flex items-center justify-center mb-2 group-hover:bg-purple-600 group-hover:text-white transition-colors shadow-2xs">
                      <Plus size={18} />
                    </div>
                    <span className="text-xs font-bold text-purple-950 group-hover:text-purple-700 tracking-wide transition-colors">
                      新建库
                    </span>
                    <span className="text-[10px] text-purple-600/80 mt-0.5">
                      新增独立私密知识沙盒
                    </span>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* VIEW B: Entered Single Knowledge Base Workspace (单库工作区) */
              <motion.div
                key="workspace-view"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                className="flex-1 flex flex-col p-4 sm:p-5 rounded-[24px] bg-white/65 backdrop-blur-[20px] backdrop-saturate-[180%] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] space-y-4"
              >
                {/* Top Navigation Bar inside Workspace */}
                <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]/60">
                  <button
                    type="button"
                    id="back-to-bases-btn"
                    onClick={() => setActiveWorkspaceBaseId(null)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#6B7280] hover:text-[#111827] transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    <span>返回知识库列表</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {(currentWorkspaceBase as any)?.isCenterBase ? (
                      <span className="px-2 py-0.5 rounded-[6px] bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
                        知识库中心已同步
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-[6px] bg-gray-100 text-gray-600 text-[10px] font-medium">
                        独立私密沙盒
                      </span>
                    )}
                  </div>
                </div>

                {/* Workspace Title & Description */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-[8px] bg-[#111827] text-white flex items-center justify-center shrink-0">
                      {renderBaseIcon(currentWorkspaceBase?.id || '', currentWorkspaceBase?.icon)}
                    </div>
                    <h3 className="text-sm font-bold text-[#111827]">
                      {currentWorkspaceBase?.title}
                    </h3>
                  </div>
                  <p className="text-xs text-[#6B7280]">
                    {currentWorkspaceBase?.description}
                  </p>
                </div>

                {/* File List in Active Base */}
                <div className="space-y-2 flex-1 overflow-y-auto max-h-[320px] custom-scroll pr-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#111827]">
                    <span>文件列表 ({currentWorkspaceBase?.sources.length || 0})</span>
                  </div>

                  <div className="space-y-1.5">
                    {currentWorkspaceBase?.sources.map((file) => {
                      const isEditing = editingFileId === file.id

                      return (
                        <div
                          key={file.id}
                          id={`file-item-${file.id}`}
                          onClick={() => {
                            if (!isEditing) {
                              setActiveFileDetail({
                                file,
                                baseTitle: currentWorkspaceBase.title,
                              })
                            }
                          }}
                          className="group p-2.5 rounded-[12px] bg-white hover:bg-purple-50/40 border border-[#E5E7EB] hover:border-purple-200 transition-all flex items-center justify-between gap-2.5 cursor-pointer shadow-2xs"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="w-7 h-7 rounded-[8px] bg-gray-100 flex items-center justify-center shrink-0">
                              {renderFileIcon(file.type)}
                            </div>

                            {isEditing ? (
                              <div
                                className="flex items-center gap-1.5 flex-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="text"
                                  value={editingFileName}
                                  onChange={(e) => setEditingFileName(e.target.value)}
                                  className="w-full h-7 px-2 text-xs rounded-[6px] bg-white border border-purple-400 focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveRename(file.id)}
                                  className="px-2 py-1 rounded-[6px] bg-[#111827] text-white text-[11px] font-semibold"
                                >
                                  保存
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingFileId(null)}
                                  className="p-1 text-gray-400 hover:text-gray-700"
                                >
                                  <X size={13} />
                                </button>
                              </div>
                            ) : (
                              <div className="min-w-0 flex-1">
                                <span
                                  className="text-xs font-bold text-[#111827] truncate block"
                                  title={file.name}
                                >
                                  {file.name}
                                </span>
                                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#6B7280]">
                                  <span className="text-emerald-600 font-medium">● 正常</span>
                                  <span>{file.size}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Hover Actions (编辑 / 删除) */}
                          {!isEditing && (
                            <div
                              className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                id={`edit-file-${file.id}`}
                                onClick={() => {
                                  setEditingFileId(file.id)
                                  setEditingFileName(file.name)
                                }}
                                className="p-1 rounded-[6px] text-gray-500 hover:text-[#111827] hover:bg-gray-100 transition-colors"
                                title="编辑文件名"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                type="button"
                                id={`delete-file-${file.id}`}
                                onClick={() => handleDeleteFile(file.id)}
                                className="p-1 rounded-[6px] text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="删除文件"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {currentWorkspaceBase?.sources.length === 0 && (
                      <div className="py-8 text-center text-xs text-[#9CA3AF]">
                        当前知识库暂无文件，请在下方上传。
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Zone (长条长方形内部仅加号，无任何文字) */}
                <div className="pt-2 border-t border-[#E5E7EB]/60">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.md,.markdown,.docx,.doc,.xlsx,.xls,.csv,.json,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`group w-full h-12 sm:h-13 rounded-[16px] border-2 border-dashed transition-all flex items-center justify-center cursor-pointer select-none ${
                      isDragging
                        ? 'border-purple-500 bg-purple-50/80 scale-[1.005] shadow-md'
                        : 'border-[#E5E7EB] hover:border-purple-400 bg-white/60 hover:bg-white shadow-2xs'
                    }`}
                    title="点击或拖拽文件上传"
                  >
                    <div className="w-8 h-8 rounded-full bg-white group-hover:scale-110 flex items-center justify-center text-purple-600 shadow-xs border border-gray-100 transition-transform">
                      <Plus size={20} strokeWidth={2.5} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Minimal File Detail Drawer / Popover */}
          {activeFileDetail && (
            <div
              id="file-detail-card"
              className="p-3.5 rounded-[16px] bg-white border border-purple-200 shadow-[0_8px_32px_rgba(0,0,0,0.04)] space-y-2.5 relative animate-in fade-in slide-in-from-bottom-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-[8px] bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                    <FileText size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#111827] leading-tight line-clamp-1">
                      {activeFileDetail.file.name}
                    </h4>
                    <span className="text-[10px] text-purple-700 font-medium">
                      所属库：{activeFileDetail.baseTitle}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveFileDetail(null)}
                  className="text-gray-400 hover:text-[#111827] p-1"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Minimal Info Grid */}
              <div className="grid grid-cols-3 gap-2 py-1.5 border-y border-[#E5E7EB]/60 text-[10px]">
                <div>
                  <span className="text-[#6B7280] block">大小</span>
                  <span className="font-bold text-[#111827]">{activeFileDetail.file.size}</span>
                </div>
                <div>
                  <span className="text-[#6B7280] block">更新日期</span>
                  <span className="font-bold text-[#111827]">{activeFileDetail.file.updatedAt}</span>
                </div>
                <div>
                  <span className="text-[#6B7280] block">状态</span>
                  <span className="font-bold text-emerald-600">正常 (已就绪)</span>
                </div>
              </div>

              {activeFileDetail.file.summary && (
                <p className="text-[11px] text-[#4B5563] leading-relaxed bg-[#F9FAFB] p-2.5 rounded-[8px] border border-[#E5E7EB]">
                  {activeFileDetail.file.summary}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ================= RIGHT COLUMN (7 Cols): AI Research Engine (AI 分析空间) ================= */}
        <div
          id="ai-research-engine"
          className="lg:col-span-7 flex flex-col rounded-[24px] bg-white/65 backdrop-blur-[20px] backdrop-saturate-[180%] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] overflow-hidden"
        >
          {/* Engine Header & Model Selector + Scope Indicator */}
          <div className="p-4 border-b border-[#E5E7EB]/70 bg-white/50 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-[#111827]">AI 分析空间</span>
              </div>
              {/* Selected Bases Scope Display */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-[#6B7280] font-medium">当前知识:</span>
                {selectedBaseObjects.map((base) => (
                  <span
                    key={base.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-purple-100 text-purple-800 text-[10px] font-semibold"
                  >
                    <Check size={10} />
                    <span>{base.title}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Model Selector + Pro Permission Status Indicator */}
            <div className="flex items-center gap-2">
              {/* Model Selector Dropdown (Apple Liquid Glass style) */}
              <div className="relative" ref={modelDropdownRef}>
                <button
                  type="button"
                  id="model-selector-btn"
                  onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-white/90 hover:bg-white border border-[#E5E7EB] hover:border-purple-300 text-xs font-semibold text-[#111827] shadow-2xs transition-all cursor-pointer"
                  title="切换 AI 研究模型"
                >
                  <Sparkles size={12} className="text-purple-600" />
                  <span>{currentModel.name}</span>
                  <span className="text-[9px] text-purple-700 bg-purple-50 px-1 py-0.2 rounded font-bold">
                    {currentModel.tag}
                  </span>
                  <ChevronDown size={12} className="text-gray-400" />
                </button>

                {/* Dropdown Menu */}
                {isModelDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-64 p-1.5 rounded-[16px] bg-white/95 backdrop-blur-[20px] border border-purple-200/80 shadow-[0_12px_36px_rgba(0,0,0,0.12)] z-30 space-y-1 animate-in fade-in zoom-in-95">
                    <div className="px-2.5 py-1 text-[10px] font-bold text-[#6B7280] border-b border-[#E5E7EB]/60">
                      选择 AI 研究模型
                    </div>
                    {AI_RESEARCH_MODELS_DATA.map((model) => {
                      const isSelected = model.id === selectedModelId
                      return (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() => {
                            setSelectedModelId(model.id)
                            setIsModelDropdownOpen(false)
                          }}
                          className={`w-full text-left p-2 rounded-[10px] text-xs transition-colors flex items-start justify-between gap-2 cursor-pointer ${
                            isSelected
                              ? 'bg-purple-50 text-purple-950 font-bold border border-purple-200/60'
                              : 'hover:bg-gray-50 text-[#111827]'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold">{model.name}</span>
                              <span className="text-[9px] text-purple-700 bg-purple-100/70 px-1 py-0.2 rounded font-bold">
                                {model.tag}
                              </span>
                            </div>
                            <p className="text-[10px] text-[#6B7280] leading-snug line-clamp-2">
                              {model.description}
                            </p>
                          </div>
                          {isSelected && (
                            <Check size={14} className="text-purple-600 shrink-0 mt-0.5" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Mode indicator */}
              <div>
                {isMultiSelected || activeSkillIds.length > 1 ? (
                  isProUser ? (
                    <span className="px-2.5 py-1 rounded-[8px] bg-purple-600 text-white text-[10px] font-bold shadow-2xs flex items-center gap-1">
                      <Zap size={11} />
                      <span>Pro 组合模式</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-[8px] bg-amber-50 border border-amber-300 text-amber-800 text-[10px] font-bold flex items-center gap-1">
                      <Lock size={10} />
                      <span>单技能/单库</span>
                    </span>
                  )
                ) : (
                  <span className="px-2.5 py-1 rounded-[8px] bg-gray-100 text-gray-700 text-[10px] font-semibold">
                    基础模式
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Pro Lock Notice Banner if Multi-Selected & Not Pro */}
          {((isMultiSelected || activeSkillIds.length > 1) && !isProUser) && (
            <div className="mx-4 mt-3 p-3 rounded-[12px] bg-amber-50/90 border border-amber-200/80 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-amber-900">
                <Lock size={14} className="text-amber-600 shrink-0" />
                <span>
                  普通用户支持单库与单 Skill 使用。升级 Pro 解锁<strong>多知识库联合检索</strong>与<strong>多 Skill 组合（合规+竞品+文案）</strong>。
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsProUser(true)}
                className="px-3 py-1 rounded-[8px] bg-[#111827] hover:bg-black text-white font-bold text-[11px] shrink-0 cursor-pointer"
              >
                解锁体验
              </button>
            </div>
          )}

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
                  <div className="w-7 h-7 rounded-[10px] bg-[#111827] text-purple-300 flex items-center justify-center shrink-0 shadow-2xs">
                    <Sparkles size={13} />
                  </div>
                )}

                <div
                  className={`max-w-[88%] rounded-[16px] p-4 space-y-2.5 ${
                    msg.sender === 'user'
                      ? 'bg-[#111827] text-white rounded-tr-xs'
                      : 'bg-white text-[#111827] rounded-tl-xs border border-[#E5E7EB] shadow-2xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed space-y-2">
                    {msg.content}
                  </div>

                  {/* Private Citations */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="pt-2.5 border-t border-[#E5E7EB] space-y-1.5">
                      <span className="text-[10px] font-bold text-purple-700 block">
                        私密来源溯源:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.citations.map((cite) => (
                          <button
                            key={cite.id}
                            type="button"
                            onClick={() => setActiveCitationPreview(cite)}
                            className="px-2 py-1 rounded-[6px] bg-purple-50 hover:bg-purple-100 border border-purple-200 text-[10px] font-medium text-[#111827] flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Lock size={9} className="text-purple-600" />
                            <span className="truncate max-w-[190px]">{cite.sourceName}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Output Actions: [保存] [发布到我的知识] */}
                  {msg.sender === 'assistant' && msg.id !== 'res-init-msg' && (
                    <div className="pt-2.5 mt-1 border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          id={`save-output-btn-${msg.id}`}
                          onClick={() => handleSaveOutput(msg.id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-[6px] bg-gray-100 hover:bg-gray-200 text-[#111827] text-[10px] font-semibold transition-colors cursor-pointer"
                          title="保存研报至草稿箱"
                        >
                          <Bookmark size={11} className="text-purple-600" />
                          <span>保存</span>
                        </button>
                        <button
                          type="button"
                          id={`publish-output-btn-${msg.id}`}
                          onClick={() => handlePublishToMyKnowledge(msg.id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-[6px] bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-bold transition-colors cursor-pointer"
                          title="将分析成果发布到「我的知识 (Customer & GEO Knowledge Hub)」"
                        >
                          <Share2 size={11} className="text-purple-700" />
                          <span>发布到我的知识</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1 text-[9px] text-gray-400">
                        <span className="text-purple-600 font-medium">
                          [{currentModel.name}]
                        </span>
                        <span>{msg.timestamp}</span>
                      </div>
                    </div>
                  )}

                  {msg.sender !== 'assistant' && (
                    <div className="text-right text-[9px] text-gray-400 pt-0.5">
                      {msg.timestamp}
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-[10px] bg-[#111827] text-white flex items-center justify-center shrink-0">
                    <User size={13} />
                  </div>
                )}
              </div>
            ))}

            {isAiThinking && (
              <div className="flex gap-3 items-center text-xs text-purple-700 p-3">
                <div className="w-7 h-7 rounded-[10px] bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 animate-spin">
                  <Sparkles size={13} />
                </div>
                <span>
                  {currentModel.name} 正在挂载技能 [{activeSkillObjects.map((s) => s.name).join(' + ') || '基础研报'}] 进行多文档联合推理…
                </span>
              </div>
            )}
          </div>

          {/* Citation Popover if clicked */}
          {activeCitationPreview && (
            <div className="mx-4 mb-2 p-3 bg-purple-50/95 border border-purple-200 rounded-[12px] text-xs relative flex items-start justify-between gap-2 animate-in fade-in slide-in-from-bottom-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-purple-900">机密文档摘录:</span>
                  <span className="text-[10px] text-purple-700 font-semibold">
                    {activeCitationPreview.sourceName}
                  </span>
                </div>
                <p className="text-[11px] text-purple-950/80 leading-relaxed italic bg-white/80 p-2 rounded-[6px] border border-purple-200">
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
          <div className="px-4 py-2 border-t border-[#E5E7EB]/60 bg-white/40 flex items-center gap-1.5 overflow-x-auto custom-scroll shrink-0">
            <span className="text-[10px] font-bold text-[#6B7280] shrink-0">研报指令:</span>
            {presetQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q)}
                className="px-2.5 py-1 rounded-[8px] bg-white hover:bg-gray-100 border border-[#E5E7EB] text-[11px] font-medium text-[#111827] whitespace-nowrap transition-colors cursor-pointer shadow-2xs shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Core AI Input Area (全新架构：＋ 操作菜单 | 当前技能卡片 | 输入内容 | 发送) */}
          <div className="p-3 sm:p-4 border-t border-[#E5E7EB]/60 bg-white/70 backdrop-blur-md shrink-0 space-y-2">
            {/* Active Skills Bar / Chips extending to the right */}
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scroll py-0.5">
              <span className="text-[10px] font-bold text-[#6B7280] shrink-0 flex items-center gap-1">
                <Sparkles size={11} className="text-purple-600" />
                <span>当前技能:</span>
              </span>

              {activeSkillObjects.map((skill) => (
                <div
                  key={skill.id}
                  id={`active-skill-badge-${skill.id}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] bg-purple-100/90 text-purple-900 text-xs font-bold border border-purple-300/80 shadow-2xs shrink-0 animate-in fade-in zoom-in-95"
                >
                  <span className="text-purple-700">{renderSkillMiniIcon(skill.icon)}</span>
                  <span>{skill.name}</span>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveSkill(skill.id, e)}
                    className="p-0.5 text-purple-500 hover:text-purple-950 rounded-full transition-colors cursor-pointer ml-0.5"
                    title="移除此技能"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {activeSkillObjects.length === 0 && (
                <span className="text-[11px] text-[#9CA3AF] italic">
                  未挂载技能，点击左侧「＋」添加技能
                </span>
              )}

              {/* [更多技能] 按钮：进入 Skill 广场 */}
              <button
                type="button"
                id="more-skills-btn"
                onClick={() => setIsSkillMarketplaceOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] bg-white hover:bg-gray-50 border border-[#E5E7EB] hover:border-purple-300 text-xs font-semibold text-purple-700 transition-all cursor-pointer shadow-2xs shrink-0 ml-1"
                title="打开技能中心浏览更多 AI 技能"
              >
                <Compass size={12} className="text-purple-600" />
                <span>更多技能</span>
              </button>
            </div>

            {/* Input Form with Left "+" Menu Button */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
              className="flex items-center gap-2 relative"
            >
              {/* "+" Action Menu Trigger */}
              <div className="relative" ref={plusMenuRef}>
                <button
                  type="button"
                  id="ai-plus-menu-btn"
                  onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
                  className={`w-10 h-10 rounded-[10px] flex items-center justify-center transition-all cursor-pointer shadow-2xs shrink-0 ${
                    isPlusMenuOpen
                      ? 'bg-[#111827] text-white'
                      : 'bg-white hover:bg-gray-100 border border-[#E5E7EB] text-[#111827]'
                  }`}
                  title="展开操作菜单 (上传文件 / 添加技能)"
                >
                  <Plus size={16} className={isPlusMenuOpen ? 'rotate-45 transition-transform' : 'transition-transform'} />
                </button>

                {/* Popover Menu: [上传文件] / [添加技能] */}
                {isPlusMenuOpen && (
                  <div
                    id="plus-action-menu"
                    className="absolute left-0 bottom-full mb-2 w-44 p-1.5 rounded-[16px] bg-white/95 backdrop-blur-[20px] border border-purple-200/80 shadow-[0_12px_36px_rgba(0,0,0,0.12)] z-30 space-y-1 animate-in fade-in zoom-in-95"
                  >
                    <button
                      type="button"
                      id="menu-upload-file-btn"
                      onClick={() => {
                        setIsPlusMenuOpen(false)
                        setIsQuickUploadModalOpen(true)
                      }}
                      className="w-full text-left px-3 py-2 rounded-[10px] text-xs font-semibold text-[#111827] hover:bg-purple-50 hover:text-purple-900 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <UploadCloud size={14} className="text-purple-600" />
                      <span>上传文件</span>
                    </button>

                    <button
                      type="button"
                      id="menu-add-skill-btn"
                      onClick={() => {
                        setIsPlusMenuOpen(false)
                        setIsSkillMarketplaceOpen(true)
                      }}
                      className="w-full text-left px-3 py-2 rounded-[10px] text-xs font-semibold text-[#111827] hover:bg-purple-50 hover:text-purple-900 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles size={14} className="text-purple-600" />
                      <span>添加技能</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Text Input */}
              <input
                type="text"
                id="research-input-prompt"
                placeholder={
                  activeSkillObjects.length > 0
                    ? `[${activeSkillObjects.map((s) => s.name).join(' + ')}] 输入研究指令，例如：分析这些资料中的风险与成本…`
                    : `向已选 ${selectedBaseIds.length} 个知识库提问 (${currentModel.name})…`
                }
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                disabled={isAiThinking}
                className="flex-1 h-10 pl-3.5 pr-3 rounded-[10px] bg-white border border-[#E5E7EB] text-xs text-[#111827] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#111827]"
              />

              {/* Send Button */}
              <button
                type="submit"
                id="send-research-prompt-btn"
                disabled={!inputPrompt.trim() || isAiThinking}
                className="h-10 px-5 rounded-[10px] bg-[#111827] hover:bg-black disabled:bg-gray-200 text-white disabled:text-gray-400 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed shrink-0"
              >
                <Send size={13} />
                <span>发送</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Skill Marketplace Modal (技能中心生态广场) */}
      <SkillMarketplaceModal
        isOpen={isSkillMarketplaceOpen}
        onClose={() => setIsSkillMarketplaceOpen(false)}
        activeSkillIds={activeSkillIds}
        onToggleSkill={handleToggleSkill}
        isProUser={isProUser}
      />

      {/* Quick Upload File Modal */}
      {isQuickUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-xs"
            onClick={() => setIsQuickUploadModalOpen(false)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-[24px] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-[#E5E7EB] z-10 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
              <h3 className="text-sm font-bold text-[#111827]">快捷上传资料至私有库</h3>
              <button
                onClick={() => setIsQuickUploadModalOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickUpload} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">
                  目标知识库
                </label>
                <select
                  value={quickUploadTargetBase}
                  onChange={(e) => setQuickUploadTargetBase(e.target.value)}
                  className="w-full h-8 px-2 text-xs rounded-[8px] bg-white border border-[#E5E7EB] text-[#111827] focus:outline-none"
                >
                  {customBases.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">
                  文件名称
                </label>
                <input
                  type="text"
                  placeholder="例如：2026_Q3_供应商审核底稿.pdf"
                  value={quickUploadName}
                  onChange={(e) => setQuickUploadName(e.target.value)}
                  className="w-full h-8 px-3 rounded-[8px] bg-white border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuickUploadModalOpen(false)}
                  className="px-3 py-1.5 rounded-[8px] bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-[#111827]"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={!quickUploadName.trim()}
                  className="px-4 py-1.5 rounded-[8px] bg-[#111827] hover:bg-black disabled:bg-gray-200 text-white disabled:text-gray-400 text-xs font-bold shadow-xs cursor-pointer"
                >
                  上传
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Knowledge Base Modal */}
      {isNewBaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-xs"
            onClick={() => setIsNewBaseModalOpen(false)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-[24px] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-[#E5E7EB] z-10 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
              <h3 className="text-sm font-bold text-[#111827]">新建私密知识库</h3>
              <button
                onClick={() => setIsNewBaseModalOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewBase} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">
                  知识库名称
                </label>
                <input
                  type="text"
                  placeholder="例如：2026 供应链审核底稿"
                  value={newBaseTitle}
                  onChange={(e) => setNewBaseTitle(e.target.value)}
                  className="w-full h-9 px-3 rounded-[8px] bg-white border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewBaseModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-[8px] bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-[#111827]"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={!newBaseTitle.trim()}
                  className="px-4 py-1.5 rounded-[8px] bg-[#111827] hover:bg-black disabled:bg-gray-200 text-white disabled:text-gray-400 text-xs font-bold shadow-xs cursor-pointer"
                >
                  创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function renderBaseIcon(baseId: string, iconName?: string) {
  if (iconName === 'Scale' || baseId === 'res-compliance' || baseId === 'hub-eu-reg') {
    return <Scale size={15} />
  }
  if (iconName === 'Truck' || baseId === 'hub-logistics') {
    return <Truck size={15} />
  }
  if (iconName === 'TrendingUp' || baseId === 'res-market' || baseId === 'hub-market-trends') {
    return <TrendingUp size={15} />
  }
  if (iconName === 'ShieldCheck' || baseId === 'hub-electronics-safety') {
    return <ShieldCheck size={15} />
  }
  if (iconName === 'FileCheck2' || baseId === 'hub-trade-contract') {
    return <FileCheck2 size={15} />
  }
  if (iconName === 'Leaf' || baseId === 'hub-green-package') {
    return <Leaf size={15} />
  }
  switch (baseId) {
    case 'res-product-private':
      return <Cpu size={15} />
    case 'res-competitor':
      return <Crosshair size={15} />
    case 'res-compliance':
      return <Scale size={15} />
    case 'res-market':
      return <BarChart3 size={15} />
    default:
      return <FolderLock size={15} />
  }
}

function renderFileIcon(type: string) {
  switch (type) {
    case 'pdf':
      return <FileText size={14} className="text-rose-500" />
    case 'structured':
      return <FileSpreadsheet size={14} className="text-emerald-600" />
    case 'markdown':
      return <FileCode size={14} className="text-blue-500" />
    default:
      return <FileText size={14} className="text-gray-500" />
  }
}

function renderSkillMiniIcon(icon: string) {
  switch (icon) {
    case 'Scale':
      return <Scale size={12} />
    case 'Crosshair':
      return <Crosshair size={12} />
    case 'Sparkles':
      return <Sparkles size={12} />
    case 'ShoppingBag':
      return <ShoppingBag size={12} />
    case 'Truck':
      return <Truck size={12} />
    case 'ShieldCheck':
      return <ShieldCheck size={12} />
    case 'TrendingUp':
      return <TrendingUp size={12} />
    default:
      return <Bot size={12} />
  }
}

function generateSynthesisResponse(
  query: string,
  selectedBaseIds: string[],
  bases: KnowledgeBaseItem[],
  model: AiResearchModelOption,
  activeSkills: AiSkillItem[]
): ChatMessage {
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const skillNames = activeSkills.map((s) => s.name).join(' + ')
  const skillHeader = skillNames ? ` · 挂载技能 [${skillNames}]` : ''

  if (query.includes('BOM') || query.includes('Bose') || query.includes('成本') || query.includes('竞品')) {
    return {
      id: `resp-res-${Date.now()}`,
      sender: 'assistant',
      content: `### 📊 竞品 BOM 成本与硬件架构对标 (${model.name}${skillHeader})\n\n基于《CONFIDENTIAL_BOM_Cost_Breakdown_Q3.xlsx》与《Teardown_Bose_QC_Ultra_vs_OmniVibe.pdf》比对分析：\n\n1. **主控蓝牙 SoC 方案**：\n   - **我司方案**：选用高通 QCC5171 ($4.85 / 颗)，支持 Snapdragon Sound 与 LDAC。\n   - **Bose QC Ultra**：定制版芯片 + 独立 DSP 协处理器，采购成本约 $6.20。\n\n2. **声学单元与降噪麦克风**：\n   - 我司采用 40mm 碳纤维振膜单元 ($3.10) + 6 麦克风阵列 ($1.45)。\n   - 竞品降噪深度高出约 2.3 dB，但我司在中高频人声分离度具备优势。\n\n3. **综合物料成本 (BOM)**：\n   - 我司全套单机物料成本为 **$42.80**，在 $199 零售价下硬件毛利率为 **78.5%**。\n\n💡 **技能强化洞察**：在物料成本领先的前提下，建议在独立站文案强化「人声清晰度与续航领先」的差异化卖点。`,
      timestamp,
      citations: [
        {
          id: 'cite-1',
          sourceId: 'src-pvt-1',
          sourceName: 'CONFIDENTIAL_BOM_Cost_Breakdown_Q3.xlsx',
          excerpt: '全组件采购单价：QCC5171 主控 $4.85，40mm 碳纤维振膜 $3.10，锂电池 $2.40，总 BOM $42.80。',
          confidence: 0.99,
        },
        {
          id: 'cite-2',
          sourceId: 'src-comp-1',
          sourceName: 'Teardown_Bose_QC_Ultra_vs_OmniVibe.pdf',
          excerpt: 'Bose QC Ultra 降噪深度实测 38.5 dB，OmniVibe 为 36.2 dB，人声抑制表现相当。',
          confidence: 0.96,
        },
      ],
    }
  }

  if (query.includes('电池') || query.includes('欧盟') || query.includes('法规') || query.includes('GPSR') || query.includes('合规') || query.includes('风险')) {
    return {
      id: `resp-res-${Date.now()}`,
      sender: 'assistant',
      content: `### ⚖️ 欧盟通用商品安全条例 (GPSR) 与电池护照合规审查 (${model.name}${skillHeader})\n\n基于《EU_GPSR_General_Product_Safety_2026.pdf》与《EU_Battery_Regulation_2026_Mandatory_Passports.pdf》跨库审查：\n\n1. **欧代与安全标签责任 (高风险)**：\n   - 必须在产品机身及外包装激光丝印欧盟授权代表 (EU RP) 实体名称与电子邮箱。\n   - 包装正面须附带六国语言安全警告与回收标志。\n\n2. **数字电池护照 QR 码 (合规项)**：\n   - 须追溯电芯原材料碳足迹与循环回收成分比例，支持无损快拆维修。\n\n3. **合规落地策略**：在批量出运前完成包装版面改版，并将欧代注册证明同步至「我的知识库」供海关预审。`,
      timestamp,
      citations: [
        {
          id: 'cite-3',
          sourceId: 'src-eu-1',
          sourceName: 'EU_GPSR_General_Product_Safety_2026.pdf',
          excerpt: '欧盟通用商品安全条例 GPSR 负责人与欧代合规标签最新要求。',
          confidence: 0.98,
        },
        {
          id: 'cite-4',
          sourceId: 'src-law-1',
          sourceName: 'EU_Battery_Regulation_2026_Mandatory_Passports.pdf',
          excerpt: '欧盟数字电池护照 QR 码追溯实施细则与电芯快拆回收标准。',
          confidence: 0.97,
        },
      ],
    }
  }

  if (query.includes('文案') || query.includes('营销') || query.includes('电商')) {
    return {
      id: `resp-res-${Date.now()}`,
      sender: 'assistant',
      content: `### ✨ 高转化本土化文案生成 (${model.name}${skillHeader})\n\n基于已选产品研发与竞品资料提炼生成：\n\n**【Headline】**\nStudio-Grade Silence. Unrivaled Clarity for Every Note.\n\n**【5 点描述 (Bullet Points)】**\n- 🎧 **Hybrid Dual-Driver Acoustic Engine**: 40mm carbon-fiber diaphragm delivering audiophile-grade precision.\n- 🔇 **Adaptive Smart-ANC**: Seamlessly suppresses up to 36.2dB of ambient noise while preserving crisp vocal clarity.\n- 🔋 **Extended 30-Hour Marathon Battery**: Fast USB-C charging delivers 4 hours of music in just 10 minutes.\n- 🌍 **Fully EU GPSR Compliant & Eco-Certified**: Designed with FSC-certified sustainable packaging.\n- 📱 **Low-Latency Bluetooth 5.3 SoC**: Qualcomm QCC5171 with multi-point connection support.`,
      timestamp,
      citations: [
        {
          id: 'cite-5',
          sourceId: 'src-pvt-1',
          sourceName: 'CONFIDENTIAL_BOM_Cost_Breakdown_Q3.xlsx',
          excerpt: '40mm 碳纤维振膜单元与高通 QCC5171 芯片规格参数。',
          confidence: 0.98,
        },
      ],
    }
  }

  return {
    id: `resp-res-${Date.now()}`,
    sender: 'assistant',
    content: `### 🔍 私有云库研报推理结果 (${model.name}${skillHeader})\n\n已完成跨文档比对与长上下文分析（模型：${model.name}，已挂载技能：${skillNames || '通用研究'}）：\n\n- **数据隔离状态**：本推理沙盒运行于独立空间，未向任何公域或第三方下游同步。\n- **分析建议**：结合当前已选 ${selectedBaseIds.length} 个知识库资料，已提取核心关键字段并完成交叉论证。您可点击下方「发布到我的知识」将结论沉淀为对外资产。`,
    timestamp,
    citations: [
      {
        id: 'cite-6',
        sourceId: 'src-pvt-2',
        sourceName: 'Qualcomm_QCC5171_Firmware_Telemetry.pdf',
        excerpt: '低延迟蓝牙芯片功耗曲线与发热温控阈值满足连续 30 小时播放标准。',
        confidence: 0.95,
      },
    ],
  }
}
