// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { createTestContext } from '../../../core/di/createTestContext.test-utils'
import { ApiError } from '../../../core/http/ApiError'
import { NoteNotFoundError } from '../../../domain/notes/entity/errors/NoteNotFoundError'
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

  describe('editing a note', () => {
    function panel(): HTMLElement {
      return screen.getByRole('complementary', { name: "Détails de l'idée" })
    }

    async function openEdition(noteTitle: string): Promise<void> {
      await userEvent.click(await screen.findByRole('button', { name: new RegExp(noteTitle) }))
      await userEvent.click(within(panel()).getByRole('button', { name: 'Modifier' }))
    }

    function renderWith(repository: ReturnType<typeof createFakeNoteRepository>): void {
      const { wrapper } = createTestContext(repository)
      render(<NotesPage />, { wrapper })
    }

    it('prefills the form, then shows the modifications in the list and the panel without reloading', async () => {
      const repository = createFakeNoteRepository()
      const note = aNote({ id: 'abc', title: 'Ancien titre', description: 'Ancienne description' })
      const saved = aNote({ id: 'abc', title: 'Nouveau titre', description: 'Ancienne description' })
      repository.getAll.mockResolvedValue([note])
      repository.getById.mockResolvedValue(note)
      repository.update.mockResolvedValue(saved)
      renderWith(repository)

      await openEdition('Ancien titre')
      const titleField = within(panel()).getByLabelText('Titre') as HTMLInputElement
      expect(titleField.value).toBe('Ancien titre')
      expect((within(panel()).getByLabelText(/Description/) as HTMLTextAreaElement).value).toBe('Ancienne description')

      await userEvent.clear(titleField)
      await userEvent.type(titleField, 'Nouveau titre')
      await userEvent.click(within(panel()).getByRole('button', { name: 'Enregistrer' }))

      await within(panel()).findByRole('button', { name: 'Modifier' })
      within(panel()).getByRole('heading', { name: 'Nouveau titre' })
      within(screen.getByRole('list')).getByText('Nouveau titre')
      expect(within(screen.getByRole('list')).queryByText('Ancien titre')).toBeNull()
      expect(repository.update).toHaveBeenCalledExactlyOnceWith('abc', {
        title: 'Nouveau titre',
        description: 'Ancienne description',
      })
      expect(repository.getAll).toHaveBeenCalledOnce()
    })

    it('goes back to the previous state of the note when the edition is cancelled', async () => {
      const repository = createFakeNoteRepository()
      const note = aNote({ id: 'abc', title: 'Une idée', description: 'Sa description' })
      repository.getAll.mockResolvedValue([note])
      repository.getById.mockResolvedValue(note)
      renderWith(repository)

      await openEdition('Une idée')
      await userEvent.type(within(panel()).getByLabelText('Titre'), ' modifiée')
      await userEvent.click(within(panel()).getByRole('button', { name: 'Annuler' }))

      within(panel()).getByText('Sa description')
      within(panel()).getByRole('heading', { name: 'Une idée' })
      expect(repository.update).not.toHaveBeenCalled()

      await userEvent.click(within(panel()).getByRole('button', { name: 'Modifier' }))
      expect((within(panel()).getByLabelText('Titre') as HTMLInputElement).value).toBe('Une idée')
    })

    it('leaves the edition but keeps the panel open on Escape', async () => {
      const repository = createFakeNoteRepository()
      const note = aNote({ id: 'abc', title: 'Une idée' })
      repository.getAll.mockResolvedValue([note])
      repository.getById.mockResolvedValue(note)
      renderWith(repository)

      await openEdition('Une idée')
      await userEvent.keyboard('{Escape}')

      within(panel()).getByRole('button', { name: 'Modifier' })

      await userEvent.keyboard('{Escape}')

      expect(screen.queryByRole('complementary')).toBeNull()
    })

    it('applies the validation rules and keeps the form open on an invalid title', async () => {
      const repository = createFakeNoteRepository()
      const note = aNote({ id: 'abc', title: 'Une idée' })
      repository.getAll.mockResolvedValue([note])
      repository.getById.mockResolvedValue(note)
      renderWith(repository)

      await openEdition('Une idée')
      await userEvent.clear(within(panel()).getByLabelText('Titre'))
      await userEvent.click(within(panel()).getByRole('button', { name: 'Enregistrer' }))

      const alert = await within(panel()).findByRole('alert')
      expect(alert.textContent).toBe('Le titre est obligatoire et ne doit pas dépasser 100 caractères.')
      expect(repository.update).not.toHaveBeenCalled()
    })

    it('shows an explicit error and removes the note from the list when it does not exist anymore', async () => {
      const repository = createFakeNoteRepository()
      const note = aNote({ id: 'abc', title: 'Une idée' })
      repository.getAll.mockResolvedValueOnce([note]).mockResolvedValue([])
      repository.getById.mockResolvedValueOnce(note).mockRejectedValue(new NoteNotFoundError('abc'))
      repository.update.mockRejectedValue(new NoteNotFoundError('abc'))
      renderWith(repository)

      await openEdition('Une idée')
      await userEvent.click(within(panel()).getByRole('button', { name: 'Enregistrer' }))

      const alert = await within(panel()).findByRole('alert')
      expect(alert.textContent).toBe("Cette idée n'existe plus.")
      await screen.findByText(/Aucune idée pour l'instant/)
    })

    it('leaves the edition when another note is selected', async () => {
      const repository = createFakeNoteRepository()
      const first = aNote({ id: 'first', title: 'Première' })
      const second = aNote({ id: 'second', title: 'Seconde' })
      repository.getAll.mockResolvedValue([first, second])
      repository.getById.mockImplementation(async (id: string) => (id === 'first' ? first : second))
      renderWith(repository)

      await openEdition('Première')
      await userEvent.click(screen.getByRole('button', { name: /Seconde/ }))

      within(panel()).getByRole('button', { name: 'Modifier' })
      within(panel()).getByRole('heading', { name: 'Seconde' })
    })
  })
})
