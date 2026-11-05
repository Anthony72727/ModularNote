/**
 * JSON shape of a link between two notes, as sent by the API
 */
export type NoteLinkDto = {
  /** Unique identifier of the link */
  id: string
  /** Id of the first note of the link */
  noteAId: string
  /** Id of the second note of the link */
  noteBId: string
}
