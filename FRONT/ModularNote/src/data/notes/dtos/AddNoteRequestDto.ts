/**
 * JSON body of POST /api/notes
 */
export type AddNoteRequestDto = {
  title: string
  description: string | null
}
