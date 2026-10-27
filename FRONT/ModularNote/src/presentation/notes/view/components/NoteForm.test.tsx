// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { createTestContext } from '../../../../core/di/createTestContext.test-utils'
import { NoteRejectedError } from '../../../../domain/notes/entity/errors/NoteRejectedError'
import { createFakeNoteRepository } from '../../../../domain/notes/repositories/FakeNoteRepository.test-utils'
import { NoteForm } from './NoteForm'

afterEach(cleanup)

describe('NoteForm', () => {
  it('highlights only the title when the title is invalid', async () => {
    const { wrapper } = createTestContext(createFakeNoteRepository())
    render(<NoteForm />, { wrapper })

    await userEvent.click(screen.getByRole('button', { name: "Créer l'idée" }))

    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toBe('Le titre est obligatoire et ne doit pas dépasser 100 caractères.')
    expect(screen.getByLabelText('Titre').getAttribute('aria-invalid')).toBe('true')
    expect(screen.getByLabelText(/Description/).getAttribute('aria-invalid')).toBe('false')
  })

  it('highlights no field when the server rejects the note', async () => {
    const repository = createFakeNoteRepository()
    repository.add.mockRejectedValue(new NoteRejectedError())
    const { wrapper } = createTestContext(repository)
    render(<NoteForm />, { wrapper })

    await userEvent.type(screen.getByLabelText('Titre'), 'Mon idée')
    await userEvent.click(screen.getByRole('button', { name: "Créer l'idée" }))

    await screen.findByRole('alert')
    expect(screen.getByLabelText('Titre').getAttribute('aria-invalid')).toBe('false')
    expect(screen.getByLabelText(/Description/).getAttribute('aria-invalid')).toBe('false')
  })
})
