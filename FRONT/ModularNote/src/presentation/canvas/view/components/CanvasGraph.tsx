import { applyNodeChanges, Panel, ReactFlow, SelectionMode } from '@xyflow/react'
import type { EdgeTypes, NodeChange, NodeTypes } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useState } from 'react'
import type { JSX, MouseEvent } from 'react'
import type { Note } from '../../../../domain/notes/entity/models/Note'
import type { NoteLink } from '../../../../domain/notes/entity/models/NoteLink'
import type { CanvasPosition } from '../../util/computeCanvasLayout'
import { mergeCanvasNodes } from '../../util/mergeCanvasNodes'
import { resolveCanvasCollisions } from '../../util/resolveCanvasCollisions'
import { useCanvasModeViewModel } from '../../viewModel/useCanvasModeViewModel'
import type { CanvasModeViewModel } from '../../viewModel/useCanvasModeViewModel'
import { CanvasBackground } from './CanvasBackground'
import { CANVAS_FIT_VIEW_OPTIONS } from './canvasFitViewOptions'
import type { CanvasLinkEdgeType, CanvasNoteNodeType } from './canvasGraphTypes'
import { CanvasControls } from './CanvasControls'
import { CanvasLinkEdge } from './CanvasLinkEdge'
import { CanvasModeMenu } from './CanvasModeMenu'
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
 * The notes and their links on a surface that can be panned and zoomed. In move mode the notes can be dragged, and
 * they never overlap: their position lives here, in the memory of the page, and is forgotten when the page is left.
 * In selection mode, surrounding notes selects them; in any mode, Ctrl + click adds or removes a note from the
 * selection. The selected notes then move together, in move mode
 * @param props - The notes, their links and their positions
 * @returns The surface
 */
export function CanvasGraph({ notes, links, positions, isDeleting, onDelete }: CanvasGraphProps): JSX.Element {
  const [currentNodes, setCurrentNodes] = useState<CanvasNoteNodeType[]>([])
  const [isSelectionFinishing, setIsSelectionFinishing] = useState<boolean>(false)
  const modeViewModel: CanvasModeViewModel = useCanvasModeViewModel()
  const isSelectionMode: boolean = modeViewModel.mode === 'selection'

  const computedNodes: CanvasNoteNodeType[] = notes.map(
    (note: Note): CanvasNoteNodeType => ({
      id: note.id,
      type: 'note',
      position: positions[note.id],
      data: { note, linkCount: countLinks(note.id, links), isDeleting, onDelete },
    }),
  )
  const nodes: CanvasNoteNodeType[] = mergeCanvasNodes(computedNodes, currentNodes)
  const hasSelection: boolean = nodes.some((node: CanvasNoteNodeType): boolean => node.selected === true)

  // Checked here and not in the callback of React Flow, whose last selection change may not be rendered yet
  if (isSelectionFinishing) {
    setIsSelectionFinishing(false)
    if (hasSelection) {
      modeViewModel.chooseMode('move')
    }
  } else if (modeViewModel.mode === 'navigation' && hasSelection) {
    clearSelection()
  }

  const edges: CanvasLinkEdgeType[] = links.map(
    (link: NoteLink): CanvasLinkEdgeType => ({
      id: link.id,
      type: 'link',
      source: link.noteAId,
      target: link.noteBId,
    }),
  )

  function clearSelection(): void {
    setCurrentNodes(nodes.map((node: CanvasNoteNodeType): CanvasNoteNodeType => ({ ...node, selected: false })))
  }

  function handleNodeClick(event: MouseEvent, clicked: CanvasNoteNodeType): void {
    // In selection mode, React Flow already handles the click, with or without Ctrl
    if (isSelectionMode) {
      setIsSelectionFinishing(true)
    } else if (event.ctrlKey || event.metaKey) {
      setCurrentNodes(
        nodes.map(
          (node: CanvasNoteNodeType): CanvasNoteNodeType =>
            node.id === clicked.id ? { ...node, selected: node.selected !== true } : node,
        ),
      )
      setIsSelectionFinishing(true)
    }
  }

  function handleNodesChange(changes: NodeChange<CanvasNoteNodeType>[]): void {
    setCurrentNodes((current: CanvasNoteNodeType[]): CanvasNoteNodeType[] =>
      resolveCanvasCollisions(applyNodeChanges(changes, mergeCanvasNodes(computedNodes, current))),
    )
  }

  return (
    <ReactFlow<CanvasNoteNodeType, CanvasLinkEdgeType>
      className={isSelectionMode ? `${styles.graph} ${styles.selecting}` : styles.graph}
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={handleNodesChange}
      onSelectionEnd={(): void => setIsSelectionFinishing(true)}
      onNodeClick={handleNodeClick}
      onPaneClick={clearSelection}
      fitView
      fitViewOptions={CANVAS_FIT_VIEW_OPTIONS}
      minZoom={0.1}
      maxZoom={2}
      panOnScroll
      panOnDrag={!isSelectionMode}
      selectionOnDrag={isSelectionMode}
      selectionMode={SelectionMode.Partial}
      nodesDraggable={modeViewModel.mode === 'move'}
      nodesConnectable={false}
      nodesFocusable={false}
      edgesFocusable={false}
      elementsSelectable={isSelectionMode}
      deleteKeyCode={null}
      attributionPosition="top-right"
    >
      <CanvasBackground />
      <CanvasModeMenu viewModel={modeViewModel} />
      <CanvasControls />
      <Panel position="bottom-right" className={styles.count}>
        {notes.length} {notes.length > 1 ? 'idées' : 'idée'} · {links.length} {links.length > 1 ? 'liens' : 'lien'}
      </Panel>
    </ReactFlow>
  )
}
