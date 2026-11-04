// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { createTestContext } from '../../../core/di/createTestContext.test-utils'
import { ApiError } from '../../../core/http/ApiError'
import { aNote, createFakeNoteRepository } from '../../../domain/notes/repositories/FakeNoteRepository.test-utils'
import { MAX_SUGGESTIONS, useLinkedNoteSearchViewModel } from './useLinkedNoteSearchViewModel'

afterEach(cleanup)

describe('useLinkedNoteSearchViewModel', () => {
  it('proposes nothing while the search is blank', async () => {
    const repository = createFakeNoteRepository()
    repository.getAll.mockResolvedValue([aNote()])
    const { wrapper } = createTestContext(repository)
    const { result } = renderHook(() => useLinkedNoteSearchViewModel([]), { wrapper })
    await waitFor(() => expect(repository.getAll).toHaveBeenCalledOnce())

    act(() => result.current.changeSearch('   '))

    expect(result.current.suggestions).toEqual([])
    expect(result.current.hasNoResult).toBe(false)
  })

  it('proposes the matching notes, newest first, without the excluded ones', async () => {
    const repository = createFakeNoteRepository()
    const older = aNote({ id: 'older', title: 'Idée ancienne', createdAt: new Date('2026-10-01T10:00:00Z') })
    const newer = aNote({ id: 'newer', title: 'Idée récente', createdAt: new Date('2026-10-20T10:00:00Z') })
    const excluded = aNote({ id: 'excluded', title: 'Idée choisie' })
    const other = aNote({ id: 'other', title: 'Autre chose' })
    repository.getAll.mockResolvedValue([older, newer, excluded, other])
    const { wrapper } = createTestContext(repository)
    const { result } = renderHook(() => useLinkedNoteSearchViewModel(['excluded']), { wrapper })

    act(() => result.current.changeSearch('idee'))

    await waitFor(() => expect(result.current.suggestions.map((note) => note.id)).toEqual(['newer', 'older']))
  })

  it('limits the proposed notes and tells that there are more', async () => {
    const repository = createFakeNoteRepository()
    repository.getAll.mockResolvedValue(
      Array.from({ length: MAX_SUGGESTIONS + 1 }, (_, index) => aNote({ id: `note-${index}`, title: 'Idée' })),
    )
    const { wrapper } = createTestContext(repository)
    const { result } = renderHook(() => useLinkedNoteSearchViewModel([]), { wrapper })

    act(() => result.current.changeSearch('idée'))

    await waitFor(() => expect(result.current.suggestions).toHaveLength(MAX_SUGGESTIONS))
    expect(result.current.hasMoreSuggestions).toBe(true)
  })

  it('does not tell that there are more when every matching note is proposed', async () => {
    const repository = createFakeNoteRepository()
    repository.getAll.mockResolvedValue(
      Array.from({ length: MAX_SUGGESTIONS }, (_, index) => aNote({ id: `note-${index}`, title: 'Idée' })),
    )
    const { wrapper } = createTestContext(repository)
    const { result } = renderHook(() => useLinkedNoteSearchViewModel([]), { wrapper })

    act(() => result.current.changeSearch('idée'))

    await waitFor(() => expect(result.current.suggestions).toHaveLength(MAX_SUGGESTIONS))
    expect(result.current.hasMoreSuggestions).toBe(false)
  })

  it('reaches an old note beyond the limit by typing its whole title', async () => {
    const repository = createFakeNoteRepository()
    const old = aNote({ id: 'old', title: 'ef', createdAt: new Date('2020-01-01T10:00:00Z') })
    const newer = Array.from({ length: MAX_SUGGESTIONS }, (_, index) =>
      aNote({ id: `note-${index}`, title: `Refonte ${index}`, createdAt: new Date('2026-10-01T10:00:00Z') }),
    )
    repository.getAll.mockResolvedValue([...newer, old])
    const { wrapper } = createTestContext(repository)
    const { result } = renderHook(() => useLinkedNoteSearchViewModel([]), { wrapper })

    act(() => result.current.changeSearch('ef'))

    await waitFor(() => expect(result.current.suggestions[0]?.id).toBe('old'))
  })

  it('tells when no note matches', async () => {
    const repository = createFakeNoteRepository()
    repository.getAll.mockResolvedValue([aNote({ title: 'Une idée' })])
    const { wrapper } = createTestContext(repository)
    const { result } = renderHook(() => useLinkedNoteSearchViewModel([]), { wrapper })

    act(() => result.current.changeSearch('projet'))

    await waitFor(() => expect(result.current.hasNoResult).toBe(true))
  })

  it('shows the loading error only while the user is searching', async () => {
    const repository = createFakeNoteRepository()
    repository.getAll.mockRejectedValue(new ApiError(500, 'boom'))
    const { wrapper } = createTestContext(repository)
    const { result } = renderHook(() => useLinkedNoteSearchViewModel([]), { wrapper })
    await waitFor(() => expect(repository.getAll).toHaveBeenCalledOnce())
    expect(result.current.error).toBeNull()

    act(() => result.current.changeSearch('idée'))

    await waitFor(() =>
      expect(result.current.error).toBe('Le serveur a rencontré une erreur, réessaie dans un instant.'),
    )
  })
})
