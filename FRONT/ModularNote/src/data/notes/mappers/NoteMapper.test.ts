import { describe, expect, it } from 'vitest'
import { toAddNoteRequestDto, toNote } from './NoteMapper'

describe('NoteMapper', () => {
  it('converts a DTO into a note, with a real Date', () => {
    const note = toNote({
      id: 'abc',
      title: 'Titre',
      description: null,
      createdAt: '2026-10-26T10:15:30.123Z',
    })

    expect(note).toEqual({
      id: 'abc',
      title: 'Titre',
      description: null,
      createdAt: new Date(Date.UTC(2026, 9, 26, 10, 15, 30, 123)),
    })
  })

  it('converts a new note into the request body', () => {
    expect(toAddNoteRequestDto({ title: 'Titre', description: 'Desc' })).toEqual({
      title: 'Titre',
      description: 'Desc',
    })
  })
})
