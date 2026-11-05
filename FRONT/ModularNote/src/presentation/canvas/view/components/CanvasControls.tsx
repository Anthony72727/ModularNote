import { Panel, useReactFlow, useViewport } from '@xyflow/react'
import type { ReactFlowInstance, Viewport } from '@xyflow/react'
import type { JSX } from 'react'
import type { CanvasLinkEdgeType, CanvasNoteNodeType } from './canvasGraphTypes'
import { CANVAS_FIT_VIEW_OPTIONS } from './canvasFitViewOptions'
import styles from './CanvasControls.module.css'

/**
 * Buttons of the canvas: zoom out, current zoom, zoom in and recenter on every note
 * @returns The panel of buttons
 */
export function CanvasControls(): JSX.Element {
  const { zoomIn, zoomOut, fitView }: ReactFlowInstance<CanvasNoteNodeType, CanvasLinkEdgeType> = useReactFlow<
    CanvasNoteNodeType,
    CanvasLinkEdgeType
  >()
  const { zoom }: Viewport = useViewport()

  return (
    <Panel position="bottom-left" className={styles.controls}>
      <button type="button" className={styles.zoomButton} aria-label="Dézoomer" onClick={(): void => void zoomOut()}>
        −
      </button>
      <span className={styles.zoom}>{Math.round(zoom * 100)} %</span>
      <button type="button" className={styles.zoomButton} aria-label="Zoomer" onClick={(): void => void zoomIn()}>
        +
      </button>
      <span className={styles.separator} aria-hidden="true" />
      <button
        type="button"
        className={styles.recenter}
        onClick={(): void => void fitView(CANVAS_FIT_VIEW_OPTIONS)}
      >
        Recentrer
      </button>
    </Panel>
  )
}
