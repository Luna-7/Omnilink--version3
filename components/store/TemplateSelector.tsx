'use client'

import { useState, useEffect } from 'react'

interface Template {
  id: string
  name: string
  layout_config: any
  preview_url: string | null
}

interface TemplateSelectorProps {
  storeId: string
  onTemplateSelect: (templateId: string) => void
}

export function TemplateSelector({ storeId, onTemplateSelect }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const response = await fetch("/api/templates");
        const { templates } = await response.json();
        setTemplates(templates || []);
      } catch (error) {
        console.error('Failed to fetch templates:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTemplates()
  }, [])

  const handleSelect = async (template: Template) => {
    setSelectedTemplate(template.id)
    try {
      const response = await fetch(
        `/api/stores/${storeId}/template`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            template_id: template.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to select template");
      }

      const result = await response.json();
      onTemplateSelect(template.id)
    } catch (error) {
      console.error('Failed to select template:', error)
      setSelectedTemplate(null)
    }
  }

  if (loading) {
    return <div>Loading templates...</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {templates.map((template) => (
        <div
          key={template.id}
          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
            selectedTemplate === template.id ? 'border-iris bg-iris' : 'border-gray-200'
          }`}
          onClick={() => handleSelect(template)}
        >
          <h3 className="font-semibold">{template.name}</h3>
          {template.preview_url && (
            <img src={template.preview_url} alt={template.name} className="mt-2 w-full h-32 object-cover" />
          )}
        </div>
      ))}
    </div>
  )
}
