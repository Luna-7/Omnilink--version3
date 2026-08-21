export interface ServerRetryOptions {
  timeoutMs?: number
  maxAttempts?: number
  baseDelayMs?: number
  shouldRetry?: (error: unknown) => boolean
  onRetry?: (args: {
    attempt: number
    maxAttempts: number
    delayMs: number
    reason: string
  }) => void
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: ServerRetryOptions = {},
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? 30_000
  const maxAttempts = options.maxAttempts ?? 3
  const baseDelayMs = options.baseDelayMs ?? 800

  let lastError: unknown = null

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutHandle = setTimeout(() => {
          reject(new Error('operation-timeout'))
        }, timeoutMs)
      })

      return await Promise.race([
        operation(),
        timeoutPromise,
      ])
    } catch (error) {
      lastError = error

      const message =
        error instanceof Error
          ? error.message
          : String(error)

      const isTimeout =
        message === 'operation-timeout'

      const retryable =
        isTimeout ||
        options.shouldRetry?.(error) === true

      if (
        !retryable ||
        attempt >= maxAttempts
      ) {
        throw error
      }

      const delayMs =
        baseDelayMs * Math.pow(2, attempt - 1)

      options.onRetry?.({
        attempt,
        maxAttempts,
        delayMs,
        reason: message,
      })

      await sleep(delayMs)
    } finally {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle)
      }
    }
  }

  throw (
    lastError instanceof Error
      ? lastError
      : new Error('Operation failed after retries')
  )
}
