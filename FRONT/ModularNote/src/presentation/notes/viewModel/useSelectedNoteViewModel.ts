import { useState } from 'react'
import { confirmDiscardChanges } from '../../core/util/confirmDiscardChanges'

/**
 * State and actions of the note whose details are open
 */
export type SelectedNoteViewModel = {
  /** Note whose details are open, null when the panel is closed */
  selectedNoteId: string | null
  /** True when the edition of the selected note holds unsaved modifications */
  hasUnsavedEdit: boolean
  /** Tell whether the edition of the selected note holds unsaved modifications (receives the new state) */
  changeHasUnsavedEdit: (value: boolean) => void
  /**
   * Open the details of a note, or close them if this note is already open (receives the note's id);
   * unsaved modifications of the selected note must be given up first
   */
  toggleNote: (id: string) => void
  /** Close the details panel; unsaved modifications of the selected note must be given up first */
  closeNote: () => void
  /** Close the details of a note that does not exist anymore, without asking (receives the note's id) */
  deselectNote: (id: string) => void
}

/**
 * ViewModel of the note whose details are open, shared by the list and the canvas: changing or closing the note
 * asks before giving up unsaved modifications
 * @returns The selected note and the actions the view can call
 */
export function useSelectedNoteViewModel(): SelectedNoteViewModel {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [hasUnsavedEdit, setHasUnsavedEdit] = useState<boolean>(false)

  function toggleNote(id: string): void {
    if (hasUnsavedEdit && !confirmDiscardChanges()) {
      return
    }
    setSelectedNoteId((current: string | null): string | null => (current === id ? null : id))
  }

  function closeNote(): void {
    if (hasUnsavedEdit && !confirmDiscardChanges()) {
      return
    }
    setSelectedNoteId(null)
  }

  function deselectNote(id: string): void {
    setSelectedNoteId((current: string | null): string | null => (current === id ? null : current))
  }

  return {
    selectedNoteId,
    hasUnsavedEdit,
    changeHasUnsavedEdit: setHasUnsavedEdit,
    toggleNote,
    closeNote,
    deselectNote,
  }
}
