'use client'

import React, { Suspense } from 'react'
import { CapabilitiesNetworkMaster } from '@/components/capabilities/CapabilitiesNetworkMaster'

export default function CapabilitiesPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-96 flex items-center justify-center text-xs text-[#6B7280]">
          加载能力与网络生态...
        </div>
      }
    >
      <CapabilitiesNetworkMaster />
    </Suspense>
  )
}
