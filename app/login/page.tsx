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
    <div className="h-screen grid grid-rows-[1fr_auto] overflow-hidden bg-[#F9F9F8] text-[#111111]">
      <main className="main-viewport">
        <div className="auth-container">
          <header className="auth-header">
            <span className="label-meta">[ AUTH_MODULE_V1 ]</span>
            <h1 className="title-display">Omnilink</h1>
            <p className="tagline-design">面向 AI 时代的商家经营中枢</p>
          </header>

          <LoginForm />
        </div>
      </main>

      <footer className="footer-design">
        <div className="footer-logo-design">OMNILINK.AI</div>
        <div className="footer-meta-design">AI-NATIVE INFRASTRUCTURE // CORE.BUILD_2024</div>
      </footer>
    </div>
  )
}

