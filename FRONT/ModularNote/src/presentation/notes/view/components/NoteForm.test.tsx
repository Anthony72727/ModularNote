// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createTestContext } from '../../../../core/di/createTestContext.test-utils'
import { LinkedNoteNotFoundError } from '../../../../domain/notes/entity/errors/LinkedNoteNotFoundError'
import { NoteRejectedError } from '../../../../domain/notes/entity/errors/NoteRejectedError'
import { aNote, createFakeNoteRepository } from '../../../../domain/notes/repositories/FakeNoteRepository.test-utils'
import { NoteForm } from './NoteForm'

afterEach(cleanup)

describe('NoteForm', () => {
  it('highlights only the title when the title is invalid', async () => {
    const repository = createFakeNoteRepository()
    repository.getAll.mockResolvedValue([])
    const { wrapper } = createTestContext(repository)
    render(<NoteForm />, { wrapper })

    await userEvent.click(screen.getByRole('button', { name: "Créer l'idée" }))

    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toBe('Le titre est obligatoire et ne doit pas dépasser 100 caractères.')
    expect(screen.getByLabelText('Titre').getAttribute('aria-invalid')).toBe('true')
    expect(screen.getByLabelText(/Description/).getAttribute('aria-invalid')).toBe('false')
  })

  it('highlights no field when the server rejects the note', async () => {
    const repository = createFakeNoteRepository()
    repository.getAll.mockResolvedValue([])
    repository.add.mockRejectedValue(new NoteRejectedError())
    const { wrapper } = createTestContext(repository)
    render(<NoteForm />, { wrapper })

    await userEvent.type(screen.getByLabelText('Titre'), 'Mon idée')
    await userEvent.click(screen.getByRole('button', { name: "Créer l'idée" }))

    await screen.findByRole('alert')
    expect(screen.getByLabelText('Titre').getAttribute('aria-invalid')).toBe('false')
    expect(screen.getByLabelText(/Description/).getAttribute('aria-invalid')).toBe('false')
  })

  describe('linked notes', () => {
    function searchField(): HTMLInputElement {
      return screen.getByLabelText(/Idées liées/) as HTMLInputElement
    }

    function renderWithNotes(...notes: ReturnType<typeof aNote>[]): ReturnType<typeof createFakeNoteRepository> {
      const repository = createFakeNoteRepository()
      repository.getAll.mockResolvedValue(notes)
      repository.add.mockResolvedValue(aNote({ id: 'created' }))
      const { wrapper } = createTestContext(repository)
      render(<NoteForm />, { wrapper })
      return repository
    }

    it('creates the note with the notes found by their title, then empties the choice', async () => {
      const repository = renderWithNotes(
        aNote({ id: 'first', title: 'Première idée' }),
        aNote({ id: 'second', title: 'Seconde idée' }),
        aNote({ id: 'other', title: 'Autre chose' }),
      )

      await userEvent.type(screen.getByLabelText('Titre'), 'Mon idée')
      await userEvent.type(searchField(), 'premiere')
      const firstProposals = await screen.findByRole('list', { name: 'Idées proposées' })
      await userEvent.click(within(firstProposals).getByRole('button', { name: 'Première idée' }))
      expect(searchField().value).toBe('')

      await userEvent.type(searchField(), 'seconde')
      const secondProposals = await screen.findByRole('list', { name: 'Idées proposées' })
      await userEvent.click(within(secondProposals).getByRole('button', { name: 'Seconde idée' }))

      await userEvent.click(screen.getByRole('button', { name: "Créer l'idée" }))

      expect(repository.add).toHaveBeenCalledExactlyOnceWith({ title: 'Mon idée', description: null }, ['first', 'second'])
      await vi.waitFor(() => expect(screen.queryByRole('list', { name: 'Idées choisies' })).toBeNull())
    })

    it('does not propose a note already chosen, and proposes it again once given up', async () => {
      renderWithNotes(aNote({ id: 'first', title: 'Une idée' }))

      await userEvent.type(searchField(), 'idée')
      await userEvent.click(await screen.findByRole('button', { name: 'Une idée' }))
      await userEvent.type(searchField(), 'idée')
      await screen.findByText('Aucune idée trouvée.')

      await userEvent.click(screen.getByRole('button', { name: 'Retirer l\'idée "Une idée"' }))

      await screen.findByRole('button', { name: 'Une idée' })
    })

    it('chooses the first proposed note on Enter, without creating the note', async () => {
      const repository = renderWithNotes(aNote({ id: 'first', title: 'Une idée' }))
      await userEvent.type(screen.getByLabelText('Titre'), 'Mon idée')
      await userEvent.type(searchField(), 'idée')
      await screen.findByRole('button', { name: 'Une idée' })

      await userEvent.keyboard('{Enter}')

      within(screen.getByRole('list', { name: 'Idées choisies' })).getByText('Une idée')
      expect(repository.add).not.toHaveBeenCalled()
    })

    it('does not create the note on Enter when nothing is proposed', async () => {
      const repository = renderWithNotes()
      await userEvent.type(screen.getByLabelText('Titre'), 'Mon idée')
      await userEvent.type(searchField(), 'idée{Enter}')

      expect(repository.add).not.toHaveBeenCalled()
    })

    it('names the note that does not exist anymore and creates nothing', async () => {
      const gone = aNote({ id: 'gone', title: 'Disparue' })
      const repository = createFakeNoteRepository()
      repository.getAll.mockResolvedValueOnce([gone]).mockResolvedValue([])
      repository.add.mockRejectedValue(new LinkedNoteNotFoundError())
      const { wrapper } = createTestContext(repository)
      render(<NoteForm />, { wrapper })

      await userEvent.type(screen.getByLabelText('Titre'), 'Mon idée')
      await userEvent.type(searchField(), 'dispar')
      await userEvent.click(await screen.findByRole('button', { name: 'Disparue' }))
      await userEvent.click(screen.getByRole('button', { name: "Créer l'idée" }))

      const alert = await screen.findByRole('alert')
      expect(alert.textContent).toBe("L'idée liée « Disparue » n'existe plus.")
      expect((screen.getByLabelText('Titre') as HTMLInputElement).value).toBe('Mon idée')
      expect(screen.queryByRole('list', { name: 'Idées choisies' })).toBeNull()
    })
  })
})
