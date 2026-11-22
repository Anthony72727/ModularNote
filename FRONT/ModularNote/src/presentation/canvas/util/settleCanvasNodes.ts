import type { CanvasNoteNodeType } from '../view/components/canvasGraphTypes'
import { computeDraggedHitbox, findHitboxExit, toCanvasCircle, toCanvasPosition } from './canvasHitbox'
import type { CanvasHitbox } from './canvasHitbox'
import type { CanvasPosition } from './computeCanvasLayout'
import { resolveCanvasCollisions } from './resolveCanvasCollisions'

const RETURN_TIME_MS: number = 180
const ARRIVAL_DISTANCE: number = 0.5

/**
 * Move a note a little closer to a place, or put it there when it is almost there
 * @param node - The note
 * @param target - Where the note goes
 * @param share - Part of the remaining distance covered by this step
 * @returns The note at its new position
 */
function moveCloser(node: CanvasNoteNodeType, target: CanvasPosition, share: number): CanvasNoteNodeType {
  const deltaX: number = target.x - node.position.x
  const deltaY: number = target.y - node.position.y
  if (Math.hypot(deltaX, deltaY) < ARRIVAL_DISTANCE) {
    return { ...node, position: target }
  }
  return { ...node, position: { x: node.position.x + deltaX * share, y: node.position.y + deltaY * share } }
}

/**
 * True when at least one dragged note is no longer where it was when the drag started
 * @param nodes - Notes of the canvas
 * @param restPositions - Place of the notes when the drag started, by id
 * @returns True once the dragged notes have moved
 */
function haveDraggedNotesMoved(nodes: CanvasNoteNodeType[], restPositions: Record<string, CanvasPosition>): boolean {
  return nodes.some((node: CanvasNoteNodeType): boolean => {
    const rest: CanvasPosition | undefined = restPositions[node.id]
    return node.dragging === true && rest !== undefined && (rest.x !== node.position.x || rest.y !== node.position.y)
  })
}

/**
 * Bring the notes a little closer to their place: a note pushed aside goes back once the way is free, and slides
 * around the notes that are still in its way. A note being dragged or without a place to go back to stays where it is.
 * A trapped note, caught by the dragged notes when the drag started, waits for them to move, then slides to the
 * closest place out of their hitbox.
 * @param nodes - Notes of the canvas
 * @param restPositions - Place of every note that goes back, by id
 * @param elapsedMs - Time since the previous call, in milliseconds
 * @param trappedIds - Ids of the notes caught by the dragged notes when the drag started
 * @returns The notes at their new position, or the same array if none has moved
 */
export function settleCanvasNodes(
  nodes: CanvasNoteNodeType[],
  restPositions: Record<string, CanvasPosition>,
  elapsedMs: number,
  trappedIds: ReadonlySet<string> = new Set<string>(),
): CanvasNoteNodeType[] {
  const share: number = 1 - Math.exp(-elapsedMs / RETURN_TIME_MS)
  const hitbox: CanvasHitbox | null = computeDraggedHitbox(nodes)
  const canLeaveHitbox: boolean = haveDraggedNotesMoved(nodes, restPositions)

  const pulledNodes: CanvasNoteNodeType[] = nodes.map((node: CanvasNoteNodeType): CanvasNoteNodeType => {
    const rest: CanvasPosition | undefined = restPositions[node.id]
    if (node.dragging === true) {
      return node
    }
    if (trappedIds.has(node.id) && hitbox !== null) {
      const exit: CanvasPosition | null = findHitboxExit(toCanvasCircle(node), hitbox)
      if (exit !== null) {
        return canLeaveHitbox ? moveCloser(node, toCanvasPosition(node, exit), share) : node
      }
    }
    return rest === undefined ? node : moveCloser(node, rest, share)
  })

  const fixedIds: Set<string> = new Set(
    nodes
      .filter((node: CanvasNoteNodeType): boolean => restPositions[node.id] === undefined)
      .map((node: CanvasNoteNodeType): string => node.id),
  )
  const settledNodes: CanvasNoteNodeType[] = resolveCanvasCollisions(pulledNodes, fixedIds, trappedIds)
  const hasMoved: boolean = settledNodes.some(
    (node: CanvasNoteNodeType, index: number): boolean =>
      node.position.x !== nodes[index].position.x || node.position.y !== nodes[index].position.y,
  )
  return hasMoved ? settledNodes : nodes
}
