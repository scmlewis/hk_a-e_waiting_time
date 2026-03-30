import { useCallback, useEffect, useRef, useState } from 'react'
import type { HospitalWaitingTime } from '../types/ae'
import { fetchWaitingTimes } from '../services/aeService'
import { isSourceDataStale } from '../utils/time'
import { REFRESH_INTERVAL_SECONDS } from '../constants/thresholds'
import { trackError, trackEvent } from '../services/telemetry'

export function useWaitingTimes() {
  const [hospitals, setHospitals] = useState<HospitalWaitingTime[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshError, setRefreshError] = useState<string | null>(null)
  const [isStale, setIsStale] = useState(false)
  const [isSourceStale, setIsSourceStale] = useState(false)
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL_SECONDS)
  const hasDataRef = useRef(false)

  const loadData = useCallback(async () => {
    const hasCachedData = hasDataRef.current

    if (hasCachedData) {
      setIsRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const data = await fetchWaitingTimes()
      setHospitals(data)
      hasDataRef.current = data.length > 0
      setError(null)
      setRefreshError(null)
      setIsStale(false)

      const sourceUpdateTime = data[0]?.updateTime ?? ''
      setIsSourceStale(isSourceDataStale(sourceUpdateTime))

      void trackEvent('wait_data_loaded', {
        hospitalCount: data.length,
        hasUnknownWait: data.some((hospital) =>
          Object.values(hospital.triage).some((triage) => triage.waitStatus === 'unknown'),
        ),
        sourceStale: isSourceDataStale(sourceUpdateTime),
        refreshType: hasCachedData ? 'background' : 'initial',
      })
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : 'Unable to load data'
      setIsStale(hasCachedData)

      void trackError(fetchError, {
        area: 'wait_data_load',
        refreshType: hasCachedData ? 'background' : 'initial',
        hasCachedData,
      })

      if (!hasCachedData) {
        setError(message)
      } else {
        setRefreshError(message)
      }
    } finally {
      setLoading(false)
      setIsRefreshing(false)
      setCountdown(REFRESH_INTERVAL_SECONDS)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          void loadData()
          return REFRESH_INTERVAL_SECONDS
        }
        return current - 1
      })
    }, 1000)

    return () => {
      window.clearInterval(timer)
    }
  }, [loadData])

  const sourceUpdateTime = hospitals[0]?.updateTime ?? ''

  return {
    hospitals,
    loading,
    isRefreshing,
    error,
    refreshError,
    isStale,
    isSourceStale,
    countdown,
    sourceUpdateTime,
    loadData,
  }
}
