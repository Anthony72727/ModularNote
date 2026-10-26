/**
 * JSON shape of a note sent by the API
 */
export type NoteDto = {
  id: string
  title: string
  description: string | null
  createdAt: string
}
