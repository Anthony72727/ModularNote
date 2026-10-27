import { describe, expect, it } from 'vitest'
import { ApiError } from '../../../core/http/ApiError'
import { NoteNotFoundError } from '../../../domain/notes/entity/errors/NoteNotFoundError'
import { NoteRejectedError } from '../../../domain/notes/entity/errors/NoteRejectedError'
import { NoteValidationError } from '../../../domain/notes/entity/errors/NoteValidationError'
import { toNoteErrorMessage } from './toNoteErrorMessage'

describe('toNoteErrorMessage', () => {
  it.each([
    [new NoteValidationError('title'), 'Le titre est obligatoire et ne doit pas dépasser 100 caractères.'],
    [new NoteValidationError('description'), 'La description ne doit pas dépasser 5000 caractères.'],
    [new NoteNotFoundError('abc'), "Cette idée n'existe plus."],
    [new NoteRejectedError(), "L'idée est invalide, vérifie le titre et la description."],
    [new ApiError(500, 'boom'), 'Le serveur a rencontré une erreur, réessaie dans un instant.'],
    [new TypeError('Failed to fetch'), 'Impossible de joindre le serveur, vérifie ta connexion.'],
  ])('translates %o', (error: unknown, expected: string) => {
    expect(toNoteErrorMessage(error)).toBe(expected)
  })
})
