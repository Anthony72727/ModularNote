import { useEffect, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { CanvasNoteNodeType } from '../view/components/canvasGraphTypes'
import type { CanvasPosition } from '../util/computeCanvasLayout'
import { settleCanvasNodes } from '../util/settleCanvasNodes'

const SETTLE_AFTER_DROP_MS: number = 1500

/**
 * What the canvas needs to send the pushed notes back to their place
 */
export type CanvasSettlingViewModel = {
  /**
   * Remember where the notes are, as a drag starts
   * @param nodes - Notes of the canvas, as they are on screen
   */
  startDrag: (nodes: CanvasNoteNodeType[]) => void
  /**
   * Keep the dropped notes where they are, and let the others finish going back
   * @param droppedNodes - Notes that were being dragged
   */
  stopDrag: (droppedNodes: CanvasNoteNodeType[]) => void
}

/**
 * While a note is being dragged, and for a short time after the drop, sends the pushed notes back to the place they
 * had when the drag started. A note still in the way at the end stays where it was pushed.
 * @param setNodes - Changes the notes on screen
 * @returns The actions to call when a drag starts and stops
 */
export function useCanvasSettlingViewModel(
  setNodes: Dispatch<SetStateAction<CanvasNoteNodeType[]>>,
): CanvasSettlingViewModel {
  const [restPositions, setRestPositions] = useState<Record<string, CanvasPosition> | null>(null)
  const [isDragging, setIsDragging] = useState<boolean>(false)

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
        settleCanvasNodes(current, restPositions, elapsedMs),
      )
      frame = requestAnimationFrame(tick)
    }

    return (): void => cancelAnimationFrame(frame)
  }, [restPositions, isDragging, setNodes])

  function startDrag(nodes: CanvasNoteNodeType[]): void {
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
  }

  return { startDrag, stopDrag }
}
