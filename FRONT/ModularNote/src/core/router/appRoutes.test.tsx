// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import { createFakeNoteRepository } from '../../domain/notes/repositories/FakeNoteRepository.test-utils'
import { createTestContext } from '../di/createTestContext.test-utils'
import { appRoutes } from './appRoutes'

afterEach(cleanup)

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
})
