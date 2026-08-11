import { DeepSeekProvider } from '@/lib/ai/deepseek'
import type { SemanticQuery } from './query'

export async function parseSemanticQuery(input: string): Promise<SemanticQuery> {
  const provider = new DeepSeekProvider()

  const prompt = `You are a commerce semantic parser.

Convert user query into JSON.

Query:
${input}

Return:
{
  "intent": "",
  "concepts": [],
  "constraints": [],
  "confidence": 0
}`

  const result = await provider.generateText(prompt, {
    temperature: 0.1,
  })

  try {
    return JSON.parse(result)
  } catch {
    return {
      intent: 'unknown',
      concepts: [],
      constraints: [],
      confidence: 0,
    }
  }
}
