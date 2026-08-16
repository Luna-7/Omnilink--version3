"use client"

interface IndustryOption {
  id: string
  name: string
  slug: string
}

interface IndustrySelectorProps {
  industries: IndustryOption[]
  value?: string
  onChange?: (value: string) => void
}

export default function IndustrySelector({
  industries,
  value,
  onChange,
}: IndustrySelectorProps) {
  return (
    <div className="form-group-design">
      <label className="label-design">
        Industry Domain (Optional)
      </label>

      <select
        className="input-design"
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
      >
        <option value="">— Select industry —</option>
        {industries.map((ind) => (
          <option key={ind.id} value={ind.id}>
            {ind.name}
          </option>
        ))}
      </select>
    </div>
  )
}
