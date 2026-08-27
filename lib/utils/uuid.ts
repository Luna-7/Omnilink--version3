const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

export function isUuid(id?: string | null): boolean {
  if (!id) return false
  return UUID_REGEX.test(id)
}

export function toValidUuid(id?: string | null): string {
  if (!id) return '00000000-0000-4000-8000-000000000000'
  if (isUuid(id)) return id

  const numMatch = id.match(/\d+$/)
  const numSuffix = numMatch ? parseInt(numMatch[0], 10).toString(16).padStart(12, '0') : '000000000001'
  return `00000000-0000-4000-8000-${numSuffix.slice(-12)}`
}
