/**
 * Shape of noteQueryKeys
 */
type NoteQueryKeys = {
  /** Key of the list of every note */
  all: readonly ['notes']
  /** Key of a single note (receives the note's id) */
  detail: (id: string) => readonly ['notes', 'detail', string]
  /** Prefix of the keys of the linked notes of every note */
  allLinks: readonly ['notes', 'links']
  /** Key of the notes linked to a note (receives the note's id) */
  links: (id: string) => readonly ['notes', 'links', string]
}

/**
 * Keys of the notes in the TanStack Query cache (the cache is the shared source of truth of the notes)
 */
export const noteQueryKeys: NoteQueryKeys = {
  all: ['notes'],
  detail: (id: string): readonly ['notes', 'detail', string] => ['notes', 'detail', id],
  allLinks: ['notes', 'links'],
  links: (id: string): readonly ['notes', 'links', string] => ['notes', 'links', id],
}
