import { useCallback, useState } from 'react'
import type { Coordinate } from '../utils/distance'
import { trackEvent } from '../services/telemetry'

export type LocationStatus = 'idle' | 'locating' | 'ready' | 'unsupported' | 'denied' | 'error'

export function useLocation() {
  const [userLocation, setUserLocation] = useState<Coordinate | null>(null)
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle')

  const handleUseMyLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationStatus('unsupported')
      void trackEvent('location_permission_result', { result: 'unsupported' })
      return
    }

    setLocationStatus('locating')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }

        setUserLocation(nextLocation)
        setLocationStatus('ready')
        void trackEvent('location_permission_result', { result: 'granted' })
      },
      (geoError) => {
        setLocationStatus(geoError.code === geoError.PERMISSION_DENIED ? 'denied' : 'error')
        void trackEvent('location_permission_result', {
          result: geoError.code === geoError.PERMISSION_DENIED ? 'denied' : 'error',
          code: geoError.code,
        })
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      },
    )
  }, [])

  const handleClearLocation = useCallback(() => {
    setUserLocation(null)
    setLocationStatus('idle')
  }, [])

  return {
    userLocation,
    locationStatus,
    handleUseMyLocation,
    handleClearLocation,
  }
}
