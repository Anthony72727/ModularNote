import { describe, expect, it } from 'vitest'
import { aNote } from '../../../domain/notes/repositories/FakeNoteRepository.test-utils'
import { computeCanvasLayout } from './computeCanvasLayout'
import type { CanvasPosition } from './computeCanvasLayout'

const notes = ['note-a', 'note-b', 'note-c', 'note-d', 'note-e', 'note-f'].map((id) => aNote({ id }))
const links = [
  { id: 'link-1', noteAId: 'note-a', noteBId: 'note-b' },
  { id: 'link-2', noteAId: 'note-c', noteBId: 'note-a' },
]

function distance(first: CanvasPosition, second: CanvasPosition): number {
  return Math.hypot(first.x - second.x, first.y - second.y)
}

describe('computeCanvasLayout', () => {
  it('gives no position without a note', () => {
    expect(computeCanvasLayout([], [])).toEqual({})
  })

  it('places every note at a usable position', () => {
    const positions = computeCanvasLayout(notes, links)

    expect(Object.keys(positions).sort()).toEqual(notes.map((note) => note.id))
    for (const position of Object.values(positions)) {
      expect(Number.isFinite(position.x)).toBe(true)
      expect(Number.isFinite(position.y)).toBe(true)
    }
  })

  it('gives the same positions at every display, whatever the order of the notes and links', () => {
    const first = computeCanvasLayout(notes, links)
    const second = computeCanvasLayout([...notes].reverse(), [...links].reverse())

    expect(second).toEqual(first)
  })

  it('brings linked notes closer than notes without a link', () => {
    const positions = computeCanvasLayout(notes, links)

    expect(distance(positions['note-a'], positions['note-b'])).toBeLessThan(
      distance(positions['note-b'], positions['note-f']),
    )
  })

  it('keeps the notes apart', () => {
    const positions = Object.values(computeCanvasLayout(notes, links))

    for (const [index, position] of positions.entries()) {
      for (const other of positions.slice(index + 1)) {
        expect(distance(position, other)).toBeGreaterThan(200)
      }
    }
  })

  it('ignores a link to an unknown note', () => {
    const positions = computeCanvasLayout(notes, [{ id: 'link', noteAId: 'note-a', noteBId: 'missing' }])

    expect(positions).toEqual(computeCanvasLayout(notes, []))
  })
})
