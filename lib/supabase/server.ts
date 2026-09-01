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

export async function createClientServer() {
  // Resolve env per-call (not at module load) so a missing/invalid config
  // fails loudly exactly when auth is attempted, instead of silently falling
  // back to a placeholder project that can never validate the session cookie.
  const supabaseUrl = getSanitizedSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co' || !supabaseAnonKey) {
    throw new Error(
      '[createClientServer] Missing or invalid NEXT_PUBLIC_SUPABASE_URL / ' +
        'NEXT_PUBLIC_SUPABASE_ANON_KEY. The server cannot read the auth cookie ' +
        'without a valid Supabase project. Check .env.local / deployment env vars.',
    )
  }

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
