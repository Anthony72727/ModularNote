import { createContext, useContext, useEffect } from 'react'
import type { Dispatch, SetStateAction } from 'react'

/**
 * Number of forms of the current page that hold unsaved text. The default value does nothing,
 * so a form also works outside of UnsavedChangesGuard.
 */
export const UnsavedChangesContext = createContext<Dispatch<SetStateAction<number>>>((): void => {})

/**
 * Let the next navigation leave the page without asking. The default value does nothing,
 * as there is no confirmation outside of UnsavedChangesGuard.
 */
export const AllowNextNavigationContext = createContext<() => void>((): void => {})

/**
 * Get the function to call just before leaving a page on purpose (the note was saved, or the user gave up with
 * a button), so that no confirmation is asked
 * @returns The function that lets the next navigation go through
 */
export function useAllowNextNavigation(): () => void {
  return useContext(AllowNextNavigationContext)
}

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
