import { useEffect, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { CanvasNoteNodeType } from '../view/components/canvasGraphTypes'
import { computeCanvasHitbox, findHitboxExit, toCanvasCircle } from '../util/canvasHitbox'
import type { CanvasHitbox } from '../util/canvasHitbox'
import type { CanvasPosition } from '../util/computeCanvasLayout'
import { settleCanvasNodes } from '../util/settleCanvasNodes'

const SETTLE_AFTER_DROP_MS: number = 1500

/**
 * What the canvas needs to send the pushed notes back to their place
 */
export type CanvasSettlingViewModel = {
  /** Ids of the notes caught by the dragged notes when the drag started, which have not left them yet */
  trappedIds: ReadonlySet<string>
  /**
   * Remember where the notes are, and which ones are caught by the dragged notes, as a drag starts
   * @param nodes - Notes of the canvas, as they are on screen
   * @param draggedNodes - Notes that are going to be dragged
   */
  startDrag: (nodes: CanvasNoteNodeType[], draggedNodes: CanvasNoteNodeType[]) => void
  /**
   * Let trapped notes that have left the dragged notes behave like the others again
   * @param ids - Ids of these notes
   */
  releaseNotes: (ids: string[]) => void
  /**
   * Keep the dropped notes where they are, and let the others finish going back
   * @param droppedNodes - Notes that were being dragged
   */
  stopDrag: (droppedNodes: CanvasNoteNodeType[]) => void
}

/**
 * While a note is being dragged, and for a short time after the drop, sends the pushed notes back to the place they
 * had when the drag started. A note still in the way at the end stays where it was pushed. A note caught between the
 * dragged notes when the drag starts waits for them to move, then slides out of their hitbox.
 * @param setNodes - Changes the notes on screen
 * @returns The actions to call when a drag starts and stops
 */
export function useCanvasSettlingViewModel(
  setNodes: Dispatch<SetStateAction<CanvasNoteNodeType[]>>,
): CanvasSettlingViewModel {
  const [restPositions, setRestPositions] = useState<Record<string, CanvasPosition> | null>(null)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [trappedIds, setTrappedIds] = useState<ReadonlySet<string>>(new Set<string>())

  useEffect(() => {
    if (restPositions === null) {
      return
    }
    let previousTime: number = performance.now()
    const stopTime: number = isDragging ? Infinity : previousTime + SETTLE_AFTER_DROP_MS
    let frame: number = requestAnimationFrame(tick)

    function tick(time: number): void {
      if (restPositions === null || time >= stopTime) {
        setRestPositions(null)
        return
      }
      const elapsedMs: number = Math.max(time - previousTime, 0)
      previousTime = time
      setNodes((current: CanvasNoteNodeType[]): CanvasNoteNodeType[] =>
        settleCanvasNodes(current, restPositions, elapsedMs, trappedIds),
      )
      frame = requestAnimationFrame(tick)
    }

    return (): void => cancelAnimationFrame(frame)
  }, [restPositions, isDragging, trappedIds, setNodes])

  function startDrag(nodes: CanvasNoteNodeType[], draggedNodes: CanvasNoteNodeType[]): void {
    const draggedIds: Set<string> = new Set(draggedNodes.map((node: CanvasNoteNodeType): string => node.id))
    const hitbox: CanvasHitbox | null = computeCanvasHitbox(
      nodes.filter((node: CanvasNoteNodeType): boolean => draggedIds.has(node.id)).map(toCanvasCircle),
    )
    setTrappedIds(
      new Set(
        nodes
          .filter(
            (node: CanvasNoteNodeType): boolean =>
              hitbox !== null && !draggedIds.has(node.id) && findHitboxExit(toCanvasCircle(node), hitbox) !== null,
          )
          .map((node: CanvasNoteNodeType): string => node.id),
      ),
    )
    const positions: Record<string, CanvasPosition> = Object.fromEntries(
      nodes.map((node: CanvasNoteNodeType): [string, CanvasPosition] => [node.id, node.position]),
    )
    // A note still going back from the previous drag keeps its place
    setRestPositions({ ...positions, ...restPositions })
    setIsDragging(true)
  }

  function stopDrag(droppedNodes: CanvasNoteNodeType[]): void {
    const remaining: Record<string, CanvasPosition> = { ...restPositions }
    droppedNodes.forEach((node: CanvasNoteNodeType): void => {
      delete remaining[node.id]
    })
    setRestPositions(remaining)
    setIsDragging(false)
    setTrappedIds(new Set<string>())
  }

  function releaseNotes(ids: string[]): void {
    setTrappedIds(
      (current: ReadonlySet<string>): ReadonlySet<string> =>
        new Set([...current].filter((id: string): boolean => !ids.includes(id))),
    )
  }

  return { trappedIds, startDrag, releaseNotes, stopDrag }
}
