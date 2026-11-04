// @vitest-environment jsdom
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
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
  it('hides the note count and offers to retry when the notes cannot be loaded', async () => {
    const repository = createFakeNoteRepository()
    repository.getAll
      .mockRejectedValueOnce(new ApiError(500, 'boom'))
      .mockResolvedValue([aNote({ title: 'Une idée' })])
    const { wrapper } = createTestContext(repository)
    render(<MemoryRouter><NotesPage /></MemoryRouter>, { wrapper })
    const listHeading = screen.getByRole('heading', { name: 'Toutes les idées' })

    await screen.findByRole('alert')
    expect(listHeading.parentElement?.textContent).toBe('Toutes les idées')

    await userEvent.click(screen.getByRole('button', { name: 'Réessayer' }))

    await screen.findByText('Une idée')
    expect(listHeading.parentElement?.textContent).toBe('Toutes les idées1 idée')
  })

  it('opens the details of a note on click and closes them with Escape', async () => {
    const repository = createFakeNoteRepository()
    const note = aNote({ id: 'abc', title: 'Une idée', description: null })
    repository.getAll.mockResolvedValue([note])
    repository.getById.mockResolvedValue(note)
    const { wrapper } = createTestContext(repository)
    render(<MemoryRouter><NotesPage /></MemoryRouter>, { wrapper })

    await userEvent.click(await screen.findByRole('button', { name: /Une idée/ }))

    const panel = screen.getByRole('complementary', { name: "Détails de l'idée" })
    within(panel).getByText('Pas de description')

    await userEvent.keyboard('{Escape}')

    expect(screen.queryByRole('complementary')).toBeNull()
  })

  describe('linked notes', () => {
    function panel(): HTMLElement {
      return screen.getByRole('complementary', { name: "Détails de l'idée" })
    }

    function linksSection(): HTMLElement {
      return within(panel()).getByRole('region', { name: 'Idées liées' })
    }

    it('lists the linked notes of the open note', async () => {
      const repository = createFakeNoteRepository()
      const note = aNote({ id: 'abc', title: 'Une idée' })
      const linked = aNote({ id: 'linked', title: 'Idée voisine' })
      repository.getAll.mockResolvedValue([note, linked])
      repository.getById.mockResolvedValue(note)
      repository.getLinkedNotes.mockResolvedValue([linked])
      const { wrapper } = createTestContext(repository)
      render(<MemoryRouter><NotesPage /></MemoryRouter>, { wrapper })

      await userEvent.click(await screen.findByRole('button', { name: /Une idée/ }))

      await within(linksSection()).findByText('Idée voisine')
      expect(repository.getLinkedNotes.mock.calls[0][0]).toBe('abc')
    })

    it('tells when the open note has no linked note', async () => {
      const repository = createFakeNoteRepository()
      const note = aNote({ id: 'abc', title: 'Une idée' })
      repository.getAll.mockResolvedValue([note])
      repository.getById.mockResolvedValue(note)
      const { wrapper } = createTestContext(repository)
      render(<MemoryRouter><NotesPage /></MemoryRouter>, { wrapper })

      await userEvent.click(await screen.findByRole('button', { name: /Une idée/ }))

      await within(linksSection()).findByText('Aucune idée liée')
    })
  })

  describe('deleting a note', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    function renderWith(repository: ReturnType<typeof createFakeNoteRepository>): void {
      const { wrapper } = createTestContext(repository)
      render(<MemoryRouter><NotesPage /></MemoryRouter>, { wrapper })
    }

    function rowOf(noteTitle: string): HTMLElement {
      const row = within(screen.getByRole('list')).getByText(noteTitle).closest('li')
      if (row === null) {
        throw new Error(`No row for ${noteTitle}`)
      }
      return row
    }

    async function clickDelete(noteTitle: string): Promise<void> {
      await within(await screen.findByRole('list')).findByText(noteTitle)
      await userEvent.click(within(rowOf(noteTitle)).getByRole('button', { name: 'Supprimer' }))
    }

    it('links each delete button to the title of its note', async () => {
      const repository = createFakeNoteRepository()
      repository.getAll.mockResolvedValue([aNote({ id: 'abc', title: 'Une idée' })])
      renderWith(repository)
      await screen.findByText('Une idée')

      const button = within(rowOf('Une idée')).getByRole('button', { name: 'Supprimer' })

      expect(button.getAttribute('aria-describedby')).toBe('note-title-abc')
      expect(document.getElementById('note-title-abc')?.textContent).toBe('Une idée')
    })

    it('removes the note from the list right away after the confirmation, without opening it', async () => {
      const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
      const repository = createFakeNoteRepository()
      repository.getAll.mockResolvedValue([
        aNote({ id: 'first', title: 'Première' }),
        aNote({ id: 'second', title: 'Seconde' }),
      ])
      repository.delete.mockResolvedValue()
      renderWith(repository)

      await clickDelete('Première')

      await waitFor(() => expect(screen.queryByText('Première')).toBeNull())
      screen.getByText('Seconde')
      expect(confirm).toHaveBeenCalledExactlyOnceWith('Supprimer l\'idée "Première" ?')
      expect(repository.delete).toHaveBeenCalledExactlyOnceWith('first')
      expect(repository.getAll).toHaveBeenCalledOnce()
      expect(screen.queryByRole('complementary')).toBeNull()
    })

    it('deletes nothing when the confirmation is refused', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false)
      const repository = createFakeNoteRepository()
      repository.getAll.mockResolvedValue([aNote({ title: 'Une idée' })])
      renderWith(repository)

      await clickDelete('Une idée')

      screen.getByText('Une idée')
      expect(repository.delete).not.toHaveBeenCalled()
    })

    it('closes the details panel of the deleted note, without reading it again', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      const repository = createFakeNoteRepository()
      const note = aNote({ id: 'abc', title: 'Une idée' })
      repository.getAll.mockResolvedValue([note])
      repository.getById.mockResolvedValue(note)
      repository.delete.mockResolvedValue()
      renderWith(repository)
      await userEvent.click(await screen.findByRole('button', { name: /Une idée/ }))
      await waitFor(() => expect(repository.getById).toHaveBeenCalledOnce())

      await clickDelete('Une idée')

      await waitFor(() => expect(screen.queryByRole('complementary')).toBeNull())
      await screen.findByText(/Aucune idée pour l'instant/)
      expect(repository.getById).toHaveBeenCalledOnce()
      expect(repository.getLinkedNotes).toHaveBeenCalledOnce()
    })

    it('keeps the details panel of another note open', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      const repository = createFakeNoteRepository()
      const first = aNote({ id: 'first', title: 'Première' })
      const second = aNote({ id: 'second', title: 'Seconde' })
      repository.getAll.mockResolvedValue([first, second])
      repository.getById.mockResolvedValue(second)
      repository.delete.mockResolvedValue()
      renderWith(repository)
      await userEvent.click(await screen.findByRole('button', { name: /Seconde/ }))

      await clickDelete('Première')

      await waitFor(() => expect(within(screen.getByRole('list')).queryByText('Première')).toBeNull())
      within(screen.getByRole('complementary')).getByRole('heading', { name: 'Seconde' })
    })

    it('only asks to confirm the deletion when the note holds unsaved modifications', async () => {
      const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
      const repository = createFakeNoteRepository()
      const note = aNote({ id: 'abc', title: 'Une idée' })
      repository.getAll.mockResolvedValue([note])
      repository.getById.mockResolvedValue(note)
      repository.delete.mockResolvedValue()
      renderWith(repository)
      await userEvent.click(await screen.findByRole('button', { name: /Une idée/ }))
      await userEvent.click(within(screen.getByRole('complementary')).getByRole('button', { name: 'Modifier' }))
      await userEvent.type(within(screen.getByRole('complementary')).getByLabelText('Titre'), ' modifiée')

      await clickDelete('Une idée')

      await waitFor(() => expect(screen.queryByRole('complementary')).toBeNull())
      expect(confirm).toHaveBeenCalledOnce()
    })

    it('shows an explicit error and removes the note when it does not exist anymore', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      const repository = createFakeNoteRepository()
      repository.getAll.mockResolvedValue([aNote({ id: 'abc', title: 'Une idée' })])
      repository.delete.mockRejectedValue(new NoteNotFoundError('abc'))
      renderWith(repository)

      await clickDelete('Une idée')

      const alert = await screen.findByRole('alert')
      expect(alert.textContent).toBe("Cette idée n'existe plus.")
      await screen.findByText(/Aucune idée pour l'instant/)
    })

    it('keeps the note and shows an error when the server fails', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      const repository = createFakeNoteRepository()
      repository.getAll.mockResolvedValue([aNote({ title: 'Une idée' })])
      repository.delete.mockRejectedValue(new ApiError(500, 'boom'))
      renderWith(repository)

      await clickDelete('Une idée')

      const alert = await screen.findByRole('alert')
      expect(alert.textContent).toBe('Le serveur a rencontré une erreur, réessaie dans un instant.')
      screen.getByText('Une idée')
    })
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
      render(<MemoryRouter><NotesPage /></MemoryRouter>, { wrapper })
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

    describe('with unsaved modifications', () => {
      afterEach(() => {
        vi.restoreAllMocks()
      })

      async function renderTwoNotesAndEditTheFirst(): Promise<ReturnType<typeof createFakeNoteRepository>> {
        const repository = createFakeNoteRepository()
        const first = aNote({ id: 'first', title: 'Première' })
        const second = aNote({ id: 'second', title: 'Seconde' })
        repository.getAll.mockResolvedValue([first, second])
        repository.getById.mockImplementation(async (id: string) => (id === 'first' ? first : second))
        renderWith(repository)
        await openEdition('Première')
        await userEvent.type(within(panel()).getByLabelText('Titre'), ' modifiée')
        return repository
      }

      function expectStillEditingTheFirstNote(): void {
        expect((within(panel()).getByLabelText('Titre') as HTMLInputElement).value).toBe('Première modifiée')
      }

      it('stays on the note when the user refuses to change note', async () => {
        const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
        await renderTwoNotesAndEditTheFirst()

        await userEvent.click(screen.getByRole('button', { name: /Seconde/ }))

        expect(confirm).toHaveBeenCalledOnce()
        expectStillEditingTheFirstNote()
      })

      it('changes note when the user accepts to lose the modifications', async () => {
        const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
        await renderTwoNotesAndEditTheFirst()

        await userEvent.click(screen.getByRole('button', { name: /Seconde/ }))

        expect(confirm).toHaveBeenCalledOnce()
        within(panel()).getByRole('heading', { name: 'Seconde' })
      })

      it('asks before closing the panel with a click on the note, the close button or Escape', async () => {
        const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
        await renderTwoNotesAndEditTheFirst()

        await userEvent.click(screen.getByRole('button', { name: /^Première/ }))
        await userEvent.click(within(panel()).getByRole('button', { name: 'Fermer le détail' }))
        await userEvent.keyboard('{Escape}')

        expect(confirm).toHaveBeenCalledTimes(3)
        expectStillEditingTheFirstNote()
      })

      it('does not ask when the modifications are undone', async () => {
        const confirm = vi.spyOn(window, 'confirm')
        await renderTwoNotesAndEditTheFirst()
        const titleField = within(panel()).getByLabelText('Titre')

        await userEvent.clear(titleField)
        await userEvent.type(titleField, 'Première')
        await userEvent.click(screen.getByRole('button', { name: /Seconde/ }))

        expect(confirm).not.toHaveBeenCalled()
        within(panel()).getByRole('heading', { name: 'Seconde' })
      })

      it('does not ask for the cancel button, which is already an explicit choice', async () => {
        const confirm = vi.spyOn(window, 'confirm')
        await renderTwoNotesAndEditTheFirst()

        await userEvent.click(within(panel()).getByRole('button', { name: 'Annuler' }))

        expect(confirm).not.toHaveBeenCalled()
        within(panel()).getByRole('button', { name: 'Modifier' })
      })

      it('does not ask after saving', async () => {
        const confirm = vi.spyOn(window, 'confirm')
        const repository = await renderTwoNotesAndEditTheFirst()
        repository.update.mockResolvedValue(aNote({ id: 'first', title: 'Première modifiée' }))

        await userEvent.click(within(panel()).getByRole('button', { name: 'Enregistrer' }))
        await within(panel()).findByRole('button', { name: 'Modifier' })
        await userEvent.click(screen.getByRole('button', { name: /Seconde/ }))

        expect(confirm).not.toHaveBeenCalled()
      })
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
