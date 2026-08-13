'use server'

import { redirect } from 'next/navigation'
import { createClientServer } from '@/lib/supabase/server'

/**
 * P0 Auth Flow — server actions for sign in / sign up / sign out.
 *
 * Uses Supabase Email + Password. No magic link, no OAuth, no third-party
 * SDK. The goal is to establish a Supabase session cookie so that
 * subsequent Server Actions (e.g. createStoreAction) can call
 * supabase.auth.getUser() and get a non-null user.
 *
 * Session cookie name: sb-<ref>-auth-token, set by supabase.auth.* methods
 * via the createClientServer() cookie adapter in lib/supabase/server.ts.
 *
 * IMPORTANT: signup may or may not produce a session depending on the
 * project's "Confirm email" setting in Supabase Dashboard → Auth.
 * If confirmation is on, signUp() returns data.session === null and the
 * user must click the link in the email (handled by /auth/callback).
 * If confirmation is off, signUp() returns a session and we redirect.
 */

export type AuthState = { error?: string; message?: string } | null

export async function loginAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const supabase = await createClientServer()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  // signInWithPassword sets the sb-*-auth-token cookie via the SSR adapter.
  redirect('/onboarding')
}

export async function signupAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters' }
  }

  const supabase = await createClientServer()
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    return { error: error.message }
  }

  // Email confirmation ON: Supabase returns a user but no session.
  // User must click the confirmation link (handled by /auth/callback).
  if (!data.session) {
    return {
      message:
        'Account created. Please check your email to confirm, then sign in.',
    }
  }

  // Email confirmation OFF: session is established immediately.
  redirect('/onboarding')
}

export async function logoutAction(_formData: FormData): Promise<void> {
  const supabase = await createClientServer()
  await supabase.auth.signOut()
  redirect('/login')
}
