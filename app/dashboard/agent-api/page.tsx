import { redirect } from 'next/navigation'

export default function AgentApiRedirect() {
  redirect('/dashboard/settings?tab=api-keys')
}
