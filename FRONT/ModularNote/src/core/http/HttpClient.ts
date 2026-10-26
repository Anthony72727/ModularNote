import { ApiError } from './ApiError'

/**
 * Error body sent by the API (RFC 9457 ProblemDetails)
 */
type ProblemDetails = {
  title?: string
  detail?: string
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/**
 * Small wrapper around fetch, shared by every repository of the data layer
 */
export class HttpClient {
  private readonly baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  get<TResponse>(path: string, signal?: AbortSignal): Promise<TResponse> {
    return this.send<TResponse>('GET', path, undefined, signal)
  }

  post<TResponse, TBody>(path: string, body: TBody, signal?: AbortSignal): Promise<TResponse> {
    return this.send<TResponse>('POST', path, body, signal)
  }

  private async send<TResponse>(
    method: HttpMethod,
    path: string,
    body: unknown,
    signal: AbortSignal | undefined,
  ): Promise<TResponse> {
    const hasBody: boolean = body !== undefined
    const response: Response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: hasBody ? { 'Content-Type': 'application/json' } : undefined,
      body: hasBody ? JSON.stringify(body) : undefined,
      signal,
    })

    if (!response.ok) {
      throw await HttpClient.toApiError(response)
    }
    if (response.status === 204) {
      return undefined as TResponse
    }
    return (await response.json()) as TResponse
  }

  private static async toApiError(response: Response): Promise<ApiError> {
    let message: string = response.statusText || `HTTP error ${response.status}`
    try {
      const problem: ProblemDetails = (await response.json()) as ProblemDetails
      message = problem.detail ?? problem.title ?? message
    } catch {
      // The body is not JSON: keep the status text
    }
    return new ApiError(response.status, message)
  }
}
