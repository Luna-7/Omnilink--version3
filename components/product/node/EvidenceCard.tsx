import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface EvidenceRecord {
  semantic_field: string
  evidence_type: 'merchant_input' | 'image' | 'document' | 'certification' | 'system_inference'
  evidence_source: string
  confidence: number
  field_value: unknown
}

interface EvidenceCardProps {
  evidence: EvidenceRecord[] | { evidence: EvidenceRecord[] } | null
}

export function EvidenceCard({ evidence }: EvidenceCardProps) {
  if (!evidence) {
    return null
  }

  const evidenceData = Array.isArray(evidence) ? evidence : 'evidence' in evidence ? evidence.evidence : []
  
  if (!evidenceData || evidenceData.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evidence</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {evidenceData.map((record, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-medium capitalize">
                {record.semantic_field.replace(/_/g, ' ')}
              </div>
              <Badge variant="secondary" className="capitalize">
                {record.evidence_type.replace(/_/g, ' ')}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Value: {String(record.field_value)}
            </div>
            <div className="text-sm">
              Confidence: {(record.confidence * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">
              Source: {record.evidence_source}
            </div>
            {index < evidenceData.length - 1 && <Separator />}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
