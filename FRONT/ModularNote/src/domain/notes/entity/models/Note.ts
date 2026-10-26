import { NoteValidationError } from '../errors/NoteValidationError'

export const NOTE_TITLE_MAX_LENGTH: number = 100
export const NOTE_DESCRIPTION_MAX_LENGTH: number = 5000

/**
 * A user's note (an idea)
 */
export type Note = {
  id: string
  title: string
  description: string | null
  createdAt: Date
}

/**
 * A valid note that is not saved yet
 */
export type NewNote = {
  title: string
  description: string | null
}

/**
 * Create a valid note to save (same rules as the API's Note entity)
 * @throws NoteValidationError if the title is empty or too long, or if the description is too long
 */
export function createNewNote(title: string, description: string | null): NewNote {
  const trimmedTitle: string = title.trim()
  if (trimmedTitle.length === 0 || trimmedTitle.length > NOTE_TITLE_MAX_LENGTH) {
    throw new NoteValidationError('title')
  }

  if (description === null || description.trim().length === 0) {
    return { title: trimmedTitle, description: null }
  }
  if (description.length > NOTE_DESCRIPTION_MAX_LENGTH) {
    throw new NoteValidationError('description')
  }
  return { title: trimmedTitle, description }
}
