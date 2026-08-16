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

  // Seed industries for the optional industry selector (#57 P2).
  const { data: industries } = await supabase
    .from('industries')
    .select('id, name, slug')
    .order('name', { ascending: true })

  return (
    <div className="h-screen grid grid-rows-[1fr_auto] overflow-hidden bg-[#F9F9F8] text-[#111111]">
      <main className="main-viewport">
        <div className="auth-container">
          <header className="auth-header">
            <span className="label-meta">[ STORE_INITIALIZATION_V1 ]</span>
            <h1 className="title-display">Omnilink</h1>
            <p className="tagline-design">创建你的 AI 原生店铺节点</p>
          </header>

          <StoreCreateForm industries={industries ?? []} />

          <form action={logoutAction} className="mt-6 text-center">
            <button
              type="submit"
              className="text-xs font-mono tracking-wider uppercase text-[#111111]/50 hover:text-[#111111] transition-colors"
            >
              [ Sign Out ]
            </button>
          </form>
        </div>
      </main>

      <footer className="footer-design">
        <div className="footer-logo-design">OMNILINK.AI</div>
        <div className="footer-meta-design">AI-NATIVE INFRASTRUCTURE // CORE.BUILD_2024</div>
      </footer>
    </div>
  )
}

