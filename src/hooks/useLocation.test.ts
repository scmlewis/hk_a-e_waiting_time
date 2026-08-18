import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useLocation } from './useLocation'

// Mock trackEvent from telemetry
vi.mock('../services/telemetry', () => ({
  trackEvent: vi.fn(),
  trackError: vi.fn()
}))

describe('useLocation hook', () => {
  const originalGeolocation = global.navigator.geolocation

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default mock implementation
    const mockGeolocation = {
      getCurrentPosition: vi.fn(),
      watchPosition: vi.fn(),
      clearWatch: vi.fn(),
    }
    
    Object.defineProperty(navigator, 'geolocation', {
      value: mockGeolocation,
      configurable: true,
      writable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('initially sets status to idle and userLocation to null', () => {
    const { result } = renderHook(() => useLocation())
    
    expect(result.current.locationStatus).toBe('idle')
    expect(result.current.userLocation).toBeNull()
  })

  it('sets status to unsupported if geolocation is not in navigator', () => {
    Object.defineProperty(navigator, 'geolocation', {
      value: undefined,
      configurable: true,
    })

    const { result } = renderHook(() => useLocation())

    act(() => {
      result.current.handleUseMyLocation()
    })

    expect(result.current.locationStatus).toBe('unsupported')
  })

  it('requests location successfully and updates userLocation to granted', () => {
    const mockPosition = {
      coords: {
        latitude: 22.3193,
        longitude: 114.1694
      }
    }

    navigator.geolocation.getCurrentPosition = vi.fn().mockImplementation((successCallback) => {
      successCallback(mockPosition)
    })

    const { result } = renderHook(() => useLocation())

    act(() => {
      result.current.handleUseMyLocation()
    })

    expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalled()
    expect(result.current.locationStatus).toBe('ready')
    expect(result.current.userLocation).toEqual({ lat: 22.3193, lng: 114.1694 })
  })

  it('sets status to denied if permission is refused', () => {
    const mockGeoError = {
      code: 1, // PERMISSION_DENIED
      PERMISSION_DENIED: 1,
    }

    navigator.geolocation.getCurrentPosition = vi.fn().mockImplementation((_success, errorCallback) => {
      errorCallback(mockGeoError)
    })

    const { result } = renderHook(() => useLocation())

    act(() => {
      result.current.handleUseMyLocation()
    })

    expect(result.current.locationStatus).toBe('denied')
  })

  it('sets status to error on other geolocation errors', () => {
    const mockGeoError = {
      code: 2, // POSITION_UNAVAILABLE
      PERMISSION_DENIED: 1,
    }

    navigator.geolocation.getCurrentPosition = vi.fn().mockImplementation((_success, errorCallback) => {
      errorCallback(mockGeoError)
    })

    const { result } = renderHook(() => useLocation())

    act(() => {
      result.current.handleUseMyLocation()
    })

    expect(result.current.locationStatus).toBe('error')
  })

  it('clears location data successfully', () => {
    const { result } = renderHook(() => useLocation())

    act(() => {
      result.current.handleClearLocation()
    })

    expect(result.current.userLocation).toBeNull()
    expect(result.current.locationStatus).toBe('idle')
  })
})
