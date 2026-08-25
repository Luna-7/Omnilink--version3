import React from 'react'

export function ProductWorkspaceSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-150 max-w-7xl mx-auto" aria-label="Loading product workspace">
      {/* 顶部标题与操作栏骨架 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[4px] bg-slate-200 animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-6 w-48 rounded bg-slate-200 animate-pulse" />
            <div className="h-3.5 w-64 rounded bg-slate-100 animate-pulse" />
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-20 rounded-[4px] bg-slate-200 animate-pulse" />
          <div className="h-8 w-24 rounded-[4px] bg-blue-200/80 animate-pulse" />
        </div>
      </div>

      {/* 主体双列网格骨架 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：基本信息 & 媒体 */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs space-y-4">
            <div className="h-4 w-28 rounded bg-slate-200 animate-pulse" />
            <div className="space-y-3">
              <div className="h-9 w-full rounded-[4px] bg-slate-100 animate-pulse" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-9 rounded-[4px] bg-slate-100 animate-pulse" />
                <div className="h-9 rounded-[4px] bg-slate-100 animate-pulse" />
              </div>
              <div className="h-20 w-full rounded-[4px] bg-slate-100 animate-pulse" />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs space-y-4">
            <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
            <div className="grid grid-cols-3 gap-3">
              <div className="aspect-square rounded-xl bg-slate-100 animate-pulse" />
              <div className="aspect-square rounded-xl bg-slate-100 animate-pulse" />
              <div className="aspect-square rounded-xl bg-slate-50 border border-dashed border-slate-200" />
            </div>
          </div>
        </div>

        {/* 右侧：定价、库存与规格 */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs space-y-4">
            <div className="h-4 w-32 rounded bg-slate-200 animate-pulse" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-9 rounded-[4px] bg-slate-100 animate-pulse" />
              <div className="h-9 rounded-[4px] bg-slate-100 animate-pulse" />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs space-y-4">
            <div className="h-4 w-36 rounded bg-slate-200 animate-pulse" />
            <div className="space-y-2.5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 rounded-[4px] bg-slate-100 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
