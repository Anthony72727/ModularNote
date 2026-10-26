type NoteQueryKeys = {
  all: readonly ['notes']
  detail: (id: string) => readonly ['notes', 'detail', string]
}

/**
 * Keys of the notes in the TanStack Query cache (the cache is the shared source of truth of the notes)
 */
export const noteQueryKeys: NoteQueryKeys = {
  all: ['notes'],
  detail: (id: string): readonly ['notes', 'detail', string] => ['notes', 'detail', id],
}
