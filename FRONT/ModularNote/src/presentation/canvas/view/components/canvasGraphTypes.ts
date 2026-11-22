import type { Edge, Node } from '@xyflow/react'
import type { Note } from '../../../../domain/notes/entity/models/Note'

/**
 * How a note stands out while a note is previewed: the previewed note itself, a note linked to it, or neither
 */
export type CanvasNoteHighlight = 'previewed' | 'linked' | 'none'

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
  /** How the note stands out while a note is previewed */
  highlight: CanvasNoteHighlight
}

/**
 * Note on the canvas
 */
export type CanvasNoteNodeType = Node<CanvasNoteData, 'note'>

/**
 * What a link of the canvas needs to display itself
 */
export type CanvasLinkData = {
  /** True when a note is previewed and the link does not touch it: the link is faded */
  isFaded: boolean
}

/**
 * Link on the canvas
 */
export type CanvasLinkEdgeType = Edge<CanvasLinkData, 'link'>
