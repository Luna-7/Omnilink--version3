'use client'

import React from 'react'
import { CustomerServiceCenterView } from '@/components/knowledge/CustomerServiceCenterView'
import { useLanguage } from '@/context/LanguageContext'

export function CustomerServiceClient() {
  const { isZh } = useLanguage()
  return <CustomerServiceCenterView isZh={isZh} />
}
