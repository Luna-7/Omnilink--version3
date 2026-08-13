import OmnilinkLiquidLayout from '@/components/dashboard/OmnilinkLayout'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <OmnilinkLiquidLayout>{children}</OmnilinkLiquidLayout>
}
