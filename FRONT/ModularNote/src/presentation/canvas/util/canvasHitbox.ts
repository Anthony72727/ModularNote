import type { CanvasNoteNodeType } from '../view/components/canvasGraphTypes'
import type { CanvasPosition } from './computeCanvasLayout'

/** Free space kept around a note, beyond its half diagonal */
export const CANVAS_NOTE_MARGIN: number = 24
const DEFAULT_WIDTH: number = 210
const DEFAULT_HEIGHT: number = 70

/**
 * Round space kept free around a note
 */
export type CanvasCircle = {
  /** Horizontal position of the center */
  x: number
  /** Vertical position of the center */
  y: number
  /** Radius: half diagonal of the note plus the margin */
  radius: number
}

/**
 * Space kept free around the notes being dragged together: the rectangle that holds their centers, widened on every
 * side by the radius of the largest note, which gives a rectangle with round corners. For a single note, it is the
 * circle of this note
 */
export type CanvasHitbox = {
  /** Left side of the rectangle that holds the centers */
  left: number
  /** Top side of the rectangle that holds the centers */
  top: number
  /** Right side of the rectangle that holds the centers */
  right: number
  /** Bottom side of the rectangle that holds the centers */
  bottom: number
  /** Width added on every side of the rectangle */
  radius: number
}

/**
 * Way out of the rectangle of a hitbox, by one of its sides
 */
type SideExit = {
  /** Center the note should have to just touch the hitbox */
  center: CanvasPosition
  /** Distance from the center of the note to this side */
  length: number
}

/**
 * Size of a note, measured by React Flow or guessed before it is
 * @param node - The note
 * @returns Its width and height
 */
function sizeOf(node: CanvasNoteNodeType): { width: number; height: number } {
  return { width: node.measured?.width ?? DEFAULT_WIDTH, height: node.measured?.height ?? DEFAULT_HEIGHT }
}

/**
 * Round space kept free around a note
 * @param node - The note
 * @returns Its circle
 */
export function toCanvasCircle(node: CanvasNoteNodeType): CanvasCircle {
  const { width, height } = sizeOf(node)
  return {
    x: node.position.x + width / 2,
    y: node.position.y + height / 2,
    radius: Math.hypot(width, height) / 2 + CANVAS_NOTE_MARGIN,
  }
}

/**
 * Position of a note whose center is at a given place
 * @param node - The note
 * @param center - Place of its center
 * @returns The position of its top left corner
 */
export function toCanvasPosition(node: CanvasNoteNodeType, center: CanvasPosition): CanvasPosition {
  const { width, height } = sizeOf(node)
  return { x: center.x - width / 2, y: center.y - height / 2 }
}

/**
 * Space kept free around notes dragged together
 * @param circles - Circles of the dragged notes
 * @returns The space around them, or null when no note is dragged
 */
export function computeCanvasHitbox(circles: CanvasCircle[]): CanvasHitbox | null {
  if (circles.length === 0) {
    return null
  }
  return {
    left: Math.min(...circles.map((circle: CanvasCircle): number => circle.x)),
    top: Math.min(...circles.map((circle: CanvasCircle): number => circle.y)),
    right: Math.max(...circles.map((circle: CanvasCircle): number => circle.x)),
    bottom: Math.max(...circles.map((circle: CanvasCircle): number => circle.y)),
    radius: Math.max(...circles.map((circle: CanvasCircle): number => circle.radius)),
  }
}

/**
 * Space kept free around the notes being dragged
 * @param nodes - Notes of the canvas
 * @returns The space around the dragged notes, or null when none is dragged
 */
export function computeDraggedHitbox(nodes: CanvasNoteNodeType[]): CanvasHitbox | null {
  return computeCanvasHitbox(
    nodes.filter((node: CanvasNoteNodeType): boolean => node.dragging === true).map(toCanvasCircle),
  )
}

/**
 * Closest place where a circle no longer touches the hitbox
 * @param circle - Circle of a note
 * @param hitbox - Space kept free around the dragged notes
 * @returns The center the note should have to just touch the hitbox, or null when it does not touch it
 */
export function findHitboxExit(circle: CanvasCircle, hitbox: CanvasHitbox): CanvasPosition | null {
  const reach: number = hitbox.radius + circle.radius
  const closestX: number = Math.min(Math.max(circle.x, hitbox.left), hitbox.right)
  const closestY: number = Math.min(Math.max(circle.y, hitbox.top), hitbox.bottom)
  const deltaX: number = circle.x - closestX
  const deltaY: number = circle.y - closestY
  const distance: number = Math.hypot(deltaX, deltaY)

  if (distance > 0) {
    if (distance >= reach) {
      return null
    }
    return { x: closestX + (deltaX / distance) * reach, y: closestY + (deltaY / distance) * reach }
  }

  // The center is inside the rectangle: the note leaves by the closest side
  const exits: SideExit[] = [
    { center: { x: hitbox.left - reach, y: circle.y }, length: circle.x - hitbox.left },
    { center: { x: hitbox.right + reach, y: circle.y }, length: hitbox.right - circle.x },
    { center: { x: circle.x, y: hitbox.top - reach }, length: circle.y - hitbox.top },
    { center: { x: circle.x, y: hitbox.bottom + reach }, length: hitbox.bottom - circle.y },
  ]
  return exits.reduce((best: SideExit, exit: SideExit): SideExit => (exit.length < best.length ? exit : best)).center
}
