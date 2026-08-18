import { PageHeader, ComingSoon } from '@/components/dashboard/kit'
import { Users } from 'lucide-react'

export default function TeamPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader title="协作权限" description="邀请团队成员并分配角色与权限。" />
      <ComingSoon
        icon={Users}
        title="团队协作即将推出"
        description="成员邀请、角色分配与细粒度权限控制正在建设中。当前版本一个账户对应一个店铺，由店主独立管理。"
      />
    </div>
  )
}
