import type { NewNote, Note } from '../../../domain/notes/entity/models/Note'
import type { NoteLink } from '../../../domain/notes/entity/models/NoteLink'
import type { AddNoteRequestDto } from '../dtos/AddNoteRequestDto'
import type { NoteDto } from '../dtos/NoteDto'
import type { NoteLinkDto } from '../dtos/NoteLinkDto'
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
 * Convert a link sent by the API into a link of the domain
 * @param dto - Link as sent by the API
 * @returns The link of the domain
 */
export function toNoteLink(dto: NoteLinkDto): NoteLink {
  return {
    id: dto.id,
    noteAId: dto.noteAId,
    noteBId: dto.noteBId,
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
