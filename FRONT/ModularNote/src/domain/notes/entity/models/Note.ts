import { NoteValidationError } from '../errors/NoteValidationError'

/**
 * Maximum length of a note's title, after trimming (same as the API)
 */
export const NOTE_TITLE_MAX_LENGTH: number = 100

/**
 * Maximum length of a note's description (same as the API)
 */
export const NOTE_DESCRIPTION_MAX_LENGTH: number = 5000

/**
 * A user's note (an idea)
 */
export type Note = {
  /** Id of the note (a GUID given by the API) */
  id: string
  /** Title of the note, never empty */
  title: string
  /** Description of the note, null when there is none */
  description: string | null
  /** Creation date */
  createdAt: Date
}

/**
 * A valid note that is not saved yet
 */
export type NewNote = {
  /** Trimmed title, between 1 and NOTE_TITLE_MAX_LENGTH characters */
  title: string
  /** Description of at most NOTE_DESCRIPTION_MAX_LENGTH characters, null when it is empty */
  description: string | null
}

/**
 * Create a valid note to save (same rules as the API's Note entity)
 * @param title - Title typed by the user, trimmed by this function
 * @param description - Description typed by the user; an empty or blank one becomes null
 * @returns The validated note, ready to be saved
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
