'use client'

import { useState } from 'react'
import { ImportForm } from '@/components/import/ImportForm'
import { ImportPreview } from '@/components/import/ImportPreview'
import { ImportResult } from '@/components/import/ImportResult'
import { FieldMapping } from '@/components/import/FieldMapping'
import { ImportPreview as ImportPreviewType, ParsedSheet, StableField } from '@/lib/imports/parser'
import { previewImportAction, confirmImportAction } from '@/app/actions/imports'
import Link from 'next/link'

type Step = 'upload' | 'preview' | 'result'

export default function ImportPage() {
  const [step, setStep] = useState<Step>('upload')
  const [preview, setPreview] = useState<ImportPreviewType | null>(null)
  const [sheet, setSheet] = useState<ParsedSheet | null>(null)
  const [mapping, setMapping] = useState<Partial<Record<StableField, string>>>({})
  const [importResult, setImportResult] = useState<{
    success: boolean
    successRows?: number
    failedRows?: number
    errors?: Array<{ row: number; field: string; message: string }>
    mapping?: Record<string, string>
    error?: string
  } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePreview = async (formData: FormData) => {
    setIsProcessing(true)
    try {
      const result = await previewImportAction(formData)
      if (result.success && result.data) {
        setPreview(result.data.preview)
        setSheet(result.data.sheet)
        setMapping(result.data.preview.detectedMapping)
        setStep('preview')
      } else {
        setImportResult({
          success: false,
          error: result.error,
        })
        setStep('result')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleMappingChange = (newMapping: Partial<Record<StableField, string>>) => {
    setMapping(newMapping)
  }

  const handleConfirmImport = async () => {
    if (!sheet) return

    setIsProcessing(true)
    try {
      const result = await confirmImportAction(sheet, mapping)
      setImportResult(result.success ? {
        success: true,
        successRows: result.data?.successRows,
        failedRows: result.data?.failedRows,
        errors: result.data?.errors,
        mapping: result.data?.mapping,
      } : {
        success: false,
        error: result.error,
      })
      setStep('result')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setStep('upload')
    setPreview(null)
    setSheet(null)
    setMapping({})
    setImportResult(null)
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <Link
          href="/dashboard/products"
          className="text-violet-600 hover:text-violet-700 text-sm font-medium"
        >
          ← 返回产品列表
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 mt-4">AI 智能导入</h1>
        <p className="text-sm text-gray-500 mt-1.5">
          上传 Excel 或 CSV 文件，AI 帮你把非结构化商品资料解析为机器可理解的数据
        </p>
      </div>

      <div className="space-y-6">
          {step === 'upload' && (
            <ImportForm onPreview={handlePreview} />
          )}

          {step === 'preview' && preview && sheet && (
            <>
              <ImportPreview preview={preview} />
              <FieldMapping
                headers={preview.headers}
                detectedMapping={preview.detectedMapping}
                onMappingChange={handleMappingChange}
              />
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  disabled={isProcessing}
                  className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmImport}
                  disabled={isProcessing || !mapping.name || !mapping.price}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? '正在导入…' : '确认导入'}
                </button>
              </div>
            </>
          )}

          {step === 'result' && importResult && (
            <>
              <ImportResult
                success={importResult.success}
                successRows={importResult.successRows}
                failedRows={importResult.failedRows}
                errors={importResult.errors}
                mapping={importResult.mapping}
                error={importResult.error}
              />
              <button
                onClick={handleReset}
                className="btn-primary-omni w-full py-3 px-4 rounded-lg"
              >
                继续导入下一个文件
              </button>
            </>
          )}
        </div>
    </div>
  )
}
