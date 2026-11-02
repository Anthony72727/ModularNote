import { describe, expect, it } from 'vitest'
import { NoteValidationError } from '../entity/errors/NoteValidationError'
import { aNote, createFakeNoteRepository } from '../repositories/FakeNoteRepository.test-utils'
import { UpdateNoteUseCaseImpl } from './UpdateNoteUseCaseImpl'

describe('UpdateNoteUseCaseImpl', () => {
  it('saves the validated content and returns the saved note', async () => {
    const repository = createFakeNoteRepository()
    const saved = aNote({ id: 'abc', title: 'Mon idée', description: null })
    repository.update.mockResolvedValue(saved)
    const useCase = new UpdateNoteUseCaseImpl(repository)

    const result = await useCase.execute('abc', '  Mon idée ', '   ')

    expect(repository.update).toHaveBeenCalledExactlyOnceWith('abc', { title: 'Mon idée', description: null })
    expect(result).toBe(saved)
  })

  it('rejects invalid content without calling the repository', async () => {
    const repository = createFakeNoteRepository()
    const useCase = new UpdateNoteUseCaseImpl(repository)

    await expect(useCase.execute('abc', '   ', null)).rejects.toBeInstanceOf(NoteValidationError)
    expect(repository.update).not.toHaveBeenCalled()
  })

  it('lets a repository error go through', async () => {
    const repository = createFakeNoteRepository()
    const failure = new Error('network down')
    repository.update.mockRejectedValue(failure)
    const useCase = new UpdateNoteUseCaseImpl(repository)

    await expect(useCase.execute('abc', 'Titre', null)).rejects.toBe(failure)
  })
})
