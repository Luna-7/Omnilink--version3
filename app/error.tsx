'use client'

import { useEffect } from 'react'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const isRedirect =
    error?.message === 'NEXT_REDIRECT' ||
    error?.message?.includes('NEXT_REDIRECT') ||
    (typeof error?.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT'))

  useEffect(() => {
    if (!isRedirect) {
      console.error(error)
    }
  }, [error, isRedirect])

  if (isRedirect) {
    return null
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full crextio-card p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#F4F3EE] border border-[#E5E2DA] flex items-center justify-center mx-auto text-[#1C1E21] font-bold">
          !
        </div>
        <h2 className="text-lg font-bold text-[#1C1E21]">
          Something went wrong
        </h2>
        <p className="text-xs text-[#7E8288] leading-relaxed">
          An unexpected issue occurred while rendering. You can try refreshing or resetting the state.
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={reset}
            className="px-6 py-2.5 rounded-full bg-[#1C1E21] hover:bg-[#3D5A4C] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            Try Again / 重试
          </button>
        </div>
      </div>
    </div>
  )
}

