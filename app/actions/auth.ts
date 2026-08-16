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
    if (error.message.includes('Invalid login credentials')) {
      return {
        error:
          '账号或密码不正确。如果您尚未注册该账号，请点击右侧「Join」按钮创建账号。',
      }
    }
    if (error.message.includes('Email not confirmed')) {
      return {
        error:
          '该邮箱尚未完成验证。Supabase 已发送确认邮件，请前往您的邮箱（包含垃圾邮件箱）点击激活链接后再登录。',
      }
    }
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
    if (error.message.includes('already registered')) {
      return { error: '该邮箱已被注册，请直接点击「Sign In」登录。' }
    }
    return { error: error.message }
  }

  // Email confirmation ON: Supabase returns a user but no session.
  // User must click the confirmation link (handled by /auth/callback).
  if (!data.session) {
    return {
      message:
        '账号创建成功！Supabase 已向您的邮箱发送了激活链接，请前往邮箱点击确认后再点击「Sign In」登录。',
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
