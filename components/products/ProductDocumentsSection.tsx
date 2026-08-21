'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FileText,
  Lock,
  Globe,
  UploadCloud,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  EyeOff,
  ExternalLink,
} from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

/**
 * Backend Contract Request:
 *
 * POST /api/v1/products/:id/documents
 * Payload:
 * {
 *   name: string,
 *   url: string,
 *   size_bytes: number,
 *   visibility: 'public_customer_facing' | 'internal_confidential',
 *   doc_category: 'manual' | 'spec_sheet' | 'bom' | 'test_report' | 'other'
 * }
 */

interface AttachedDoc {
  id: string
  name: string
  size: string
  uploadedAt: string
  visibility: 'public' | 'private'
  type: string
  productId?: string
}

interface ProductDocumentsSectionProps {
  productId?: string
}

export function ProductDocumentsSection({ productId = 'prod-opt-001' }: ProductDocumentsSectionProps) {
  const { isZh } = useLanguage()
  const [activeTab, setActiveTab] = useState<'public' | 'private'>('public')

  const [docs, setDocs] = useState<AttachedDoc[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [newDocName, setNewDocName] = useState('')

  // Initialize and load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('omnilink_synced_product_docs')
      if (stored) {
        setDocs(JSON.parse(stored))
      } else {
        const initialDocs: AttachedDoc[] = [
          {
            id: 'doc-pub-1',
            name: 'User_Manual_OmniVibe_Wireless.pdf',
            size: '2.4 MB',
            uploadedAt: '2026-08-15',
            visibility: 'public',
            type: 'pdf',
            productId: 'prod-vibe-300',
          },
          {
            id: 'doc-pub-2',
            name: 'Quick_Start_Guide_MultiLanguage.pdf',
            size: '1.1 MB',
            uploadedAt: '2026-08-16',
            visibility: 'public',
            type: 'pdf',
            productId: 'prod-opt-001',
          },
          {
            id: 'doc-pvt-1',
            name: 'CONFIDENTIAL_BOM_Acoustic_Driver_Cost.xlsx',
            size: '3.8 MB',
            uploadedAt: '2026-08-18',
            visibility: 'private',
            type: 'xlsx',
            productId: 'prod-opt-001',
          },
          {
            id: 'doc-pvt-2',
            name: 'Factory_Frequency_Response_Yield.pdf',
            size: '5.2 MB',
            uploadedAt: '2026-08-19',
            visibility: 'private',
            type: 'pdf',
            productId: 'prod-opt-001',
          },
        ]
        localStorage.setItem('omnilink_synced_product_docs', JSON.stringify(initialDocs))
        setDocs(initialDocs)
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  // Helper to save to local storage
  const saveDocs = (newDocs: AttachedDoc[]) => {
    setDocs(newDocs)
    try {
      localStorage.setItem('omnilink_synced_product_docs', JSON.stringify(newDocs))
    } catch (e) {
      console.error(e)
    }
  }

  // Filter docs belonging to CURRENT product
  const currentProductDocs = docs.filter((d) => d.productId === productId)
  const publicDocs = currentProductDocs.filter((d) => d.visibility === 'public')
  const privateDocs = currentProductDocs.filter((d) => d.visibility === 'private')

  const handleUploadSample = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDocName.trim()) return
    const newDoc: AttachedDoc = {
      id: `doc-${Date.now()}`,
      name: newDocName.trim(),
      size: '1.5 MB',
      uploadedAt: '刚刚',
      visibility: activeTab,
      type: newDocName.toLowerCase().endsWith('.pdf') ? 'pdf' : 'doc',
      productId: productId,
    }
    saveDocs([newDoc, ...docs])
    setNewDocName('')
    setIsUploading(false)
  }

  const handleDelete = (id: string) => {
    saveDocs(docs.filter((d) => d.id !== id))
  }

  return (
    <div className="space-y-4 pt-4 border-t border-gray-200">
      {/* Title & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-gray-900">
              {isZh ? '产品关联文档与知识源' : 'Product Documents'}
            </h4>
            <Link
              href="/dashboard/knowledge"
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 transition-colors"
            >
              <span>{isZh ? '进入知识库管理' : 'Open Knowledge Workspace'}</span>
              <ExternalLink size={11} />
            </Link>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {isZh
              ? '公开文档用于前台买家问答；私密文档仅供内部研发分析。'
              : 'Public documents for customer AI; private for internal R&D.'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 border border-gray-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('public')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'public'
                ? 'bg-white text-gray-900 shadow-2xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Globe size={13} className="text-emerald-600" />
            <span>
              {isZh ? '公开文档' : 'Public'} ({publicDocs.length})
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('private')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'private'
                ? 'bg-gray-900 text-white shadow-2xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Lock size={12} className="text-purple-400" />
            <span>
              {isZh ? '私密研发' : 'Private'} ({privateDocs.length})
            </span>
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      {activeTab === 'public' ? (
        <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-900 flex items-start gap-2.5">
          <ShieldCheck size={15} className="text-emerald-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">
              {isZh ? '已进入客户知识库' : 'Customer-Facing AI Knowledge'}
            </span>
            <span className="text-emerald-800 ml-1.5">
              {isZh
                ? '已自动完成向量解析，供独立站商品详情页买家咨询与 AI 导购调用。'
                : 'Indexed for storefront customer assistance.'}
            </span>
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-purple-50/80 border border-purple-200/80 text-xs text-purple-950 flex items-start gap-2.5">
          <EyeOff size={15} className="text-purple-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">
              {isZh ? '内部私密研发文档' : 'Confidential R&D Documents'}
            </span>
            <span className="text-purple-800 ml-1.5">
              {isZh
                ? '严格隔离：仅同步至 Internal Research 工作区，外部 AI 与买家客服完全屏蔽。'
                : 'Strictly isolated to internal workspace.'}
            </span>
          </div>
        </div>
      )}

      {/* Upload Dropzone / Trigger */}
      <div className="space-y-3">
        <div className="p-4 border-2 border-dashed border-gray-200 hover:border-gray-400 rounded-xl bg-gray-50/60 text-center space-y-2 transition-colors">
          <UploadCloud size={20} className="mx-auto text-gray-500" />
          <p className="text-xs font-semibold text-gray-800">
            {isZh
              ? `拖拽文件上传至「${activeTab === 'public' ? '公开知识源' : '私密研发库'}」`
              : `Upload to ${activeTab === 'public' ? 'Public' : 'Private'} Knowledge`}
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setIsUploading(true)}
              className="px-3.5 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold shadow-2xs hover:bg-black transition-all cursor-pointer"
            >
              {isZh ? '选择文件' : 'Select File'}
            </button>
          </div>
        </div>

        {isUploading && (
          <form onSubmit={handleUploadSample} className="p-3 bg-white border border-gray-200 rounded-xl space-y-2">
            <label className="block text-xs font-semibold text-gray-900">
              {isZh ? '文件名称' : 'Document Name'}
            </label>
            <input
              type="text"
              placeholder={activeTab === 'public' ? 'User_Manual_v2.pdf' : 'CONFIDENTIAL_BOM_2026.xlsx'}
              value={newDocName}
              onChange={(e) => setNewDocName(e.target.value)}
              className="w-full h-8 px-3 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsUploading(false)}
                className="px-3 py-1 rounded-lg bg-gray-100 text-xs text-gray-700 hover:bg-gray-200"
              >
                {isZh ? '取消' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-3.5 py-1 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-black"
              >
                {isZh ? '上传' : 'Upload'}
              </button>
            </div>
          </form>
        )}

        {/* Current List for Active Tab */}
        <div className="space-y-2">
          {(activeTab === 'public' ? publicDocs : privateDocs).map((doc) => (
            <div
              key={doc.id}
              className="p-3 rounded-xl bg-white border border-gray-200/80 shadow-2xs flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-700 shrink-0">
                  <FileText size={14} className={doc.visibility === 'public' ? 'text-blue-500' : 'text-purple-600'} />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-gray-900 block truncate">{doc.name}</span>
                  <span className="text-[10px] text-gray-400 block">
                    {doc.size} · {doc.uploadedAt}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    doc.visibility === 'public'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                      : 'bg-purple-50 text-purple-700 border border-purple-200/60'
                  }`}
                >
                  {doc.visibility === 'public'
                    ? (isZh ? '已绑定至此商品' : 'Bound to Product')
                    : (isZh ? '私密隔离' : 'Private')}
                </span>

                <button
                  type="button"
                  onClick={() => handleDelete(doc.id)}
                  className="text-gray-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                  title={isZh ? '解除' : 'Remove'}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}

          {(activeTab === 'public' ? publicDocs : privateDocs).length === 0 && (
            <div className="py-6 text-center text-xs text-gray-400">
              {isZh ? '暂无关联文档' : 'No documents attached'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
