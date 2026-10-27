// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { createTestContext } from '../../../../core/di/createTestContext.test-utils'
import { ApiError } from '../../../../core/http/ApiError'
import type { Note } from '../../../../domain/notes/entity/models/Note'
import { aNote, createFakeNoteRepository } from '../../../../domain/notes/repositories/FakeNoteRepository.test-utils'
import { noteQueryKeys } from '../../viewModel/noteQueryKeys'
import { QuickAddNote } from './QuickAddNote'

afterEach(cleanup)

function renderQuickAdd() {
  const repository = createFakeNoteRepository()
  const context = createTestContext(repository)
  render(<QuickAddNote />, { wrapper: context.wrapper })
  const field = screen.getByRole('textbox', { name: 'Nouvelle idée' }) as HTMLInputElement
  return { repository, field, ...context }
}

describe('QuickAddNote', () => {
  it('is focused as soon as it is shown', () => {
    const { field } = renderQuickAdd()

    expect(document.activeElement).toBe(field)
  })

  it('creates a note with the trimmed title on Enter, then empties the field and keeps the focus', async () => {
    const { repository, field, queryClient } = renderQuickAdd()
    const created = aNote({ id: 'new', title: 'Mon idée', description: null })
    repository.add.mockResolvedValue(created)
    queryClient.setQueryData<Note[]>(noteQueryKeys.all, [])

    await userEvent.type(field, '  Mon idée  {Enter}')

    expect(repository.add).toHaveBeenCalledExactlyOnceWith({ title: 'Mon idée', description: null })
    await waitFor(() => expect(field.value).toBe(''))
    expect(document.activeElement).toBe(field)
    expect(queryClient.getQueryData(noteQueryKeys.all)).toEqual([created])
  })

  it('shows the notes just added, newest first', async () => {
    const { repository, field } = renderQuickAdd()
    repository.add
      .mockResolvedValueOnce(aNote({ id: '1', title: 'Première' }))
      .mockResolvedValueOnce(aNote({ id: '2', title: 'Seconde' }))

    await userEvent.type(field, 'Première{Enter}')
    await waitFor(() => expect(field.value).toBe(''))
    await userEvent.type(field, 'Seconde{Enter}')

    const recent = await screen.findByRole('region', { name: "Ajoutées à l'instant" })
    await waitFor(() =>
      expect(within(recent).getAllByRole('listitem').map((item) => item.firstChild?.textContent)).toEqual([
        'Seconde',
        'Première',
      ]),
    )
  })

  it.each(['', '   '])('does nothing on Enter when the field is blank (%j)', async (text: string) => {
    const { repository, field } = renderQuickAdd()

    await userEvent.type(field, `${text}{Enter}`)

    expect(repository.add).not.toHaveBeenCalled()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('ignores Enter while a character is being composed (accents, IME)', () => {
    const { repository, field } = renderQuickAdd()
    fireEvent.change(field, { target: { value: 'Idée' } })

    fireEvent.keyDown(field, { key: 'Enter', isComposing: true })

    expect(repository.add).not.toHaveBeenCalled()
  })

  it('does not create a duplicate when Enter is pressed again while the note is being sent', async () => {
    const { repository, field } = renderQuickAdd()
    repository.add.mockReturnValue(new Promise<Note>(() => {}))

    await userEvent.type(field, 'Mon idée{Enter}')
    await screen.findByText('Ajout…')
    await userEvent.keyboard('{Enter}{Enter}')

    expect(repository.add).toHaveBeenCalledOnce()
  })

  it('keeps the text and shows an error when the note cannot be saved', async () => {
    const { repository, field } = renderQuickAdd()
    repository.add.mockRejectedValue(new ApiError(500, 'boom'))

    await userEvent.type(field, 'Mon idée{Enter}')

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Le serveur a rencontré une erreur, réessaie dans un instant.',
    )
    expect(field.value).toBe('Mon idée')
    expect(field.getAttribute('aria-invalid')).toBe('true')
  })
})
