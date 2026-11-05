import type { CanvasNoteNodeType } from '../view/components/canvasGraphTypes'
import type { CanvasPosition } from './computeCanvasLayout'
import { resolveCanvasCollisions } from './resolveCanvasCollisions'

const RETURN_TIME_MS: number = 180
const ARRIVAL_DISTANCE: number = 0.5

/**
 * Bring the notes a little closer to their place: a note pushed aside goes back once the way is free, and slides
 * around the notes that are still in its way. A note being dragged or without a place to go back to stays where it is.
 * @param nodes - Notes of the canvas
 * @param restPositions - Place of every note that goes back, by id
 * @param elapsedMs - Time since the previous call, in milliseconds
 * @returns The notes at their new position, or the same array if none has moved
 */
export function settleCanvasNodes(
  nodes: CanvasNoteNodeType[],
  restPositions: Record<string, CanvasPosition>,
  elapsedMs: number,
): CanvasNoteNodeType[] {
  const share: number = 1 - Math.exp(-elapsedMs / RETURN_TIME_MS)
  const pulledNodes: CanvasNoteNodeType[] = nodes.map((node: CanvasNoteNodeType): CanvasNoteNodeType => {
    const rest: CanvasPosition | undefined = restPositions[node.id]
    if (rest === undefined || node.dragging === true) {
      return node
    }
    const deltaX: number = rest.x - node.position.x
    const deltaY: number = rest.y - node.position.y
    if (Math.hypot(deltaX, deltaY) < ARRIVAL_DISTANCE) {
      return { ...node, position: rest }
    }
    return { ...node, position: { x: node.position.x + deltaX * share, y: node.position.y + deltaY * share } }
  })

  const fixedIds: Set<string> = new Set(
    nodes
      .filter((node: CanvasNoteNodeType): boolean => restPositions[node.id] === undefined)
      .map((node: CanvasNoteNodeType): string => node.id),
  )
  const settledNodes: CanvasNoteNodeType[] = resolveCanvasCollisions(pulledNodes, fixedIds)
  const hasMoved: boolean = settledNodes.some(
    (node: CanvasNoteNodeType, index: number): boolean =>
      node.position.x !== nodes[index].position.x || node.position.y !== nodes[index].position.y,
  )
  return hasMoved ? settledNodes : nodes
}
