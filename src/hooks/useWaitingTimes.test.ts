import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useWaitingTimes } from './useWaitingTimes'
import { fetchWaitingTimes } from '../services/aeService'

// Mock dependencies
vi.mock('../services/aeService', () => ({
  fetchWaitingTimes: vi.fn(),
}))

vi.mock('../services/telemetry', () => ({
  trackEvent: vi.fn(),
  trackError: vi.fn(),
}))

vi.mock('../utils/time', () => ({
  isSourceDataStale: vi.fn().mockReturnValue(false),
}))

const mockHospitalData = [
  {
    hospitalName: 'Test Hospital',
    updateTime: '12:00',
    details: { cluster: 'KWC', address: '123 Fake St' },
    triage: {
      'III': {
        waitStatus: 'moderate',
        waitingTimeText: '2 hours',
      }
    }
  }
]

describe('useWaitingTimes hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches waiting times on mount successfully', async () => {
    (fetchWaitingTimes as any).mockResolvedValue(mockHospitalData)

    const { result } = renderHook(() => useWaitingTimes())

    // Initial state
    expect(result.current.loading).toBe(true)

    // Wait for the load to finish
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(fetchWaitingTimes).toHaveBeenCalledTimes(1)
    expect(result.current.hospitals).toEqual(mockHospitalData)
    expect(result.current.sourceUpdateTime).toBe('12:00')
    expect(result.current.error).toBeNull()
    expect(result.current.isStale).toBe(false)
  })

  it('handles fetch request failures properly', async () => {
    (fetchWaitingTimes as any).mockRejectedValue(new Error('Network Error'))

    const { result } = renderHook(() => useWaitingTimes())

    // Wait for load to finish
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(fetchWaitingTimes).toHaveBeenCalledTimes(1)
    expect(result.current.error).toBe('Network Error')
    expect(result.current.hospitals).toEqual([])
  })

  it('sets isRefreshing flag when polling again from cached data', async () => {
    (fetchWaitingTimes as any).mockResolvedValue(mockHospitalData)

    const { result } = renderHook(() => useWaitingTimes())

    // First mount
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Manually fetch again
    act(() => {
      result.current.loadData()
    })

    expect(result.current.isRefreshing).toBe(true)

    // Wait for the re-fetch to complete
    await waitFor(() => {
      expect(result.current.isRefreshing).toBe(false)
    })
    
    expect(fetchWaitingTimes).toHaveBeenCalledTimes(2)
  })

  it('triggers refresh automatically when countdown reaches 0', async () => {
    vi.useFakeTimers()
    ;(fetchWaitingTimes as any).mockResolvedValue(mockHospitalData)

    const { result } = renderHook(() => useWaitingTimes())

    // Initial fetch happens on mount
    await act(async () => {
      vi.advanceTimersByTime(1)
    })
    
    // Fast-forward 300 seconds
    await act(async () => {
      vi.advanceTimersByTime(300000)
    })

    // Should have triggered a re-fetch (called twice: once on mount, once after 300s)
    expect(fetchWaitingTimes).toHaveBeenCalledTimes(2)
    
    vi.useRealTimers()
  })
})
