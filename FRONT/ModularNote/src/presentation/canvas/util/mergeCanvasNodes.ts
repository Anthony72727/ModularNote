import type { CanvasNoteNodeType } from '../view/components/canvasGraphTypes'

/**
 * Combine the nodes built from the data with the nodes as they are on screen: a note already shown stays where it is
 * (and keeps its measured size), a new note takes its computed position, and a removed note disappears
 * @param computedNodes - One node per note to show, with its computed position and up-to-date data
 * @param currentNodes - Nodes as they are on screen
 * @returns The nodes to show
 */
export function mergeCanvasNodes(
  computedNodes: CanvasNoteNodeType[],
  currentNodes: CanvasNoteNodeType[],
): CanvasNoteNodeType[] {
  const currentById: Map<string, CanvasNoteNodeType> = new Map(
    currentNodes.map((node: CanvasNoteNodeType): [string, CanvasNoteNodeType] => [node.id, node]),
  )
  return computedNodes.map((computed: CanvasNoteNodeType): CanvasNoteNodeType => {
    const current: CanvasNoteNodeType | undefined = currentById.get(computed.id)
    return current === undefined ? computed : { ...current, data: computed.data }
  })
}
