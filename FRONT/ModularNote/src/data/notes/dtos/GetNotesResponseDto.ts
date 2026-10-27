import type { NoteDto } from './NoteDto'

/**
 * JSON shape of GET /api/notes
 */
export type GetNotesResponseDto = {
  /** Every note of the user */
  notes: NoteDto[]
}
