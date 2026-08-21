'use client'

import React, { useState } from 'react'
import type {
  BrandBusinessStructuredData,
  ProductKnowledgeSupplementaryData,
  SupportPolicyStructuredData,
  KnowledgeFileSource,
  KnowledgeProductBinding,
  AiSuggestedBindingMatch,
} from './types'
import {
  INITIAL_KNOWLEDGE_SOURCES,
  INITIAL_PRODUCT_BINDINGS,
  INITIAL_AI_SUGGESTIONS,
} from './mockData'
import { SystemPresetsSection } from './SystemPresetsSection'
import { KnowledgeSourcesSection } from './KnowledgeSourcesSection'
import { V2PreviewModalType } from './V2PreviewModals'

interface MyKnowledgeViewProps {
  isZh: boolean
  onOpenV2Preview?: (type: V2PreviewModalType) => void
  brandData: BrandBusinessStructuredData
  productData?: ProductKnowledgeSupplementaryData
  policyData?: SupportPolicyStructuredData
  onSaveBrand: (data: BrandBusinessStructuredData) => void
  onSaveProduct?: (data: ProductKnowledgeSupplementaryData) => void
  onSavePolicy?: (data: SupportPolicyStructuredData) => void
}

export function MyKnowledgeView({
  isZh,
  brandData,
  onSaveBrand,
}: MyKnowledgeViewProps) {
  // Relational Knowledge State
  const [sources, setSources] = useState<KnowledgeFileSource[]>(INITIAL_KNOWLEDGE_SOURCES)
  const [bindings, setBindings] = useState<KnowledgeProductBinding[]>(INITIAL_PRODUCT_BINDINGS)
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestedBindingMatch[]>(INITIAL_AI_SUGGESTIONS)

  // Upload handler with realistic state transitions
  const handleUploadFile = (file: File) => {
    const newId = `src-user-${Date.now()}`
    const extension = file.name.split('.').pop()?.toLowerCase() || 'txt'

    let type: any = 'txt'
    if (['pdf'].includes(extension)) type = 'pdf'
    else if (['md', 'markdown'].includes(extension)) type = 'markdown'
    else if (['doc', 'docx'].includes(extension)) type = 'docx'
    else if (['xlsx', 'xls', 'csv'].includes(extension)) type = 'xlsx'
    else if (['json'].includes(extension)) type = 'json'

    const sizeFormatted =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`

    const newSource: KnowledgeFileSource = {
      id: newId,
      name: file.name,
      type,
      size: sizeFormatted,
      sizeBytes: file.size,
      updatedAt: new Date().toISOString().split('T')[0],
      visibility: 'customer-facing',
      status: 'uploading',
      progress: 30,
      tokensCount: 0,
      summary: isZh ? '正在上传文件...' : 'Uploading file...',
    }

    setSources((prev) => [newSource, ...prev])

    // Transition: processing
    setTimeout(() => {
      setSources((prev) =>
        prev.map((s) =>
          s.id === newId
            ? {
                ...s,
                status: 'processing',
                progress: 75,
                summary: isZh ? '正在解析内容与向量索引...' : 'Processing & indexing...',
              }
            : s
        )
      )
    }, 800)

    // Transition: ready
    setTimeout(() => {
      setSources((prev) =>
        prev.map((s) =>
          s.id === newId
            ? {
                ...s,
                status: 'ready',
                progress: 100,
                tokensCount: Math.floor(file.size / 200) + 1200,
                summary: isZh ? '已就绪' : 'Ready',
              }
            : s
        )
      )
    }, 1800)
  }

  // Delete file handler (Deletes source file completely and removes all associated bindings)
  const handleDeleteFile = (sourceId: string) => {
    setSources((prev) => prev.filter((s) => s.id !== sourceId))
    setBindings((prev) => prev.filter((b) => b.sourceId !== sourceId))
    setAiSuggestions((prev) => prev.filter((sug) => sug.sourceId !== sourceId))
  }

  // Toggle binding for multi-select in AssociateProductModal
  const handleToggleBinding = (sourceId: string, productId: string) => {
    const existing = bindings.find(
      (b) => b.sourceId === sourceId && b.productId === productId
    )
    if (existing) {
      setBindings((prev) => prev.filter((b) => b.id !== existing.id))
    } else {
      const newBinding: KnowledgeProductBinding = {
        id: `bind-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sourceId,
        productId,
        boundAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        matchType: 'manual',
      }
      setBindings((prev) => [...prev, newBinding])
    }
  }

  // Remove binding between specific source and product
  const handleRemoveBinding = (sourceId: string, productId: string) => {
    setBindings((prev) =>
      prev.filter((b) => !(b.sourceId === sourceId && b.productId === productId))
    )
  }

  // Add binding between specific source and product
  const handleAddBinding = (sourceId: string, productId: string) => {
    const already = bindings.some(
      (b) => b.sourceId === sourceId && b.productId === productId
    )
    if (already) return

    const newBinding: KnowledgeProductBinding = {
      id: `bind-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sourceId,
      productId,
      boundAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      matchType: 'manual',
    }
    setBindings((prev) => [...prev, newBinding])
  }

  // Confirm AI Auto-Match suggestion
  const handleConfirmAiSuggestion = (suggestionId: string) => {
    const sug = aiSuggestions.find((s) => s.id === suggestionId)
    if (!sug) return

    // Add binding
    handleAddBinding(sug.sourceId, sug.productId)

    // Remove suggestion
    setAiSuggestions((prev) => prev.filter((s) => s.id !== suggestionId))
  }

  // Ignore AI Auto-Match suggestion
  const handleIgnoreAiSuggestion = (suggestionId: string) => {
    setAiSuggestions((prev) => prev.filter((s) => s.id !== suggestionId))
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Block A: 官方系统预设 (Compact Accordion, Collapsed by Default) */}
      <SystemPresetsSection
        brandData={brandData}
        onSaveBrand={onSaveBrand}
        isZh={isZh}
      />

      {/* Block B: 知识源文件库 (Global Upload & 3-Tier Progressive Disclosure File Library) */}
      <KnowledgeSourcesSection
        sources={sources}
        bindings={bindings}
        aiSuggestions={aiSuggestions}
        onUploadFile={handleUploadFile}
        onDeleteFile={handleDeleteFile}
        onToggleBinding={handleToggleBinding}
        onRemoveBinding={handleRemoveBinding}
        onAddBinding={handleAddBinding}
        onConfirmAiSuggestion={handleConfirmAiSuggestion}
        onIgnoreAiSuggestion={handleIgnoreAiSuggestion}
        isZh={isZh}
      />
    </div>
  )
}
