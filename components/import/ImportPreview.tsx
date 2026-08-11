'use client'

import { ImportPreview as ImportPreviewType } from '@/lib/imports/parser'

interface ImportPreviewProps {
  preview: ImportPreviewType
}

export function ImportPreview({ preview }: ImportPreviewProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">File Preview</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">File Name</p>
            <p className="font-medium text-gray-900">{preview.fileName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Rows</p>
            <p className="font-medium text-gray-900">{preview.totalRows}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Columns</p>
            <p className="font-medium text-gray-900">{preview.headers.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Unknown Fields</p>
            <p className="font-medium text-gray-900">{preview.unknownFields.length}</p>
          </div>
        </div>

        {preview.warnings.length > 0 && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">Warnings</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              {preview.warnings.map((warning, index) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Detected Columns</h4>
          <div className="flex flex-wrap gap-2">
            {preview.headers.map((header) => (
              <span
                key={header}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
              >
                {header}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sample Data (First 10 Rows)</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                {preview.headers.map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {preview.sampleRows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {preview.headers.map((header) => (
                    <td
                      key={header}
                      className="px-4 py-3 whitespace-nowrap text-sm text-gray-900"
                    >
                      {String(row[header] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
