/**
 * Ask the user to confirm the deletion of a note
 * @param title - Title of the note to delete
 * @returns True if the user accepts to delete the note
 */
export function confirmDeleteNote(title: string): boolean {
  return window.confirm(`Supprimer l'idée "${title}" ?`)
}
