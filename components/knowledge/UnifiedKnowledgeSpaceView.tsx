'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'motion/react'
import {
  Sparkles,
  ShoppingBag,
  Plus,
  Send,
  User,
  Bot,
  FileText,
  Check,
  X,
  ChevronDown,
  HardDrive,
  Copy,
  Share2,
  RotateCcw,
} from 'lucide-react'
import type {
  KnowledgeBaseItem,
  KnowledgeSource,
  ChatMessage,
  BrandBusinessStructuredData,
  KnowledgeFileSource,
  KnowledgeProductBinding,
} from './types'
import {
  SYSTEM_KNOWLEDGE_BASES,
  INTERNAL_RESEARCH_BASES,
  AI_RESEARCH_MODELS_DATA,
} from './mockData'

const DEFAULT_PRODUCT_FILE_SOURCES: KnowledgeFileSource[] = [
  {
    id: 'src-prod-1',
    name: 'OPT-001_Acoustic_Headphones_Datasheet.pdf',
    type: 'pdf',
    size: '3.4 MB',
    updatedAt: '2026-08-14',
    visibility: 'customer-facing',
    status: 'ready',
    summary: '硬件规格参数、声学频响曲线（20Hz-40kHz）与包装配件清单',
  },
  {
    id: 'src-prod-2',
    name: 'OPT-001_Maintenance_And_Care_Guide.pdf',
    type: 'pdf',
    size: '890 KB',
    updatedAt: '2026-08-10',
    visibility: 'customer-facing',
    status: 'ready',
    summary: '耳垫清洁、电池保养周期与防水注意事项',
  },
  {
    id: 'src-prod-3',
    name: 'Global_Compliance_Certificates.pdf',
    type: 'pdf',
    size: '2.1 MB',
    updatedAt: '2026-08-12',
    visibility: 'customer-facing',
    status: 'ready',
    summary: 'CE, FCC, RoHS, Bluetooth SIG 官方认证编号与检测报告',
  },
]

const DEFAULT_PRODUCT_BINDINGS: KnowledgeProductBinding[] = [
  {
    id: 'bind-1',
    sourceId: 'src-prod-1',
    productId: 'prod-opt-001',
    boundAt: '2026-08-14',
    matchType: 'ai_suggested',
  },
  {
    id: 'bind-2',
    sourceId: 'src-prod-2',
    productId: 'prod-opt-001',
    boundAt: '2026-08-10',
    matchType: 'manual',
  },
  {
    id: 'bind-3',
    sourceId: 'src-prod-3',
    productId: 'prod-opt-001',
    boundAt: '2026-08-12',
    matchType: 'ai_suggested',
  },
]
import { AI_SKILLS_LIBRARY, type AiSkillItem } from './skillsData'
import ReactMarkdown from 'react-markdown'
import { FolderCard } from './FolderCard'
import { BrandStoreWorkspace } from './BrandStoreWorkspace'
import { ProductKnowledgeWorkspace } from './ProductKnowledgeWorkspace'
import { GeneralFolderWorkspace } from './GeneralFolderWorkspace'
import { SkillMarketplaceModal } from './SkillMarketplaceModal'
import { KnowledgeMarketplaceView } from './KnowledgeMarketplaceView'

interface UnifiedKnowledgeSpaceViewProps {
  isZh: boolean
  brandData: BrandBusinessStructuredData
  onSaveBrand: (data: BrandBusinessStructuredData) => void
  addedCenterBaseIds: string[]
  onToggleAddCenterBase: (id: string) => void
}

