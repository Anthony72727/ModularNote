import type { NoteLinkDto } from './NoteLinkDto'

/**
 * JSON shape of GET /api/links
 */
export type GetLinksResponseDto = {
  /** Every link between the notes */
  links: NoteLinkDto[]
}
