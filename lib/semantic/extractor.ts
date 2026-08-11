import { DeepSeekProvider } from '@/lib/ai/deepseek'
import type { ProductSemanticData } from '@/lib/product/types'

export async function extractProductSemantic(input: string | { title: string; description?: string; category?: string }): Promise<ProductSemanticData> {
  const provider = new DeepSeekProvider()

  // Handle both string description and object input
  const description = typeof input === 'string' ? input : input.description || input.title
  const title = typeof input === 'string' ? '' : input.title

  const prompt = `You are a product semantic extractor.

Extract semantic attributes from the product information.

Title: ${title}
Description: ${description}

Return JSON with semantic attributes:
{
  "material": "",
  "weight": 0,
  "uv400": false,
  "child_friendly": false,
  "waterproof": false,
  "wireless": false,
  "battery_life": 0,
  "screen_size": 0,
  "color": "",
  "brand": "",
  "model": ""
}

Only include attributes that are present in the description. Use null for missing values.`

  const result = await provider.generateText(prompt, {
    temperature: 0.1,
  })

  try {
    return JSON.parse(result)
  } catch {
    return {}
  }
}
