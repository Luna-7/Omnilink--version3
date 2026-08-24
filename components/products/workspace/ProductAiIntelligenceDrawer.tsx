'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  X,
  Sparkles,
  Check,
  Ban,
  ArrowRight,
  AlertTriangle,
  Info,
  CheckCircle2,
  HelpCircle,
  Loader2,
} from 'lucide-react'
import type { ProductAiReport, ProductAiChange } from '@/lib/product/ai-intelligence'
import { useLanguage } from '@/context/LanguageContext'

interface ProductAiIntelligenceDrawerProps {
  isOpen: boolean
  onClose: () => void
  report: ProductAiReport | null
  onApplyChanges: (changes: ProductAiChange[]) => Promise<void>
  isApplying?: boolean
}

export function ProductAiIntelligenceDrawer({
  isOpen,
  onClose,
  report,
  onApplyChanges,
  isApplying = false,
}: ProductAiIntelligenceDrawerProps) {
  const { isZh } = useLanguage()
  const drawerRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  // Local state for tracking change statuses (pending, accepted, rejected)
  const [localChanges, setLocalChanges] = useState<ProductAiChange[]>([])
  const [expandedReasonId, setExpandedReasonId] = useState<string | null>(null)

  useEffect(() => {
    if (report?.changes) {
      setLocalChanges(report.changes)
    }
  }, [report])

  // Escape key handler and focus trap
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    if (closeBtnRef.current) {
      closeBtnRef.current.focus()
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleItemStatusChange = (id: string, status: 'accepted' | 'rejected') => {
    setLocalChanges((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    )
  }

  const handleApplyAll = async () => {
    // Mark all pending as accepted
    const updated = localChanges.map((c) =>
      c.status === 'pending' ? { ...c, status: 'accepted' as const } : c
    )
    setLocalChanges(updated)
    await onApplyChanges(updated)
  }

  const adds = localChanges.filter((c) => c.type === 'add')
  const updates = localChanges.filter((c) => c.type === 'update')
  const removes = localChanges.filter((c) => c.type === 'remove')
  const conflicts = report?.findings.filter((f) => f.severity === 'error') || []

  const pendingCount = localChanges.filter((c) => c.status === 'pending').length
  const acceptedCount = localChanges.filter((c) => c.status === 'accepted').length

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-drawer-title"
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-250"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[4px] bg-[#024AD8] text-white flex items-center justify-center shadow-xs shrink-0">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 id="ai-drawer-title" className="text-base font-extrabold text-slate-900">
                {isZh ? '修改报告' : 'Modification Report'}
              </h2>
              <p className="text-xs text-slate-500">
                {isZh ? 'AI 整理发现的优化建议与冲突分析' : 'AI optimization suggestions and conflict report'}
              </p>
            </div>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label={isZh ? '关闭' : 'Close'}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-[4px] cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-[#024AD8]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-slate-800 text-xs">
          {/* Summary Banner */}
          <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 flex items-center justify-between gap-2">
            <div>
              <p className="font-bold text-slate-900">
                {isZh
                  ? `共发现 ${localChanges.length} 项处理建议`
                  : `${localChanges.length} suggestions found`}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-slate-600 mt-0.5 font-mono">
                <span>新增 {adds.length}</span>
                <span>•</span>
                <span>修改 {updates.length}</span>
                <span>•</span>
                <span>冲突 {conflicts.length}</span>
              </div>
            </div>
            {acceptedCount > 0 && (
              <span className="px-2 py-0.5 rounded-[4px] bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                {isZh ? `已选择 ${acceptedCount} 项` : `${acceptedCount} selected`}
              </span>
            )}
          </div>

          {/* Section 1: 新增 (Adds) */}
          {adds.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  <span>{isZh ? '新增属性' : 'Add Attributes'}</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">{adds.length} 项</span>
              </div>

              <div className="space-y-2">
                {adds.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">
                        {item.label || item.fieldKey}
                      </span>
                      <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-[4px] font-medium border border-blue-100">
                        → {item.nextValue}
                      </span>
                    </div>
                    {item.reason && (
                      <p className="text-[11px] text-slate-500 leading-normal">{item.reason}</p>
                    )}

                    <div className="flex items-center justify-end gap-1.5 pt-1">
                      {item.status === 'accepted' ? (
                        <span className="px-2 py-0.5 rounded-[4px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px] flex items-center gap-1">
                          <Check size={11} /> {isZh ? '已同意应用' : 'Accepted'}
                        </span>
                      ) : item.status === 'rejected' ? (
                        <span className="px-2 py-0.5 rounded-[4px] bg-slate-100 text-slate-500 border border-slate-200 font-bold text-[10px] flex items-center gap-1">
                          <Ban size={11} /> {isZh ? '已忽略' : 'Ignored'}
                        </span>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => handleItemStatusChange(item.id, 'accepted')}
                        className={`h-6 px-2.5 rounded-[4px] text-[11px] font-medium cursor-pointer transition-all focus-visible:outline-2 focus-visible:outline-[#024AD8] ${
                          item.status === 'accepted'
                            ? 'bg-[#024AD8] text-white'
                            : 'bg-white border border-[#D1D1D1] text-[#1C1C1C] hover:bg-blue-50 hover:text-[#024AD8]'
                        }`}
                      >
                        {isZh ? '应用' : 'Apply'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleItemStatusChange(item.id, 'rejected')}
                        className={`h-6 px-2.5 rounded-[4px] text-[11px] font-medium cursor-pointer transition-all focus-visible:outline-2 focus-visible:outline-[#024AD8] ${
                          item.status === 'rejected'
                            ? 'bg-slate-200 text-slate-800'
                            : 'bg-white border border-[#D1D1D1] text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {isZh ? '忽略' : 'Ignore'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: 修改 (Updates) */}
          {updates.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>{isZh ? '规范调整 / 修正' : 'Value Updates'}</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">{updates.length} 项</span>
              </div>

              <div className="space-y-2">
                {updates.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">
                        {item.label || item.fieldKey}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] bg-white p-2 rounded-lg border border-slate-200 font-mono">
                      <span className="text-slate-400 line-through truncate max-w-[120px]">
                        {item.previousValue || '(空)'}
                      </span>
                      <ArrowRight size={12} className="text-[#024AD8] shrink-0" />
                      <span className="text-[#024AD8] font-bold truncate">
                        {item.nextValue}
                      </span>
                    </div>

                    {item.reason && (
                      <p className="text-[11px] text-slate-500 leading-normal">{item.reason}</p>
                    )}

                    <div className="flex items-center justify-end gap-1.5 pt-1">
                      {item.status === 'accepted' ? (
                        <span className="px-2 py-0.5 rounded-[4px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px] flex items-center gap-1">
                          <Check size={11} /> {isZh ? '已同意应用' : 'Accepted'}
                        </span>
                      ) : item.status === 'rejected' ? (
                        <span className="px-2 py-0.5 rounded-[4px] bg-slate-100 text-slate-500 border border-slate-200 font-bold text-[10px] flex items-center gap-1">
                          <Ban size={11} /> {isZh ? '已忽略' : 'Ignored'}
                        </span>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => handleItemStatusChange(item.id, 'accepted')}
                        className={`h-6 px-2.5 rounded-[4px] text-[11px] font-medium cursor-pointer transition-all focus-visible:outline-2 focus-visible:outline-[#024AD8] ${
                          item.status === 'accepted'
                            ? 'bg-[#024AD8] text-white'
                            : 'bg-white border border-[#D1D1D1] text-[#1C1C1C] hover:bg-blue-50 hover:text-[#024AD8]'
                        }`}
                      >
                        {isZh ? '应用' : 'Apply'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleItemStatusChange(item.id, 'rejected')}
                        className={`h-6 px-2.5 rounded-[4px] text-[11px] font-medium cursor-pointer transition-all focus-visible:outline-2 focus-visible:outline-[#024AD8] ${
                          item.status === 'rejected'
                            ? 'bg-slate-200 text-slate-800'
                            : 'bg-white border border-[#D1D1D1] text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {isZh ? '忽略' : 'Ignore'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: 冲突 (Conflicts & Findings) */}
          {(conflicts.length > 0 || (report?.findings && report.findings.length > 0)) && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <AlertTriangle size={14} className="text-amber-600" />
                  <span>{isZh ? '属性冲突与资料检查' : 'Conflicts & Findings'}</span>
                </span>
              </div>

              <div className="space-y-2">
                {report?.findings.map((f) => (
                  <div
                    key={f.id}
                    className={`p-3 rounded-xl border text-xs space-y-1 ${
                      f.severity === 'error'
                        ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                        : 'bg-amber-50/70 border-amber-200 text-amber-900'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      <span>{f.label || f.fieldKey || '属性冲突'}</span>
                    </div>
                    <p className="text-[11px] opacity-90 leading-relaxed">{f.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: 数据检查 (Readiness Checklist - Clean, no scores) */}
          {report?.readinessChecks && report.readinessChecks.length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 text-xs block">
                {isZh ? '数据检查' : 'Data Check'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                {report.readinessChecks.map((chk, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 p-2 bg-white rounded-lg border border-slate-200 font-medium"
                  >
                    {chk.status === 'pass' ? (
                      <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle size={13} className="text-amber-600 shrink-0" />
                    )}
                    <span className="truncate">{chk.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 5: Agent 理解测试 (Simulation) */}
          {report?.agentSimulations && report.agentSimulations.length > 0 && (
            <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-200/80 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                <HelpCircle size={14} className="text-indigo-600" />
                <span>{isZh ? 'AI 理解测试' : 'Agent Simulation Test'}</span>
              </div>

              {report.agentSimulations.map((sim, i) => (
                <div key={i} className="space-y-1 bg-white p-2.5 rounded-lg border border-indigo-100 text-[11px]">
                  <p className="font-bold text-slate-800">问题：{sim.question}</p>
                  <p className="text-slate-600">结果：{sim.answer}</p>
                  {sim.reason && (
                    <div>
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedReasonId(expandedReasonId === `sim-${i}` ? null : `sim-${i}`)
                        }
                        className="text-[10px] font-semibold text-[#024AD8] hover:underline cursor-pointer mt-1"
                      >
                        {expandedReasonId === `sim-${i}`
                          ? isZh
                            ? '收起原因'
                            : 'Hide reason'
                          : isZh
                          ? '[查看原因]'
                          : '[View reason]'}
                      </button>
                      {expandedReasonId === `sim-${i}` && (
                        <p className="text-[10px] text-slate-500 mt-1 p-1.5 bg-slate-50 rounded border border-slate-200">
                          {sim.reason}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/90 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500">
            {pendingCount > 0 ? (
              <span>{isZh ? `尚有 ${pendingCount} 项待选择` : `${pendingCount} pending`}</span>
            ) : (
              <span>{isZh ? '已准备就绪' : 'Ready'}</span>
            )}
          </div>

          <button
            type="button"
            onClick={handleApplyAll}
            disabled={isApplying || localChanges.length === 0}
            className="px-5 h-9 bg-[#024AD8] hover:bg-[#003198] active:bg-[#00226B] text-white text-xs font-bold rounded-[4px] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-[#E2E2E2] disabled:text-[#9E9E9E] disabled:cursor-not-allowed shadow-xs focus-visible:outline-2 focus-visible:outline-[#024AD8]"
          >
            {isApplying ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>{isZh ? '正在应用修改…' : 'Applying...'}</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>{isZh ? '全部应用' : 'Apply All'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
