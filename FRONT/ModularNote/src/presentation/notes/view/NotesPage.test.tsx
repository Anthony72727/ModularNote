// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { createTestContext } from '../../../core/di/createTestContext.test-utils'
import { ApiError } from '../../../core/http/ApiError'
import { aNote, createFakeNoteRepository } from '../../../domain/notes/repositories/FakeNoteRepository.test-utils'
import { NotesPage } from './NotesPage'

beforeAll(() => {
  // jsdom does not implement scrolling
  Element.prototype.scrollIntoView = vi.fn()
})
afterEach(cleanup)

describe('NotesPage', () => {
  it('shows a created note in the list right away and empties the form', async () => {
    const repository = createFakeNoteRepository()
    repository.getAll.mockResolvedValue([])
    repository.add.mockResolvedValue(aNote({ id: 'new', title: 'Mon idée', description: 'Les détails' }))
    const { wrapper } = createTestContext(repository)
    render(<NotesPage />, { wrapper })
    await screen.findByText(/Aucune idée pour l'instant/)

    await userEvent.type(screen.getByLabelText('Titre'), 'Mon idée')
    await userEvent.type(screen.getByLabelText(/Description/), 'Les détails')
    await userEvent.click(screen.getByRole('button', { name: "Créer l'idée" }))

    const list = await screen.findByRole('list')
    within(list).getByText('Mon idée')
    expect(repository.getAll).toHaveBeenCalledOnce()
    expect((screen.getByLabelText('Titre') as HTMLInputElement).value).toBe('')
    expect((screen.getByLabelText(/Description/) as HTMLTextAreaElement).value).toBe('')
  })

  it('hides the note count and offers to retry when the notes cannot be loaded', async () => {
    const repository = createFakeNoteRepository()
    repository.getAll
      .mockRejectedValueOnce(new ApiError(500, 'boom'))
      .mockResolvedValue([aNote({ title: 'Une idée' })])
    const { wrapper } = createTestContext(repository)
    render(<NotesPage />, { wrapper })
    const listHeading = screen.getByRole('heading', { name: 'Mes idées' })

    await screen.findByRole('alert')
    expect(listHeading.parentElement?.textContent).toBe('Mes idées')

    await userEvent.click(screen.getByRole('button', { name: 'Réessayer' }))

    await screen.findByText('Une idée')
    expect(listHeading.parentElement?.textContent).toBe('Mes idées1')
  })

  it('opens the details of a note on click and closes them with Escape', async () => {
    const repository = createFakeNoteRepository()
    const note = aNote({ id: 'abc', title: 'Une idée', description: null })
    repository.getAll.mockResolvedValue([note])
    repository.getById.mockResolvedValue(note)
    const { wrapper } = createTestContext(repository)
    render(<NotesPage />, { wrapper })

    await userEvent.click(await screen.findByRole('button', { name: /Une idée/ }))

    const panel = screen.getByRole('complementary', { name: "Détails de l'idée" })
    within(panel).getByText('Pas de description')

    await userEvent.keyboard('{Escape}')

    expect(screen.queryByRole('complementary')).toBeNull()
  })
})
