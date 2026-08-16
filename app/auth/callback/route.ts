import { NextResponse, type NextRequest } from 'next/server'
import { createClientServer } from '@/lib/supabase/server'

/**
 * Supabase auth callback — exchanges the ?code= from an email confirmation
 * (or magic link / OAuth) for a real session cookie, then redirects.
 *
 * Flow:
 *   1. User signs up with email + password via /login
 *   2. Supabase sends an email with a link to <Site URL>/auth/callback?code=...
 *   3. User clicks the link → this GET handler runs
 *   4. exchangeCodeForSession() validates the code and writes the
 *      sb-*-auth-token cookie
 *   5. We redirect to a same-origin internal path
 *
 * Security (#59 §19):
 *   The `next` query parameter is user-controlled. We restrict it to paths
 *   that begin with a single "/" and do NOT contain "//" or a protocol
 *   prefix. This prevents open-redirect attacks where a malicious link
 *   like /auth/callback?next=https://evil.example would otherwise bounce
 *   the user to an external site.
 *
 * Configure Supabase Dashboard → Auth → URL Configuration:
 *   - Site URL = https://<your-domain>
 *   - Additional Redirect URLs = https://<your-domain>/auth/callback
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const rawNext = searchParams.get('next') ?? '/onboarding'
  const safeNext = sanitizeInternalPath(rawNext)

  if (code) {
    const supabase = await createClientServer()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}

/**
 * Returns a path that is guaranteed to be same-origin and absolute-rooted.
 *
 * Accepts only strings that:
 *   - start with a single "/" (internal path)
 *   - do NOT start with "//" or "/\\" (protocol-relative URL)
 *   - do NOT contain a protocol prefix like "javascript:" or "http:"
 *
 * Any unsafe value falls back to /onboarding so we never redirect off-site.
 */
function sanitizeInternalPath(value: string): string {
  if (!value || typeof value !== 'string') return '/onboarding'
  if (!value.startsWith('/')) return '/onboarding'
  if (value.startsWith('//') || value.startsWith('/\\')) return '/onboarding'
  // Belt-and-suspenders: reject any path that still smuggles a protocol.
  if (/[\s]/.test(value)) return '/onboarding'
  return value
}