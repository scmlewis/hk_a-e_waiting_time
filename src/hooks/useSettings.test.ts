import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSettings } from './useSettings'

describe('useSettings hook', () => {
  beforeEach(() => {
    window.localStorage.clear()

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  it('should initialize with default states', () => {
    const { result } = renderHook(() => useSettings())

    expect(result.current.languageMode).toBe('en')
    expect(result.current.isDark).toBe(true)
  })

  it('should toggle language mode correctly', () => {
    const { result } = renderHook(() => useSettings())

    act(() => {
      result.current.toggleLanguageMode()
    })

    expect(result.current.languageMode).toBe('zh-HK')
    expect(window.localStorage.getItem('ewt_language_mode')).toBe('zh-HK')

    act(() => {
      result.current.toggleLanguageMode()
    })

    expect(result.current.languageMode).toBe('en')
  })

  it('should initialize from localStorage if available', () => {
    window.localStorage.setItem('ewt_language_mode', 'zh-HK')

    const { result } = renderHook(() => useSettings())

    expect(result.current.languageMode).toBe('zh-HK')
    expect(result.current.isDark).toBe(true)
  })
})
