import { describe, expect, it, vi } from 'vitest'
import { aNote } from '../../../domain/notes/repositories/FakeNoteRepository.test-utils'
import type { CanvasNoteNodeType } from '../view/components/canvasGraphTypes'
import { resolveCanvasCollisions } from './resolveCanvasCollisions'

const WIDTH = 200
const HEIGHT = 70
// Half of the diagonal of a note, plus the margin
const RADIUS = Math.hypot(WIDTH, HEIGHT) / 2 + 24

function aNode(id: string, x: number, y: number, dragging: boolean = false): CanvasNoteNodeType {
  return {
    id,
    type: 'note',
    position: { x, y },
    dragging,
    measured: { width: WIDTH, height: HEIGHT },
    data: { note: aNote({ id }), linkCount: 0, isDeleting: false, onDelete: vi.fn(), highlight: 'none' },
  }
}

function distance(first: CanvasNoteNodeType, second: CanvasNoteNodeType): number {
  return Math.hypot(first.position.x - second.position.x, first.position.y - second.position.y)
}

describe('resolveCanvasCollisions', () => {
  it('keeps the same nodes when their circles do not touch', () => {
    const nodes = [aNode('a', 0, 0), aNode('b', 0, RADIUS * 2 + 1)]

    const result = resolveCanvasCollisions(nodes)

    expect(result[0]).toBe(nodes[0])
    expect(result[1]).toBe(nodes[1])
  })

  it('pushes a note aside without moving a note listed as fixed', () => {
    const [fixed, pushed] = resolveCanvasCollisions([aNode('a', 0, 0), aNode('b', 50, 10)], new Set(['a']))

    expect(fixed.position).toEqual({ x: 0, y: 0 })
    expect(distance(fixed, pushed)).toBeCloseTo(RADIUS * 2)
  })

  it('pushes a note aside without moving the one being dragged', () => {
    const [dragged, pushed] = resolveCanvasCollisions([aNode('a', 0, 0, true), aNode('b', 50, 10)])

    expect(dragged.position).toEqual({ x: 0, y: 0 })
    expect(distance(dragged, pushed)).toBeCloseTo(RADIUS * 2)
  })

  it('keeps the same distance in every direction, because the space is round', () => {
    const [center, above] = resolveCanvasCollisions([aNode('a', 0, 0, true), aNode('b', 0, 100)])
    const [, beside] = resolveCanvasCollisions([aNode('a', 0, 0, true), aNode('b', 100, 0)])

    expect(above.position.x).toBeCloseTo(0)
    expect(above.position.y).toBeCloseTo(RADIUS * 2)
    expect(beside.position.x).toBeCloseTo(RADIUS * 2)
    expect(distance(center, above)).toBeCloseTo(distance(center, beside))
  })

  it('gives more space to a taller note', () => {
    const tall = { ...aNode('a', 0, 0, true), measured: { width: WIDTH, height: 200 } }

    const [, pushed] = resolveCanvasCollisions([tall, aNode('b', 0, 100)])

    expect(pushed.position.y).toBeGreaterThan(RADIUS * 2)
  })

  it('moves the next notes in a chain', () => {
    const nodes = resolveCanvasCollisions([aNode('a', 0, 0, true), aNode('b', 0, 60), aNode('c', 0, 130)])

    expect(distance(nodes[0], nodes[1])).toBeGreaterThanOrEqual(RADIUS * 2 - 0.1)
    expect(distance(nodes[1], nodes[2])).toBeGreaterThanOrEqual(RADIUS * 2 - 0.1)
    expect(distance(nodes[0], nodes[2])).toBeGreaterThanOrEqual(RADIUS * 2 - 0.1)
  })

  it('never moves two notes dragged together', () => {
    const [first, second] = resolveCanvasCollisions([aNode('a', 0, 0, true), aNode('b', 10, 10, true)])

    expect(first.position).toEqual({ x: 0, y: 0 })
    expect(second.position).toEqual({ x: 10, y: 10 })
  })

  it('separates two notes at the same place when none is dragged', () => {
    const [first, second] = resolveCanvasCollisions([aNode('a', 0, 0), aNode('b', 0, 0)])

    expect(distance(first, second)).toBeCloseTo(RADIUS * 2)
  })

  it('pushes a note out of the space around notes dragged together, instead of letting it get caught between them', () => {
    const nodes = [aNode('a', 0, 0, true), aNode('b', 600, 0, true), aNode('c', 300, 0)]

    const [, , caught] = resolveCanvasCollisions(nodes)

    expect(caught.position.x).toBe(300)
    expect(Math.abs(caught.position.y)).toBeCloseTo(RADIUS * 2)
  })

  it('pushes a note out of the space between the dragged notes, even far from each of them', () => {
    // The note does not touch the circle of a or b, but it is in the rectangle between them
    const nodes = [aNode('a', 0, 0, true), aNode('b', 0, 1000, true), aNode('c', RADIUS * 2 - 10, 500)]

    const [, , pushed] = resolveCanvasCollisions(nodes)

    expect(pushed.position).toEqual({ x: RADIUS * 2, y: 500 })
  })

  it('leaves a trapped note inside the dragged notes', () => {
    const nodes = [aNode('a', 0, 0, true), aNode('b', 600, 0, true), aNode('c', 300, 0)]

    const [, , trapped] = resolveCanvasCollisions(nodes, new Set(), new Set(['c']))

    expect(trapped).toBe(nodes[2])
  })
})
