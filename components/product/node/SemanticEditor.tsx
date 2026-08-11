"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface SemanticEditorProps {
  productId: string
  semanticData: Record<string, unknown> | null
}

export function SemanticEditor({ productId, semanticData }: SemanticEditorProps) {
  const [data, setData] = useState<Record<string, unknown>>(semanticData || {})
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  function updateValue(key: string, value: string) {
    setData({
      ...data,
      [key]: value,
    })
  }

  async function saveChanges() {
    setIsSaving(true)
    setSaveMessage(null)

    try {
      const response = await fetch(
        `/api/merchant/products/${productId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            semantic_data: data,
          }),
        }
      )

      if (response.ok) {
        setSaveMessage('Changes saved successfully')
      } else {
        setSaveMessage('Failed to save changes')
      }
    } catch {
      setSaveMessage('Error saving changes')
    } finally {
      setIsSaving(false)
    }
  }

  if (!semanticData || Object.keys(semanticData).length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Semantic Review</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key} className="capitalize">
                {key.replace(/_/g, ' ')}
              </Label>
              <Input
                id={key}
                value={String(value)}
                onChange={(e) => updateValue(key, e.target.value)}
                className="w-full"
              />
            </div>
          ))}
        </div>
        
        <div className="flex items-center gap-3">
          <Button onClick={saveChanges} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
          {saveMessage && (
            <span className={`text-sm ${saveMessage.includes('successfully') ? 'text-green-500' : 'text-destructive'}`}>
              {saveMessage}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
