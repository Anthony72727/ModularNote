import type { Edge, Node } from '@xyflow/react'
import type { Note } from '../../../../domain/notes/entity/models/Note'

/**
 * What a note of the canvas needs to display itself
 */
export type CanvasNoteData = {
  /** Note to show */
  note: Note
  /** Number of links of the note */
  linkCount: number
  /** True to disable the deletion while another one is being sent */
  isDeleting: boolean
  /** Called when the user asks to delete the note, with this note */
  onDelete: (note: Note) => void
}

/**
 * Note on the canvas
 */
export type CanvasNoteNodeType = Node<CanvasNoteData, 'note'>

/**
 * Link on the canvas
 */
export type CanvasLinkEdgeType = Edge<Record<string, never>, 'link'>
