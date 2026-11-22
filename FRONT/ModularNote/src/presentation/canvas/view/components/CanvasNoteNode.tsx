import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { JSX, MouseEvent } from 'react'
import { formatShortDate } from '../../../core/util/formatDate'
import type { CanvasNoteNodeType } from './canvasGraphTypes'
import styles from './CanvasNoteNode.module.css'

/**
 * Note on the canvas: its title, its date, its number of links and a delete action, with a thicker and lighter
 * frame when it is selected
 * @param props - The node given by React Flow
 * @returns The block of the note
 */
export function CanvasNoteNode({ data, selected }: NodeProps<CanvasNoteNodeType>): JSX.Element {
  const { note, linkCount, isDeleting, onDelete } = data

  return (
    <article className={selected ? `${styles.node} ${styles.selected}` : styles.node}>
      {/* React Flow needs handles to draw a link, even though the line goes from center to center */}
      <Handle type="target" position={Position.Top} isConnectable={false} className={styles.handle} />
      <span className={styles.dot} aria-hidden="true" />
      <h3 className={styles.title}>{note.title}</h3>
      <p className={styles.meta}>
        {formatShortDate(note.createdAt)} · {linkCount} {linkCount > 1 ? 'liens' : 'lien'}
      </p>
      <button
        type="button"
        className={`nodrag nopan ${styles.delete}`}
        aria-label={`Supprimer l'idée "${note.title}"`}
        disabled={isDeleting}
        onClick={(event: MouseEvent<HTMLButtonElement>): void => {
          // The click is about the deletion only: it must not select the note as well
          event.stopPropagation()
          onDelete(note)
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
      <Handle type="source" position={Position.Bottom} isConnectable={false} className={styles.handle} />
    </article>
  )
}
