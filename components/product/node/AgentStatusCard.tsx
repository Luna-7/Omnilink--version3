import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function AgentStatusCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Commerce Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Badge>
          AI Ready
        </Badge>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-apricot">✓</span>
            <span>Structured Data</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-apricot">✓</span>
            <span>Semantic Understanding</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-apricot">✓</span>
            <span>Agent Accessible</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
