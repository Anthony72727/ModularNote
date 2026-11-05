import { Background, BackgroundVariant, useViewport } from '@xyflow/react'
import type { Viewport } from '@xyflow/react'
import type { JSX } from 'react'

const GAP: number = 24
const WIDE_GAP: number = 96
const WIDE_GAP_MAX_ZOOM: number = 0.4
const DOT_SIZE: number = 3
const MIN_DOT_SIZE_ON_SCREEN: number = 2

/**
 * Dotted background of the mockups: when zooming out, the dots stay visible and do not turn into a solid color
 * @returns The background
 */
export function CanvasBackground(): JSX.Element {
  const { zoom }: Viewport = useViewport()

  return (
    <Background
      variant={BackgroundVariant.Dots}
      gap={zoom < WIDE_GAP_MAX_ZOOM ? WIDE_GAP : GAP}
      size={Math.max(DOT_SIZE, MIN_DOT_SIZE_ON_SCREEN / zoom)}
      color="var(--color-grid)"
    />
  )
}
