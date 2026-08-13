'use client'

import { useActionState } from 'react'
import { loginAction, signupAction, type AuthState } from '@/app/actions/auth'

/**
 * LoginForm — single form, two submit buttons.
 *
 * - "Sign In" submits via loginAction (signInWithPassword → redirect).
 * - "Create Account" submits via signupAction (signUp → may require email
 *   confirmation; in that case the action returns a message instead of
 *   redirecting, which is rendered below the inputs).
 *
 * Both actions are wrapped in useActionState so we can display
 * { error, message } returned from the server without try/catch in the
 * component (the try/catch would swallow the NEXT_REDIRECT thrown by
 * redirect() on success).
 */
export function LoginForm() {
  const [signinState, signinDispatch, signinPending] = useActionState<
    AuthState,
    FormData
  >(loginAction, null)

  const [signupState, signupDispatch, signupPending] = useActionState<
    AuthState,
    FormData
  >(signupAction, null)

  const error = signinState?.error ?? signupState?.error
  const message = signupState?.message ?? null
  const isPending = signinPending || signupPending

  return (
    <form className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="current-password"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {error ? (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm"
        >
          {error}
        </div>
      ) : null}

      {message ? (
        <div
          role="status"
          className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded text-sm"
        >
          {message}
        </div>
      ) : null}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          formAction={signinDispatch}
          disabled={isPending}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {signinPending ? 'Signing in…' : 'Sign In'}
        </button>
        <button
          type="submit"
          formAction={signupDispatch}
          disabled={isPending}
          className="flex-1 bg-white text-gray-800 border border-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
        >
          {signupPending ? 'Creating…' : 'Create Account'}
        </button>
      </div>
    </form>
  )
}
