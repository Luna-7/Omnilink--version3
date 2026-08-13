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
 *   5. We redirect to /onboarding (or `?next=` if provided)
 *
 * Configure Supabase Dashboard → Auth → URL Configuration:
 *   - Site URL = https://<your-domain>
 *   - Additional Redirect URLs = https://<your-domain>/auth/callback
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/onboarding'

  if (code) {
    const supabase = await createClientServer()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
