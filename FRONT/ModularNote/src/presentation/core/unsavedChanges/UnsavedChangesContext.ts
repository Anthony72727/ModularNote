import { createContext, useContext, useEffect } from 'react'
import type { Dispatch, SetStateAction } from 'react'

/**
 * Number of forms of the current page that hold unsaved text. The default value does nothing,
 * so a form also works outside of UnsavedChangesGuard.
 */
export const UnsavedChangesContext = createContext<Dispatch<SetStateAction<number>>>((): void => {})

/**
 * Tell UnsavedChangesGuard that a form holds unsaved text, as long as it is true and the form is shown
 * @param hasUnsavedChanges - True when leaving the page would lose what the user typed
 */
export function useUnsavedChanges(hasUnsavedChanges: boolean): void {
  const setUnsavedFormsCount: Dispatch<SetStateAction<number>> = useContext(UnsavedChangesContext)

  useEffect((): (() => void) | undefined => {
    if (!hasUnsavedChanges) {
      return undefined
    }
    setUnsavedFormsCount((count: number): number => count + 1)
    return (): void => setUnsavedFormsCount((count: number): number => count - 1)
  }, [hasUnsavedChanges, setUnsavedFormsCount])
}
