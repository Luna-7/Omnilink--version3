import { redirect } from 'next/navigation'
import { createClientServer } from '@/lib/supabase/server'
import { LoginForm } from '@/components/auth/LoginForm'

/**
 * /login — Email + Password sign in / sign up.
 *
 * Auth guard (reverse): if the visitor already has a valid session, we
 * skip /login and send them straight to /onboarding. This prevents the
 * "log in then bounce back to login" loop.
 */
export default async function LoginPage() {
  const supabase = await createClientServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/onboarding')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Omnilink</h1>
          <p className="text-gray-600">
            Sign in or create an account to get started
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  )
}
