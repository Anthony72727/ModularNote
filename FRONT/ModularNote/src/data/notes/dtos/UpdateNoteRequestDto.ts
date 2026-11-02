/**
 * JSON body of PUT /api/notes/{id}
 */
export type UpdateNoteRequestDto = {
  /** New title of the note, already trimmed */
  title: string
  /** New description of the note, null when there is none */
  description: string | null
}
