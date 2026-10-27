import { ApiError } from '../../../core/http/ApiError'
import { NoteNotFoundError } from '../../../domain/notes/entity/errors/NoteNotFoundError'
import { NoteRejectedError } from '../../../domain/notes/entity/errors/NoteRejectedError'
import { NoteValidationError } from '../../../domain/notes/entity/errors/NoteValidationError'
import { NOTE_DESCRIPTION_MAX_LENGTH, NOTE_TITLE_MAX_LENGTH } from '../../../domain/notes/entity/models/Note'

/**
 * Translate an error thrown by a notes use case into a message for the user
 * @param error - Error thrown by a use case, of any type
 * @returns A message in French that tells the user what happened
 */
export function toNoteErrorMessage(error: unknown): string {
  if (error instanceof NoteValidationError) {
    return error.field === 'title'
      ? `Le titre est obligatoire et ne doit pas dépasser ${NOTE_TITLE_MAX_LENGTH} caractères.`
      : `La description ne doit pas dépasser ${NOTE_DESCRIPTION_MAX_LENGTH} caractères.`
  }
  if (error instanceof NoteNotFoundError) {
    return "Cette idée n'existe plus."
  }
  if (error instanceof NoteRejectedError) {
    return "L'idée est invalide, vérifie le titre et la description."
  }
  if (error instanceof ApiError) {
    // The server answered, but with an error the user cannot fix
    return 'Le serveur a rencontré une erreur, réessaie dans un instant.'
  }
  return 'Impossible de joindre le serveur, vérifie ta connexion.'
}
