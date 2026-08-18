// src/components/HospitalMap.tsx
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { HospitalWaitingTime, TriageCategory } from '../types/ae'
import type { AppLabels, LanguageMode } from '../constants/labels'
import type { Coordinate } from '../utils/distance'
import type { LocationStatus } from '../hooks/useLocation'
import { WAIT_STATUS_COLORS } from '../constants/mapColors'
import { HK_MAP_BOUNDS } from '../utils/geoProjection'
import { MapPopup } from './MapPopup'
import { trackEvent } from '../services/telemetry'

interface HospitalMapProps {
  hospitals: HospitalWaitingTime[]
  selectedTriageCategory: TriageCategory
  userLocation: Coordinate | null
  locationStatus: LocationStatus
  loading: boolean
  error: string | null
  labels: AppLabels
  languageMode: LanguageMode
}

const HK_CENTER: L.LatLngTuple = [22.35, 114.15]
const HK_ZOOM = 11

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'

export function HospitalMap({
  hospitals,
  selectedTriageCategory,
  userLocation,
  locationStatus,
  loading,
  error,
  labels,
  languageMode,
}: HospitalMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.CircleMarker>>(new Map())
  const userMarkerRef = useRef<L.CircleMarker | null>(null)
  const userCircleRef = useRef<L.CircleMarker | null>(null)
  const popupRef = useRef<L.Popup | null>(null)
  const [popupContainer, setPopupContainer] = useState<HTMLDivElement | null>(null)
  const [selectedName, setSelectedName] = useState<string | null>(null)

  const marked = hospitals.filter((h) => h.details.location)
  const selected = marked.find((h) => h.hospitalName === selectedName) ?? null

  const selectHospital = (hospital: HospitalWaitingTime) => {
    setSelectedName(hospital.hospitalName)
    void trackEvent('map_marker_tapped', { hospitalName: hospital.hospitalName })
  }

  const closePopup = () => setSelectedName(null)

  // Escape key closes popup
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedName(null)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  // Initialise map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: HK_CENTER,
      zoom: HK_ZOOM,
      zoomControl: false,
      attributionControl: true,
      maxBounds: [
        [HK_MAP_BOUNDS.latMin, HK_MAP_BOUNDS.lngMin],
        [HK_MAP_BOUNDS.latMax, HK_MAP_BOUNDS.lngMax],
      ],
      maxBoundsViscosity: 0.8,
      minZoom: 10,
    })

    L.tileLayer(TILE_URL, {
      attribution: TILE_ATTRIBUTION,
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map)

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Sync hospital markers
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    const nextNames = new Set(marked.map((h) => h.hospitalName))

    // Remove stale markers
    markersRef.current.forEach((marker, name) => {
      if (!nextNames.has(name)) {
        marker.remove()
        markersRef.current.delete(name)
      }
    })

    // Add / update markers
    for (const hospital of marked) {
      const { lat, lng } = hospital.details.location!
      const color = WAIT_STATUS_COLORS[hospital.triage[selectedTriageCategory].waitStatus]
      const isSelected = hospital.hospitalName === selectedName
      const radius = isSelected ? 12 : 9

      let marker = markersRef.current.get(hospital.hospitalName)
      if (!marker) {
        marker = L.circleMarker([lat, lng], {
          radius,
          fillColor: color,
          fillOpacity: 1,
          color: isSelected ? '#ffffff' : 'transparent',
          weight: isSelected ? 3 : 0,
          bubblingMouseEvents: false,
        })
          .addTo(map)
          .on('click', () => selectHospital(hospital))

        marker.bindTooltip(
          `${hospital.hospitalName}: ${hospital.triage[selectedTriageCategory].waitingTimeText}`,
          { direction: 'top', offset: [0, -10], className: 'map-tooltip' },
        )

        markersRef.current.set(hospital.hospitalName, marker)
      } else {
        marker.setRadius(radius)
        marker.setStyle({
          fillColor: color,
          color: isSelected ? '#ffffff' : 'transparent',
          weight: isSelected ? 3 : 0,
        })
        marker.setTooltipContent(
          `${hospital.hospitalName}: ${hospital.triage[selectedTriageCategory].waitingTimeText}`,
        )
      }
    }
  }, [marked, selectedTriageCategory, selectedName])

  // Sync user-location marker
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    if (userLocation && locationStatus === 'ready') {
      if (!userCircleRef.current) {
        userCircleRef.current = L.circleMarker([userLocation.lat, userLocation.lng], {
          radius: 20,
          fillColor: '#3b82f6',
          fillOpacity: 0.12,
          color: 'transparent',
          weight: 0,
          interactive: false,
        }).addTo(map)
      } else {
        userCircleRef.current.setLatLng([userLocation.lat, userLocation.lng])
      }

      if (!userMarkerRef.current) {
        userMarkerRef.current = L.circleMarker([userLocation.lat, userLocation.lng], {
          radius: 6,
          fillColor: '#3b82f6',
          fillOpacity: 1,
          color: '#ffffff',
          weight: 2,
          interactive: false,
        }).addTo(map)
      } else {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng])
      }
    } else {
      if (userCircleRef.current) {
        userCircleRef.current.remove()
        userCircleRef.current = null
      }
      if (userMarkerRef.current) {
        userMarkerRef.current.remove()
        userMarkerRef.current = null
      }
    }
  }, [userLocation, locationStatus])

  // Sync popup
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    // Remove existing popup
    map.closePopup()
    popupRef.current = null
    setPopupContainer(null)

    if (selected && selected.details.location) {
      const container = document.createElement('div')
      const popup = L.popup({
        maxWidth: 360,
        minWidth: 280,
        autoPan: true,
        autoPanPadding: L.point(40, 40),
        closeButton: false,
        className: 'custom-map-popup',
      })
        .setLatLng([selected.details.location.lat, selected.details.location.lng])
        .setContent(container)
        .openOn(map)

      popup.on('close', () => {
        setSelectedName(null)
        setPopupContainer(null)
      })

      popupRef.current = popup
      setPopupContainer(container)
    }
  }, [selected])

  if (loading) {
    return (
      <div
        className="aspect-[4/3] w-full animate-pulse border border-m3-outline-variant bg-m3-surface-container-high"
        aria-hidden="true"
      />
    )
  }

  if (error && hospitals.length === 0) {
    return (
      <p className="border border-m3-error/50 p-4 text-sm text-m3-error" role="alert">
        {error}
      </p>
    )
  }

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden border border-m3-outline-variant">
      <div ref={mapRef} className="h-full w-full bg-[#0E1513]" role="img" aria-label={labels.viewMap} />

      {popupContainer &&
        selected &&
        createPortal(
          <MapPopup
            hospital={selected}
            selectedTriageCategory={selectedTriageCategory}
            languageMode={languageMode}
            labels={labels.hospitalCard}
            onClose={closePopup}
          />,
          popupContainer,
        )}
    </div>
  )
}
