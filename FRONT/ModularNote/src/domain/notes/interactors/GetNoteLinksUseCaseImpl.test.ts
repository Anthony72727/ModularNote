import { describe, expect, it } from 'vitest'
import { aNote, createFakeNoteRepository } from '../repositories/FakeNoteRepository.test-utils'
import { GetNoteLinksUseCaseImpl } from './GetNoteLinksUseCaseImpl'

describe('GetNoteLinksUseCaseImpl', () => {
  it('reads the linked notes through the repository', async () => {
    const repository = createFakeNoteRepository()
    const linked = [aNote({ id: 'linked' })]
    repository.getLinkedNotes.mockResolvedValue(linked)
    const controller = new AbortController()

    const result = await new GetNoteLinksUseCaseImpl(repository).execute('abc', controller.signal)

    expect(repository.getLinkedNotes).toHaveBeenCalledExactlyOnceWith('abc', controller.signal)
    expect(result).toBe(linked)
  })
})
