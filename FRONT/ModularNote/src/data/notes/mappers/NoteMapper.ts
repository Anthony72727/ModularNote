import type { NewNote, Note } from '../../../domain/notes/entity/models/Note'
import type { AddNoteRequestDto } from '../dtos/AddNoteRequestDto'
import type { NoteDto } from '../dtos/NoteDto'

/**
 * Convert a note sent by the API into a note of the domain (the date string becomes a Date)
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
 */
export function toAddNoteRequestDto(note: NewNote): AddNoteRequestDto {
  return {
    title: note.title,
    description: note.description,
  }
}
