import { describe, expect, it } from 'vitest'
import { NoteValidationError } from '../errors/NoteValidationError'
import { createNewNote, NOTE_DESCRIPTION_MAX_LENGTH, NOTE_TITLE_MAX_LENGTH } from './Note'

describe('createNewNote', () => {
  it('returns the note with a trimmed title', () => {
    const note = createNewNote('  Mon idée  ', 'Une description')

    expect(note).toEqual({ title: 'Mon idée', description: 'Une description' })
  })

  it.each(['', '   ', '\t\n'])('rejects an empty or blank title (%j)', (title: string) => {
    expect(() => createNewNote(title, null)).toThrow(NoteValidationError)
  })

  it('accepts a title of exactly the max length', () => {
    const title = 'a'.repeat(NOTE_TITLE_MAX_LENGTH)

    expect(createNewNote(title, null).title).toBe(title)
  })

  it('rejects a title longer than the max length', () => {
    const error = captureError(() => createNewNote('a'.repeat(NOTE_TITLE_MAX_LENGTH + 1), null))

    expect(error).toBeInstanceOf(NoteValidationError)
    expect((error as NoteValidationError).field).toBe('title')
  })

  it('checks the length of the title after trimming it', () => {
    const title = `  ${'a'.repeat(NOTE_TITLE_MAX_LENGTH)}  `

    expect(createNewNote(title, null).title).toHaveLength(NOTE_TITLE_MAX_LENGTH)
  })

  it.each([null, '', '   '])('turns a missing or blank description (%j) into null', (description: string | null) => {
    expect(createNewNote('Titre', description).description).toBeNull()
  })

  it('keeps the description as typed (not trimmed)', () => {
    expect(createNewNote('Titre', '  ligne 1\nligne 2  ').description).toBe('  ligne 1\nligne 2  ')
  })

  it('accepts a description of exactly the max length', () => {
    const description = 'a'.repeat(NOTE_DESCRIPTION_MAX_LENGTH)

    expect(createNewNote('Titre', description).description).toBe(description)
  })

  it('rejects a description longer than the max length', () => {
    const error = captureError(() => createNewNote('Titre', 'a'.repeat(NOTE_DESCRIPTION_MAX_LENGTH + 1)))

    expect(error).toBeInstanceOf(NoteValidationError)
    expect((error as NoteValidationError).field).toBe('description')
  })
})

function captureError(action: () => unknown): unknown {
  try {
    action()
  } catch (error: unknown) {
    return error
  }
  throw new Error('Expected an error to be thrown')
}
