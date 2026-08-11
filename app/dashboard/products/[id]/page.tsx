import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

async function getProduct(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/products/${id}/ai-json`,
    {
      cache: 'no-store',
    },
  )

  return await res.json()
}

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await getProduct(id)
  const product = data.product

  return (
    <div className="p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{product.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{product.description}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Semantic Node</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg text-sm">
            {JSON.stringify(data.semantic, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Commerce Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Badge>✓ Structured Data</Badge>
          <Badge>✓ Semantic Attributes</Badge>
          <Badge>✓ Agent Accessible</Badge>
        </CardContent>
      </Card>
    </div>
  )
}
