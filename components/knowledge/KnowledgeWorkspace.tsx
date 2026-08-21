'use client'

import React, { useState } from 'react'
import {
  INITIAL_BRAND_DATA,
} from './mockData'
import { UnifiedKnowledgeSpaceView } from './UnifiedKnowledgeSpaceView'
import { useLanguage } from '@/context/LanguageContext'

export function KnowledgeWorkspace() {
  const { isZh } = useLanguage()

  // Shared state: Knowledge Center bases added to Library
  const [addedCenterBaseIds, setAddedCenterBaseIds] = useState<string[]>(['hub-eu-reg'])

  // Local structured knowledge state for editing
  const [brandData, setBrandData] = useState(INITIAL_BRAND_DATA)

  const handleToggleAddCenterBase = (baseId: string) => {
    setAddedCenterBaseIds((prev) =>
      prev.includes(baseId) ? prev.filter((id) => id !== baseId) : [...prev, baseId]
    )
  }

  return (
    <div className="w-full">
      <UnifiedKnowledgeSpaceView
        isZh={isZh}
        brandData={brandData}
        onSaveBrand={setBrandData}
        addedCenterBaseIds={addedCenterBaseIds}
        onToggleAddCenterBase={handleToggleAddCenterBase}
      />
    </div>
  )
}

