import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { QueryClient, QueryFunctionContext, UseMutationResult } from '@tanstack/react-query'
import type { Dependencies } from '../../../core/di/Dependencies'
import { useDependencies } from '../../../core/di/DependenciesContext'
import { LinkedNoteNotFoundError } from '../../../domain/notes/entity/errors/LinkedNoteNotFoundError'
import { NoteValidationError } from '../../../domain/notes/entity/errors/NoteValidationError'
import type { NoteField } from '../../../domain/notes/entity/errors/NoteValidationError'
import type { Note } from '../../../domain/notes/entity/models/Note'
import { toMissingLinkedNotesMessage } from '../util/toMissingLinkedNotesMessage'
import { toNoteErrorMessage } from '../util/toNoteErrorMessage'
import { noteQueryKeys } from './noteQueryKeys'

/**
 * Number of notes kept in recentNotes
 */
export const MAX_RECENT_NOTES: number = 5

/**
 * State and actions of a note creation form (full form or quick add)
 */
export type AddNoteViewModel = {
  /** Title typed by the user, as is */
  title: string
  /** Description typed by the user, as is */
  description: string
  /** Existing notes chosen to be linked to the new note */
  linkedNotes: Note[]
  /** True when the title is empty or only made of spaces */
  isTitleBlank: boolean
  /** True when the user typed something that is not saved yet */
  hasUnsavedInput: boolean
  /** Message to show to the user, null when there is no error */
  error: string | null
  /** Field to highlight, null when the error is not about a specific field */
  invalidField: NoteField | null
  /** True while the note is being sent */
  isSubmitting: boolean
  /** Notes created with this form since it was opened, newest first (at most MAX_RECENT_NOTES) */
  recentNotes: Note[]
  /** Replace the title and clear the current error (receives the new title) */
  changeTitle: (value: string) => void
  /** Replace the description and clear the current error (receives the new description) */
  changeDescription: (value: string) => void
  /** Choose an existing note to link to the new note and clear the current error (receives this note) */
  addLinkedNote: (note: Note) => void
  /** Give up the link to a note and clear the current error (receives the id of this note) */
  removeLinkedNote: (id: string) => void
  /** Validate and send the note, then empty the form; ignored while a note is already being sent */
  submit: () => void
}

/**
 * Raw values of the form, validated by the use case
 */
type AddNoteInput = {
  title: string
  description: string
  linkedNoteIds: string[]
}

/**
 * ViewModel of the note creation forms: the full form of the notes page and the quick add (US1.3)
 * @returns The state of the form and the actions the view can call
 */
export function useAddNoteViewModel(): AddNoteViewModel {
  const { addNote, getNotes }: Dependencies = useDependencies()
  const queryClient: QueryClient = useQueryClient()
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [linkedNotes, setLinkedNotes] = useState<Note[]>([])
  const [missingLinkedNoteTitles, setMissingLinkedNoteTitles] = useState<string[]>([])
  const [recentNotes, setRecentNotes] = useState<Note[]>([])

  /**
   * Find which linked notes do not exist anymore by reading the notes again: the API only knows their ids,
   * while the titles to show are still known here. Without an answer, the generic message of the error is kept.
   */
  async function forgetMissingLinkedNotes(): Promise<void> {
    try {
      const notes: Note[] = await queryClient.fetchQuery({
        queryKey: noteQueryKeys.all,
        queryFn: ({ signal }: QueryFunctionContext): Promise<Note[]> => getNotes.execute(signal),
      })
      const existingIds: Set<string> = new Set(notes.map((note: Note): string => note.id))
      setMissingLinkedNoteTitles(
        linkedNotes.filter((note: Note): boolean => !existingIds.has(note.id)).map((note: Note): string => note.title),
      )
      setLinkedNotes((current: Note[]): Note[] => current.filter((note: Note): boolean => existingIds.has(note.id)))
    } catch {
      // The generic message is enough: the user can still try again
    }
  }

  const addNoteMutation: UseMutationResult<Note, Error, AddNoteInput> = useMutation({
    mutationFn: (input: AddNoteInput): Promise<Note> =>
      addNote.execute(input.title, input.description, input.linkedNoteIds),
    onSuccess: (note: Note): void => {
      // Every component that reads the notes from the cache is refreshed, without reloading the page
      queryClient.setQueryData<Note[]>(noteQueryKeys.all, (notes: Note[] | undefined): Note[] | undefined =>
        notes === undefined ? undefined : [...notes, note],
      )
      queryClient.setQueryData<Note>(noteQueryKeys.detail(note.id), note)
      void queryClient.invalidateQueries({ queryKey: noteQueryKeys.allLinks })
    },
    onError: async (error: Error): Promise<void> => {
      if (error instanceof LinkedNoteNotFoundError) {
        await forgetMissingLinkedNotes()
      }
    },
  })

  function clearError(): void {
    setMissingLinkedNoteTitles([])
    if (addNoteMutation.isError) {
      addNoteMutation.reset()
    }
  }

  function changeTitle(value: string): void {
    setTitle(value)
    clearError()
  }

  function changeDescription(value: string): void {
    setDescription(value)
    clearError()
  }

  function addLinkedNote(note: Note): void {
    setLinkedNotes((current: Note[]): Note[] =>
      current.some((linkedNote: Note): boolean => linkedNote.id === note.id) ? current : [...current, note],
    )
    clearError()
  }

  function removeLinkedNote(id: string): void {
    setLinkedNotes((current: Note[]): Note[] => current.filter((note: Note): boolean => note.id !== id))
    clearError()
  }

  function submit(): void {
    if (addNoteMutation.isPending) {
      return
    }
    setMissingLinkedNoteTitles([])
    addNoteMutation.mutate(
      { title, description, linkedNoteIds: linkedNotes.map((note: Note): string => note.id) },
      {
        onSuccess: (note: Note): void => {
          setTitle('')
          setDescription('')
          setLinkedNotes([])
          setRecentNotes((notes: Note[]): Note[] => [note, ...notes].slice(0, MAX_RECENT_NOTES))
        },
      },
    )
  }

  let error: string | null = null
  if (missingLinkedNoteTitles.length > 0) {
    error = toMissingLinkedNotesMessage(missingLinkedNoteTitles)
  } else if (addNoteMutation.isError) {
    error = toNoteErrorMessage(addNoteMutation.error)
  }

  return {
    title,
    description,
    linkedNotes,
    isTitleBlank: title.trim().length === 0,
    hasUnsavedInput: title.trim().length > 0 || description.trim().length > 0 || linkedNotes.length > 0,
    error,
    invalidField: addNoteMutation.error instanceof NoteValidationError ? addNoteMutation.error.field : null,
    isSubmitting: addNoteMutation.isPending,
    recentNotes,
    changeTitle,
    changeDescription,
    addLinkedNote,
    removeLinkedNote,
    submit,
  }
}
