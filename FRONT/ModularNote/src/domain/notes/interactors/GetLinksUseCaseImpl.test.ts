import { describe, expect, it } from 'vitest'
import { createFakeNoteRepository } from '../repositories/FakeNoteRepository.test-utils'
import { GetLinksUseCaseImpl } from './GetLinksUseCaseImpl'

describe('GetLinksUseCaseImpl', () => {
  it('reads the links through the repository', async () => {
    const repository = createFakeNoteRepository()
    const links = [{ id: 'link', noteAId: 'a', noteBId: 'b' }]
    repository.getAllLinks.mockResolvedValue(links)
    const controller = new AbortController()

    const result = await new GetLinksUseCaseImpl(repository).execute(controller.signal)

    expect(repository.getAllLinks).toHaveBeenCalledExactlyOnceWith(controller.signal)
    expect(result).toBe(links)
  })
})
