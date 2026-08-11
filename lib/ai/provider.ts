export interface AIProvider {
  generateText(
    prompt: string,
    options?: {
      temperature?: number
      model?: string
    },
  ): Promise<string>
}
