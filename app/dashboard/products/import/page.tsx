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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/dashboard/products"
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            ← Back to Products
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Import Products</h1>
          <p className="text-gray-600 mt-1">Upload your Excel or CSV file to import products</p>
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
                  Cancel
                </button>
                <button
                  onClick={handleConfirmImport}
                  disabled={isProcessing || !mapping.name || !mapping.price}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? 'Importing...' : 'Confirm Import'}
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
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Import Another File
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
