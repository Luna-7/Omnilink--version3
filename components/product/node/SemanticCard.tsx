import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface SemanticCardProps {
  semantic: Record<string, unknown> | null
  derivedSemantics?: Record<string, unknown> | null
}

export function SemanticCard({ semantic, derivedSemantics }: SemanticCardProps) {
  const hasBaseSemantic = semantic && Object.keys(semantic).length > 0
  const hasDerivedSemantics = derivedSemantics && Object.keys(derivedSemantics).length > 0

  if (!hasBaseSemantic && !hasDerivedSemantics) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Semantic Identity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {hasBaseSemantic && (
          <div>
            <div className="text-sm font-semibold mb-3">Base Semantics</div>
            <div className="grid md:grid-cols-3 gap-4">
              {Object.entries(semantic).map(([key, value]) => (
                <div key={key} className="border rounded-lg p-3">
                  <div className="text-sm text-muted-foreground capitalize">
                    {key.replace(/_/g, ' ')}
                  </div>
                  <div className="font-medium">
                    {String(value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {hasBaseSemantic && hasDerivedSemantics && <Separator />}
        
        {hasDerivedSemantics && (
          <div>
            <div className="text-sm font-semibold mb-3">Derived Intelligence</div>
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
          </div>
        )}
      </CardContent>
    </Card>
  )
}
