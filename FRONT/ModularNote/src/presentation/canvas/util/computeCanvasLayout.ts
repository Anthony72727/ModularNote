import { forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY } from 'd3-force'
import type { SimulationLinkDatum, SimulationNodeDatum } from 'd3-force'
import type { Note } from '../../../domain/notes/entity/models/Note'
import type { NoteLink } from '../../../domain/notes/entity/models/NoteLink'

const LINK_DISTANCE: number = 280
const REPULSION: number = -1600
const COLLISION_RADIUS: number = 135
const CENTER_STRENGTH: number = 0.06
const TICKS: number = 300
const START_RADIUS: number = 800

/**
 * Position of a note on the canvas
 */
export type CanvasPosition = {
  /** Horizontal position */
  x: number
  /** Vertical position */
  y: number
}

/**
 * A note in the simulation
 */
type LayoutNode = SimulationNodeDatum & {
  id: string
}

/**
 * Hash of a text (FNV-1a), always the same for the same text
 */
function hash(text: string, seed: number): number {
  let value: number = seed
  for (let index: number = 0; index < text.length; index++) {
    value = Math.imul(value ^ text.charCodeAt(index), 16777619)
  }
  return value >>> 0
}

/**
 * Starting position deduced from the id of a note, so that a note starts from the same place at every display
 */
function toStartPosition(id: string): CanvasPosition {
  const angle: number = (hash(id, 2166136261) / 2 ** 32) * 2 * Math.PI
  const radius: number = Math.sqrt(hash(id, 16777619) / 2 ** 32) * START_RADIUS
  return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius }
}

/**
 * Compute where to show every note: linked notes get closer, the others push each other away.
 * Nothing is random and the input is sorted, so the same notes and links always give the same positions.
 * @param notes - Notes to place
 * @param links - Links between the notes; a link to an unknown note is ignored
 * @returns The position of every note, by id
 */
export function computeCanvasLayout(notes: Note[], links: NoteLink[]): Record<string, CanvasPosition> {
  const ids: string[] = notes.map((note: Note): string => note.id).sort()
  const knownIds: Set<string> = new Set(ids)
  const nodes: LayoutNode[] = ids.map((id: string): LayoutNode => ({ id, ...toStartPosition(id) }))
  const simulationLinks: SimulationLinkDatum<LayoutNode>[] = links
    .filter((link: NoteLink): boolean => knownIds.has(link.noteAId) && knownIds.has(link.noteBId))
    .map((link: NoteLink): SimulationLinkDatum<LayoutNode> => ({ source: link.noteAId, target: link.noteBId }))
    .sort((first: SimulationLinkDatum<LayoutNode>, second: SimulationLinkDatum<LayoutNode>): number =>
      `${String(first.source)}${String(first.target)}`.localeCompare(`${String(second.source)}${String(second.target)}`),
    )

  forceSimulation<LayoutNode>(nodes)
    .force(
      'link',
      forceLink<LayoutNode, SimulationLinkDatum<LayoutNode>>(simulationLinks)
        .id((node: LayoutNode): string => node.id)
        .distance(LINK_DISTANCE),
    )
    .force('charge', forceManyBody<LayoutNode>().strength(REPULSION))
    .force('collide', forceCollide<LayoutNode>(COLLISION_RADIUS))
    .force('x', forceX<LayoutNode>(0).strength(CENTER_STRENGTH))
    .force('y', forceY<LayoutNode>(0).strength(CENTER_STRENGTH))
    .stop()
    .tick(TICKS)

  const positions: Record<string, CanvasPosition> = {}
  for (const node of nodes) {
    positions[node.id] = { x: Math.round(node.x ?? 0), y: Math.round(node.y ?? 0) }
  }
  return positions
}
