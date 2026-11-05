import type { CanvasNoteNodeType } from '../view/components/canvasGraphTypes'

const GAP: number = 16
const MAX_PASSES: number = 30
const DEFAULT_WIDTH: number = 210
const DEFAULT_HEIGHT: number = 70

/**
 * Space taken by a note while the collisions are resolved
 */
type Box = {
  x: number
  y: number
  width: number
  height: number
  isFixed: boolean
}

/**
 * Push two boxes apart along the axis where they overlap the least
 * @returns True if the boxes were overlapping
 */
function separate(first: Box, second: Box): boolean {
  const overlapX: number = Math.min(first.x + first.width, second.x + second.width) + GAP - Math.max(first.x, second.x)
  const overlapY: number =
    Math.min(first.y + first.height, second.y + second.height) + GAP - Math.max(first.y, second.y)
  if (overlapX <= 0 || overlapY <= 0 || (first.isFixed && second.isFixed)) {
    return false
  }

  const firstShare: number = first.isFixed ? 0 : second.isFixed ? 1 : 0.5
  const secondShare: number = 1 - firstShare
  if (overlapX < overlapY) {
    const direction: number = first.x + first.width / 2 <= second.x + second.width / 2 ? 1 : -1
    first.x -= direction * overlapX * firstShare
    second.x += direction * overlapX * secondShare
  } else {
    const direction: number = first.y + first.height / 2 <= second.y + second.height / 2 ? 1 : -1
    first.y -= direction * overlapY * firstShare
    second.y += direction * overlapY * secondShare
  }
  return true
}

/**
 * Keep the notes from overlapping: a note that is too close to another one is pushed aside, which can push the next
 * one, and so on. A note being dragged never moves, it is the others that make room.
 * @param nodes - Notes of the canvas
 * @returns The notes, with a new position for those that had to move
 */
export function resolveCanvasCollisions(nodes: CanvasNoteNodeType[]): CanvasNoteNodeType[] {
  const boxes: Box[] = nodes.map(
    (node: CanvasNoteNodeType): Box => ({
      x: node.position.x,
      y: node.position.y,
      width: node.measured?.width ?? DEFAULT_WIDTH,
      height: node.measured?.height ?? DEFAULT_HEIGHT,
      isFixed: node.dragging === true,
    }),
  )

  let hasOverlap: boolean = true
  for (let pass: number = 0; pass < MAX_PASSES && hasOverlap; pass++) {
    hasOverlap = false
    for (let first: number = 0; first < boxes.length; first++) {
      for (let second: number = first + 1; second < boxes.length; second++) {
        hasOverlap = separate(boxes[first], boxes[second]) || hasOverlap
      }
    }
  }

  return nodes.map((node: CanvasNoteNodeType, index: number): CanvasNoteNodeType => {
    const { x, y }: Box = boxes[index]
    return x === node.position.x && y === node.position.y ? node : { ...node, position: { x, y } }
  })
}
