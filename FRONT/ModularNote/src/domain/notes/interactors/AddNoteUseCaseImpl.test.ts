import { describe, expect, it } from 'vitest'
import { NoteValidationError } from '../entity/errors/NoteValidationError'
import { aNote, createFakeNoteRepository } from '../repositories/FakeNoteRepository.test-utils'
import { AddNoteUseCaseImpl } from './AddNoteUseCaseImpl'

describe('AddNoteUseCaseImpl', () => {
  it('saves the validated note and returns the saved note', async () => {
    const repository = createFakeNoteRepository()
    const saved = aNote({ title: 'Mon idée', description: null })
    repository.add.mockResolvedValue(saved)
    const useCase = new AddNoteUseCaseImpl(repository)

    const result = await useCase.execute('  Mon idée ', '   ')

    expect(repository.add).toHaveBeenCalledExactlyOnceWith({ title: 'Mon idée', description: null })
    expect(result).toBe(saved)
  })

  it('rejects an invalid note without calling the repository', async () => {
    const repository = createFakeNoteRepository()
    const useCase = new AddNoteUseCaseImpl(repository)

    await expect(useCase.execute('   ', null)).rejects.toBeInstanceOf(NoteValidationError)
    expect(repository.add).not.toHaveBeenCalled()
  })

  it('lets a repository error go through', async () => {
    const repository = createFakeNoteRepository()
    const failure = new Error('network down')
    repository.add.mockRejectedValue(failure)
    const useCase = new AddNoteUseCaseImpl(repository)

    await expect(useCase.execute('Titre', null)).rejects.toBe(failure)
  })
})
