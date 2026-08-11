'use client'

import { useState, useEffect } from 'react'
import { StableField, detectStableMapping } from '@/lib/imports/parser'

interface FieldMappingProps {
  headers: string[]
  detectedMapping: Partial<Record<StableField, string>>
  onMappingChange: (mapping: Partial<Record<StableField, string>>) => void
}

const STABLE_FIELDS: { key: StableField; label: string; required: boolean }[] = [
  { key: 'name', label: 'Product Name', required: true },
  { key: 'sku', label: 'SKU', required: false },
  { key: 'price', label: 'Price', required: true },
  { key: 'currency', label: 'Currency', required: false },
  { key: 'inventory', label: 'Inventory', required: false },
  { key: 'description', label: 'Description', required: false },
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
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Field Mapping</h3>
      <p className="text-sm text-gray-600 mb-6">
        Map your Excel columns to Omnilink product fields
      </p>

      <div className="space-y-4">
        {STABLE_FIELDS.map(({ key, label, required }) => (
          <div key={key} className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </label>
            </div>
            <div className="flex-1">
              <select
                value={mapping[key] || ''}
                onChange={(e) => handleFieldChange(key, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Select Field --</option>
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
        <h4 className="text-sm font-medium text-gray-700 mb-2">Detected Mapping</h4>
        <div className="space-y-1">
          {Object.entries(detectedMapping).map(([field, header]) => (
            <div key={field} className="text-xs text-gray-600">
              <span className="font-medium">{field}</span> → {header}
            </div>
          ))}
          {Object.keys(detectedMapping).length === 0 && (
            <p className="text-xs text-gray-500">No fields automatically detected</p>
          )}
        </div>
      </div>
    </div>
  )
}
