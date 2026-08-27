'use client'

import React, { useState } from 'react'
import { X, ShieldPlus } from 'lucide-react'
import { AuthorizedMerchant } from './types'

interface AuthorizeMerchantModalProps {
  isOpen: boolean
  onClose: () => void
  workName: string
  onAuthorize: (merchant: AuthorizedMerchant) => void
}

export function AuthorizeMerchantModal({
  isOpen,
  onClose,
  workName,
  onAuthorize,
}: AuthorizeMerchantModalProps) {
  const [merchantName, setMerchantName] = useState('')
  const [scope, setScope] = useState('商品展示')
  const [validity, setValidity] = useState('2026.08.27 — 2027.08.27')

  if (!isOpen) return null

  const handleConfirm = () => {
    if (!merchantName.trim()) return
    const newMerchant: AuthorizedMerchant = {
      id: `auth-${Date.now()}`,
      name: merchantName.trim(),
      scope,
      validity,
      status: 'active',
      authorizedDate: '2026-08-27',
    }
    onAuthorize(newMerchant)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[8px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldPlus size={16} className="text-[#024AD8]" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              授权商家使用作品
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-[3px] flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div>
            <span className="text-slate-500">授权目标作品：</span>
            <span className="font-bold text-slate-900 dark:text-white ml-1">
              {workName}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              商家主体 / 店铺名称
            </label>
            <input
              type="text"
              placeholder="例如：Nordic Essence Co."
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              className="w-full h-8 px-3 rounded-[4px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#024AD8]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              授权使用范围
            </label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="w-full h-8 px-3 rounded-[4px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#024AD8] cursor-pointer"
            >
              <option value="商品展示">商品展示</option>
              <option value="营销内容">营销内容</option>
              <option value="全渠道包装使用">全渠道包装使用</option>
              <option value="授权分销与独立陈列">授权分销与独立陈列</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              授权有效期
            </label>
            <input
              type="text"
              value={validity}
              onChange={(e) => setValidity(e.target.value)}
              className="w-full h-8 px-3 rounded-[4px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#024AD8]"
            />
          </div>
        </div>

        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 bg-slate-50/50 dark:bg-slate-850/50">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-3 rounded-[4px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
          >
            取消
          </button>
          <button
            type="button"
            disabled={!merchantName.trim()}
            onClick={handleConfirm}
            className="h-8 px-4 rounded-[4px] bg-[#024AD8] hover:bg-[#003198] active:bg-[#00226B] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-semibold transition-all cursor-pointer"
          >
            颁发数字授权
          </button>
        </div>
      </div>
    </div>
  )
}
