import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DerivedIntelligenceCardProps {
  derivedSemantics: Record<string, unknown> | null
}

export function DerivedIntelligenceCard({ derivedSemantics }: DerivedIntelligenceCardProps) {
  if (!derivedSemantics || Object.keys(derivedSemantics).length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Derived Intelligence</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-4">
          {Object.entries(derivedSemantics).map(([key, value]) => (
            <div key={key} className="border rounded-lg p-3 bg-muted/50">
              <div className="text-sm text-muted-foreground capitalize">
                {key.replace(/_/g, ' ')}
              </div>
              <div className="font-medium">
                {String(value)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
