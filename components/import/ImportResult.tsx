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
      <div className="bg-deep-orange border border-deep-orange rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-deep-orange rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-deep-orange"
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
          <h3 className="text-lg font-semibold text-deep-orange">导入失败</h3>
        </div>
        <p className="text-deep-orange">{error || '导入过程中发生错误'}</p>
      </div>
    )
  }

  return (
    <div className="bg-apricot border border-apricot rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-apricot rounded-full flex items-center justify-center">
          <svg
            className="w-6 h-6 text-apricot"
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
        <h3 className="text-lg font-semibold text-apricot">导入完成</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-apricot">成功行数</p>
          <p className="text-2xl font-bold text-apricot">{successRows}</p>
        </div>
        <div>
          <p className="text-sm text-deep-orange">失败行数</p>
          <p className="text-2xl font-bold text-deep-orange">{failedRows}</p>
        </div>
      </div>

      {errors && errors.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-deep-orange mb-2">错误（{errors.length})</h4>
          <div className="bg-white border border-deep-orange rounded-lg p-4 max-h-64 overflow-y-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">行</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">字段</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">信息</th>
                </tr>
              </thead>
              <tbody>
                {errors.slice(0, 20).map((err, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="px-3 py-2 text-sm text-gray-900">{err.row}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">{err.field}</td>
                    <td className="px-3 py-2 text-sm text-deep-orange">{err.message}</td>
                  </tr>
                ))}
                {errors.length > 20 && (
                  <tr>
                    <td colSpan={3} className="px-3 py-2 text-sm text-gray-500 text-center">
                      … 另有 {errors.length - 20} 条错误
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
          <h4 className="text-sm font-medium text-apricot mb-2">字段映射</h4>
          <div className="space-y-2">
            {Object.entries(mapping).map(([field, header]) => (
              <div key={field} className="flex items-center gap-2 text-sm">
                <span className="bg-apricot text-apricot px-2 py-1 rounded font-medium">
                  {field}
                </span>
                <span className="text-apricot">←</span>
                <span className="text-apricot">{header}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => router.push('/dashboard/products')}
        className="w-full bg-apricot text-white py-3 px-4 rounded-lg hover:bg-apricot transition-colors"
      >
        View Products
      </button>
    </div>
  )
}
