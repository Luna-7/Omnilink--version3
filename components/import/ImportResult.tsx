'use client'

import { useRouter } from 'next/navigation'

interface ValidationError {
  row: number
  field: string
  message: string
}

interface ImportResultProps {
  success: boolean
  successRows?: number
  failedRows?: number
  errors?: ValidationError[]
  mapping?: Record<string, string>
  error?: string
}

export function ImportResult({ success, successRows, failedRows, errors, mapping, error }: ImportResultProps) {
  const router = useRouter()

  if (!success) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-900">Import Failed</h3>
        </div>
        <p className="text-red-700">{error || 'An error occurred during import'}</p>
      </div>
    )
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <svg
            className="w-6 h-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-green-900">Import Completed</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-green-700">Success Rows</p>
          <p className="text-2xl font-bold text-green-900">{successRows}</p>
        </div>
        <div>
          <p className="text-sm text-red-700">Failed Rows</p>
          <p className="text-2xl font-bold text-red-900">{failedRows}</p>
        </div>
      </div>

      {errors && errors.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-red-900 mb-2">Errors ({errors.length})</h4>
          <div className="bg-white border border-red-200 rounded-lg p-4 max-h-64 overflow-y-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Row</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Field</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                </tr>
              </thead>
              <tbody>
                {errors.slice(0, 20).map((err, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="px-3 py-2 text-sm text-gray-900">{err.row}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">{err.field}</td>
                    <td className="px-3 py-2 text-sm text-red-600">{err.message}</td>
                  </tr>
                ))}
                {errors.length > 20 && (
                  <tr>
                    <td colSpan={3} className="px-3 py-2 text-sm text-gray-500 text-center">
                      ... and {errors.length - 20} more errors
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {mapping && Object.keys(mapping).length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-green-900 mb-2">Field Mapping</h4>
          <div className="space-y-2">
            {Object.entries(mapping).map(([field, header]) => (
              <div key={field} className="flex items-center gap-2 text-sm">
                <span className="bg-green-200 text-green-800 px-2 py-1 rounded font-medium">
                  {field}
                </span>
                <span className="text-green-700">←</span>
                <span className="text-green-900">{header}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => router.push('/dashboard/products')}
        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
      >
        View Products
      </button>
    </div>
  )
}
