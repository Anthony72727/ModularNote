import { describe, expect, it } from 'vitest'
import { aNote, createFakeNoteRepository } from '../repositories/FakeNoteRepository.test-utils'
import { GetNotesUseCase } from './GetNotesUseCase'

describe('GetNotesUseCase', () => {
  it('returns every note of the repository', async () => {
    const repository = createFakeNoteRepository()
    const notes = [aNote({ id: '1' }), aNote({ id: '2' })]
    repository.getAll.mockResolvedValue(notes)
    const useCase = new GetNotesUseCase(repository)

    await expect(useCase.execute()).resolves.toBe(notes)
  })

  it('passes the abort signal to the repository', async () => {
    const repository = createFakeNoteRepository()
    repository.getAll.mockResolvedValue([])
    const controller = new AbortController()
    const useCase = new GetNotesUseCase(repository)

    await useCase.execute(controller.signal)

    expect(repository.getAll).toHaveBeenCalledExactlyOnceWith(controller.signal)
  })
})
