'use client'

import React, { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import {
  ShieldCheck,
  Plus,
  Search,
  Copy,
  Check,
  ChevronRight,
  Clock,
  CheckCircle2,
  Package,
  Building2,
  Radio,
  Eye,
  X,
} from 'lucide-react'
import { ProvenanceWork, AssociatedProduct, AuthorizedMerchant } from './types'
import { INITIAL_PROVENANCE_WORKS } from './mockData'
import { AddWorkModal } from './AddWorkModal'
import { SimulateConflictModal } from './SimulateConflictModal'
import { ProtectionRulesModal } from './ProtectionRulesModal'
import { AssociateProductModal } from './AssociateProductModal'
import { AuthorizeMerchantModal } from './AuthorizeMerchantModal'

type FilterTab = 'all' | 'verified' | 'reviewing' | 'pending' | 'protected'

export function ProvenanceView() {
  const [works, setWorks] = useState<ProvenanceWork[]>(INITIAL_PROVENANCE_WORKS)
  const [selectedWorkId, setSelectedWorkId] = useState<string | null>('work-rainforest-diffuser')
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false)
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false)
  const [isAssociateModalOpen, setIsAssociateModalOpen] = useState(false)
  const [isAuthorizeModalOpen, setIsAuthorizeModalOpen] = useState(false)
  const [copiedHash, setCopiedHash] = useState(false)

  // Zoom preview modal for work images
  const [zoomedImage, setZoomedImage] = useState<string | null>(null)

  const selectedWork = useMemo(
    () => works.find((w) => w.id === selectedWorkId) || null,
    [works, selectedWorkId]
  )

  // Filtered works list
  const filteredWorks = useMemo(() => {
    return works.filter((w) => {
      // Tab filter
      if (activeTab === 'verified' && w.status !== 'verified') return false
      if (activeTab === 'reviewing' && w.status !== 'reviewing') return false
      if (activeTab === 'pending' && w.status !== 'pending') return false
      if (activeTab === 'protected' && w.platformProtection.status !== 'protected') return false

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        return (
          w.name.toLowerCase().includes(q) ||
          w.code.toLowerCase().includes(q) ||
          w.type.toLowerCase().includes(q) ||
          w.owner.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [works, activeTab, searchQuery])

  // Aggregate Metrics
  const totalWorks = 12
  const totalAssociatedProducts = 36
  const totalAuthorizedMerchants = 8
  const totalProtectedProducts = 31
  const pendingIncidents = 0

  const handleCopyFingerprint = (hash: string) => {
    navigator.clipboard.writeText(hash)
    setCopiedHash(true)
    setTimeout(() => setCopiedHash(false), 2000)
  }

  const handleAddNewWork = (newWork: ProvenanceWork) => {
    setWorks((prev) => [newWork, ...prev])
    setSelectedWorkId(newWork.id)
  }

  const handleAssociateProduct = (product: AssociatedProduct) => {
    if (!selectedWorkId) return
    setWorks((prev) =>
      prev.map((w) => {
        if (w.id === selectedWorkId) {
          const updated = [...w.associatedProducts, product]
          return {
            ...w,
            associatedProducts: updated,
            platformProtection: {
              ...w.platformProtection,
              protectedProductCount: updated.length,
            },
          }
        }
        return w
      })
    )
  }

  const handleAuthorizeMerchant = (merchant: AuthorizedMerchant) => {
    if (!selectedWorkId) return
    setWorks((prev) =>
      prev.map((w) => {
        if (w.id === selectedWorkId) {
          return {
            ...w,
            authorizedMerchants: [...w.authorizedMerchants, merchant],
          }
        }
        return w
      })
    )
  }

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* ============================================================
            1. HEADER (来源 / 作品来源与保护)
            ============================================================ */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              <span>Omnilink 基础设施</span>
              <span>/</span>
              <span className="text-slate-900 dark:text-white font-bold">来源</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              作品来源与保护
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              让原创作品拥有可验证的来源，并与商品建立可信关系。
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {/* Interactive Conflict Demo Button */}
            <button
              type="button"
              onClick={() => setIsSimulateModalOpen(true)}
              className="h-9 px-3.5 rounded-[4px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Radio size={13} className="text-amber-500 animate-pulse" />
              <span>模拟受保护冲突检测</span>
            </button>

            {/* Protection Rules Secondary Button */}
            <button
              type="button"
              onClick={() => setIsRulesModalOpen(true)}
              className="h-9 px-3.5 rounded-[4px] bg-white dark:bg-slate-800 border border-[#D1D1D1] dark:border-slate-700 hover:bg-[#F7F7F7] dark:hover:bg-slate-750 text-[#1C1C1C] dark:text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck size={14} className="text-slate-600 dark:text-slate-300" />
              <span>保护规则</span>
            </button>

            {/* Primary Action: Add Work Button (HP Blue #024AD8) */}
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="h-9 px-4 rounded-[4px] bg-[#024AD8] hover:bg-[#003198] active:bg-[#00226B] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>添加作品</span>
            </button>
          </div>
        </div>

        {/* ============================================================
            2. TOP METRICS OVERVIEW (横向数据概览)
            ============================================================ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-4 rounded-[6px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
              {totalWorks}
            </div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">
              已登记作品
            </div>
          </div>

          <div className="p-4 rounded-[6px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
              {totalAssociatedProducts}
            </div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">
              关联商品
            </div>
          </div>

          <div className="p-4 rounded-[6px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
              {totalAuthorizedMerchants}
            </div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">
              授权商家
            </div>
          </div>

          <div className="p-4 rounded-[6px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
            <div className="text-2xl sm:text-3xl font-black text-[#024AD8] dark:text-blue-400 tracking-tight font-mono">
              {totalProtectedProducts}
            </div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">
              受保护商品
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 p-4 rounded-[6px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight font-mono">
              {pendingIncidents}
            </div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">
              待处理事件
            </div>
          </div>
        </div>

        {/* ============================================================
            3. WORKS GALLERY (我的作品库)
            ============================================================ */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                我的作品
              </h2>
              <p className="text-xs text-slate-500">
                管理原创设计、摄影、视觉资产，以及它们关联的商品。
              </p>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search
                  size={13}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="搜索作品名称或编号..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 pr-3 w-44 sm:w-56 rounded-[4px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#024AD8]"
                />
              </div>

              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-[4px] text-xs">
                {(
                  [
                    { key: 'all', label: '全部' },
                    { key: 'verified', label: '已验证' },
                    { key: 'reviewing', label: '审核中' },
                    { key: 'pending', label: '待审核' },
                    { key: 'protected', label: '受保护' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-2.5 py-1 rounded-[3px] font-medium transition-colors cursor-pointer ${
                      activeTab === tab.key
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3-Column Image-First Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredWorks.map((work) => {
              const isSelected = selectedWorkId === work.id
              return (
                <div
                  key={work.id}
                  onClick={() => setSelectedWorkId(work.id)}
                  className={`group rounded-[6px] bg-white dark:bg-slate-900 border overflow-hidden transition-all cursor-pointer flex flex-col shadow-2xs hover:shadow-md ${
                    isSelected
                      ? 'border-[#024AD8] ring-1 ring-[#024AD8]'
                      : 'border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Hero Artwork Image */}
                  <div className="w-full aspect-16/10 relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <Image
                      src={work.coverImage}
                      alt={work.name}
                      fill
                      className="object-cover group-hover:scale-103 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-[3px] bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-semibold">
                      {work.type}
                    </div>

                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-[3px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs text-[10px] font-semibold flex items-center gap-1 shadow-xs">
                      {work.status === 'verified' && (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="text-emerald-700 dark:text-emerald-400">已验证</span>
                        </>
                      )}
                      {work.status === 'reviewing' && (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          <span className="text-amber-700 dark:text-amber-400">审核中</span>
                        </>
                      )}
                      {work.status === 'pending' && (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          <span className="text-slate-600 dark:text-slate-400">待审核</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {work.name}
                        </h3>
                        <span className="font-mono text-[10px] text-slate-400 font-medium shrink-0">
                          {work.code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                        {work.subtitle || work.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-slate-500">
                        <Package size={13} />
                        <span>关联商品:</span>
                        <strong className="font-bold text-slate-800 dark:text-slate-200">
                          {work.associatedProducts.length}
                        </strong>
                      </div>

                      <button
                        type="button"
                        className="font-semibold text-[#024AD8] hover:text-[#003198] flex items-center gap-0.5 text-xs transition-colors cursor-pointer"
                      >
                        <span>查看</span>
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Dashed Add Card */}
            <div
              onClick={() => setIsAddModalOpen(true)}
              className="rounded-[6px] border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-[#024AD8] hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-all p-6 flex flex-col items-center justify-center text-center cursor-pointer min-h-[260px] group"
            >
              <div className="w-10 h-10 rounded-[4px] bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/40 text-slate-400 group-hover:text-[#024AD8] flex items-center justify-center mb-2.5 transition-colors">
                <Plus size={20} />
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                添加作品
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                建立一个新的受保护作品
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          4. DETAIL DRAWER (560px Wide Slide-Over Drawer)
          ============================================================ */}
      <AnimatePresence>
        {selectedWork && (
          <div className="fixed inset-0 z-40 flex justify-end pointer-events-none">
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedWorkId(null)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-3xs pointer-events-auto lg:bg-transparent"
            />

            {/* Slide-over Panel */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="w-full max-w-[560px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl h-screen overflow-y-auto pointer-events-auto flex flex-col z-50 sticky top-0"
            >
              {/* Drawer Top Sticky Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs z-20">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[280px]">
                    {selectedWork.name}
                  </span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-[2px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {selectedWork.code}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedWorkId(null)}
                  className="w-7 h-7 rounded-[4px] flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="p-6 space-y-6 flex-1 text-xs">
                {/* 1. Large High-Res Artwork Hero Preview */}
                <div className="space-y-2">
                  <div
                    onClick={() => setZoomedImage(selectedWork.coverImage)}
                    className="w-full aspect-16/10 rounded-[6px] overflow-hidden relative border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 group cursor-zoom-in"
                  >
                    <Image
                      src={selectedWork.coverImage}
                      alt={selectedWork.name}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-1">
                      <Eye size={14} />
                      <span>查看高清大图</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {selectedWork.name}
                    </h2>
                    <div className="flex items-center gap-1.5">
                      {selectedWork.status === 'verified' && (
                        <span className="px-2 py-0.5 rounded-[3px] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                          <CheckCircle2 size={12} />
                          <span>已验证作品</span>
                        </span>
                      )}
                      {selectedWork.status === 'reviewing' && (
                        <span className="px-2 py-0.5 rounded-[3px] bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-400 font-semibold text-[11px] flex items-center gap-1">
                          <Clock size={12} />
                          <span>审核中</span>
                        </span>
                      )}
                      {selectedWork.status === 'pending' && (
                        <span className="px-2 py-0.5 rounded-[3px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-[11px]">
                          待审核
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Basic Info (作品基本信息) */}
                <div className="p-4 rounded-[6px] bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    作品基本信息
                  </div>
                  <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 pt-1">
                    <div>
                      <span className="text-slate-400 block text-[11px]">版权所有者</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {selectedWork.owner}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">作品类型</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {selectedWork.type}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">创建时间</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {selectedWork.createdAt}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">作品编号</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {selectedWork.code}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">来源状态</span>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                        {selectedWork.status === 'verified'
                          ? '已验证'
                          : selectedWork.status === 'reviewing'
                          ? '审核中'
                          : '待审核'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Core Module: 作品来源 (Provenance Timeline) */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-xs">
                      作品来源
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      记录这个作品从创作到保护的完整过程。
                    </p>
                  </div>

                  {selectedWork.reviewProgress ? (
                    <div className="p-4 rounded-[6px] bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-850 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                          提交时间: {selectedWork.reviewProgress.submissionDate}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-[2px] bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                          审核优先级: {selectedWork.reviewProgress.priority}
                        </span>
                      </div>
                      <div className="space-y-2 pt-1">
                        {selectedWork.timeline.map((item) => (
                          <div key={item.id} className="flex items-start gap-2.5">
                            {item.status === 'completed' ? (
                              <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                            ) : item.status === 'current' ? (
                              <Clock size={14} className="text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 flex items-center justify-between">
                              <span className={`font-medium ${item.status === 'current' ? 'text-amber-800 dark:text-amber-200 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                                {item.title}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {item.date}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 relative pl-4 border-l-2 border-slate-200 dark:border-slate-800 ml-2">
                      {selectedWork.timeline.map((item) => (
                        <div key={item.id} className="relative pb-3 last:pb-0">
                          <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#024AD8] ring-4 ring-white dark:ring-slate-900" />
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {item.title}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {item.date}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {item.actorOrDesc}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. Digital Fingerprint (数字指纹) */}
                <div className="p-4 rounded-[6px] bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-xs">
                        数字指纹
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        用于验证作品是否发生变化，以及识别平台中的相同或高度相似作品。
                      </p>
                    </div>
                  </div>

                  {/* Hash box */}
                  <div className="p-2.5 rounded-[4px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                    <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate">
                      <span className="text-slate-400 mr-1">SHA-256:</span>
                      {selectedWork.fingerprint.fullHash}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyFingerprint(selectedWork.fingerprint.fullHash)}
                      className="px-2 py-1 rounded-[3px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                    >
                      {copiedHash ? (
                        <>
                          <Check size={11} className="text-emerald-600" />
                          <span>已复制</span>
                        </>
                      ) : (
                        <>
                          <Copy size={11} />
                          <span>复制</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <span>存证状态:</span>
                      <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">
                        {selectedWork.fingerprint.status}
                      </strong>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <span>链上记录:</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                        {selectedWork.fingerprint.onChainRecorded}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* 5. Associated Products (关联商品) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-xs">
                        关联商品
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        这个作品目前被应用于以下商品。
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAssociateModalOpen(true)}
                      className="text-xs font-semibold text-[#024AD8] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} />
                      <span>关联商品</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {selectedWork.associatedProducts.length === 0 ? (
                      <div className="text-center py-4 text-slate-400 text-xs border border-dashed rounded-[4px]">
                        暂未关联商品
                      </div>
                    ) : (
                      selectedWork.associatedProducts.map((prod) => (
                        <div
                          key={prod.id}
                          className="p-2.5 rounded-[4px] bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 hover:bg-slate-100/60 dark:hover:bg-slate-800 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-10 h-10 rounded-[3px] overflow-hidden relative shrink-0 border border-slate-200 dark:border-slate-700">
                              <Image
                                src={prod.image}
                                alt={prod.name}
                                fill
                                className="object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 dark:text-white truncate">
                                {prod.name}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                SKU: {prod.sku}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0">
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-[2px] font-semibold ${
                                prod.status === 'published'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                  : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {prod.status === 'published' ? '已发布' : '草稿'}
                            </span>
                            <Link
                              href="/dashboard/products"
                              className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                            >
                              查看商品
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 6. License & Usage Permissions (使用权限) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-xs">
                        使用权限
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        管理哪些商家可以使用这个作品。
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAuthorizeModalOpen(true)}
                      className="text-xs font-semibold text-[#024AD8] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} />
                      <span>授权商家</span>
                    </button>
                  </div>

                  {/* Owner badge card */}
                  <div className="p-3 rounded-[4px] bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 size={15} className="text-slate-600 dark:text-slate-300" />
                      <span className="font-bold text-slate-900 dark:text-white">
                        {selectedWork.owner}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-[2px] bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                      所有者
                    </span>
                  </div>

                  {/* Authorized Merchants */}
                  {selectedWork.authorizedMerchants.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[11px] font-semibold text-slate-500">
                        已授权商家 ({selectedWork.authorizedMerchants.length})
                      </div>
                      {selectedWork.authorizedMerchants.map((auth) => (
                        <div
                          key={auth.id}
                          className="p-3 rounded-[4px] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-slate-800 dark:text-slate-200">
                              {auth.name}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              使用范围: {auth.scope} · 有效期: {auth.validity}
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-[2px] bg-blue-50 text-[#024AD8] dark:bg-blue-950/40 dark:text-blue-400">
                            已授权
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 7. Platform Protection (平台保护) */}
                <div className="p-4 rounded-[6px] bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-xs">
                        平台保护
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Omnilink 会持续识别平台中的重复使用情况，并验证其使用权限。
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-[3px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] flex items-center gap-1">
                      <ShieldCheck size={11} />
                      <span>保护中</span>
                    </span>
                  </div>

                  {/* 3 Quick Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div className="p-2 rounded-[4px] bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60">
                      <div className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                        {selectedWork.platformProtection.protectedProductCount}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">受保护商品</div>
                    </div>
                    <div className="p-2 rounded-[4px] bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60">
                      <div className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                        {selectedWork.platformProtection.matchRecordCount}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">匹配记录</div>
                    </div>
                    <div className="p-2 rounded-[4px] bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60">
                      <div className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                        {selectedWork.platformProtection.unauthorizedUsageCount}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">未授权使用</div>
                    </div>
                  </div>

                  {/* Detection Logs */}
                  {selectedWork.platformProtection.recentDetections.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <div className="text-[11px] font-semibold text-slate-500">
                        近期检测记录
                      </div>
                      {selectedWork.platformProtection.recentDetections.map((det) => (
                        <div
                          key={det.id}
                          className="p-2.5 rounded-[4px] bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 text-[11px] flex items-center justify-between"
                        >
                          <div>
                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                              {det.storeName}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              图片匹配 {det.matchRate}% · {det.matchedItemName || '素材检测'}
                            </div>
                          </div>
                          <div className="text-right">
                            <span
                              className={`font-semibold ${
                                det.status === 'authorized'
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-amber-600 dark:text-amber-400'
                              }`}
                            >
                              {det.status === 'authorized' ? '已授权' : '未找到有效授权'}
                            </span>
                            <div className="text-[10px] text-slate-400">{det.timeAgo}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================
          5. ZOOM PREVIEW MODAL
          ============================================================ */}
      {zoomedImage && (
        <div
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="max-w-4xl max-h-[85vh] relative w-full h-full rounded-[6px] overflow-hidden">
            <Image
              src={zoomedImage}
              alt="Zoomed Artwork"
              fill
              className="object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}

      {/* Modals */}
      <AddWorkModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddWork={handleAddNewWork}
      />

      <SimulateConflictModal
        isOpen={isSimulateModalOpen}
        onClose={() => setIsSimulateModalOpen(false)}
        onAuthorizedGranted={() => {
          // Grant authorization dynamically for the simulation demo
          if (selectedWorkId) {
            handleAuthorizeMerchant({
              id: `auth-${Date.now()}`,
              name: 'Nordic Living Concept',
              scope: '全渠道商品主图与详情页展示',
              validity: '2026.08.27 — 2027.08.27',
              status: 'active',
              authorizedDate: '2026-08-27',
            })
          }
        }}
      />

      <ProtectionRulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />

      {selectedWork && (
        <>
          <AssociateProductModal
            isOpen={isAssociateModalOpen}
            onClose={() => setIsAssociateModalOpen(false)}
            alreadyAssociatedIds={selectedWork.associatedProducts.map((p) => p.id)}
            onAssociate={handleAssociateProduct}
          />

          <AuthorizeMerchantModal
            isOpen={isAuthorizeModalOpen}
            onClose={() => setIsAuthorizeModalOpen(false)}
            workName={selectedWork.name}
            onAuthorize={handleAuthorizeMerchant}
          />
        </>
      )}
    </div>
  )
}
