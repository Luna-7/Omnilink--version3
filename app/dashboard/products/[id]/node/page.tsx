import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SemanticCard } from '@/components/product/node/SemanticCard'
import { DerivedIntelligenceCard } from '@/components/product/node/DerivedIntelligenceCard'
import { EvidenceCard } from '@/components/product/node/EvidenceCard'
import { AgentStatusCard } from '@/components/product/node/AgentStatusCard'
import { SemanticEditor } from '@/components/product/node/SemanticEditor'
import DemoNav from '@/components/demo/DemoNav'

async function getAIProduct(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/products/${id}/ai-json`,
    {
      cache: 'no-store',
    },
  )

  return res.json()
}

async function getEvidence(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/products/${id}/evidence`,
    {
      cache: 'no-store',
    },
  )

  return res.json()
}

export default async function NodePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const ai = await getAIProduct(id)
  const evidence = await getEvidence(id)

  const product = ai.product
  const semanticData = ai.semantic?.semantic_data
  const derivedSemantics = ai.derived_semantics
  const merchantSemanticData = semanticData

  return (
    <div>
      <DemoNav/>
      <div className="p-8 space-y-6">
        <h1 className="text-3xl font-bold">AI Product Node</h1>

      {/* AI Product Node Showcase Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle>AI Product Node</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-900">
            This product is structured and ready for AI agents. The semantic data below enables 
            AI systems to understand and discover this product based on meaning rather than keywords.
          </p>
        </CardContent>
      </Card>

      {/* Product Identity Card */}
      <Card>
        <CardHeader>
          <CardTitle>Product Identity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-xl font-semibold">{product.name}</div>
          <div className="text-muted-foreground capitalize">{product.category || 'General'}</div>
          <p>{product.description}</p>
        </CardContent>
      </Card>

      {/* Semantic Identity Card */}
      <SemanticCard semantic={semanticData} />

      {/* Semantic Review Card */}
      <SemanticEditor productId={id} semanticData={merchantSemanticData} />

      {/* Derived Intelligence Card */}
      <DerivedIntelligenceCard derivedSemantics={derivedSemantics} />

      {/* Evidence Card */}
      <EvidenceCard evidence={evidence} />

      {/* Agent Commerce Status Card */}
      <AgentStatusCard />
      </div>
    </div>
  )
}
