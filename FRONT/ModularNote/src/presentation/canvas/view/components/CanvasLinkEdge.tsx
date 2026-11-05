import { BaseEdge, useInternalNode } from '@xyflow/react'
import type { EdgeProps, InternalNode } from '@xyflow/react'
import type { JSX } from 'react'
import type { CanvasLinkEdgeType, CanvasNoteNodeType } from './canvasGraphTypes'
import styles from './CanvasLinkEdge.module.css'

/**
 * Center of a note on the canvas
 */
function toCenter(node: InternalNode<CanvasNoteNodeType>): { x: number; y: number } {
  return {
    x: node.internals.positionAbsolute.x + (node.measured.width ?? 0) / 2,
    y: node.internals.positionAbsolute.y + (node.measured.height ?? 0) / 2,
  }
}

/**
 * Link on the canvas: a straight line between the centers of its two notes, so it follows them when they move
 * @param props - The edge given by React Flow
 * @returns The line, or nothing while its notes are not known yet
 */
export function CanvasLinkEdge({ source, target }: EdgeProps<CanvasLinkEdgeType>): JSX.Element | null {
  const sourceNode: InternalNode<CanvasNoteNodeType> | undefined = useInternalNode<CanvasNoteNodeType>(source)
  const targetNode: InternalNode<CanvasNoteNodeType> | undefined = useInternalNode<CanvasNoteNodeType>(target)

  if (sourceNode === undefined || targetNode === undefined) {
    return null
  }

  const from: { x: number; y: number } = toCenter(sourceNode)
  const to: { x: number; y: number } = toCenter(targetNode)

  return <BaseEdge path={`M${from.x} ${from.y} L${to.x} ${to.y}`} className={styles.link} interactionWidth={0} />
}
