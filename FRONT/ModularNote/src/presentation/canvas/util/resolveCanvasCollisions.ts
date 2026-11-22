import type { CanvasNoteNodeType } from '../view/components/canvasGraphTypes'
import { computeCanvasHitbox, findHitboxExit, toCanvasCircle, toCanvasPosition } from './canvasHitbox'
import type { CanvasCircle, CanvasHitbox } from './canvasHitbox'
import type { CanvasPosition } from './computeCanvasLayout'

const TOLERANCE: number = 0.01
const MAX_PASSES: number = 30

/**
 * Round space kept free around a note while the collisions are resolved
 */
type Circle = CanvasCircle & {
  /** True when the note is being dragged */
  isDragged: boolean
  /** True when the note must not move */
  isFixed: boolean
  /** True when the note got caught by the dragged notes when the drag started: it leaves them by itself */
  isTrapped: boolean
  /** True when the note was pushed */
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
 * Push a circle out of the hitbox of the dragged notes, which does not move
 * @returns True if the circle was touching the hitbox
 */
function leaveHitbox(circle: Circle, hitbox: CanvasHitbox): boolean {
  const exit: CanvasPosition | null = findHitboxExit(circle, hitbox)
  if (exit === null || Math.hypot(exit.x - circle.x, exit.y - circle.y) <= TOLERANCE) {
    return false
  }
  circle.x = exit.x
  circle.y = exit.y
  circle.hasMoved = true
  return true
}

/**
 * Keep a round free space around every note: a note whose circle touches another one is pushed aside, which can push
 * the next one, and so on. The notes being dragged never move, it is the others that make room: together they keep a
 * single space free around them (a rectangle with round corners, see CanvasHitbox), so that no note can get caught
 * between them. A note listed as fixed never moves either, and a trapped note is left inside the dragged notes: it
 * leaves them slowly, see settleCanvasNodes.
 * @param nodes - Notes of the canvas
 * @param fixedIds - Ids of other notes that must not move
 * @param trappedIds - Ids of the notes caught by the dragged notes when the drag started
 * @returns The notes, with a new position for those that had to move
 */
export function resolveCanvasCollisions(
  nodes: CanvasNoteNodeType[],
  fixedIds: ReadonlySet<string> = new Set<string>(),
  trappedIds: ReadonlySet<string> = new Set<string>(),
): CanvasNoteNodeType[] {
  const circles: Circle[] = nodes.map((node: CanvasNoteNodeType): Circle => {
    const isDragged: boolean = node.dragging === true
    return {
      ...toCanvasCircle(node),
      isDragged,
      isFixed: isDragged || fixedIds.has(node.id),
      isTrapped: !isDragged && trappedIds.has(node.id),
      hasMoved: false,
    }
  })
  const others: Circle[] = circles.filter((circle: Circle): boolean => !circle.isDragged)
  const hitbox: CanvasHitbox | null = computeCanvasHitbox(circles.filter((circle: Circle): boolean => circle.isDragged))

  let hasOverlap: boolean = true
  for (let pass: number = 0; pass < MAX_PASSES && hasOverlap; pass++) {
    hasOverlap = false
    for (let first: number = 0; first < others.length; first++) {
      for (let second: number = first + 1; second < others.length; second++) {
        hasOverlap = separate(others[first], others[second]) || hasOverlap
      }
    }
    if (hitbox !== null) {
      others
        .filter((circle: Circle): boolean => !circle.isFixed && !circle.isTrapped)
        .forEach((circle: Circle): void => {
          hasOverlap = leaveHitbox(circle, hitbox) || hasOverlap
        })
    }
  }

  return nodes.map((node: CanvasNoteNodeType, index: number): CanvasNoteNodeType => {
    const circle: Circle = circles[index]
    return circle.hasMoved ? { ...node, position: toCanvasPosition(node, circle) } : node
  })
}
