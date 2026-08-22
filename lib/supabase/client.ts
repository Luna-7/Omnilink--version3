import { createClient } from '@supabase/supabase-js'

function getSanitizedSupabaseUrl(url: string | undefined): string {
  const target = url || ''
  try {
    const parsed = new URL(target)
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return target
    }
  } catch {
    if (target && !target.startsWith('http://') && !target.startsWith('https://') && target.includes('.')) {
      try {
        const withProtocol = `https://${target}`
        new URL(withProtocol)
        return withProtocol
      } catch {
        // ignore
      }
    }
  }
  return 'https://placeholder.supabase.co'
}

const supabaseUrl = getSanitizedSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
