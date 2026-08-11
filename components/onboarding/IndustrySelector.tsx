"use client"

interface IndustrySelectorProps {
  value?: string
  onChange?: (value:string)=>void
}

export default function IndustrySelector({
  value,
  onChange
}:IndustrySelectorProps){

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Industry (optional)
      </label>

      <input
        className="w-full rounded-md border px-3 py-2"
        value={value ?? ""}
        onChange={(e)=>onChange?.(e.target.value)}
        placeholder="Example: Eyewear, Fashion, Electronics"
      />

    </div>
  )
}
