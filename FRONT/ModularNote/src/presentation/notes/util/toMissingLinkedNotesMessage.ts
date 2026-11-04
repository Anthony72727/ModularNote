/**
 * Build the message that names the linked notes that do not exist anymore
 * @param titles - Titles of these notes, at least one
 * @returns A message in French for the user
 */
export function toMissingLinkedNotesMessage(titles: string[]): string {
  const quotedTitles: string = titles.map((title: string): string => `« ${title} »`).join(', ')
  return titles.length === 1 ? `L'idée liée ${quotedTitles} n'existe plus.` : `Les idées liées ${quotedTitles} n'existent plus.`
}
