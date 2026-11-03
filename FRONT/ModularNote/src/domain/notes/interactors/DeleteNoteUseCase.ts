/**
 * Delete a note
 */
export interface DeleteNoteUseCase {
  /**
   * Delete the note
   * @param id - Id of the note to delete
   * @returns Nothing once the note is deleted
   * @throws NoteNotFoundError if the note does not exist anymore
   */
  execute(id: string): Promise<void>
}
