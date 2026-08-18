import React from 'react'

export function ProductsSkeleton() {
  return (
    <div className="space-y-5 animate-in fade-in duration-200" aria-label="Loading products">
      {/* 顶部指标卡行 骨架屏 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="crextio-card p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200/80 ai-shimmer shrink-0" />
              <div className="space-y-2">
                <div className="h-3 w-20 rounded bg-gray-200/80 ai-shimmer" />
                <div className="h-5 w-16 rounded bg-gray-200/80 ai-shimmer" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 主体操作栏与产品列表 骨架屏 */}
      <div className="crextio-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="space-y-2">
            <div className="h-5 w-32 rounded bg-gray-200/80 ai-shimmer" />
            <div className="h-3 w-48 rounded bg-gray-200/80 ai-shimmer" />
          </div>

          <div className="flex items-center gap-2.5">
            <div className="h-8 w-28 rounded-full bg-gray-200/80 ai-shimmer" />
            <div className="h-8 w-24 rounded-full bg-gray-200/80 ai-shimmer" />
          </div>
        </div>

        {/* 状态药丸与搜索栏 骨架屏 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-1.5 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-7 w-20 rounded-full bg-gray-200/80 ai-shimmer shrink-0" />
            ))}
          </div>
          <div className="h-9 w-full sm:w-64 rounded-full bg-gray-200/80 ai-shimmer" />
        </div>

        {/* 网格卡片 骨架屏 */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-[#F4F5F7]/70 border border-[#E5E7EB] rounded-2xl p-4 flex flex-col justify-between gap-3"
            >
              <div>
                <div className="w-full aspect-square rounded-xl bg-gray-200/80 ai-shimmer" />
                <div className="space-y-2 mt-3">
                  <div className="flex justify-between items-center">
                    <div className="h-3 w-12 rounded bg-gray-200/80 ai-shimmer" />
                    <div className="h-3 w-16 rounded bg-gray-200/80 ai-shimmer" />
                  </div>
                  <div className="h-4 w-3/4 rounded bg-gray-200/80 ai-shimmer" />
                  <div className="flex justify-between items-center mt-2">
                    <div className="h-4 w-16 rounded bg-gray-200/80 ai-shimmer" />
                    <div className="h-3 w-12 rounded bg-gray-200/80 ai-shimmer" />
                  </div>
                </div>
              </div>
              <div className="pt-2.5 border-t border-[#E5E7EB]/80 flex justify-between items-center">
                <div className="h-5 w-20 rounded-md bg-gray-200/80 ai-shimmer" />
                <div className="h-4 w-12 rounded bg-gray-200/80 ai-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
