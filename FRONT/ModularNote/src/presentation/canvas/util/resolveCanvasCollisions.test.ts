import { describe, expect, it, vi } from 'vitest'
import { aNote } from '../../../domain/notes/repositories/FakeNoteRepository.test-utils'
import type { CanvasNoteNodeType } from '../view/components/canvasGraphTypes'
import { resolveCanvasCollisions } from './resolveCanvasCollisions'

function aNode(id: string, x: number, y: number, dragging: boolean = false): CanvasNoteNodeType {
  return {
    id,
    type: 'note',
    position: { x, y },
    dragging,
    measured: { width: 200, height: 70 },
    data: { note: aNote({ id }), linkCount: 0, isDeleting: false, onDelete: vi.fn() },
  }
}

function overlaps(first: CanvasNoteNodeType, second: CanvasNoteNodeType): boolean {
  return (
    Math.abs(first.position.x - second.position.x) < 200 && Math.abs(first.position.y - second.position.y) < 70
  )
}

describe('resolveCanvasCollisions', () => {
  it('keeps the same nodes when nothing overlaps', () => {
    const nodes = [aNode('a', 0, 0), aNode('b', 500, 500)]

    const result = resolveCanvasCollisions(nodes)

    expect(result[0]).toBe(nodes[0])
    expect(result[1]).toBe(nodes[1])
  })

  it('pushes a note aside without moving the one being dragged', () => {
    const [dragged, pushed] = resolveCanvasCollisions([aNode('a', 0, 0, true), aNode('b', 50, 10)])

    expect(dragged.position).toEqual({ x: 0, y: 0 })
    expect(overlaps(dragged, pushed)).toBe(false)
  })

  it('pushes a note that comes close, even before they touch', () => {
    const [, pushed] = resolveCanvasCollisions([aNode('a', 0, 0, true), aNode('b', 0, 80)])

    expect(pushed.position.y).toBe(86)
  })

  it('moves the next notes in a chain', () => {
    const nodes = resolveCanvasCollisions([aNode('a', 0, 0, true), aNode('b', 0, 60), aNode('c', 0, 130)])

    expect(overlaps(nodes[0], nodes[1])).toBe(false)
    expect(overlaps(nodes[1], nodes[2])).toBe(false)
    expect(overlaps(nodes[0], nodes[2])).toBe(false)
  })

  it('separates two notes at the same place when none is dragged', () => {
    const [first, second] = resolveCanvasCollisions([aNode('a', 0, 0), aNode('b', 0, 0)])

    expect(overlaps(first, second)).toBe(false)
  })
})
