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

  /**
   * Create a client whose requests all start with the same base URL
   * @param baseUrl - Prefix of every request, e.g. "/api"
   */
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  /**
   * Send a GET request and read the JSON body of the response
   * @typeParam TResponse - Shape of the JSON sent back by the API
   * @param path - Path under the base URL, e.g. "/notes"
   * @param signal - Cancels the request when the caller does not need the result anymore
   * @returns The JSON body of the response
   * @throws ApiError if the status is not 2xx
   */
  get<TResponse>(path: string, signal?: AbortSignal): Promise<TResponse> {
    return this.send<TResponse>('GET', path, undefined, signal)
  }

  /**
   * Send a POST request with a JSON body and read the JSON body of the response
   * @typeParam TResponse - Shape of the JSON sent back by the API
   * @typeParam TBody - Shape of the JSON sent to the API
   * @param path - Path under the base URL, e.g. "/notes"
   * @param body - Object sent as JSON
   * @param signal - Cancels the request when the caller does not need the result anymore
   * @returns The JSON body of the response, or undefined for a 204 No Content
   * @throws ApiError if the status is not 2xx
   */
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

  /**
   * Build an ApiError from the ProblemDetails body, or from the status text if there is none
   */
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
