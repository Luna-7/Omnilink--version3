'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import {
  X,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  Send,
  Lock,
} from 'lucide-react'

interface SimulateConflictModalProps {
  isOpen: boolean
  onClose: () => void
  onAuthorizedGranted?: () => void
}

export function SimulateConflictModal({
  isOpen,
  onClose,
  onAuthorizedGranted,
}: SimulateConflictModalProps) {
  const [viewState, setViewState] = useState<'detected' | 'applying' | 'success'>('detected')
  const [requestStoreName, setRequestStoreName] = useState('Nordic Living Concept')
  const [selectedScope, setSelectedScope] = useState('全渠道商品主图与详情页展示')
  const [applicantNote, setApplicantNote] = useState('希望在北欧生活馆精选栏目中展示该雨林扩香仪系列。')

  if (!isOpen) return null

  const handleSendRequest = () => {
    setViewState('success')
    if (onAuthorizedGranted) {
      onAuthorizedGranted()
    }
  }

  const handleResetAndClose = () => {
    setViewState('detected')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs transition-opacity">
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-[8px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scenario Header Bar */}
        <div className="px-5 py-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[2px] bg-blue-500/20 text-blue-300 font-semibold border border-blue-400/30">
              交互演示
            </span>
            <span className="text-xs font-bold tracking-tight">
              模拟第三方商家上传受保护素材时的平台拦截流
            </span>
          </div>
          <button
            onClick={handleResetAndClose}
            className="w-6 h-6 rounded-[3px] flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {viewState === 'detected' && (
            <div className="space-y-5">
              {/* Alert Header */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-[4px] bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 shrink-0">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    发现受保护作品
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    这张图片可能属于 Omnilink 中已有的受保护作品。平台已自动进行特征比对与权限检索。
                  </p>
                </div>
              </div>

              {/* Match Card */}
              <div className="p-4 rounded-[6px] bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 space-y-3.5">
                <div className="flex items-center gap-3.5">
                  <div className="w-16 h-16 rounded-[4px] overflow-hidden relative shrink-0 border border-slate-200 dark:border-slate-700">
                    <Image
                      src="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80"
                      alt="Matched Artwork"
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        Rainforest Diffuser
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[2px] bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        ORG-8F3A-91CD
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>版权所有者: <strong className="text-slate-800 dark:text-slate-200 font-semibold">Luna Studio</strong></span>
                    </div>

                    <div className="flex items-center gap-3 pt-0.5">
                      <div className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300">
                        <span>图片匹配度:</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">94%</span>
                      </div>
                      <span className="text-slate-300 dark:text-slate-700">·</span>
                      <div className="flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400 font-semibold">
                        <Lock size={11} />
                        <span>未找到有效授权</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Explanation Note */}
              <div className="text-xs text-slate-500 bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-[4px] border border-blue-100 dark:border-blue-900/40 leading-relaxed">
                Omnilink 基础设施遵循<strong>“识别 → 验证 → 判断权限 → 提供授权”</strong>原则。您可以直接向原创者提交授权申请，或更换其他原创素材。
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="h-8 px-3.5 rounded-[4px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  移除图片
                </button>
                <button
                  type="button"
                  onClick={() => setViewState('applying')}
                  className="h-8 px-4 rounded-[4px] bg-[#024AD8] hover:bg-[#003198] active:bg-[#00226B] text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>申请使用权限</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}

          {viewState === 'applying' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  申请使用权限
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  向原创者 <strong className="text-slate-800 dark:text-slate-200">Luna Studio</strong> 提交使用申请。
                </p>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    申请商户主体
                  </label>
                  <input
                    type="text"
                    value={requestStoreName}
                    onChange={(e) => setRequestStoreName(e.target.value)}
                    className="w-full h-8 px-3 rounded-[4px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#024AD8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    申请使用范围
                  </label>
                  <select
                    value={selectedScope}
                    onChange={(e) => setSelectedScope(e.target.value)}
                    className="w-full h-8 px-3 rounded-[4px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#024AD8] cursor-pointer"
                  >
                    <option value="全渠道商品主图与详情页展示">全渠道商品主图与详情页展示</option>
                    <option value="营销海报与推广素材">营销海报与推广素材</option>
                    <option value="授权分销与独立陈列">授权分销与独立陈列</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    申请附言
                  </label>
                  <textarea
                    rows={2}
                    value={applicantNote}
                    onChange={(e) => setApplicantNote(e.target.value)}
                    className="w-full p-2.5 rounded-[4px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#024AD8]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setViewState('detected')}
                  className="h-8 px-3 rounded-[4px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  返回
                </button>
                <button
                  type="button"
                  onClick={handleSendRequest}
                  className="h-8 px-4 rounded-[4px] bg-[#024AD8] hover:bg-[#003198] active:bg-[#00226B] text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send size={12} />
                  <span>提交申请</span>
                </button>
              </div>
            </div>
          )}

          {viewState === 'success' && (
            <div className="space-y-4 py-3 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 mx-auto">
                <CheckCircle2 size={24} />
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  授权申请已成功发送
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  已向 Luna Studio 发送数字授权要约。原创方确认后，该商品将自动获得全网合规使用许可。
                </p>
              </div>

              <div className="p-3 rounded-[4px] bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>目标作品</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Rainforest Diffuser</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>申请主体</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{requestStoreName}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>申请范围</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedScope}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="h-8 px-6 rounded-[4px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  完成演示
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
