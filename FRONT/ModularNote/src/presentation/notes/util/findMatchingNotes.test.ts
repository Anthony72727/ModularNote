import { describe, expect, it } from 'vitest'
import { aNote } from '../../../domain/notes/repositories/FakeNoteRepository.test-utils'
import { findMatchingNotes } from './findMatchingNotes'

describe('findMatchingNotes', () => {
  it.each([
    ['Mon idée', 'idée'],
    ['Mon idée', 'IDEE'],
    ['Mon IDEE', 'idée'],
    ['Mon idée', '  mon '],
  ])('finds %s with %s', (title: string, search: string) => {
    expect(findMatchingNotes([aNote({ title })], search, [])).toHaveLength(1)
  })

  it('does not find a title that does not contain the search', () => {
    expect(findMatchingNotes([aNote({ title: 'Mon idée' })], 'projet', [])).toEqual([])
  })

  it('finds nothing while the search is blank', () => {
    expect(findMatchingNotes([aNote()], '   ', [])).toEqual([])
  })

  it('leaves out the excluded notes', () => {
    const kept = aNote({ id: 'kept', title: 'Idée' })
    const excluded = aNote({ id: 'excluded', title: 'Idée' })

    expect(findMatchingNotes([kept, excluded], 'idée', ['excluded'])).toEqual([kept])
  })

  it('puts the exact title first, then the titles starting with the search, then the others', () => {
    const contains = aNote({ id: 'contains', title: 'Refonte', createdAt: new Date('2026-10-30T10:00:00Z') })
    const start = aNote({ id: 'start', title: 'Efficacité', createdAt: new Date('2026-10-20T10:00:00Z') })
    const exact = aNote({ id: 'exact', title: 'EF', createdAt: new Date('2026-10-01T10:00:00Z') })

    const found = findMatchingNotes([contains, start, exact], 'ef', [])

    expect(found.map((note) => note.id)).toEqual(['exact', 'start', 'contains'])
  })

  it('puts the newest note first among equally close titles', () => {
    const older = aNote({ id: 'older', title: 'Idée ancienne', createdAt: new Date('2026-10-01T10:00:00Z') })
    const newer = aNote({ id: 'newer', title: 'Idée récente', createdAt: new Date('2026-10-20T10:00:00Z') })

    expect(findMatchingNotes([older, newer], 'idée', []).map((note) => note.id)).toEqual(['newer', 'older'])
  })
})
