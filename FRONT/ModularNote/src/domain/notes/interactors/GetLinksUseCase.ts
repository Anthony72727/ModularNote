import type { NoteLink } from '../entity/models/NoteLink'

/**
 * Read every link between the notes
 */
export interface GetLinksUseCase {
  /**
   * Read every link between the notes
   * @param signal - Cancels the reading when the caller does not need the result anymore
   * @returns Every link, in no particular order
   */
  execute(signal?: AbortSignal): Promise<NoteLink[]>
}
