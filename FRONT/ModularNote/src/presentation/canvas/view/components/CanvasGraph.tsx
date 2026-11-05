import { applyNodeChanges, Background, BackgroundVariant, Panel, ReactFlow } from '@xyflow/react'
import type { EdgeTypes, NodeChange, NodeTypes } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useState } from 'react'
import type { JSX } from 'react'
import type { Note } from '../../../../domain/notes/entity/models/Note'
import type { NoteLink } from '../../../../domain/notes/entity/models/NoteLink'
import type { CanvasPosition } from '../../util/computeCanvasLayout'
import { mergeCanvasNodes } from '../../util/mergeCanvasNodes'
import { CANVAS_FIT_VIEW_OPTIONS } from './canvasFitViewOptions'
import type { CanvasLinkEdgeType, CanvasNoteNodeType } from './canvasGraphTypes'
import { CanvasControls } from './CanvasControls'
import { CanvasLinkEdge } from './CanvasLinkEdge'
import { CanvasNoteNode } from './CanvasNoteNode'
import styles from './CanvasGraph.module.css'

const nodeTypes: NodeTypes = { note: CanvasNoteNode }
const edgeTypes: EdgeTypes = { link: CanvasLinkEdge }

/**
 * Props of CanvasGraph
 */
type CanvasGraphProps = {
  /** Notes to show */
  notes: Note[]
  /** Links between the notes */
  links: NoteLink[]
  /** Position computed for every note, by id */
  positions: Record<string, CanvasPosition>
  /** True to disable the deletion while another one is being sent */
  isDeleting: boolean
  /** Called when the user asks to delete a note, with this note */
  onDelete: (note: Note) => void
}

/**
 * Number of links of a note
 */
function countLinks(noteId: string, links: NoteLink[]): number {
  return links.filter((link: NoteLink): boolean => link.noteAId === noteId || link.noteBId === noteId).length
}

/**
 * The notes and their links on a surface that can be panned and zoomed. The notes can be dragged:
 * their position lives here, in the memory of the page, and is forgotten when the page is left
 * @param props - The notes, their links and their positions
 * @returns The surface
 */
export function CanvasGraph({ notes, links, positions, isDeleting, onDelete }: CanvasGraphProps): JSX.Element {
  const [currentNodes, setCurrentNodes] = useState<CanvasNoteNodeType[]>([])

  const computedNodes: CanvasNoteNodeType[] = notes.map(
    (note: Note): CanvasNoteNodeType => ({
      id: note.id,
      type: 'note',
      position: positions[note.id],
      data: { note, linkCount: countLinks(note.id, links), isDeleting, onDelete },
    }),
  )
  const edges: CanvasLinkEdgeType[] = links.map(
    (link: NoteLink): CanvasLinkEdgeType => ({
      id: link.id,
      type: 'link',
      source: link.noteAId,
      target: link.noteBId,
    }),
  )

  function handleNodesChange(changes: NodeChange<CanvasNoteNodeType>[]): void {
    setCurrentNodes((current: CanvasNoteNodeType[]): CanvasNoteNodeType[] =>
      applyNodeChanges(changes, mergeCanvasNodes(computedNodes, current)),
    )
  }

  return (
    <ReactFlow<CanvasNoteNodeType, CanvasLinkEdgeType>
      className={styles.graph}
      nodes={mergeCanvasNodes(computedNodes, currentNodes)}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={handleNodesChange}
      fitView
      fitViewOptions={CANVAS_FIT_VIEW_OPTIONS}
      minZoom={0.1}
      maxZoom={2}
      nodesConnectable={false}
      nodesFocusable={false}
      edgesFocusable={false}
      elementsSelectable={false}
      deleteKeyCode={null}
      attributionPosition="top-right"
    >
      <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="var(--color-grid)" />
      <CanvasControls />
      <Panel position="bottom-right" className={styles.count}>
        {notes.length} {notes.length > 1 ? 'idées' : 'idée'} · {links.length} {links.length > 1 ? 'liens' : 'lien'}
      </Panel>
    </ReactFlow>
  )
}
