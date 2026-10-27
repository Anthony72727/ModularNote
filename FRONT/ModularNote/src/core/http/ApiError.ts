/**
 * Error returned by the API when the HTTP status is not 2xx
 */
export class ApiError extends Error {
  /** HTTP status of the response, e.g. 404 */
  readonly status: number

  /**
   * Create the error
   * @param status - HTTP status of the response
   * @param message - Message sent by the API (ProblemDetails detail), or the status text
   */
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}
