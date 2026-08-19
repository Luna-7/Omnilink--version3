import { redirect } from 'next/navigation'

export default function ApiStatsRedirect() {
  redirect('/dashboard/settings?tab=api-stats')
}
