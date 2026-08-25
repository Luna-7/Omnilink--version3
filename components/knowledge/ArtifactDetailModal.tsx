'use client'

import React, { useState } from 'react'
import {
  X,
  Copy,
  Check,
  Download,
  Pin,
  PinOff,
  Sparkles,
  Share2,
  FileText,
  Clock,
  Layers,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import type { SavedArtifact } from './types'

interface ArtifactDetailModalProps {
  artifact: SavedArtifact | null
  isOpen: boolean
  onClose: () => void
  onTogglePin?: (id: string) => void
  onInsertToChat?: (artifact: SavedArtifact) => void
}

export function ArtifactDetailModal({
  artifact,
  isOpen,
  onClose,
  onTogglePin,
  onInsertToChat,
}: ArtifactDetailModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen || !artifact) return null

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(artifact.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([artifact.content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${artifact.title.replace(/\s+/g, '_')}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-3xl bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl text-[#111827] overflow-hidden flex flex-col max-h-[88vh] z-10 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E7EB] bg-[#F9FAFB] flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#024AD8] border border-blue-100 text-xs font-bold">
                {artifact.typeLabel}
              </span>
              <span className="text-xs text-[#6B7280] flex items-center gap-1">
                <Clock size={12} />
                {artifact.createdAt}
              </span>
              <span className="text-xs text-[#6B7280] flex items-center gap-1">
                <Layers size={12} />
                {artifact.sourcesText}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#111827] leading-snug truncate">
              {artifact.title}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onTogglePin && (
              <button
                type="button"
                onClick={() => onTogglePin(artifact.id)}
                className={`p-2 rounded-[4px] border transition-colors cursor-pointer ${
                  artifact.pinned
                    ? 'bg-amber-50 border-amber-200 text-amber-600'
                    : 'bg-white border-[#D1D5DB] text-[#4B5563] hover:text-[#111827] hover:bg-[#F3F4F6]'
                }`}
                title={artifact.pinned ? '取消置顶' : '置顶固定'}
              >
                {artifact.pinned ? <PinOff size={15} /> : <Pin size={15} />}
              </button>
            )}

            <button
              type="button"
              onClick={handleCopy}
              className="p-2 rounded-[4px] bg-white border border-[#D1D5DB] text-[#374151] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
              title="复制 Markdown 内容"
            >
              {copied ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="p-2 rounded-[4px] bg-white border border-[#D1D5DB] text-[#374151] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
              title="导出为 Markdown 文件"
            >
              <Download size={15} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-[4px] bg-white border border-[#D1D5DB] text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors cursor-pointer ml-1"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Markdown Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scroll space-y-4 bg-white text-[#374151]">
          <div className="prose prose-sm max-w-none text-xs sm:text-sm leading-relaxed">
            <ReactMarkdown
              components={{
                h3({ children }) {
                  return (
                    <h3 className="text-base font-bold text-[#024AD8] mt-4 mb-2 pb-1 border-b border-[#E5E7EB]">
                      {children}
                    </h3>
                  )
                },
                h4({ children }) {
                  return (
                    <h4 className="text-sm font-bold text-[#111827] mt-3 mb-1.5">
                      {children}
                    </h4>
                  )
                },
                strong({ children }) {
                  return <b className="font-bold text-[#111827]">{children}</b>
                },
                p({ children }) {
                  return <p className="text-[#374151] leading-relaxed my-2">{children}</p>
                },
                ul({ children }) {
                  return <ul className="list-disc pl-5 my-2 space-y-1.5 text-[#374151]">{children}</ul>
                },
                li({ children }) {
                  return <li className="text-[#374151]">{children}</li>
                },
              }}
            >
              {artifact.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#F9FAFB] border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#6B7280] shrink-0">
          <span>{artifact.wordCount ? `字数统计：约 ${artifact.wordCount} 字` : '研报已自动归档'}</span>

          <div className="flex items-center gap-2">
            {onInsertToChat && (
              <button
                type="button"
                onClick={() => {
                  onInsertToChat(artifact)
                  onClose()
                }}
                className="px-3 py-1.5 rounded-[4px] bg-[#024AD8] hover:bg-[#003198] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles size={13} />
                <span>基于此研报继续深聊</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-[4px] bg-white border border-[#D1D5DB] hover:bg-[#F3F4F6] text-[#374151] text-xs font-semibold cursor-pointer"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
