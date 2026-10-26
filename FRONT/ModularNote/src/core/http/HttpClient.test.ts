import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from './ApiError'
import { HttpClient } from './HttpClient'

function jsonResponse(status: number, body: unknown, statusText: string = ''): Response {
  return new Response(JSON.stringify(body), {
    status,
    statusText,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('HttpClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('GET: calls the URL under the base URL and returns the JSON', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { value: 42 }))
    vi.stubGlobal('fetch', fetchMock)
    const controller = new AbortController()

    const result = await new HttpClient('/api').get<{ value: number }>('/notes', controller.signal)

    expect(result).toEqual({ value: 42 })
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith('/api/notes', {
      method: 'GET',
      headers: undefined,
      body: undefined,
      signal: controller.signal,
    })
  })

  it('POST: sends the body as JSON', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(201, { id: '1' }))
    vi.stubGlobal('fetch', fetchMock)

    await new HttpClient('/api').post('/notes', { title: 'Titre' })

    expect(fetchMock).toHaveBeenCalledExactlyOnceWith('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"title":"Titre"}',
      signal: undefined,
    })
  })

  it('returns undefined on 204 No Content', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })))

    await expect(new HttpClient('/api').get('/notes')).resolves.toBeUndefined()
  })

  it('throws an ApiError with the ProblemDetails detail', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse(400, { title: 'Bad Request', detail: 'Title must be non-empty.' })),
    )

    const error = await new HttpClient('/api').get('/notes').catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).status).toBe(400)
    expect((error as ApiError).message).toBe('Title must be non-empty.')
  })

  it('falls back to the ProblemDetails title when there is no detail', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(404, { title: 'Not Found' })))

    await expect(new HttpClient('/api').get('/notes/1')).rejects.toThrow('Not Found')
  })

  it('falls back to the status text when the body is not JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('<html>oops</html>', { status: 502, statusText: 'Bad Gateway' })),
    )

    const error = await new HttpClient('/api').get('/notes').catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).status).toBe(502)
    expect((error as ApiError).message).toBe('Bad Gateway')
  })

  it('lets a network error go through (not an ApiError)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    await expect(new HttpClient('/api').get('/notes')).rejects.toBeInstanceOf(TypeError)
  })
})
