/**
 * Undirected link between two notes: "A linked to B" and "B linked to A" are the same link
 */
export type NoteLink = {
  /** Unique identifier given by the server */
  id: string
  /** Id of one of the two notes */
  noteAId: string
  /** Id of the other note */
  noteBId: string
}
