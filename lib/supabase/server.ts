import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

export async function createClientServer() {
  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}
