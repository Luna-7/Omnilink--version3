'use client'

import { useState } from 'react'
import { createStoreAction } from '@/app/actions/onboarding'
import { IndustrySelector } from './IndustrySelector'

export function StoreCreateForm() {
  const [storeName, setStoreName] = useState('')
  const [industryId, setIndustryId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setError('')

    try {
      await createStoreAction(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create store')
      setIsSubmitting(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="store_name" className="block text-sm font-medium text-gray-700 mb-2">
          Store Name
        </label>
        <input
          type="text"
          id="store_name"
          name="store_name"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          required
          placeholder="e.g., Luna Glasses"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <IndustrySelector value={industryId} onChange={setIndustryId} />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !storeName || !industryId}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? 'Creating Store...' : 'Create Store'}
      </button>
    </form>
  )
}
