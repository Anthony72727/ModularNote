/**
 * Ask the user whether what they typed and did not save can be lost
 * @returns True if the user accepts to lose it
 */
export function confirmDiscardChanges(): boolean {
  return window.confirm('Ce que tu as écrit n’est pas enregistré. Veux-tu vraiment l’abandonner ?')
}
