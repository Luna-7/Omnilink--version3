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
      <div className="form-group-design">
        <label
          htmlFor="email"
          className="label-design"
        >
          User Identification
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="Email Address"
          autoComplete="email"
          className="input-design"
        />
      </div>

      <div className="form-group-design">
        <label
          htmlFor="password"
          className="label-design"
        >
          Security Protocol
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="Password"
          autoComplete="current-password"
          className="input-design"
        />
      </div>

      {error ? (
        <div
          role="alert"
          className="bg-deep-orange/10 border border-deep-orange/20 text-deep-orange text-xs px-3 py-2 rounded font-mono"
        >
          {error}
        </div>
      ) : null}

      {message ? (
        <div
          role="status"
          className="bg-[#3b3686]/10 border border-[#3b3686]/20 text-[#3b3686] text-xs px-3 py-2 rounded font-mono"
        >
          {message}
        </div>
      ) : null}

      <div className="button-group-design">
        <button
          type="submit"
          formAction={signinDispatch}
          disabled={isPending}
          className="btn-design-primary"
        >
          {signinPending ? 'Signing In…' : 'Sign In'}
        </button>
        <button
          type="submit"
          formAction={signupDispatch}
          disabled={isPending}
          className="btn-design-secondary"
        >
          {signupPending ? 'Joining…' : 'Join'}
        </button>
      </div>
    </form>
  )

}
