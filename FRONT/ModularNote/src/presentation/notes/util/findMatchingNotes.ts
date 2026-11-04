import type { Note } from '../../../domain/notes/entity/models/Note'

/**
 * A note that matches a search, with how close its title is to it
 */
type RankedNote = {
  /** The matching note */
  note: Note
  /** Closeness of its title to the search, the lowest being the closest */
  rank: number
}

const EXACT_TITLE_RANK: number = 0
const TITLE_START_RANK: number = 1
const TITLE_CONTAINS_RANK: number = 2

/**
 * Lower a text and remove its accents, so that a search ignores both
 */
function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
}

/**
 * Tell how close a title is to a search
 * @returns The rank of the title, null if it does not contain the search
 */
function getRank(title: string, normalizedSearch: string): number | null {
  const normalizedTitle: string = normalize(title)
  if (normalizedTitle === normalizedSearch) {
    return EXACT_TITLE_RANK
  }
  if (normalizedTitle.startsWith(normalizedSearch)) {
    return TITLE_START_RANK
  }
  return normalizedTitle.includes(normalizedSearch) ? TITLE_CONTAINS_RANK : null
}

/**
 * Find the notes whose title contains a search, ignoring the case and the accents
 * @param notes - Notes to search in
 * @param search - Text typed by the user, surrounding spaces being ignored
 * @param excludedNoteIds - Ids of the notes to leave out
 * @returns The matching notes: exact titles first, then titles starting with the search, then the others, newest first in each group (empty if the search is blank)
 */
export function findMatchingNotes(notes: Note[], search: string, excludedNoteIds: string[]): Note[] {
  const normalizedSearch: string = normalize(search.trim())
  if (normalizedSearch.length === 0) {
    return []
  }

  const excludedIds: Set<string> = new Set<string>(excludedNoteIds)
  const rankedNotes: RankedNote[] = []
  for (const note of notes) {
    const rank: number | null = excludedIds.has(note.id) ? null : getRank(note.title, normalizedSearch)
    if (rank !== null) {
      rankedNotes.push({ note, rank })
    }
  }

  return rankedNotes
    .sort(
      (first: RankedNote, second: RankedNote): number =>
        first.rank - second.rank || second.note.createdAt.getTime() - first.note.createdAt.getTime(),
    )
    .map((rankedNote: RankedNote): Note => rankedNote.note)
}
