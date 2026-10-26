import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../../core/http/ApiError'
import type { HttpClient } from '../../../core/http/HttpClient'
import { NoteNotFoundError } from '../../../domain/notes/entity/errors/NoteNotFoundError'
import type { NoteDto } from '../dtos/NoteDto'
import { HttpNoteRepository } from './HttpNoteRepository'

const noteDto: NoteDto = {
  id: 'abc',
  title: 'Titre',
  description: 'Desc',
  createdAt: '2026-10-26T10:00:00Z',
}

function createFakeHttpClient() {
  const fake = { get: vi.fn(), post: vi.fn() }
  return { fake, httpClient: fake as unknown as HttpClient }
}

describe('HttpNoteRepository', () => {
  it('getAll: reads GET /notes and maps every note', async () => {
    const { fake, httpClient } = createFakeHttpClient()
    fake.get.mockResolvedValue({ notes: [noteDto] })
    const controller = new AbortController()

    const notes = await new HttpNoteRepository(httpClient).getAll(controller.signal)

    expect(fake.get).toHaveBeenCalledExactlyOnceWith('/notes', controller.signal)
    expect(notes).toEqual([{ ...noteDto, createdAt: new Date('2026-10-26T10:00:00Z') }])
  })

  it('getById: reads GET /notes/{id}', async () => {
    const { fake, httpClient } = createFakeHttpClient()
    fake.get.mockResolvedValue(noteDto)

    const note = await new HttpNoteRepository(httpClient).getById('abc')

    expect(fake.get).toHaveBeenCalledExactlyOnceWith('/notes/abc', undefined)
    expect(note.id).toBe('abc')
  })

  it('getById: turns a 404 into NoteNotFoundError', async () => {
    const { fake, httpClient } = createFakeHttpClient()
    fake.get.mockRejectedValue(new ApiError(404, 'The note was not found.'))

    const error = await new HttpNoteRepository(httpClient).getById('abc').catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(NoteNotFoundError)
    expect((error as NoteNotFoundError).noteId).toBe('abc')
  })

  it('getById: lets the other errors go through', async () => {
    const { fake, httpClient } = createFakeHttpClient()
    const failure = new ApiError(500, 'boom')
    fake.get.mockRejectedValue(failure)

    await expect(new HttpNoteRepository(httpClient).getById('abc')).rejects.toBe(failure)
  })

  it('add: sends POST /notes and maps the created note', async () => {
    const { fake, httpClient } = createFakeHttpClient()
    fake.post.mockResolvedValue(noteDto)

    const note = await new HttpNoteRepository(httpClient).add({ title: 'Titre', description: 'Desc' })

    expect(fake.post).toHaveBeenCalledExactlyOnceWith('/notes', { title: 'Titre', description: 'Desc' })
    expect(note.createdAt).toEqual(new Date('2026-10-26T10:00:00Z'))
  })
})
