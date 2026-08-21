import { Suspense } from 'react'
import { CustomerServiceClient } from './CustomerServiceClient'

export const dynamic = 'force-dynamic'

export default function CustomerServicePage() {
  return (
    <Suspense fallback={null}>
      <CustomerServiceClient />
    </Suspense>
  )
}
