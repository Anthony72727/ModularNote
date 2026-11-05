// @vitest-environment jsdom
import { act, cleanup, fireEvent, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { useCanvasModeViewModel } from './useCanvasModeViewModel'

afterEach(cleanup)

describe('useCanvasModeViewModel', () => {
  it('starts in navigation, with the list of modes closed', () => {
    const { result } = renderHook(() => useCanvasModeViewModel())

    expect(result.current.mode).toBe('navigation')
    expect(result.current.isMenuOpen).toBe(false)
  })

  it('switches mode and closes the list when a mode is chosen', () => {
    const { result } = renderHook(() => useCanvasModeViewModel())

    act(() => result.current.toggleMenu())
    expect(result.current.isMenuOpen).toBe(true)

    act(() => result.current.chooseMode('move'))

    expect(result.current.mode).toBe('move')
    expect(result.current.isMenuOpen).toBe(false)
  })

  it('switches mode with the D and N keys', () => {
    const { result } = renderHook(() => useCanvasModeViewModel())

    fireEvent.keyDown(window, { key: 'd' })
    expect(result.current.mode).toBe('move')

    fireEvent.keyDown(window, { key: 'N' })
    expect(result.current.mode).toBe('navigation')
  })

  it('ignores the keys combined with Ctrl, and those typed in a field', () => {
    const { result } = renderHook(() => useCanvasModeViewModel())
    const input = document.createElement('input')
    document.body.append(input)

    fireEvent.keyDown(window, { key: 'd', ctrlKey: true })
    fireEvent.keyDown(input, { key: 'd' })

    expect(result.current.mode).toBe('navigation')
    input.remove()
  })

  it('closes the list with Escape', () => {
    const { result } = renderHook(() => useCanvasModeViewModel())
    act(() => result.current.toggleMenu())

    fireEvent.keyDown(window, { key: 'Escape' })

    expect(result.current.isMenuOpen).toBe(false)
  })
})
