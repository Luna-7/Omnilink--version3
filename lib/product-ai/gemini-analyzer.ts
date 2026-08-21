import { GoogleGenAI, Type } from '@google/genai'
import type { ProductDraft } from './types'

export async function analyzeProduct(input: {
  productName?: string
  images: Array<{
    bytes: Buffer
    mimeType: string
  }>
}): Promise<ProductDraft> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing')
  }

  const ai = new GoogleGenAI({ apiKey })
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
      category: { type: Type.STRING, nullable: true },
      description: { type: Type.STRING, nullable: true },
      attributes: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            key: { type: Type.STRING },
            label: { type: Type.STRING },
            value: { type: Type.STRING },
            type: {
              type: Type.STRING,
              enum: ['text', 'number', 'boolean', 'select'],
            },
            unit: { type: Type.STRING, nullable: true },
            confidence: { type: Type.NUMBER },
          },
          required: ['key', 'label', 'value', 'type', 'confidence'],
        },
      },
      suggestedModules: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            key: { type: Type.STRING },
            label: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
          },
          required: ['key', 'label', 'confidence'],
        },
      },
    },
    required: ['name', 'attributes', 'suggestedModules'],
  }

  const prompt = `
You are Omnilink's product understanding assistant.

Understand the product from:
1. product images
2. optional product name

Create a concise editable product draft.

Rules:
- Do not invent technical specifications.
- Do not claim facts that cannot reasonably be observed.
- Image understanding is allowed.
- If information is uncertain, omit it.
- Keep the description concise.
- Attributes should only contain useful product facts.
- Suggested modules are proposals only.
- Never create database schemas.
- Never claim certification unless explicitly visible.

Product name:
${input.productName?.trim() || '(not provided)'}

Return JSON only.
`

  const contents = [
    {
      text: prompt,
    },
    ...input.images.map((image) => ({
      inlineData: {
        mimeType: image.mimeType,
        data: image.bytes.toString('base64'),
      },
    })),
  ]

  const response = await ai.models.generateContent({
    model,
    contents,
    config: {
      responseMimeType: 'application/json',
      responseSchema,
    },
  })

  if (!response.text) {
    throw new Error('Gemini returned an empty response')
  }

  return JSON.parse(response.text) as ProductDraft
}
