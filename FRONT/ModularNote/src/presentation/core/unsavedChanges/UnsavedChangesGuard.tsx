import { useEffect, useRef, useState } from 'react'
import type { JSX, ReactNode, RefObject } from 'react'
import { useBlocker } from 'react-router'
import type { Blocker } from 'react-router'
import { confirmDiscardChanges } from '../util/confirmDiscardChanges'
import { AllowNextNavigationContext, UnsavedChangesContext } from './UnsavedChangesContext'

/**
 * Props of UnsavedChangesGuard
 */
type UnsavedChangesGuardProps = {
  /** Pages whose forms are protected */
  children: ReactNode
}

/**
 * Ask for a confirmation before leaving a page whose forms hold unsaved text: navigation inside
 * the application (links, back button), and reloading or closing the tab
 * @param props - The pages to protect
 * @returns The pages
 */
export function UnsavedChangesGuard({ children }: UnsavedChangesGuardProps): JSX.Element {
  const [unsavedFormsCount, setUnsavedFormsCount] = useState<number>(0)
  const hasUnsavedChanges: boolean = unsavedFormsCount > 0
  const isNextNavigationAllowed: RefObject<boolean> = useRef<boolean>(false)

  function allowNextNavigation(): void {
    isNextNavigationAllowed.current = true
  }

  const blocker: Blocker = useBlocker(({ currentLocation, nextLocation }): boolean => {
    if (isNextNavigationAllowed.current) {
      isNextNavigationAllowed.current = false
      return false
    }
    return hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname
  })

  useEffect((): void => {
    if (blocker.state !== 'blocked') {
      return
    }
    if (confirmDiscardChanges()) {
      setTimeout(blocker.proceed, 0)
    } else {
      blocker.reset()
    }
  }, [blocker])

  useEffect((): (() => void) | undefined => {
    if (!hasUnsavedChanges) {
      return undefined
    }
    function handleBeforeUnload(event: BeforeUnloadEvent): void {
      event.preventDefault()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return (): void => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  return (
    <UnsavedChangesContext.Provider value={setUnsavedFormsCount}>
      <AllowNextNavigationContext.Provider value={allowNextNavigation}>{children}</AllowNextNavigationContext.Provider>
    </UnsavedChangesContext.Provider>
  )
}
