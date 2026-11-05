import type { CanvasNoteNodeType } from '../view/components/canvasGraphTypes'

const MARGIN: number = 24
const TOLERANCE: number = 0.01
const MAX_PASSES: number = 30
const DEFAULT_WIDTH: number = 210
const DEFAULT_HEIGHT: number = 70

/**
 * Round space kept free around a note while the collisions are resolved
 */
type Circle = {
  x: number
  y: number
  radius: number
  isFixed: boolean
  hasMoved: boolean
}

/**
 * Push two circles apart along the line between their centers
 * @returns True if the circles were overlapping
 */
function separate(first: Circle, second: Circle): boolean {
  const deltaX: number = second.x - first.x
  const deltaY: number = second.y - first.y
  const distance: number = Math.hypot(deltaX, deltaY)
  const overlap: number = first.radius + second.radius - distance
  if (overlap <= TOLERANCE || (first.isFixed && second.isFixed)) {
    return false
  }

  // Two notes at the very same place have no line between them: they part horizontally
  const directionX: number = distance === 0 ? 1 : deltaX / distance
  const directionY: number = distance === 0 ? 0 : deltaY / distance
  const firstShare: number = first.isFixed ? 0 : second.isFixed ? 1 : 0.5
  const secondShare: number = 1 - firstShare

  first.x -= directionX * overlap * firstShare
  first.y -= directionY * overlap * firstShare
  first.hasMoved = first.hasMoved || !first.isFixed
  second.x += directionX * overlap * secondShare
  second.y += directionY * overlap * secondShare
  second.hasMoved = second.hasMoved || !second.isFixed
  return true
}

/**
 * Keep a round free space around every note: a note whose circle touches another one is pushed aside, which can push
 * the next one, and so on. A note being dragged or listed as fixed never moves, it is the others that make room.
 * @param nodes - Notes of the canvas
 * @param fixedIds - Ids of other notes that must not move
 * @returns The notes, with a new position for those that had to move
 */
export function resolveCanvasCollisions(
  nodes: CanvasNoteNodeType[],
  fixedIds: ReadonlySet<string> = new Set<string>(),
): CanvasNoteNodeType[] {
  const circles: Circle[] = nodes.map((node: CanvasNoteNodeType): Circle => {
    const width: number = node.measured?.width ?? DEFAULT_WIDTH
    const height: number = node.measured?.height ?? DEFAULT_HEIGHT
    return {
      x: node.position.x + width / 2,
      y: node.position.y + height / 2,
      radius: Math.hypot(width, height) / 2 + MARGIN,
      isFixed: node.dragging === true || fixedIds.has(node.id),
      hasMoved: false,
    }
  })

  let hasOverlap: boolean = true
  for (let pass: number = 0; pass < MAX_PASSES && hasOverlap; pass++) {
    hasOverlap = false
    for (let first: number = 0; first < circles.length; first++) {
      for (let second: number = first + 1; second < circles.length; second++) {
        hasOverlap = separate(circles[first], circles[second]) || hasOverlap
      }
    }
  }

  return nodes.map((node: CanvasNoteNodeType, index: number): CanvasNoteNodeType => {
    const circle: Circle = circles[index]
    if (!circle.hasMoved) {
      return node
    }
    const width: number = node.measured?.width ?? DEFAULT_WIDTH
    const height: number = node.measured?.height ?? DEFAULT_HEIGHT
    return { ...node, position: { x: circle.x - width / 2, y: circle.y - height / 2 } }
  })
}
