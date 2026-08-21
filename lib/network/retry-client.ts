export interface RetryOptions {
  timeoutMs?: number
  maxAttempts?: number
  baseDelayMs?: number
  onRetry?: (args: {
    attempt: number
    maxAttempts: number
    delayMs: number
    reason: string
  }) => void
}

const RETRYABLE_STATUS = new Set([
  429,
  500,
  502,
  503,
  504,
])

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isAbortError(error: unknown) {
  return (
    error instanceof DOMException &&
    error.name === 'AbortError'
  )
}

export async function fetchWithRetry(
  input: RequestInfo | URL,
  init: RequestInit = {},
  options: RetryOptions = {},
): Promise<Response> {
  const timeoutMs = options.timeoutMs ?? 45_000
  const maxAttempts = options.maxAttempts ?? 3
  const baseDelayMs = options.baseDelayMs ?? 800

  let lastError: unknown = null

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController()
    const timeoutId = window.setTimeout(
      () => controller.abort(),
      timeoutMs,
    )

    try {
      const response = await fetch(input, {
        ...init,
        signal: controller.signal,
      })

      if (
        !RETRYABLE_STATUS.has(response.status) ||
        attempt >= maxAttempts
      ) {
        return response
      }

      const delayMs =
        baseDelayMs * Math.pow(2, attempt - 1)

      const reason = `HTTP ${response.status}`

      options.onRetry?.({
        attempt,
        maxAttempts,
        delayMs,
        reason,
      })

      await sleep(delayMs)
    } catch (error) {
      lastError = error

      const retryable =
        isAbortError(error) ||
        error instanceof TypeError

      if (
        !retryable ||
        attempt >= maxAttempts
      ) {
        throw error
      }

      const delayMs =
        baseDelayMs * Math.pow(2, attempt - 1)

      const reason =
        isAbortError(error)
          ? 'timeout'
          : 'network-error'

      options.onRetry?.({
        attempt,
        maxAttempts,
        delayMs,
        reason,
      })

      await sleep(delayMs)
    } finally {
      window.clearTimeout(timeoutId)
    }
  }

  throw (
    lastError instanceof Error
      ? lastError
      : new Error('Request failed after retries')
  )
}
