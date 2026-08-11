import { AIProvider } from './provider'

export class DeepSeekProvider implements AIProvider {
  private apiKey: string

  constructor() {
    const key = process.env.DEEPSEEK_API_KEY

    if (!key) {
      throw new Error('Missing DEEPSEEK_API_KEY')
    }

    this.apiKey = key
  }

  async generateText(
    prompt: string,
    options?: {
      temperature?: number
      model?: string
    },
  ): Promise<string> {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: options?.model ?? 'deepseek-chat',
        temperature: options?.temperature ?? 0.2,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    })

    const data = await response.json()

    return data.choices?.[0]?.message?.content ?? ''
  }
}
