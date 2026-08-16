'use client'

import { useState } from 'react'
import { createStoreAction } from '@/app/actions/onboarding'
import IndustrySelector from './IndustrySelector'

interface IndustryOption {
  id: string
  name: string
  slug: string
}

export function StoreCreateForm({ industries = [] }: { industries?: IndustryOption[] }) {
  const [storeName, setStoreName] = useState('')
  const [industryId, setIndustryId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setError('')

    if (industryId) {
      formData.set('industry_id', industryId)
      const ind = industries.find((i) => i.id === industryId)
      if (ind) formData.set('industry_category', ind.name)
    }

    try {
      await createStoreAction(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create store')
      setIsSubmitting(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="form-group-design">
        <label htmlFor="store_name" className="label-design">
          Store Identifier / Name
        </label>
        <input
          type="text"
          id="store_name"
          name="store_name"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          required
          placeholder="e.g., Luna Glasses"
          className="input-design"
        />
      </div>

      <IndustrySelector industries={industries} value={industryId} onChange={setIndustryId} />

      {error && (
        <div className="bg-deep-orange/10 border border-deep-orange/20 text-deep-orange text-xs px-3 py-2 rounded font-mono">
          {error}
        </div>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting || !storeName}
          className="btn-design-primary w-full"
        >
          {isSubmitting ? 'Initializing Node…' : 'Initialize Store Node'}
        </button>
      </div>
    </form>
  )
}
