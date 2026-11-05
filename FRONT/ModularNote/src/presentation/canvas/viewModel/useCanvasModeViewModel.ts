import { useEffect, useState } from 'react'

/**
 * Mode of the canvas: navigation only moves the view, move lets the user drag the notes,
 * selection lets the user surround notes to select them
 */
export type CanvasMode = 'navigation' | 'move' | 'selection'

/**
 * State and actions of the mode of the canvas
 */
export type CanvasModeViewModel = {
  /** Current mode */
  mode: CanvasMode
  /** True when the list of modes is open */
  isMenuOpen: boolean
  /** Switch to a mode and close the list of modes (receives the mode) */
  chooseMode: (mode: CanvasMode) => void
  /** Open or close the list of modes */
  toggleMenu: () => void
}

/**
 * ViewModel of the mode of the canvas, which starts in navigation: N, D and S switch mode, Escape closes the list
 * @returns The mode and the actions the view can call
 */
export function useCanvasModeViewModel(): CanvasModeViewModel {
  const [mode, setMode] = useState<CanvasMode>('navigation')
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)

  useEffect((): (() => void) => {
    function handleKeyDown(event: KeyboardEvent): void {
      const isTyping: boolean = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement
      if (isTyping || event.ctrlKey || event.metaKey || event.altKey) {
        return
      }
      const key: string = event.key.toLowerCase()
      if (key === 'n') {
        setMode('navigation')
      } else if (key === 'd') {
        setMode('move')
      } else if (key === 's') {
        setMode('selection')
      } else if (key === 'escape') {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return (): void => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  function chooseMode(newMode: CanvasMode): void {
    setMode(newMode)
    setIsMenuOpen(false)
  }

  function toggleMenu(): void {
    setIsMenuOpen((isOpen: boolean): boolean => !isOpen)
  }

  return { mode, isMenuOpen, chooseMode, toggleMenu }
}
