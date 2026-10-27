/**
 * JSON body of POST /api/notes
 */
export type AddNoteRequestDto = {
  /** Title of the note, already trimmed */
  title: string
  /** Description of the note, null when there is none */
  description: string | null
}
