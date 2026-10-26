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

export type AddNoteViewModel = {
  title: string
  description: string
  error: string | null
  invalidField: NoteField | null
  isSubmitting: boolean
  changeTitle: (value: string) => void
  changeDescription: (value: string) => void
  submit: () => void
}

type AddNoteInput = {
  title: string
  description: string
}

/**
 * ViewModel of the note creation form (also meant to be reused by the quick add of US1.3)
 */
export function useAddNoteViewModel(): AddNoteViewModel {
  const { addNote }: Dependencies = useDependencies()
  const queryClient: QueryClient = useQueryClient()
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')

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
        onSuccess: (): void => {
          setTitle('')
          setDescription('')
        },
      },
    )
  }

  return {
    title,
    description,
    error: addNoteMutation.isError ? toNoteErrorMessage(addNoteMutation.error) : null,
    invalidField: addNoteMutation.error instanceof NoteValidationError ? addNoteMutation.error.field : null,
    isSubmitting: addNoteMutation.isPending,
    changeTitle,
    changeDescription,
    submit,
  }
}
