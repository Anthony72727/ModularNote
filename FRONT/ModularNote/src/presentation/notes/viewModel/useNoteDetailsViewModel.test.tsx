// @vitest-environment jsdom
import { cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { createTestContext } from '../../../core/di/createTestContext.test-utils'
import { NoteNotFoundError } from '../../../domain/notes/entity/errors/NoteNotFoundError'
import type { Note } from '../../../domain/notes/entity/models/Note'
import { aNote, createFakeNoteRepository } from '../../../domain/notes/repositories/FakeNoteRepository.test-utils'
import { noteQueryKeys } from './noteQueryKeys'
import { useNoteDetailsViewModel } from './useNoteDetailsViewModel'

afterEach(cleanup)

describe('useNoteDetailsViewModel', () => {
  it('shows the note of the list right away, then the note sent by the API', async () => {
    const repository = createFakeNoteRepository()
    const fromList = aNote({ id: 'abc', title: 'Ancien titre' })
    const fromApi = aNote({ id: 'abc', title: 'Titre à jour' })
    let answer: (note: Note) => void = () => {}
    repository.getById.mockReturnValue(new Promise<Note>((resolve) => (answer = resolve)))
    const { queryClient, wrapper } = createTestContext(repository)
    queryClient.setQueryData<Note[]>(noteQueryKeys.all, [fromList])

    const { result } = renderHook(() => useNoteDetailsViewModel('abc'), { wrapper })

    expect(result.current.note).toBe(fromList)
    answer(fromApi)
    await waitFor(() => expect(result.current.note).toBe(fromApi))
    expect(result.current.error).toBeNull()
  })

  it('shows an error without retrying when the note does not exist anymore', async () => {
    const repository = createFakeNoteRepository()
    repository.getById.mockRejectedValue(new NoteNotFoundError('abc'))
    const { wrapper } = createTestContext(repository)

    const { result } = renderHook(() => useNoteDetailsViewModel('abc'), { wrapper })

    await waitFor(() => expect(result.current.error).toBe("Cette idée n'existe plus."))
    expect(result.current.note).toBeNull()
    expect(repository.getById).toHaveBeenCalledOnce()
  })
})
