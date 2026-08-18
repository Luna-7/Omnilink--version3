'use client'

import { useState, useRef } from 'react'

interface ImportFormProps {
  onPreview: (formData: FormData) => Promise<void>
}

export function ImportForm({ onPreview }: ImportFormProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [hasFile, setHasFile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      setHasFile(true)
      await processFile(file)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setHasFile(true)
      await processFile(file)
    }
  }

  const processFile = async (file: File) => {
    setError('')
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      await onPreview(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 大型亚克力拖入区 */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`glass-panel rounded-lg border-2 border-dashed p-12 text-center transition-colors duration-200 ${
          isDragging
            ? 'border-[#3b3686] bg-[#3b3686]/[0.04]'
            : 'border-[#3b3686]/25 hover:border-[#3b3686]/45'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="space-y-4">
          <div className="mx-auto w-14 h-14 bg-[#3b3686]/[0.08] border border-[#3b3686]/15 rounded-md flex items-center justify-center">
            <svg
              className="w-7 h-7 text-[#3b3686]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.75}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <div>
            <p className="text-base font-medium text-gray-900">
              {isDragging ? '松开以上传文件' : '拖入 Excel / CSV 产品文件'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              AI 将自动识别产品字段、分类与语义数据
            </p>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="btn-primary-omni px-5 h-9 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'AI 正在解析…' : '选择文件'}
          </button>
          <p className="text-xs text-gray-400">
            支持 .xlsx / .xls / .csv
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-[#f59e0b]/[0.08] border border-[#f59e0b]/25 text-[#b45309] px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
