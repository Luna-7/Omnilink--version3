import { Suspense } from 'react'
import { KnowledgeClient } from './KnowledgeClient'

export default function KnowledgePage() {
  return (
    <Suspense fallback={null}>
      <KnowledgeClient />
    </Suspense>
  )
}
