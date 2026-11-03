import { describe, expect, it } from 'vitest'
import { NoteNotFoundError } from '../entity/errors/NoteNotFoundError'
import { createFakeNoteRepository } from '../repositories/FakeNoteRepository.test-utils'
import { DeleteNoteUseCaseImpl } from './DeleteNoteUseCaseImpl'

describe('DeleteNoteUseCaseImpl', () => {
  it('deletes the note through the repository', async () => {
    const repository = createFakeNoteRepository()
    repository.delete.mockResolvedValue()
    const useCase = new DeleteNoteUseCaseImpl(repository)

    await useCase.execute('abc')

    expect(repository.delete).toHaveBeenCalledExactlyOnceWith('abc')
  })

  it('lets a repository error go through', async () => {
    const repository = createFakeNoteRepository()
    const failure = new NoteNotFoundError('abc')
    repository.delete.mockRejectedValue(failure)
    const useCase = new DeleteNoteUseCaseImpl(repository)

    await expect(useCase.execute('abc')).rejects.toBe(failure)
  })
})
