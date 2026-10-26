import { ApiError } from '../../../core/http/ApiError'
import type { HttpClient } from '../../../core/http/HttpClient'
import { NoteNotFoundError } from '../../../domain/notes/entity/errors/NoteNotFoundError'
import { NoteRejectedError } from '../../../domain/notes/entity/errors/NoteRejectedError'
import type { NewNote, Note } from '../../../domain/notes/entity/models/Note'
import type { NoteRepository } from '../../../domain/notes/repositories/NoteRepository'
import type { AddNoteRequestDto } from '../dtos/AddNoteRequestDto'
import type { GetNotesResponseDto } from '../dtos/GetNotesResponseDto'
import type { NoteDto } from '../dtos/NoteDto'
import { toAddNoteRequestDto, toNote } from '../mappers/NoteMapper'

/**
 * NoteRepository that calls the REST API (/api/notes)
 */
export class HttpNoteRepository implements NoteRepository {
  private readonly httpClient: HttpClient

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient
  }

  async getAll(signal?: AbortSignal): Promise<Note[]> {
    const response: GetNotesResponseDto = await this.httpClient.get<GetNotesResponseDto>('/notes', signal)
    return response.notes.map(toNote)
  }

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

  async add(note: NewNote): Promise<Note> {
    try {
      const dto: NoteDto = await this.httpClient.post<NoteDto, AddNoteRequestDto>('/notes', toAddNoteRequestDto(note))
      return toNote(dto)
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 400) {
        throw new NoteRejectedError()
      }
      throw error
    }
  }
}
