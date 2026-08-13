import { redirect } from 'next/navigation'
import { createClientServer } from '@/lib/supabase/server'
import { StoreCreateForm } from '@/components/onboarding/StoreCreateForm'
import { logoutAction } from '@/app/actions/auth'

/**
 * /onboarding — protected page.
 *
 * Auth guard: any visitor without a valid Supabase session is sent to
 * /login. Uses getUser() (NOT getSession()) because getUser() validates
 * the JWT against the Auth server — getSession() only reads the cookie
 * payload and can be spoofed.
 */
export default async function OnboardingPage() {
  const supabase = await createClientServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Omnilink
          </h1>
          <p className="text-gray-600">
            Create your store to get started with AI-native commerce
          </p>
        </div>

        <StoreCreateForm />

        <form action={logoutAction} className="mt-6 text-center">
          <button
            type="submit"
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  )
}
