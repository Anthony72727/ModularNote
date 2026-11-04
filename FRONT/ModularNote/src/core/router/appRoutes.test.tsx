// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { aNote, createFakeNoteRepository } from '../../domain/notes/repositories/FakeNoteRepository.test-utils'
import { createTestContext } from '../di/createTestContext.test-utils'
import { appRoutes } from './appRoutes'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

/**
 * Render the whole application at the given URL, with no note saved
 */
function renderAt(url: string) {
  const repository = createFakeNoteRepository()
  repository.getAll.mockResolvedValue([])
  const { wrapper } = createTestContext(repository)
  const router = createMemoryRouter(appRoutes, { initialEntries: [url] })
  render(<RouterProvider router={router} />, { wrapper })
  return router
}

describe('appRoutes', () => {
  it('shows the notes page at the root, inside the layout', async () => {
    renderAt('/')

    expect(screen.getByRole('heading', { level: 1, name: 'ModularNote' })).toBeDefined()
    expect(await screen.findByRole('heading', { name: 'Toutes les idées' })).toBeDefined()
    expect(screen.getByRole('link', { name: 'Liste' }).getAttribute('aria-current')).toBe('page')
  })

  it('shows the not found page for an unknown URL, with a link back to the notes', async () => {
    const router = renderAt('/inconnue')

    expect(screen.getByRole('heading', { name: "Cette page n'existe pas" })).toBeDefined()

    await userEvent.click(screen.getByRole('link', { name: 'Retour à mes idées' }))

    expect(router.state.location.pathname).toBe('/')
    expect(await screen.findByRole('heading', { name: 'Toutes les idées' })).toBeDefined()
  })

  it('shows the quick add page and goes back to the notes from the navigation', async () => {
    const router = renderAt('/quick-add')

    expect(screen.getByRole('textbox', { name: 'Nouvelle idée' })).toBeDefined()
    expect(screen.getByRole('link', { name: 'Ajout rapide' }).getAttribute('aria-current')).toBe('page')

    await userEvent.click(screen.getByRole('link', { name: 'Liste' }))

    expect(router.state.location.pathname).toBe('/')
    expect(await screen.findByRole('heading', { name: 'Toutes les idées' })).toBeDefined()
  })

  describe('creating a note on its own page', () => {
    function renderCreationPage() {
      const created = aNote({ id: 'new', title: 'Mon idée' })
      const repository = createFakeNoteRepository()
      repository.getAll.mockResolvedValue([created])
      repository.add.mockResolvedValue(created)
      const { wrapper } = createTestContext(repository)
      const router = createMemoryRouter(appRoutes, { initialEntries: ['/new'] })
      render(<RouterProvider router={router} />, { wrapper })
      return { router, repository }
    }

    it('opens from the navigation, with the focus on the title', async () => {
      const router = renderAt('/')

      await userEvent.click(screen.getByRole('link', { name: 'Nouvelle idée' }))

      expect(router.state.location.pathname).toBe('/new')
      expect(document.activeElement).toBe(screen.getByLabelText('Titre'))
      expect(screen.getByRole('link', { name: 'Nouvelle idée' }).getAttribute('aria-current')).toBe('page')
    })

    it('shows the created note in the list, without asking anything', async () => {
      const confirm = vi.spyOn(window, 'confirm')
      const { router, repository } = renderCreationPage()

      await userEvent.type(screen.getByLabelText('Titre'), 'Mon idée')
      await userEvent.click(screen.getByRole('button', { name: "Créer l'idée" }))

      await waitFor(() => expect(router.state.location.pathname).toBe('/'))
      await screen.findByRole('button', { name: /Mon idée/ })
      expect(repository.add).toHaveBeenCalledOnce()
      expect(confirm).not.toHaveBeenCalled()
    })

    it('stays on the page and keeps the text when the note is invalid', async () => {
      const { router, repository } = renderCreationPage()

      await userEvent.click(screen.getByRole('button', { name: "Créer l'idée" }))

      await screen.findByRole('alert')
      expect(router.state.location.pathname).toBe('/new')
      expect(repository.add).not.toHaveBeenCalled()
    })

    it('goes back to the list with the cancel button, without asking anything', async () => {
      const confirm = vi.spyOn(window, 'confirm')
      const { router, repository } = renderCreationPage()

      await userEvent.type(screen.getByLabelText('Titre'), 'Mon idée')
      await userEvent.click(screen.getByRole('button', { name: 'Annuler' }))

      await waitFor(() => expect(router.state.location.pathname).toBe('/'))
      expect(repository.add).not.toHaveBeenCalled()
      expect(confirm).not.toHaveBeenCalled()
    })

    it('still asks when the user leaves by a link afterwards', async () => {
      const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
      const { router } = renderCreationPage()
      await userEvent.click(screen.getByRole('button', { name: 'Annuler' }))
      await waitFor(() => expect(router.state.location.pathname).toBe('/'))

      await userEvent.click(screen.getByRole('link', { name: 'Nouvelle idée' }))
      await userEvent.type(screen.getByLabelText('Titre'), 'Autre idée')
      await userEvent.click(screen.getByRole('link', { name: 'Liste' }))

      await waitFor(() => expect(confirm).toHaveBeenCalledOnce())
      expect(router.state.location.pathname).toBe('/new')
    })
  })

  describe('leaving a page with unsaved text', () => {
    function isReloadBlocked(): boolean {
      const event = new Event('beforeunload', { cancelable: true })
      window.dispatchEvent(event)
      return event.defaultPrevented
    }

    it('stays on the quick add page and keeps the text when the user refuses', async () => {
      const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
      const router = renderAt('/quick-add')
      const field = screen.getByRole('textbox', { name: 'Nouvelle idée' }) as HTMLInputElement
      await userEvent.type(field, 'Mon idée')

      await userEvent.click(screen.getByRole('link', { name: 'Liste' }))

      await waitFor(() => expect(confirm).toHaveBeenCalledOnce())
      expect(router.state.location.pathname).toBe('/quick-add')
      expect(field.value).toBe('Mon idée')
    })

    it('leaves the page when the user accepts to lose the text of the creation form', async () => {
      const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
      const router = renderAt('/new')
      await userEvent.type(screen.getByLabelText('Titre'), 'Mon idée')

      await userEvent.click(screen.getByRole('link', { name: 'Ajout rapide' }))

      await waitFor(() => expect(router.state.location.pathname).toBe('/quick-add'))
      expect(confirm).toHaveBeenCalledOnce()
    })

    it('does not ask when nothing was typed', async () => {
      const confirm = vi.spyOn(window, 'confirm')
      const router = renderAt('/quick-add')

      await userEvent.click(screen.getByRole('link', { name: 'Liste' }))

      expect(router.state.location.pathname).toBe('/')
      expect(confirm).not.toHaveBeenCalled()
    })

    it('makes the browser ask before reloading or closing the tab, only while there is unsaved text', async () => {
      renderAt('/quick-add')
      const field = screen.getByRole('textbox', { name: 'Nouvelle idée' })
      expect(isReloadBlocked()).toBe(false)

      await userEvent.type(field, 'M')
      expect(isReloadBlocked()).toBe(true)

      await userEvent.clear(field)
      expect(isReloadBlocked()).toBe(false)
    })
  })
})
