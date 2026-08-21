import { Suspense } from 'react'
import { KnowledgeClient } from './KnowledgeClient'

export const dynamic = 'force-dynamic'

export default function KnowledgePage() {
  return (
    <Suspense fallback={null}>
      <KnowledgeClient />
    </Suspense>
  )
}

