import { createClientServer } from '@/lib/supabase/server'
import { DashboardView } from '@/components/dashboard/DashboardView'

export default async function DashboardPage() {
  const supabase = await createClientServer()
  let displayName = '演示商家'
  try {
    const { data } = await supabase.auth.getUser()
    if (data?.user) {
      displayName =
        (data.user.user_metadata?.full_name as string | undefined) ||
        (data.user.user_metadata?.name as string | undefined) ||
        data.user.email ||
        '商家'
    }
  } catch {
    // preview fallback
  }

  return <DashboardView displayName={displayName} />
}