export function UnifiedKnowledgeSpaceView({
  isZh,
  brandData,
  onSaveBrand,
  addedCenterBaseIds,
  onToggleAddCenterBase,
}: UnifiedKnowledgeSpaceViewProps) {
  // 1. Unified Knowledge Folders List (Initialized with rich collaborative metadata)
  const [folders, setFolders] = useState<KnowledgeBaseItem[]>(() => {
    return [
      // 1. 品牌与店铺信息 (System Fixed - Exclusive Chromatic Diffused Glow)
      {
        ...SYSTEM_KNOWLEDGE_BASES[0],
        id: 'brand-business',
        title: '品牌与店铺信息',
        titleEn: 'Brand & Store Info',
        description: '官方品牌形象、联系方式、社交矩阵与品牌介绍，全域多端同步。',
        isSystem: true,
        sourceCount: 5,
        storageUsed: '4.8 MB',
        lastSynced: '10月13日',
        priorityTag: 'BRAND SOUL · 核心资产',
        priorityColor: 'rainbow',
        statusBadge: { text: '✨ 全局同步', color: 'synced' },
        commentsCount: 12,
        attachmentsCount: 5,
        collaborators: [
          { id: 'u1', name: 'Brand Lead', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&auto=format&fit=crop&q=80' },
          { id: 'u2', name: 'Design VP', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&auto=format&fit=crop&q=80' },
          { id: 'u3', name: 'Founder', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&auto=format&fit=crop&q=80' },
        ],
      },
      // 2. 产品知识 (System Fixed, SKU Binding)
      {
        ...SYSTEM_KNOWLEDGE_BASES[1],
        id: 'product-knowledge',
        title: '产品知识',
        titleEn: 'Product Knowledge',
        description: 'SKU 规格说明书、认证文件、使用手册与产品深度上下文绑定。',
        isSystem: true,
        sourceCount: 7,
        storageUsed: '8.1 MB',
        lastSynced: '10月12日',
        priorityTag: 'MODERATE PRIORITY',
        priorityColor: 'moderate',
        statusBadge: { text: 'In Progress', color: 'progress' },
        commentsCount: 8,
        attachmentsCount: 7,
        collaborators: [
          { id: 'u4', name: 'Product PM', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&auto=format&fit=crop&q=80' },
          { id: 'u5', name: 'QA Engineer', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=60&h=60&auto=format&fit=crop&q=80' },
        ],
      },
      // 3. 服务与政策 (General - Expand Left Column)
      {
        ...SYSTEM_KNOWLEDGE_BASES[2],
        id: 'support-policy',
        title: '服务与政策',
        titleEn: 'Service & Policy',
        description: '全球物流时效、30天退换货政策、保修细则与常见 FAQ。',
        isSystem: false,
        sourceCount: 4,
        storageUsed: '2.4 MB',
        lastSynced: '10月10日',
        priorityTag: 'URGENT',
        priorityColor: 'urgent',
        statusBadge: { text: 'Under Review', color: 'review' },
        commentsCount: 15,
        attachmentsCount: 4,
        collaborators: [
          { id: 'u6', name: 'Support Lead', avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=60&h=60&auto=format&fit=crop&q=80' },
          { id: 'u7', name: 'Legal Counsel', avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=60&h=60&auto=format&fit=crop&q=80' },
        ],
      },
      // 4. 产品研发 (General - Expand Left Column)
      {
        ...INTERNAL_RESEARCH_BASES[0],
        id: 'product-rd',
        title: '产品研发',
        titleEn: 'Product R&D',
        description: '声学算法专利、BOM 物料清单、腔体 3D 图纸及工程测试数据。',
        isSystem: false,
        sourceCount: 6,
        storageUsed: '19.4 MB',
        lastSynced: '10月08日',
        priorityTag: 'LOW PRIORITY',
        priorityColor: 'low',
        statusBadge: { text: 'In Progress', color: 'progress' },
        commentsCount: 6,
        attachmentsCount: 6,
        collaborators: [
          { id: 'u8', name: 'Chief Acoustic', avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=60&h=60&auto=format&fit=crop&q=80' },
          { id: 'u9', name: 'Hardware Eng', avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=60&h=60&auto=format&fit=crop&q=80' },
        ],
      },
      // 5. 竞品分析 (General - Expand Left Column)
      {
        ...INTERNAL_RESEARCH_BASES[2],
        id: 'competitor-intel',
        title: '竞品分析',
        titleEn: 'Competitor Intel',
        description: 'Bose/Sony 声学实验室拆解报告、北美主流降噪耳机定价矩阵。',
        isSystem: false,
        sourceCount: 5,
        storageUsed: '14.2 MB',
        lastSynced: '10月05日',
        priorityTag: 'ON BOARDING',
        priorityColor: 'onboarding',
        statusBadge: { text: 'In Correction', color: 'correction' },
        commentsCount: 24,
        attachmentsCount: 5,
        collaborators: [
          { id: 'u10', name: 'Market Intel', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&auto=format&fit=crop&q=80' },
          { id: 'u11', name: 'Pricing Analyst', avatarUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=60&h=60&auto=format&fit=crop&q=80' },
        ],
      },
      // 6. 市场研究 (General - Expand Left Column)
      {
        ...INTERNAL_RESEARCH_BASES[1],
        id: 'market-research',
        title: '市场研究',
        titleEn: 'Market Research',
        description: '2026 欧美跨境音频消费趋势、TikTok 爆款 VOC 归因与词根。',
        isSystem: false,
        sourceCount: 4,
        storageUsed: '6.5 MB',
        lastSynced: '09月28日',
        priorityTag: 'STRATEGIC INTEL',
        priorityColor: 'intel',
        statusBadge: { text: 'Pending', color: 'pending' },
        commentsCount: 9,
        attachmentsCount: 4,
        collaborators: [
          { id: 'u12', name: 'Growth Director', avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=60&h=60&auto=format&fit=crop&q=80' },
        ],
      },
    ]
  })

  // Product binding specific state
  const [productFileSources, setProductFileSources] = useState<KnowledgeFileSource[]>(
    DEFAULT_PRODUCT_FILE_SOURCES
  )
  const [productBindings, setProductBindings] = useState<KnowledgeProductBinding[]>(
    DEFAULT_PRODUCT_BINDINGS
  )

  // Multi-folder checkbox selection for AI Analysis Space
  const [selectedFolderIdsForAi, setSelectedFolderIdsForAi] = useState<string[]>([
    'product-rd',
    'competitor-intel',
    'market-research',
  ])

  // Active workspace (null = folder grid list; string = currently opened folder)
  const [activeOpenedFolderId, setActiveOpenedFolderId] = useState<string | null>(null)

  // Knowledge Marketplace / Center Modal State
  const [isMarketplaceModalOpen, setIsMarketplaceModalOpen] = useState(false)

  // Create Folder Modal State
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false)
  const [newFolderTitle, setNewFolderTitle] = useState('')
  const [newFolderDesc, setNewFolderDesc] = useState('')

  // AI Model Selection State
  const [selectedModelId, setSelectedModelId] = useState<string>('gemini-2-5-pro')
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState<boolean>(false)
  const modelDropdownRef = useRef<HTMLDivElement>(null)

  // AI Skill Selection State
  const [activeSkillIds, setActiveSkillIds] = useState<string[]>(['skill-compliance', 'skill-competitor'])
  const [isSkillMarketplaceOpen, setIsSkillMarketplaceOpen] = useState<boolean>(false)
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState<boolean>(false)
  const plusMenuRef = useRef<HTMLDivElement>(null)

  // Quick Inline Upload State inside AI Input
  const [isQuickUploadModalOpen, setIsQuickUploadModalOpen] = useState<boolean>(false)
  const [quickUploadName, setQuickUploadName] = useState<string>('')
  const [quickUploadTargetFolder, setQuickUploadTargetFolder] = useState<string>('product-rd')

  // AI Research Messages / Synthesis State
  const [queryInput, setQueryInput] = useState<string>('')
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false)
  const [researchMessages, setResearchMessages] = useState<ChatMessage[]>([
    {
      id: 'res-msg-1',
      sender: 'assistant',
      content:
        '### 📊 欧美跨境音频市场合规与竞品对标分析研报\n\n根据您所选的 **「产品研发」**、**「竞品分析」** 与 **「市场研究」** 知识库，结合 **「欧盟法规审查」** 及 **「竞品情报分析」** 技能进行深度推理：\n\n#### 1. 竞品技术对标 (Bose QC Ultra vs. Omnilink OPT-001)\n- **主动降噪算法 (ANC)**：Bose 采用双芯片前馈+反馈拓扑结构，在 100Hz-1kHz 低频段深度达 -42dB；Omnilink OPT-001 采用自研 DSP 空间音频算法，中高频人声过滤表现提升 18%。\n- **续航与快充**：OPT-001 标称 32 小时续航，相比 Bose 的 24 小时高出 33.3%，在户外通勤场景具备显著竞争优势。\n\n#### 2. 欧盟合规与电池新规风险防范\n- **电池可拆卸与碳足迹声明**：自 2026 起出口欧盟的消费类音频硬件必须配备完整的 CE/WEEE 认证和电池生命周期溯源 QR 码。\n- **建议行动**：已在相关附件中核验物料清单 (BOM)，建议尽快在《OPT-001 认证文件》中补充更新 RoHS 2.0 声明。',
      timestamp: '11:30',
      citations: [
        {
          id: 'cit-1',
          sourceId: 'src-rd-1',
          sourceName: 'DSP_主动降噪算法白皮书_v3.pdf',
          excerpt: 'OPT-001 自研算法架构可降低延迟至 28ms，并实现自适应动态降噪调频。',
          confidence: 0.98,
        },
        {
          id: 'cit-2',
          sourceId: 'src-comp-1',
          sourceName: 'Bose_QC_Ultra_声学实验室实测拆解.pdf',
          excerpt: '竞品拆解显示其采用高通 QCC5181 芯片，整机功耗为 14.2mA。',
          confidence: 0.96,
        },
      ],
      modelUsed: 'Gemini 2.5 Pro (深度逻辑研报推理)',
    },
  ])

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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

  // Toggle selection for AI analysis
  const handleToggleFolderAiSelect = (folderId: string) => {
    setSelectedFolderIdsForAi((prev) =>
      prev.includes(folderId) ? prev.filter((id) => id !== folderId) : [...prev, folderId]
    )
  }

  // Create new folder
  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFolderTitle.trim()) return

    const newFolder: KnowledgeBaseItem = {
      id: `custom-folder-${Date.now()}`,
      title: newFolderTitle.trim(),
      titleEn: newFolderTitle.trim(),
      description: newFolderDesc.trim() || '自定义创建的专用知识库文件夹。',
      descriptionEn: 'Custom knowledge repository folder.',
      icon: 'Folder',
      visibility: 'internal-private',
      sourceCount: 0,
      storageUsed: '0 KB',
      lastSynced: '刚刚创建',
      activeConnections: ['Unified AI Engine'],
      isSystem: false,
      sources: [],
    }

    setFolders((prev) => [...prev, newFolder])
    setSelectedFolderIdsForAi((prev) => [...prev, newFolder.id])
    setNewFolderTitle('')
    setNewFolderDesc('')
    setIsCreateFolderModalOpen(false)
  }

  // Delete custom folder
  const handleDeleteFolder = (folderId: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== folderId))
    setSelectedFolderIdsForAi((prev) => prev.filter((id) => id !== folderId))
    if (activeOpenedFolderId === folderId) {
      setActiveOpenedFolderId(null)
    }
  }

  // Rename folder
  const handleRenameFolder = (folderId: string, newTitle: string) => {
    setFolders((prev) =>
      prev.map((f) => (f.id === folderId ? { ...f, title: newTitle } : f))
    )
  }

  // Update folder's sources
  const handleUpdateFolderSources = (folderId: string, sources: KnowledgeSource[]) => {
    setFolders((prev) =>
      prev.map((f) =>
        f.id === folderId ? { ...f, sources, sourceCount: sources.length } : f
      )
    )
  }

  // Send AI query
  const handleSendQuery = (text?: string) => {
    const q = text || queryInput
    if (!q.trim()) return

    const userMessage: ChatMessage = {
      id: `user-msg-${Date.now()}`,
      sender: 'user',
      content: q.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setResearchMessages((prev) => [...prev, userMessage])
    if (!text) setQueryInput('')
    setIsSynthesizing(true)

    // Simulate AI synthesis with active skills
    setTimeout(() => {
      const activeSkillNames = AI_SKILLS_LIBRARY.filter((s) =>
        activeSkillIds.includes(s.id)
      )
        .map((s) => s.name)
        .join(' + ')

      const botMessage: ChatMessage = {
        id: `ai-msg-${Date.now() + 1}`,
        sender: 'assistant',
        content: `### 📑 基于【${activeSkillNames || '通用研报推理'}】的深度分析结果\n\n已检索您已勾选的 **${selectedFolderIdsForAi.length} 个知识库**：\n\n1. **核心要点洞察**：针对您的问题「${q.trim()}」，结合相关文献中的技术规格与行业数据，推导出相关方案在性能和法规层面上完全可行。\n2. **执行建议**：建议将该推论归档并在下次产品评审中同步。\n3. **跨库关联**：已对标相关竞品数据，整体风险指数处于 **低（Low Risk）** 评级。`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: [
          {
            id: `cit-${Date.now()}`,
            sourceId: 'src-auto',
            sourceName: '知识库分析切片.pdf',
            excerpt: '系统自动从当前选中的知识库中提取与问题高度相关的段落。',
            confidence: 0.97,
          },
        ],
        modelUsed: AI_RESEARCH_MODELS_DATA.find((m) => m.id === selectedModelId)?.name || 'Gemini 2.5 Pro',
      }

      setResearchMessages((prev) => [...prev, botMessage])
      setIsSynthesizing(false)
    }, 700)
  }

  // Active opened folder object
  const activeFolderObj = folders.find((f) => f.id === activeOpenedFolderId)

  return (
    <div className="space-y-4">
      {/* Dynamic Render: 
          1. 品牌与店铺信息: 保持全屏独立配置空间 (BrandStoreWorkspace)
          2. 产品知识: 保持全屏独立绑定配置空间 (ProductKnowledgeWorkspace)
          3. 其他知识库 (服务与政策、产品研发、竞品分析、市场研究、自定义库): 采取展开覆盖左边模块，右侧 AI 分析空间保持常驻！
      */}
      <div className="flex flex-col lg:flex-row gap-5 items-stretch h-[calc(100vh-110px)] max-h-[820px] overflow-hidden">
        {/* LEFT COLUMN: 知识库管理 (2*3 莫兰迪半透明亚克力卡片网格) */}
        <div
          id="knowledge-folders-column"
          className="w-full lg:w-[440px] xl:w-[470px] rounded-[24px] bg-white/70 backdrop-blur-[20px] backdrop-saturate-[180%] border border-white/80 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.03)] flex flex-col justify-between shrink-0 h-full overflow-hidden transition-all duration-300"
        >
          {activeOpenedFolderId === 'brand-business' ? (
            <BrandStoreWorkspace
              onBack={() => setActiveOpenedFolderId(null)}
              folderTitle={folders.find((f) => f.id === 'brand-business')?.title || '品牌与店铺信息'}
              onRenameFolder={(newTitle) => handleRenameFolder('brand-business', newTitle)}
              brandData={brandData}
              onSaveBrand={onSaveBrand}
              sources={folders.find((f) => f.id === 'brand-business')?.sources || []}
              onUpdateSources={(srcs) => handleUpdateFolderSources('brand-business', srcs)}
              isZh={isZh}
            />
          ) : activeOpenedFolderId === 'product-knowledge' ? (
            <ProductKnowledgeWorkspace
              onBack={() => setActiveOpenedFolderId(null)}
              folderTitle={folders.find((f) => f.id === 'product-knowledge')?.title || '产品知识'}
              onRenameFolder={(newTitle) => handleRenameFolder('product-knowledge', newTitle)}
              sources={productFileSources}
              bindings={productBindings}
              onRemoveBinding={(sourceId, productId) => {
                setProductBindings((prev) =>
                  prev.filter(
                    (b) => !(b.sourceId === sourceId && b.productId === productId)
                  )
                )
              }}
              onAddBinding={(sourceId, productId) => {
                setProductBindings((prev) => [
                  ...prev,
                  {
                    id: `bind-${Date.now()}`,
                    sourceId,
                    productId,
                    boundAt: '刚刚',
                    matchType: 'manual',
                  },
                ])
              }}
              onUploadFile={(fileName, productId) => {
                const newSource: KnowledgeFileSource = {
                  id: `src-prod-${Date.now()}`,
                  name: fileName,
                  type: 'pdf',
                  size: '2.4 MB',
                  updatedAt: '刚刚',
                  visibility: 'customer-facing',
                  status: 'ready',
                  summary: '新上传的产品知识文件已完成绑定。',
                }
                setProductFileSources((prev) => [newSource, ...prev])
                if (productId) {
                  setProductBindings((prev) => [
                    ...prev,
                    {
                      id: `bind-${Date.now()}`,
                      sourceId: newSource.id,
                      productId,
                      boundAt: '刚刚',
                      matchType: 'manual',
                    },
                  ])
                }
              }}
              isZh={isZh}
            />
          ) : activeFolderObj ? (
            /* 通用知识库展开覆盖左边模块 (Cover Left Module) */
            <GeneralFolderWorkspace
              folder={activeFolderObj}
              onBack={() => setActiveOpenedFolderId(null)}
              onDeleteFolder={!activeFolderObj.isSystem ? handleDeleteFolder : undefined}
              onUpdateFolderSources={handleUpdateFolderSources}
              onRenameFolder={handleRenameFolder}
              isZh={isZh}
            />
          ) : (
              /* 知识库主列表：2*2 莫兰迪亚克力胶囊卡片网格 */
              <div className="space-y-3 flex-1 flex flex-col justify-between h-full">
                <div className="space-y-3 flex-1 flex flex-col min-h-0">
                  {/* Top Action Bar in Knowledge Base List: [知识库中心] */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-[#E5E7EB]/70 shrink-0">
                    <div>
                      <h3 className="text-sm font-extrabold text-[#111827] tracking-tight">
                        知识库管理
                      </h3>
                    </div>

                    {/* 知识库中心 Button (Top Action) - Premium dark glass, low profile */}
                    <button
                      type="button"
                      id="open-knowledge-marketplace-btn"
                      onClick={() => setIsMarketplaceModalOpen(true)}
                      className="px-3 py-1.5 rounded-[12px] bg-[#111827]/5 hover:bg-[#111827]/10 border border-[#111827]/10 text-[#4B5563] hover:text-[#111827] backdrop-blur-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      <ShoppingBag size={13} />
                      <span>知识库中心</span>
                    </button>
                  </div>

                  {/* Folders Grid List: 2*3 纵向交错排列 (Pastel Soft Acrylic Glass Cards) */}
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3 flex-1 overflow-y-auto custom-scroll pr-1">
                    {folders.map((folder, idx) => {
                      const isSelected = selectedFolderIdsForAi.includes(folder.id)
                      return (
                        <FolderCard
                          key={folder.id}
                          id={folder.id}
                          index={idx}
                          title={folder.title}
                          description={folder.description}
                          sourceCount={folder.sourceCount}
                          storageUsed={folder.storageUsed}
                          lastUpdated={folder.lastSynced || '10月13日'}
                          isSelectedForAi={isSelected}
                          onToggleAiSelect={() => handleToggleFolderAiSelect(folder.id)}
                          onClick={() => setActiveOpenedFolderId(folder.id)}
                          onRename={handleRenameFolder}
                          isSystem={folder.isSystem}
                        />
                      )
                    })}

                    {/* BOTTOM ACTION: 「新建知识库」极简无字莫兰迪半透明卡片 */}
                    <div
                      id="create-new-knowledge-base-card"
                      onClick={() => setIsCreateFolderModalOpen(true)}
                      className="knowledge-card group relative w-full h-[115px] sm:h-[125px] cursor-pointer select-none transition-all duration-200 border-dashed border-white/80 hover:border-gray-400 p-2.5 sm:p-3 flex flex-col items-center justify-center text-center hover:-translate-y-0.5"
                    >
                      <div className="w-10 h-10 rounded-full bg-white/95 text-purple-600 flex items-center justify-center shadow-xs border border-white group-hover:scale-110 transition-transform">
                        <Plus size={20} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Storage Quota Footer */}
                <div className="pt-2 border-t border-[#E5E7EB]/60 flex items-center justify-between text-[11px] text-[#6B7280] shrink-0">
                  <div className="flex items-center gap-1.5">
                    <HardDrive size={13} className="text-purple-600" />
                    <span>存储已用：<strong className="text-[#111827]">68.9 MB</strong> / 500 MB</span>
                  </div>
                  <span className="text-emerald-600 font-semibold text-[10px]">● 向量引擎正常</span>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: AI 分析空间 (NotebookLM Deep Research & Synthesis Engine) */}
          <div
            id="ai-analysis-space"
            className="flex-1 rounded-[24px] bg-white/70 backdrop-blur-[20px] backdrop-saturate-[180%] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex flex-col justify-between overflow-hidden h-full"
          >
            {/* Research Output Stream */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scroll">
              {researchMessages.map((msg) => {
                const isUser = msg.sender === 'user'
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`group/msg flex gap-3 max-w-[92%] ${
                      isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 text-xs font-bold ${
                        isUser
                          ? 'bg-[#111827] text-white shadow-2xs'
                          : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-xs'
                      }`}
                    >
                      {isUser ? <User size={14} /> : <Sparkles size={14} />}
                    </div>

                    <div className="space-y-2 min-w-0 flex-1">
                      <div
                        className={`p-4 rounded-[20px] text-xs leading-relaxed ${
                          isUser
                            ? 'bg-[#111827] text-white rounded-tr-[4px] shadow-sm'
                            : 'bg-white text-[#111827] rounded-tl-[4px] border border-[#E5E7EB] shadow-2xs'
                        }`}
                      >
                        <div className={`prose prose-xs max-w-none ${isUser ? 'text-white' : 'text-[#111827]'}`}>
                          <ReactMarkdown
                            components={{
                              h3({ children }) {
                                return <h3 className={`text-[16px] font-bold block mt-2.5 mb-1.5 ${isUser ? 'text-white' : 'text-purple-900'}`}>{children}</h3>
                              },
                              h4({ children }) {
                                return <h4 className={`text-[18px] font-bold block mt-3.5 mb-2 ${isUser ? 'text-white' : 'text-[#111827]'}`}>{children}</h4>
                              },
                              strong({ children }) {
                                return <b className="font-bold">{children}</b>
                              },
                              p({ children }) {
                                return <p className={`text-xs ${isUser ? 'text-gray-100' : 'text-[#374151]'} leading-relaxed my-1.5`}>{children}</p>
                              },
                              ul({ children }) {
                                return <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>
                              },
                              li({ children }) {
                                return <li className={`text-xs ${isUser ? 'text-gray-100' : 'text-[#374151]'} leading-relaxed`}>{children}</li>
                              }
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>

                        {/* Citations Box */}
                        {!isUser && msg.citations && msg.citations.length > 0 && (
                          <div className="mt-3.5 pt-2.5 border-t border-purple-100 space-y-1.5">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-900">
                              <FileText size={12} className="text-purple-600" />
                              <span>溯源文献与切片引用：</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {msg.citations.map((cit) => (
                                <span
                                  key={cit.id}
                                  className="px-2 py-0.8 rounded-[6px] bg-purple-50 text-purple-800 text-[10px] font-medium border border-purple-200"
                                >
                                  {cit.sourceName}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Message Actions - Displayed on hover */}
                      {!isUser && (
                        <div className="flex items-center justify-between text-[10px] text-[#6B7280] pt-0.5 px-1">
                          <span>{msg.timestamp} · {msg.modelUsed}</span>
                          <div className="flex items-center gap-1.5 opacity-0 group-hover/msg:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => {
                                if (navigator.clipboard) {
                                  navigator.clipboard.writeText(msg.content)
                                }
                                alert('研报内容已复制到剪贴板')
                              }}
                              className="px-2 py-0.8 rounded-[6px] bg-white border border-[#E5E7EB] hover:bg-purple-50 text-gray-600 hover:text-purple-700 font-bold flex items-center gap-1 cursor-pointer shadow-2xs transition-colors"
                              title="复制"
                            >
                              <Copy size={11} />
                              <span>复制</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                alert('研报分享链接已生成')
                              }}
                              className="px-2 py-0.8 rounded-[6px] bg-white border border-[#E5E7EB] hover:bg-purple-50 text-gray-600 hover:text-purple-700 font-bold flex items-center gap-1 cursor-pointer shadow-2xs transition-colors"
                              title="分享"
                            >
                              <Share2 size={11} />
                              <span>分享</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                handleSendQuery()
                              }}
                              className="px-2 py-0.8 rounded-[6px] bg-white border border-[#E5E7EB] hover:bg-purple-50 text-gray-600 hover:text-purple-700 font-bold flex items-center gap-1 cursor-pointer shadow-2xs transition-colors"
                              title="重试"
                            >
                              <RotateCcw size={11} />
                              <span>重试</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}

              {isSynthesizing && (
                <div className="flex gap-3 max-w-[90%] mr-auto">
                  <div className="w-8 h-8 rounded-[10px] bg-purple-600 text-white flex items-center justify-center shrink-0">
                    <Sparkles size={14} />
                  </div>
                  <div className="p-4 rounded-[20px] bg-white border border-[#E5E7EB] shadow-2xs space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
                      <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
                      <span>正在联合 {selectedFolderIdsForAi.length} 个知识库进行大模型推理…</span>
                    </div>
                    <p className="text-[11px] text-[#6B7280]">
                      正在检索声学算法、竞品实测与法规条款并生成结构化研报。
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Section: Skills Bar, Model Switcher & Input Bar */}
            <div className="p-3.5 bg-white/90 border-t border-[#E5E7EB]/70 space-y-2.5 shrink-0">
              {/* Active Skills Bar + Model Dropdown Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {activeSkillIds.map((skillId) => {
                    const skill = AI_SKILLS_LIBRARY.find((s) => s.id === skillId)
                    if (!skill) return null
                    return (
                      <span
                        key={skill.id}
                        className="px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-900 text-[11px] font-bold flex items-center gap-1.5 shadow-2xs"
                      >
                        <span>{skill.name}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveSkillIds((prev) => prev.filter((id) => id !== skill.id))
                          }
                          className="text-purple-400 hover:text-rose-600 cursor-pointer"
                        >
                          <X size={11} />
                        </button>
                      </span>
                    )
                  })}

                  {/* Open Skill Marketplace Modal */}
                  <button
                    type="button"
                    id="more-skills-btn"
                    onClick={() => setIsSkillMarketplaceOpen(true)}
                    className="px-2.5 py-1 rounded-full bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#111827] text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus size={11} />
                    <span>更多技能</span>
                  </button>
                </div>

                {/* Model Selector Dropdown */}
                <div className="relative" ref={modelDropdownRef}>
                  <button
                    type="button"
                    id="model-selector-btn"
                    onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                    className="px-2.5 py-1 rounded-full bg-white hover:bg-gray-50 border border-[#E5E7EB] text-[11px] font-bold text-[#111827] flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                  >
                    <Bot size={12} className="text-purple-600" />
                    <span>
                      {AI_RESEARCH_MODELS_DATA.find((m) => m.id === selectedModelId)?.name ||
                        'Gemini 2.5 Pro'}
                    </span>
                    <ChevronDown size={11} className="text-gray-400" />
                  </button>

                  {isModelDropdownOpen && (
                    <div className="absolute right-0 bottom-full mb-1.5 w-44 rounded-[14px] bg-white border border-[#E5E7EB] shadow-xl p-1.5 z-30 space-y-0.5">
                      {AI_RESEARCH_MODELS_DATA.map((model) => (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() => {
                            setSelectedModelId(model.id)
                            setIsModelDropdownOpen(false)
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-[8px] transition-colors cursor-pointer flex items-center justify-between text-xs font-semibold ${
                            selectedModelId === model.id
                              ? 'bg-purple-50 text-purple-900 font-bold'
                              : 'text-[#111827] hover:bg-gray-100'
                          }`}
                        >
                          <span>{model.name}</span>
                          {selectedModelId === model.id && (
                            <Check size={12} className="text-purple-600 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Input Box with Left '+' Button & Gemini Light Spin Send Button */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendQuery()
                }}
                className="relative flex items-center gap-2 bg-[#F9FAFB] p-1.5 rounded-[16px] border border-[#E5E7EB] focus-within:border-[#8B5CF6] focus-within:bg-white transition-all shadow-2xs"
              >
                {/* '+' Floating Action Menu */}
                <div className="relative" ref={plusMenuRef}>
                  <button
                    type="button"
                    id="plus-action-menu-btn"
                    onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
                    className="w-8 h-8 rounded-[10px] bg-white border border-[#E5E7EB] text-[#111827] hover:bg-gray-100 flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
                    title="上传文件或挂载技能"
                  >
                    <Plus size={15} />
                  </button>

                  {isPlusMenuOpen && (
                    <div className="absolute left-0 bottom-full mb-2 w-48 rounded-[14px] bg-white border border-[#E5E7EB] shadow-xl p-1.5 z-30 space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsPlusMenuOpen(false)
                          setIsQuickUploadModalOpen(true)
                        }}
                        className="w-full text-left p-2 rounded-[8px] hover:bg-purple-50 text-xs font-semibold text-[#111827] flex items-center gap-2 cursor-pointer"
                      >
                        <FileText size={13} className="text-purple-600" />
                        <span>上传新文件</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsPlusMenuOpen(false)
                          setIsSkillMarketplaceOpen(true)
                        }}
                        className="w-full text-left p-2 rounded-[8px] hover:bg-purple-50 text-xs font-semibold text-[#111827] flex items-center gap-2 cursor-pointer"
                      >
                        <Sparkles size={13} className="text-purple-600" />
                        <span>挂载分析技能</span>
                      </button>
                    </div>
                  )}
                </div>

                <input
                  type="text"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  placeholder="向所选知识库提问，例如：对比 OPT-001 与 Bose 的降噪与续航优势…"
                  className="flex-1 bg-transparent text-xs text-[#111827] focus:outline-none px-2"
                />

                {/* Send Button with Gemini-like Rotating Light Ring when generating */}
                <div className={`relative p-[2px] rounded-[12px] overflow-hidden ${isSynthesizing ? 'bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-[spin_2s_linear_infinite]' : ''}`}>
                  <button
                    type="submit"
                    disabled={!queryInput.trim() || isSynthesizing}
                    className="w-9 h-9 rounded-[10px] bg-[#111827] hover:bg-black disabled:bg-gray-200 text-white disabled:text-gray-400 flex items-center justify-center transition-all shadow-xs cursor-pointer shrink-0 relative z-10"
                    title="发送"
                  >
                    <Send size={14} className={isSynthesizing ? "animate-pulse" : ""} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

      {/* POPUP MODAL: 知识库中心 (Knowledge Marketplace Modal) */}
      {isMarketplaceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setIsMarketplaceModalOpen(false)}
          />

          <div
            id="knowledge-marketplace-modal"
            className="relative w-full max-w-5xl bg-white rounded-[24px] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.2)] border border-[#E5E7EB] z-10 max-h-[90vh] flex flex-col space-y-4 animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[12px] bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-center">
                  <ShoppingBag size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#111827]">知识库中心 (权威行业与合规库生态)</h3>
                  <p className="text-[11px] text-[#6B7280]">
                    一键同步行业知识、跨境法规、亚马逊类目合规与选品智库至您的知识空间。
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMarketplaceModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scroll pr-1">
              <KnowledgeMarketplaceView
                isZh={isZh}
                addedCenterBaseIds={addedCenterBaseIds}
                onToggleAddCenterBase={onToggleAddCenterBase}
              />
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL: 新建知识库 (Create Knowledge Base Modal) */}
      {isCreateFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setIsCreateFolderModalOpen(false)}
          />

          <div
            id="create-folder-modal"
            className="relative w-full max-w-md bg-white rounded-[24px] p-6 shadow-2xl border border-[#E5E7EB] z-10 space-y-4 animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-[10px] bg-purple-600 text-white flex items-center justify-center">
                  <Plus size={16} />
                </div>
                <h4 className="text-sm font-bold text-[#111827]">新建知识库</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateFolderModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs"
              >
                <X size={13} />
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">
                  知识库名称
                </label>
                <input
                  type="text"
                  value={newFolderTitle}
                  onChange={(e) => setNewFolderTitle(e.target.value)}
                  placeholder="例如：2026年夏季新品营销素材库"
                  className="w-full h-9 px-3 rounded-[10px] bg-white border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">
                  知识库描述（可选）
                </label>
                <textarea
                  rows={2}
                  value={newFolderDesc}
                  onChange={(e) => setNewFolderDesc(e.target.value)}
                  placeholder="描述该库主要存放的文件类型与业务目标…"
                  className="w-full p-2.5 rounded-[10px] bg-white border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#8B5CF6] resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateFolderModalOpen(false)}
                  className="px-4 py-2 rounded-[10px] bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-[#111827]"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={!newFolderTitle.trim()}
                  className="px-5 py-2 rounded-[10px] bg-[#111827] hover:bg-black disabled:bg-gray-200 text-white disabled:text-gray-400 text-xs font-bold shadow-xs cursor-pointer"
                >
                  创建知识库
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL: 快速上传新文件 (Quick Upload from '+' Menu) */}
      {isQuickUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setIsQuickUploadModalOpen(false)}
          />

          <div
            id="quick-upload-modal"
            className="relative w-full max-w-md bg-white rounded-[24px] p-6 shadow-2xl border border-[#E5E7EB] z-10 space-y-4 animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-[10px] bg-purple-600 text-white flex items-center justify-center">
                  <FileText size={16} />
                </div>
                <h4 className="text-sm font-bold text-[#111827]">快速上传文件至知识库</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickUploadModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs"
              >
                <X size={13} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">
                  目标知识库
                </label>
                <select
                  value={quickUploadTargetFolder}
                  onChange={(e) => setQuickUploadTargetFolder(e.target.value)}
                  className="w-full h-9 px-3 rounded-[10px] bg-white border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none"
                >
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">
                  文件名
                </label>
                <input
                  type="text"
                  value={quickUploadName}
                  onChange={(e) => setQuickUploadName(e.target.value)}
                  placeholder="例如：2026_Q3_声学实验室测评数据.pdf"
                  className="w-full h-9 px-3 rounded-[10px] bg-white border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuickUploadModalOpen(false)}
                  className="px-4 py-2 rounded-[10px] bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-[#111827]"
                >
                  取消
                </button>
                <button
                  type="button"
                  disabled={!quickUploadName.trim()}
                  onClick={() => {
                    const newSource: KnowledgeSource = {
                      id: `src-quick-${Date.now()}`,
                      name: quickUploadName.trim(),
                      type: 'pdf',
                      size: '1.9 MB',
                      updatedAt: '刚刚',
                      visibility: 'customer-facing',
                      selected: true,
                      summary: '新上传文件已快速完成解析。',
                    }
                    handleUpdateFolderSources(quickUploadTargetFolder, [
                      newSource,
                      ...(folders.find((f) => f.id === quickUploadTargetFolder)?.sources || []),
                    ])
                    setQuickUploadName('')
                    setIsQuickUploadModalOpen(false)
                  }}
                  className="px-5 py-2 rounded-[10px] bg-[#111827] hover:bg-black disabled:bg-gray-200 text-white disabled:text-gray-400 text-xs font-bold shadow-xs cursor-pointer"
                >
                  确认上传
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL: 技能中心 (Skill Marketplace Modal) */}
      <SkillMarketplaceModal
        isOpen={isSkillMarketplaceOpen}
        onClose={() => setIsSkillMarketplaceOpen(false)}
        activeSkillIds={activeSkillIds}
        onToggleSkill={(skillId) => {
          setActiveSkillIds((prev) =>
            prev.includes(skillId)
              ? prev.filter((id) => id !== skillId)
              : [...prev, skillId]
          )
        }}
        isProUser={true}
      />
    </div>
  )
}
