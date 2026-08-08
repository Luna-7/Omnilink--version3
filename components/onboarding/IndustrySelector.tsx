'use client'

interface Industry {
  id: string
  name: string
  slug: string
  description: string | null
}

interface IndustrySelectorProps {
  value: string
  onChange: (value: string) => void
  industries: Industry[]
}

export function IndustrySelector({ value, onChange, industries }: IndustrySelectorProps) {
  return (
    <div>
      <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
        Industry
      </label>
      <select
        id="industry"
        name="industry_id"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select an industry</option>
        {industries.map((industry) => (
          <option key={industry.id} value={industry.id}>
            {industry.name}
          </option>
        ))}
      </select>
    </div>
  )
}
