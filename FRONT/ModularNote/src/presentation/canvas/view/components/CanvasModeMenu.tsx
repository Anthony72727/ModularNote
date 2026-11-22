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
        <>
          <path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4" />
          <circle cx="12" cy="12" r="2.5" className={styles.filled} />
        </>
      )}
      {mode === 'move' && (
        <>
          <circle cx="6.5" cy="17.5" r="3" className={styles.dashed} />
          <path d="M9 15l4.5-4.5" className={styles.dashed} />
          <circle cx="17" cy="7" r="3.5" className={styles.filled} />
        </>
      )}
      {mode === 'selection' && <rect x="4" y="4" width="16" height="16" rx="2" className={styles.dashed} />}
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
            <span className={styles.modeDescription}>Se balader sur le canvas sans rien modifier.</span>
          </span>
        </button>

        <ul className={styles.help}>
          <li>
            <kbd className={styles.key}>Glisser</kbd> se déplacer
          </li>
          <li>
            <kbd className={styles.key}>Molette</kbd> haut, bas (et côtés en 4 directions)
          </li>
          <li>
            <kbd className={styles.key}>Maj + molette</kbd> gauche, droite
          </li>
          <li>
            <kbd className={styles.key}>Ctrl + molette</kbd> zoom
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
