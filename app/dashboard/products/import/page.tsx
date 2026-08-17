'use client'

import { useState } from 'react'
import { ImportForm } from '@/components/import/ImportForm'
import { ImportPreview } from '@/components/import/ImportPreview'
import { ImportResult } from '@/components/import/ImportResult'
import { FieldMapping } from '@/components/import/FieldMapping'
import { VariantAnalysisPreview } from '@/components/import/VariantAnalysisPreview'
import { ImportPreview as ImportPreviewType, ParsedSheet, StableField } from '@/lib/imports/parser'
import type { ImportAnalysis } from '@/lib/imports/types'
import { previewImportAction, analyzeImportAction, confirmImportAction } from '@/app/actions/imports'
import Link from 'next/link'

type Step = 'upload' | 'mapping' | 'analysis' | 'confirmation' | 'result'

export default function ImportPage() {
  const [step, setStep] = useState<Step>('upload')
  const [preview, setPreview] = useState<ImportPreviewType | null>(null)
  const [sheet, setSheet] = useState<ParsedSheet | null>(null)
  const [mapping, setMapping] = useState<Partial<Record<StableField, string>>>({})
  const [analysis, setAnalysis] = useState<ImportAnalysis | null>(null)
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
        setStep('mapping')
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

  const handleAnalyze = async () => {
    if (!sheet) return

    setIsProcessing(true)
    try {
      const result = await analyzeImportAction(sheet, mapping)
      if (result.success && result.data) {
        setAnalysis(result.data.analysis)
        setStep('analysis')
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
    setAnalysis(null)
    setImportResult(null)
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <Link
          href="/dashboard/products"
          className="text-iris hover:text-iris text-sm font-medium"
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

          {step === 'mapping' && preview && sheet && (
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
                  onClick={handleAnalyze}
                  disabled={isProcessing || !mapping.name || !mapping.price}
                  className="flex-1 bg-apricot text-white py-3 px-4 rounded-lg hover:bg-apricot disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? '正在分析…' : '下一步：分析变体'}
                </button>
              </div>
            </>
          )}

          {step === 'analysis' && analysis && (
            <>
              <VariantAnalysisPreview analysis={analysis} />
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('mapping')}
                  disabled={isProcessing}
                  className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  返回修改映射
                </button>
                <button
                  onClick={() => setStep('confirmation')}
                  disabled={isProcessing || analysis.mode === 'needs_review'}
                  className="flex-1 bg-apricot text-white py-3 px-4 rounded-lg hover:bg-apricot disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {analysis.mode === 'needs_review' ? '需要先解决冲突' : '确认导入结构'}
                </button>
              </div>
            </>
          )}

          {step === 'confirmation' && analysis && (
            <>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">确认导入</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">导入模式: {analysis.mode === 'single_sku' ? '单 SKU' : analysis.mode === 'variant_candidate' ? '变体模式' : '需要审核'}</p>
                      <p className="text-sm text-gray-500">
                        {analysis.summary.productGroups} 个产品组，{analysis.summary.variantCount} 个变体
                      </p>
                    </div>
                  </div>
                  
                  {analysis.mode === 'needs_review' && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        ⚠️ 检测到 {analysis.summary.conflictCount} 个冲突，需要人工审核后才能导入
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('analysis')}
                  disabled={isProcessing}
                  className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  返回分析
                </button>
                <button
                  onClick={handleConfirmImport}
                  disabled={isProcessing || analysis.mode === 'needs_review'}
                  className="flex-1 bg-apricot text-white py-3 px-4 rounded-lg hover:bg-apricot disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
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
