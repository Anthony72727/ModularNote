import { Panel } from '@xyflow/react'
import type { JSX } from 'react'
import type { CanvasMode, CanvasModeViewModel } from '../../viewModel/useCanvasModeViewModel'
import styles from './CanvasModeMenu.module.css'

/**
 * Props of CanvasModeMenu
 */
type CanvasModeMenuProps = {
  /** Mode of the canvas and actions to change it */
  viewModel: CanvasModeViewModel
}

/**
 * Name of each mode, as announced by the button that shows the current mode
 */
const MODE_NAMES: Record<CanvasMode, string> = {
  navigation: 'navigation',
  move: 'déplacement',
  selection: 'sélection',
}

/**
 * Icon of a mode
 */
function ModeIcon({ mode }: { mode: CanvasMode }): JSX.Element {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
      {mode === 'navigation' && (
        <path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 11V4.5a1.5 1.5 0 0 1 3 0V12M14 11.5V6a1.5 1.5 0 0 1 3 0v8a6 6 0 0 1-6 6h-1a6 6 0 0 1-4.6-2.2L3.3 14.5a1.5 1.5 0 0 1 2.3-1.9L8 15" />
      )}
      {mode === 'move' && <path d="M12 3v18M3 12h18M9 6l3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3" />}
      {mode === 'selection' && <rect x="4" y="4" width="16" height="16" rx="2" strokeDasharray="3 3" />}
    </svg>
  )
}

/**
 * Chevron of the button that opens or closes the list of modes
 */
function Chevron({ isOpen }: { isOpen: boolean }): JSX.Element {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" className={styles.chevron}>
      <path d={isOpen ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'} />
    </svg>
  )
}

/**
 * Selector of the mode of the canvas: a small button showing the current mode, which opens the list of modes
 * @param props - The mode and the actions to change it
 * @returns The selector
 */
export function CanvasModeMenu({ viewModel }: CanvasModeMenuProps): JSX.Element {
  const { mode, isMenuOpen, chooseMode, toggleMenu }: CanvasModeViewModel = viewModel

  if (!isMenuOpen) {
    return (
      <Panel position="top-left">
        <button
          type="button"
          className={styles.toggle}
          aria-expanded="false"
          aria-label={`Mode ${MODE_NAMES[mode]}. Changer de mode`}
          onClick={toggleMenu}
        >
          <ModeIcon mode={mode} />
          <Chevron isOpen={false} />
        </button>
      </Panel>
    )
  }

  return (
    <Panel position="top-left" className={styles.menu}>
      <button
        type="button"
        className={styles.menuToggle}
        aria-expanded="true"
        aria-label="Replier le sélecteur de mode"
        onClick={toggleMenu}
      >
        <ModeIcon mode={mode} />
        <span className={styles.menuLabel}>MODE</span>
        <Chevron isOpen />
      </button>

      <div role="group" aria-label="Mode du canvas" className={styles.modes}>
        <button
          type="button"
          className={mode === 'navigation' ? `${styles.mode} ${styles.modeActive}` : styles.mode}
          aria-pressed={mode === 'navigation'}
          onClick={(): void => chooseMode('navigation')}
        >
          <span className={styles.modeIcon}>
            <ModeIcon mode="navigation" />
          </span>
          <span className={styles.modeText}>
            <span className={styles.modeName}>
              Navigation <kbd className={styles.key}>N</kbd>
            </span>
            <span className={styles.modeDescription}>Se balader sur le canvas sans déplacer les idées.</span>
          </span>
        </button>

        <ul className={styles.help}>
          <li>
            <span className={styles.helpKey}>Glisser</span> · se déplacer
          </li>
          <li>
            <span className={styles.helpKey}>Molette</span> · haut, bas (et côtés en 4 directions)
          </li>
          <li>
            <span className={styles.helpKey}>Maj + molette</span> · gauche, droite
          </li>
          <li>
            <span className={styles.helpKey}>Ctrl + molette</span> · zoom
          </li>
        </ul>

        <button
          type="button"
          className={mode === 'move' ? `${styles.mode} ${styles.modeActive}` : styles.mode}
          aria-pressed={mode === 'move'}
          onClick={(): void => chooseMode('move')}
        >
          <span className={styles.modeIcon}>
            <ModeIcon mode="move" />
          </span>
          <span className={styles.modeText}>
            <span className={styles.modeName}>
              Déplacement <kbd className={styles.key}>D</kbd>
            </span>
            <span className={styles.modeDescription}>
              Glisser une idée pour la placer. Elles ne se chevauchent pas et les liens suivent.
            </span>
          </span>
        </button>

        <button
          type="button"
          className={mode === 'selection' ? `${styles.mode} ${styles.modeActive}` : styles.mode}
          aria-pressed={mode === 'selection'}
          onClick={(): void => chooseMode('selection')}
        >
          <span className={styles.modeIcon}>
            <ModeIcon mode="selection" />
          </span>
          <span className={styles.modeText}>
            <span className={styles.modeName}>
              Sélection <kbd className={styles.key}>S</kbd>
            </span>
            <span className={styles.modeDescription}>
              Glisser pour entourer des idées : elles se sélectionnent et se déplacent ensemble.
            </span>
          </span>
        </button>
      </div>
    </Panel>
  )
}
