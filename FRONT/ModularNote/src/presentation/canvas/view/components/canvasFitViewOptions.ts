import type { FitViewOptions } from '@xyflow/react'
import type { CanvasNoteNodeType } from './canvasGraphTypes'

/**
 * How the canvas frames the notes, at the opening and on "Recentrer": a few notes are not shown larger than life
 */
export const CANVAS_FIT_VIEW_OPTIONS: FitViewOptions<CanvasNoteNodeType> = { padding: 0.15, maxZoom: 1 }
