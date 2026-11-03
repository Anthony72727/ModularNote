import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { QueryFunctionContext, UseQueryResult } from '@tanstack/react-query'
import type { Dependencies } from '../../../core/di/Dependencies'
import { useDependencies } from '../../../core/di/DependenciesContext'
import type { Note } from '../../../domain/notes/entity/models/Note'
import { findMatchingNotes } from '../util/findMatchingNotes'
import { toNoteErrorMessage } from '../util/toNoteErrorMessage'
import { noteQueryKeys } from './noteQueryKeys'

/**
 * Number of notes proposed at most, because showing more slows down typing; typing a longer search reaches the others
 */
export const MAX_SUGGESTIONS: number = 100

/**
 * State and actions of the search of the notes to link
 */
export type LinkedNoteSearchViewModel = {
  /** Text typed by the user, as is */
  search: string
  /** Notes whose title matches the search, the closest first (empty while the search is blank) */
  suggestions: Note[]
  /** True when more notes match the search than the ones proposed */
  hasMoreSuggestions: boolean
  /** True when the search is not blank and no note matches it */
  hasNoResult: boolean
  /** Message to show when the notes cannot be read and the user is searching, null otherwise */
  error: string | null
  /** Replace the search (receives the new text) */
  changeSearch: (value: string) => void
}

/**
 * ViewModel of the search of the notes to link, by title
 * @param excludedNoteIds - Ids of the notes not to propose, because they are already chosen
 * @returns The state of the search and the action the view can call
 */
export function useLinkedNoteSearchViewModel(excludedNoteIds: string[]): LinkedNoteSearchViewModel {
  const { getNotes }: Dependencies = useDependencies()
  const [search, setSearch] = useState<string>('')

  const notesQuery: UseQueryResult<Note[], Error> = useQuery({
    queryKey: noteQueryKeys.all,
    queryFn: ({ signal }: QueryFunctionContext): Promise<Note[]> => getNotes.execute(signal),
  })

  const isSearching: boolean = search.trim().length > 0
  const matchingNotes: Note[] = findMatchingNotes(notesQuery.data ?? [], search, excludedNoteIds)

  return {
    search,
    suggestions: matchingNotes.slice(0, MAX_SUGGESTIONS),
    hasMoreSuggestions: matchingNotes.length > MAX_SUGGESTIONS,
    hasNoResult: isSearching && notesQuery.isSuccess && matchingNotes.length === 0,
    error: isSearching && notesQuery.isError ? toNoteErrorMessage(notesQuery.error) : null,
    changeSearch: setSearch,
  }
}
