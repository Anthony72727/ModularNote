import type { NewNote, Note } from '../../../domain/notes/entity/models/Note'
import type { AddNoteRequestDto } from '../dtos/AddNoteRequestDto'
import type { NoteDto } from '../dtos/NoteDto'
import type { UpdateNoteRequestDto } from '../dtos/UpdateNoteRequestDto'

/**
 * Convert a note sent by the API into a note of the domain (the date string becomes a Date)
 * @param dto - Note as sent by the API
 * @returns The note of the domain
 */
export function toNote(dto: NoteDto): Note {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    createdAt: new Date(dto.createdAt),
  }
}

/**
 * Convert a validated note into the body of POST /api/notes
 * @param note - Note validated by the domain
 * @param linkedNoteIds - Ids of the existing notes to link to the new note
 * @returns The JSON body of the request
 */
export function toAddNoteRequestDto(note: NewNote, linkedNoteIds: string[]): AddNoteRequestDto {
  return {
    title: note.title,
    description: note.description,
    linkedNoteIds,
  }
}

/**
 * Convert the validated content of a note into the body of PUT /api/notes/{id}
 * @param note - Content validated by the domain
 * @returns The JSON body of the request
 */
export function toUpdateNoteRequestDto(note: NewNote): UpdateNoteRequestDto {
  return {
    title: note.title,
    description: note.description,
  }
}
