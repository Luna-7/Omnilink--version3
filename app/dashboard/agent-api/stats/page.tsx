import { PageHeader, ComingSoon } from '@/components/dashboard/kit'
import { Activity } from 'lucide-react'

export default function ApiStatsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader title="访问统计" description="API 请求量、活跃连接与响应趋势。" />
      <ComingSoon
        icon={Activity}
        title="访问统计即将推出"
        description="当 Agent API 对外开放后，这里会展示请求量、活跃连接数与响应量趋势。当前暂无统计数据。"
      />
    </div>
  )
}
