'use client'

import { ImportAnalysis } from '@/lib/imports/types'

interface VariantAnalysisPreviewProps {
  analysis: ImportAnalysis
}

export function VariantAnalysisPreview({ analysis }: VariantAnalysisPreviewProps) {
  const { mode, summary, groups } = analysis

  const getModeBadge = () => {
    switch (mode) {
      case 'single_sku':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'variant_candidate':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'needs_review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getModeLabel = () => {
    switch (mode) {
      case 'single_sku':
        return '单 SKU 模式'
      case 'variant_candidate':
        return '变体候选模式'
      case 'needs_review':
        return '需要人工审核'
      default:
        return '未知模式'
    }
  }

  return (
    <div className="space-y-6">
      {/* Analysis Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">导入分析结果</h3>
        
        <div className="mb-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getModeBadge()}`}>
            {getModeLabel()}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">总行数</p>
            <p className="text-2xl font-bold text-gray-900">{summary.totalRows}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">产品组</p>
            <p className="text-2xl font-bold text-gray-900">{summary.productGroups}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">变体数量</p>
            <p className="text-2xl font-bold text-gray-900">{summary.variantCount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">冲突数</p>
            <p className="text-2xl font-bold text-red-600">{summary.conflictCount}</p>
          </div>
        </div>

        {summary.reviewRequiredCount > 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ {summary.reviewRequiredCount} 个产品组需要人工审核
            </p>
          </div>
        )}
      </div>

      {/* Product Groups Detail */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">产品组详情</h3>
        
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.key} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{group.product.name}</h4>
                  {group.product.model && (
                    <p className="text-sm text-gray-500">型号: {group.product.model}</p>
                  )}
                  {group.product.brand && (
                    <p className="text-sm text-gray-500">品牌: {group.product.brand}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    group.requiresReview 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {group.requiresReview ? '需审核' : '正常'}
                  </span>
                </div>
              </div>

              {/* Options */}
              {group.options.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">选项定义:</p>
                  <div className="flex flex-wrap gap-2">
                    {group.options.map(option => (
                      <div key={option.code} className="bg-gray-50 border border-gray-200 rounded px-3 py-2">
                        <p className="text-xs font-medium text-gray-700">{option.name}</p>
                        <p className="text-xs text-gray-500">{option.values.join(', ')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Variants */}
              {group.variants.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    变体 ({group.variants.length}):
                  </p>
                  <div className="max-h-48 overflow-y-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-1 px-2 text-xs font-medium text-gray-500">选项组合</th>
                          <th className="text-left py-1 px-2 text-xs font-medium text-gray-500">SKU</th>
                          <th className="text-left py-1 px-2 text-xs font-medium text-gray-500">价格</th>
                          <th className="text-left py-1 px-2 text-xs font-medium text-gray-500">库存</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.variants.slice(0, 5).map((variant) => (
                          <tr key={variant.sourceRows.join('-')} className="border-b border-gray-100">
                            <td className="py-1 px-2 text-gray-900">
                              {Object.entries(variant.optionValues || {})
                                .map(([key, value]) => `${key}: ${value}`)
                                .join(', ')}
                            </td>
                            <td className="py-1 px-2 text-gray-900">{variant.sku || '-'}</td>
                            <td className="py-1 px-2 text-gray-900">{variant.price ? `$${variant.price}` : '-'}</td>
                            <td className="py-1 px-2 text-gray-900">{variant.inventory ?? '-'}</td>
                          </tr>
                        ))}
                        {group.variants.length > 5 && (
                          <tr>
                            <td colSpan={4} className="py-1 px-2 text-xs text-gray-500 text-center">
                              … 另有 {group.variants.length - 5} 个变体
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Conflicts */}
              {group.conflicts.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm font-medium text-gray-700 mb-2">字段冲突:</p>
                  {group.conflicts.map((conflict) => (
                    <div key={`${conflict.field}-${conflict.rows.join('-')}`} className="text-sm text-red-700">
                      <span className="font-medium">{conflict.field}:</span> 
                      行 {conflict.rows.join(', ')} 有不同值 ({conflict.values.join(', ')})
                    </div>
                  ))}
                </div>
              )}

              {/* Source Rows */}
              <div className="text-xs text-gray-400">
                源数据行: {group.sourceRows.join(', ')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
