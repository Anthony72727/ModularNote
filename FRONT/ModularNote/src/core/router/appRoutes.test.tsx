// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createFakeNoteRepository } from '../../domain/notes/repositories/FakeNoteRepository.test-utils'
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
    expect(await screen.findByRole('heading', { name: 'Mes idées' })).toBeDefined()
    expect(screen.getByRole('link', { name: 'Mes idées' }).getAttribute('aria-current')).toBe('page')
  })

  it('shows the not found page for an unknown URL, with a link back to the notes', async () => {
    const router = renderAt('/inconnue')

    expect(screen.getByRole('heading', { name: "Cette page n'existe pas" })).toBeDefined()

    await userEvent.click(screen.getByRole('link', { name: 'Retour à mes idées' }))

    expect(router.state.location.pathname).toBe('/')
    expect(await screen.findByRole('heading', { name: 'Mes idées' })).toBeDefined()
  })

  it('shows the quick add page and goes back to the notes from the navigation', async () => {
    const router = renderAt('/quick-add')

    expect(screen.getByRole('textbox', { name: 'Nouvelle idée' })).toBeDefined()
    expect(screen.getByRole('link', { name: 'Ajout rapide' }).getAttribute('aria-current')).toBe('page')

    await userEvent.click(screen.getByRole('link', { name: 'Mes idées' }))

    expect(router.state.location.pathname).toBe('/')
    expect(await screen.findByRole('heading', { name: 'Mes idées' })).toBeDefined()
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

      await userEvent.click(screen.getByRole('link', { name: 'Mes idées' }))

      await waitFor(() => expect(confirm).toHaveBeenCalledOnce())
      expect(router.state.location.pathname).toBe('/quick-add')
      expect(field.value).toBe('Mon idée')
    })

    it('leaves the page when the user accepts to lose the text of the creation form', async () => {
      const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
      const router = renderAt('/')
      await userEvent.type(screen.getByLabelText('Titre'), 'Mon idée')

      await userEvent.click(screen.getByRole('link', { name: 'Ajout rapide' }))

      await waitFor(() => expect(router.state.location.pathname).toBe('/quick-add'))
      expect(confirm).toHaveBeenCalledOnce()
    })

    it('does not ask when nothing was typed', async () => {
      const confirm = vi.spyOn(window, 'confirm')
      const router = renderAt('/quick-add')

      await userEvent.click(screen.getByRole('link', { name: 'Mes idées' }))

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
