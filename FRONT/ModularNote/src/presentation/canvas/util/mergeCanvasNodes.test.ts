import { describe, expect, it, vi } from 'vitest'
import { aNote } from '../../../domain/notes/repositories/FakeNoteRepository.test-utils'
import type { CanvasNoteNodeType } from '../view/components/canvasGraphTypes'
import { mergeCanvasNodes } from './mergeCanvasNodes'

function aNode(id: string, x: number, title: string = 'Idée'): CanvasNoteNodeType {
  return {
    id,
    type: 'note',
    position: { x, y: 0 },
    data: { note: aNote({ id, title }), linkCount: 0, isDeleting: false, onDelete: vi.fn() },
  }
}

describe('mergeCanvasNodes', () => {
  it('shows the computed nodes when nothing is on screen yet', () => {
    const computed = [aNode('a', 10)]

    expect(mergeCanvasNodes(computed, [])).toEqual(computed)
  })

  it('keeps a moved note where it is, with its measured size and up-to-date data', () => {
    const moved = { ...aNode('a', 500, 'Ancien titre'), measured: { width: 200, height: 70 } }

    const [node] = mergeCanvasNodes([aNode('a', 10, 'Nouveau titre')], [moved])

    expect(node.position.x).toBe(500)
    expect(node.measured).toEqual({ width: 200, height: 70 })
    expect(node.data.note.title).toBe('Nouveau titre')
  })

  it('gives a new note its computed position and drops a removed note', () => {
    const nodes = mergeCanvasNodes([aNode('new', 10)], [aNode('removed', 500)])

    expect(nodes.map((node) => node.id)).toEqual(['new'])
    expect(nodes[0].position.x).toBe(10)
  })
})
