/**
 * JSON shape of a note sent by the API
 */
export type NoteDto = {
  /** Id of the note (a GUID) */
  id: string
  /** Title of the note */
  title: string
  /** Description of the note, null when there is none */
  description: string | null
  /** Creation date, as an ISO 8601 string in UTC */
  createdAt: string
}
