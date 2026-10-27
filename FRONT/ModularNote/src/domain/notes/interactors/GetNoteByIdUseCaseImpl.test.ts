import { describe, expect, it } from 'vitest'
import { NoteNotFoundError } from '../entity/errors/NoteNotFoundError'
import { aNote, createFakeNoteRepository } from '../repositories/FakeNoteRepository.test-utils'
import { GetNoteByIdUseCaseImpl } from './GetNoteByIdUseCaseImpl'

describe('GetNoteByIdUseCaseImpl', () => {
  it('returns the note with the given id', async () => {
    const repository = createFakeNoteRepository()
    const note = aNote({ id: 'abc' })
    repository.getById.mockResolvedValue(note)
    const controller = new AbortController()
    const useCase = new GetNoteByIdUseCaseImpl(repository)

    await expect(useCase.execute('abc', controller.signal)).resolves.toBe(note)
    expect(repository.getById).toHaveBeenCalledExactlyOnceWith('abc', controller.signal)
  })

  it('lets NoteNotFoundError go through', async () => {
    const repository = createFakeNoteRepository()
    repository.getById.mockRejectedValue(new NoteNotFoundError('abc'))
    const useCase = new GetNoteByIdUseCaseImpl(repository)

    await expect(useCase.execute('abc')).rejects.toBeInstanceOf(NoteNotFoundError)
  })
})
