import type { NewNote, Note } from '../../../domain/notes/entity/models/Note'
import type { AddNoteRequestDto } from '../dtos/AddNoteRequestDto'
import type { NoteDto } from '../dtos/NoteDto'

export function toNote(dto: NoteDto): Note {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    createdAt: new Date(dto.createdAt),
  }
}

export function toAddNoteRequestDto(note: NewNote): AddNoteRequestDto {
  return {
    title: note.title,
    description: note.description,
  }
}
