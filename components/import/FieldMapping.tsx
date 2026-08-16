'use client'

import { useState, useEffect } from 'react'
import { StableField, detectStableMapping } from '@/lib/imports/parser'

interface FieldMappingProps {
  headers: string[]
  detectedMapping: Partial<Record<StableField, string>>
  onMappingChange: (mapping: Partial<Record<StableField, string>>) => void
}

const STABLE_FIELDS: { key: StableField; label: string; required: boolean }[] = [
  { key: 'name', label: '产品名称', required: true },
  { key: 'sku', label: 'SKU', required: false },
  { key: 'price', label: '价格', required: true },
  { key: 'currency', label: '货币', required: false },
  { key: 'inventory', label: '库存', required: false },
  { key: 'description', label: '描述', required: false },
]

export function FieldMapping({ headers, detectedMapping, onMappingChange }: FieldMappingProps) {
  const [mapping, setMapping] = useState(detectedMapping)

  // Auto-detect mapping if not provided
  useEffect(() => {
    if (Object.keys(detectedMapping).length === 0) {
      const autoMapping = detectStableMapping(headers)
      setMapping(autoMapping)
      onMappingChange(autoMapping)
    }
  }, [headers, detectedMapping, onMappingChange])

  const handleFieldChange = (field: StableField, header: string) => {
    const newMapping = { ...mapping, [field]: header || undefined }
    setMapping(newMapping)
    onMappingChange(newMapping)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">字段映射</h3>
      <p className="text-sm text-gray-600 mb-6">
        将你的表格列映射到 Omnilink 产品字段
      </p>

      <div className="space-y-4">
        {STABLE_FIELDS.map(({ key, label, required }) => (
          <div key={key} className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-deep-orange ml-1">*</span>}
              </label>
            </div>
            <div className="flex-1">
              <select
                value={mapping[key] || ''}
                onChange={(e) => handleFieldChange(key, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#3b3686]/25 focus:border-[#3b3686]"
              >
                <option value="">-- 选择列 --</option>
                {headers.map((header) => (
                  <option key={header} value={header}>
                    {header}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">自动检测结果</h4>
        <div className="space-y-1">
          {Object.entries(detectedMapping).map(([field, header]) => (
            <div key={field} className="text-xs text-gray-600">
              <span className="font-medium">{field}</span> → {header}
            </div>
          ))}
          {Object.keys(detectedMapping).length === 0 && (
            <p className="text-xs text-gray-500">未自动识别到字段</p>
          )}
        </div>
      </div>
    </div>
  )
}
