import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { QueryClient, UseMutationResult } from '@tanstack/react-query'
import type { Dependencies } from '../../../core/di/Dependencies'
import { useDependencies } from '../../../core/di/DependenciesContext'
import { NoteValidationError } from '../../../domain/notes/entity/errors/NoteValidationError'
import type { NoteField } from '../../../domain/notes/entity/errors/NoteValidationError'
import type { Note } from '../../../domain/notes/entity/models/Note'
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
  /** True when the title is empty or only made of spaces */
  isTitleBlank: boolean
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
  /** Validate and send the note, then empty the form; ignored while a note is already being sent */
  submit: () => void
}

/**
 * Raw values of the form, validated by the use case
 */
type AddNoteInput = {
  title: string
  description: string
}

/**
 * ViewModel of the note creation forms: the full form of the notes page and the quick add (US1.3)
 * @returns The state of the form and the actions the view can call
 */
export function useAddNoteViewModel(): AddNoteViewModel {
  const { addNote }: Dependencies = useDependencies()
  const queryClient: QueryClient = useQueryClient()
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [recentNotes, setRecentNotes] = useState<Note[]>([])

  const addNoteMutation: UseMutationResult<Note, Error, AddNoteInput> = useMutation({
    mutationFn: (input: AddNoteInput): Promise<Note> => addNote.execute(input.title, input.description),
    onSuccess: (note: Note): void => {
      // Every component that reads the notes from the cache is refreshed, without reloading the page
      queryClient.setQueryData<Note[]>(noteQueryKeys.all, (notes: Note[] | undefined): Note[] | undefined =>
        notes === undefined ? undefined : [...notes, note],
      )
      queryClient.setQueryData<Note>(noteQueryKeys.detail(note.id), note)
    },
  })

  function clearError(): void {
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

  function submit(): void {
    if (addNoteMutation.isPending) {
      return
    }
    addNoteMutation.mutate(
      { title, description },
      {
        onSuccess: (note: Note): void => {
          setTitle('')
          setDescription('')
          setRecentNotes((notes: Note[]): Note[] => [note, ...notes].slice(0, MAX_RECENT_NOTES))
        },
      },
    )
  }

  return {
    title,
    description,
    isTitleBlank: title.trim().length === 0,
    error: addNoteMutation.isError ? toNoteErrorMessage(addNoteMutation.error) : null,
    invalidField: addNoteMutation.error instanceof NoteValidationError ? addNoteMutation.error.field : null,
    isSubmitting: addNoteMutation.isPending,
    recentNotes,
    changeTitle,
    changeDescription,
    submit,
  }
}
