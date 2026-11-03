import { describe, expect, it } from 'vitest'
import { toMissingLinkedNotesMessage } from './toMissingLinkedNotesMessage'

describe('toMissingLinkedNotesMessage', () => {
  it('names a single note', () => {
    expect(toMissingLinkedNotesMessage(['Mon idée'])).toBe("L'idée liée « Mon idée » n'existe plus.")
  })

  it('names several notes', () => {
    expect(toMissingLinkedNotesMessage(['Une', 'Deux'])).toBe("Les idées liées « Une », « Deux » n'existent plus.")
  })
})
