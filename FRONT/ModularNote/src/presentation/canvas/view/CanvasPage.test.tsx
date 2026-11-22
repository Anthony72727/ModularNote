// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { createTestContext } from '../../../core/di/createTestContext.test-utils'
import { ApiError } from '../../../core/http/ApiError'
import { appRoutes } from '../../../core/router/appRoutes'
import { aNote, createFakeNoteRepository } from '../../../domain/notes/repositories/FakeNoteRepository.test-utils'
import type { FakeNoteRepository } from '../../../domain/notes/repositories/FakeNoteRepository.test-utils'

const noteA = aNote({ id: 'a', title: 'Idée A' })
const noteB = aNote({ id: 'b', title: 'Idée B' })
const link = { id: 'link', noteAId: 'a', noteBId: 'b' }

beforeAll(async () => {
  // The route loads this page on demand: loaded here, the tests do not depend on how long that takes
  await import('./CanvasPage')
  // jsdom does not know these browser features, used by React Flow to measure the surface
  class FakeResizeObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
  vi.stubGlobal('ResizeObserver', FakeResizeObserver)
  vi.stubGlobal('DOMMatrixReadOnly', class {
    m22 = 1
  })
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function renderCanvas(repository: FakeNoteRepository): void {
  const { wrapper } = createTestContext(repository)
  const router = createMemoryRouter(appRoutes, { initialEntries: ['/canvas'] })
  render(<RouterProvider router={router} />, { wrapper })
}

describe('CanvasPage', () => {
  it('shows every note with its date and its number of links, and the totals', async () => {
    const repository = createFakeNoteRepository()
    repository.getAll.mockResolvedValue([noteA, noteB])
    repository.getAllLinks.mockResolvedValue([link])

    renderCanvas(repository)

    expect(await screen.findByText('Idée A')).toBeDefined()
    expect(screen.getByText('Idée B')).toBeDefined()
    expect(screen.getAllByText('26/10 · 1 lien')).toHaveLength(2)
    expect(screen.getByText('2 idées · 1 lien')).toBeDefined()
    expect(screen.getByRole('link', { name: 'Canvas' }).getAttribute('aria-current')).toBe('page')
  })

  it('invites to create a first note when there is none', async () => {
    const repository = createFakeNoteRepository()
    repository.getAll.mockResolvedValue([])

    renderCanvas(repository)

    expect(await screen.findByRole('link', { name: 'Créer une première idée' })).toBeDefined()
  })

  it('shows an error when the notes cannot be loaded, and can try again', async () => {
    const repository = createFakeNoteRepository()
    repository.getAll.mockRejectedValueOnce(new ApiError(500, 'Erreur'))
    repository.getAll.mockResolvedValue([noteA])

    renderCanvas(repository)

    expect(await screen.findByRole('alert')).toBeDefined()

    await userEvent.click(screen.getByRole('button', { name: 'Réessayer' }))

    expect(await screen.findByText('Idée A')).toBeDefined()
  })

  it('adds and removes notes from the selection with Ctrl + click, and goes to the move mode', async () => {
    const repository = createFakeNoteRepository()
    repository.getAll.mockResolvedValue([noteA, noteB])

    renderCanvas(repository)
    await screen.findByText('Idée A')
    expect(screen.getByLabelText('Mode navigation. Changer de mode')).toBeDefined()

    fireEvent.click(screen.getByText('Idée A'), { ctrlKey: true })
    fireEvent.click(screen.getByText('Idée B'), { ctrlKey: true })

    await waitFor(() => expect(document.querySelectorAll('.react-flow__node.selected')).toHaveLength(2))
    expect(screen.getByLabelText('Mode déplacement. Changer de mode')).toBeDefined()

    fireEvent.click(screen.getByText('Idée A'), { ctrlKey: true })

    await waitFor(() => expect(document.querySelectorAll('.react-flow__node.selected')).toHaveLength(1))
  })

  describe('preview of a note', () => {
    const preview = (): HTMLElement => screen.getByRole('complementary', { name: "Aperçu de l'idée" })

    it('opens with a click, shows the description and the linked notes, without selecting the note', async () => {
      const repository = createFakeNoteRepository()
      repository.getAll.mockResolvedValue([noteA, noteB])
      repository.getAllLinks.mockResolvedValue([link])
      repository.getById.mockResolvedValue(noteA)
      repository.getLinkedNotes.mockResolvedValue([noteB])

      renderCanvas(repository)
      await screen.findByText('Idée A')

      fireEvent.click(screen.getByText('Idée A'))

      expect(await within(preview()).findByText('Sa description')).toBeDefined()
      expect(within(preview()).getByRole('heading', { name: 'Idée A' })).toBeDefined()
      expect(await within(preview()).findByText('Idée B')).toBeDefined()
      expect(repository.getById).toHaveBeenCalledWith('a', expect.anything())
      expect(document.querySelectorAll('.react-flow__node.selected')).toHaveLength(0)
      expect(screen.getByLabelText('Mode navigation. Changer de mode')).toBeDefined()
    })

    it('shows "Pas de description" for a note without one', async () => {
      const noteWithoutDescription = aNote({ id: 'a', title: 'Idée A', description: null })
      const repository = createFakeNoteRepository()
      repository.getAll.mockResolvedValue([noteWithoutDescription])
      repository.getById.mockResolvedValue(noteWithoutDescription)

      renderCanvas(repository)
      await screen.findByText('Idée A')

      fireEvent.click(screen.getByText('Idée A'))

      expect(await within(preview()).findByText('Pas de description')).toBeDefined()
    })

    it('closes with a second click on the note', async () => {
      const repository = createFakeNoteRepository()
      repository.getAll.mockResolvedValue([noteA])
      repository.getById.mockResolvedValue(noteA)

      renderCanvas(repository)
      await screen.findByText('Idée A')

      fireEvent.click(screen.getByText('Idée A'))
      await within(preview()).findByText('Sa description')
      fireEvent.click(screen.getAllByText('Idée A')[0])

      expect(screen.queryByRole('complementary', { name: "Aperçu de l'idée" })).toBeNull()
    })

    it('closes with a click on the background', async () => {
      const repository = createFakeNoteRepository()
      repository.getAll.mockResolvedValue([noteA])
      repository.getById.mockResolvedValue(noteA)

      renderCanvas(repository)
      await screen.findByText('Idée A')

      fireEvent.click(screen.getByText('Idée A'))
      await within(preview()).findByText('Sa description')
      // fireEvent: React Flow only counts a click on the background when the mouse did not move
      const pane = document.querySelector('.react-flow__pane') as HTMLElement
      fireEvent.click(pane)

      expect(screen.queryByRole('complementary', { name: "Aperçu de l'idée" })).toBeNull()
    })

    it('switches to the other note with a click on it', async () => {
      const repository = createFakeNoteRepository()
      repository.getAll.mockResolvedValue([noteA, noteB])
      repository.getById.mockImplementation((id: string) => Promise.resolve(id === 'a' ? noteA : noteB))

      renderCanvas(repository)
      await screen.findByText('Idée A')

      fireEvent.click(screen.getByText('Idée A'))
      expect(await within(preview()).findByRole('heading', { name: 'Idée A' })).toBeDefined()
      fireEvent.click(screen.getByText('Idée B'))

      expect(await within(preview()).findByRole('heading', { name: 'Idée B' })).toBeDefined()
    })

    it('does not open in selection mode, nor with Ctrl + click', async () => {
      const repository = createFakeNoteRepository()
      repository.getAll.mockResolvedValue([noteA, noteB])

      renderCanvas(repository)
      await screen.findByText('Idée A')

      fireEvent.click(screen.getByText('Idée A'), { ctrlKey: true })
      await userEvent.keyboard('s')
      fireEvent.click(screen.getByText('Idée B'))

      expect(screen.queryByRole('complementary', { name: "Aperçu de l'idée" })).toBeNull()
      expect(repository.getById).not.toHaveBeenCalled()
    })

    it('edits the note, and the canvas shows the new title at once', async () => {
      const edited = aNote({ id: 'a', title: 'Idée A modifiée' })
      const repository = createFakeNoteRepository()
      repository.getAll.mockResolvedValue([noteA])
      repository.getById.mockResolvedValue(noteA)
      repository.update.mockResolvedValue(edited)

      renderCanvas(repository)
      await screen.findByText('Idée A')

      fireEvent.click(screen.getByText('Idée A'))
      await userEvent.click(await within(preview()).findByRole('button', { name: 'Modifier' }))
      const title = within(preview()).getByLabelText(/Titre/)
      await userEvent.clear(title)
      await userEvent.type(title, 'Idée A modifiée')
      await userEvent.click(within(preview()).getByRole('button', { name: 'Enregistrer' }))

      expect(await within(preview()).findByRole('heading', { name: 'Idée A modifiée' })).toBeDefined()
      expect(document.querySelector('.react-flow__node')?.textContent).toContain('Idée A modifiée')
      expect(repository.update).toHaveBeenCalledExactlyOnceWith('a', { title: 'Idée A modifiée', description: 'Sa description' })
    })

    it('deletes the note after a confirmation, and closes', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      const repository = createFakeNoteRepository()
      repository.getAll.mockResolvedValue([noteA, noteB])
      repository.getById.mockResolvedValue(noteB)
      repository.delete.mockResolvedValue()

      renderCanvas(repository)
      await screen.findByText('Idée B')

      fireEvent.click(screen.getByText('Idée B'))
      await userEvent.click(await within(preview()).findByRole('button', { name: 'Supprimer' }))

      await waitFor(() => expect(screen.queryByText('Idée B')).toBeNull())
      expect(screen.queryByRole('complementary', { name: "Aperçu de l'idée" })).toBeNull()
      expect(repository.delete).toHaveBeenCalledExactlyOnceWith('b')
    })
  })

  it('deletes a note after a confirmation, and it disappears at once', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const repository = createFakeNoteRepository()
    repository.getAll.mockResolvedValue([noteA, noteB])
    repository.delete.mockResolvedValue()

    renderCanvas(repository)
    await screen.findByText('Idée B')

    // fireEvent: the CSS that keeps the mouse active on a note is not loaded by jsdom
    fireEvent.click(screen.getByLabelText('Supprimer l\'idée "Idée B"'))

    expect(confirm).toHaveBeenCalledExactlyOnceWith('Supprimer l\'idée "Idée B" ?')
    await waitFor(() => expect(screen.queryByText('Idée B')).toBeNull())
    expect(screen.getByText('Idée A')).toBeDefined()
    expect(repository.delete).toHaveBeenCalledExactlyOnceWith('b')
  })

  it('deletes nothing when the confirmation is refused', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const repository = createFakeNoteRepository()
    repository.getAll.mockResolvedValue([noteA])

    renderCanvas(repository)
    await screen.findByText('Idée A')

    fireEvent.click(screen.getByLabelText('Supprimer l\'idée "Idée A"'))

    expect(repository.delete).not.toHaveBeenCalled()
    expect(screen.getByText('Idée A')).toBeDefined()
  })
})
