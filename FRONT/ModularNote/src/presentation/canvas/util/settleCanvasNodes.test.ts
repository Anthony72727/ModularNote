import { describe, expect, it, vi } from 'vitest'
import { aNote } from '../../../domain/notes/repositories/FakeNoteRepository.test-utils'
import type { CanvasNoteNodeType } from '../view/components/canvasGraphTypes'
import { settleCanvasNodes } from './settleCanvasNodes'

const WIDTH = 200
const HEIGHT = 70
// Half of the diagonal of a note, plus the margin
const RADIUS = Math.hypot(WIDTH, HEIGHT) / 2 + 24
const LONG_TIME = 100_000

function aNode(id: string, x: number, y: number, dragging: boolean = false): CanvasNoteNodeType {
  return {
    id,
    type: 'note',
    position: { x, y },
    dragging,
    measured: { width: WIDTH, height: HEIGHT },
    data: { note: aNote({ id }), linkCount: 0, isDeleting: false, onDelete: vi.fn() },
  }
}

function distance(first: CanvasNoteNodeType, second: CanvasNoteNodeType): number {
  return Math.hypot(first.position.x - second.position.x, first.position.y - second.position.y)
}

describe('settleCanvasNodes', () => {
  it('brings a note closer to its place, little by little', () => {
    const [node] = settleCanvasNodes([aNode('a', 100, 0)], { a: { x: 0, y: 0 } }, 16)

    expect(node.position.x).toBeGreaterThan(0)
    expect(node.position.x).toBeLessThan(100)
  })

  it('puts a note back at its exact place once it is close enough', () => {
    const [node] = settleCanvasNodes([aNode('a', 0.2, 0)], { a: { x: 0, y: 0 } }, 16)

    expect(node.position).toEqual({ x: 0, y: 0 })
  })

  it('returns the same array when no note has moved', () => {
    const nodes = [aNode('a', 0, 0)]

    expect(settleCanvasNodes(nodes, { a: { x: 0, y: 0 } }, 16)).toBe(nodes)
  })

  it('does not move the note being dragged', () => {
    const [node] = settleCanvasNodes([aNode('a', 100, 0, true)], { a: { x: 0, y: 0 } }, LONG_TIME)

    expect(node.position).toEqual({ x: 100, y: 0 })
  })

  it('keeps a note out of the free space of the one being dragged, on the way back', () => {
    const [dragged, pushed] = settleCanvasNodes(
      [aNode('a', 0, 0, true), aNode('b', 0, RADIUS * 2)],
      { b: { x: 0, y: 10 } },
      LONG_TIME,
    )

    expect(dragged.position).toEqual({ x: 0, y: 0 })
    expect(distance(dragged, pushed)).toBeCloseTo(RADIUS * 2)
  })

  it('slides a note around the one in its way, towards its place', () => {
    let nodes = [aNode('a', 0, 0, true), aNode('b', RADIUS * 2, 0)]

    for (let frame = 0; frame < 200; frame++) {
      nodes = settleCanvasNodes(nodes, { b: { x: 10, y: RADIUS * 2 } }, 16)
      expect(distance(nodes[0], nodes[1])).toBeGreaterThan(RADIUS * 2 - 0.1)
    }

    expect(nodes[1].position.x).toBeCloseTo(10, 0)
    expect(nodes[1].position.y).toBeCloseTo(RADIUS * 2, 0)
  })

  it('does not push a note that has no place to go back to', () => {
    const [dropped, pushed] = settleCanvasNodes(
      [aNode('a', 0, 0), aNode('b', 0, RADIUS * 2)],
      { b: { x: 0, y: 10 } },
      LONG_TIME,
    )

    expect(dropped.position).toEqual({ x: 0, y: 0 })
    expect(distance(dropped, pushed)).toBeCloseTo(RADIUS * 2)
  })

  it('leaves a note without a place where it is', () => {
    const nodes = [aNode('a', 40, 40)]

    expect(settleCanvasNodes(nodes, {}, LONG_TIME)).toBe(nodes)
  })
})
