import { ApiError } from '../../../core/http/ApiError'
import type { HttpClient } from '../../../core/http/HttpClient'
import { LinkedNoteNotFoundError } from '../../../domain/notes/entity/errors/LinkedNoteNotFoundError'
import { NoteNotFoundError } from '../../../domain/notes/entity/errors/NoteNotFoundError'
import { NoteRejectedError } from '../../../domain/notes/entity/errors/NoteRejectedError'
import type { NewNote, Note } from '../../../domain/notes/entity/models/Note'
import type { NoteRepository } from '../../../domain/notes/repositories/NoteRepository'
import type { AddNoteRequestDto } from '../dtos/AddNoteRequestDto'
import type { GetNotesResponseDto } from '../dtos/GetNotesResponseDto'
import type { NoteDto } from '../dtos/NoteDto'
import type { UpdateNoteRequestDto } from '../dtos/UpdateNoteRequestDto'
import { toAddNoteRequestDto, toNote, toUpdateNoteRequestDto } from '../mappers/NoteMapper'

/**
 * NoteRepository that calls the REST API (/api/notes)
 */
export class HttpNoteRepository implements NoteRepository {
  private readonly httpClient: HttpClient

  /**
   * Create the repository
   * @param httpClient - Client that sends the requests to the API
   */
  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient
  }

  /** @inheritDoc */
  async getAll(signal?: AbortSignal): Promise<Note[]> {
    const response: GetNotesResponseDto = await this.httpClient.get<GetNotesResponseDto>('/notes', signal)
    return response.notes.map(toNote)
  }

  /** @inheritDoc */
  async getById(id: string, signal?: AbortSignal): Promise<Note> {
    try {
      const dto: NoteDto = await this.httpClient.get<NoteDto>(`/notes/${encodeURIComponent(id)}`, signal)
      return toNote(dto)
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 404) {
        throw new NoteNotFoundError(id)
      }
      throw error
    }
  }

  /** @inheritDoc */
  async getLinkedNotes(id: string, signal?: AbortSignal): Promise<Note[]> {
    try {
      const response: GetNotesResponseDto = await this.httpClient.get<GetNotesResponseDto>(
        `/notes/${encodeURIComponent(id)}/links`,
        signal,
      )
      return response.notes.map(toNote)
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 404) {
        throw new NoteNotFoundError(id)
      }
      throw error
    }
  }

  /** @inheritDoc */
  async add(note: NewNote, linkedNoteIds: string[]): Promise<Note> {
    try {
      const dto: NoteDto = await this.httpClient.post<NoteDto, AddNoteRequestDto>(
        '/notes',
        toAddNoteRequestDto(note, linkedNoteIds),
      )
      return toNote(dto)
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 404) {
        throw new LinkedNoteNotFoundError()
      }
      if (error instanceof ApiError && error.status === 400) {
        throw new NoteRejectedError()
      }
      throw error
    }
  }

  /** @inheritDoc */
  async update(id: string, note: NewNote): Promise<Note> {
    try {
      const dto: NoteDto = await this.httpClient.put<NoteDto, UpdateNoteRequestDto>(
        `/notes/${encodeURIComponent(id)}`,
        toUpdateNoteRequestDto(note),
      )
      return toNote(dto)
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 404) {
        throw new NoteNotFoundError(id)
      }
      if (error instanceof ApiError && error.status === 400) {
        throw new NoteRejectedError()
      }
      throw error
    }
  }

  /** @inheritDoc */
  async delete(id: string): Promise<void> {
    try {
      await this.httpClient.delete(`/notes/${encodeURIComponent(id)}`)
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 404) {
        throw new NoteNotFoundError(id)
      }
      throw error
    }
  }
}
