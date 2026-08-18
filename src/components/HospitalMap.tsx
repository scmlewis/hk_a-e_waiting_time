// src/components/HospitalMap.tsx
import { useEffect, useState } from 'react'
import type { HospitalWaitingTime, TriageCategory } from '../types/ae'
import type { AppLabels, LanguageMode } from '../constants/labels'
import type { Coordinate } from '../utils/distance'
import type { LocationStatus } from '../hooks/useLocation'
import { projectToSvg, kmToViewBoxPx, HK_MAP_VIEWBOX } from '../utils/geoProjection'
import { WAIT_STATUS_COLORS } from '../constants/mapColors'
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

function useIsNarrow(): boolean {
  const [narrow, setNarrow] = useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(max-width: 768px)').matches
      : false,
  )

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia('(max-width: 768px)')
    const handler = () => setNarrow(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return narrow
}

const POPUP_WIDTH = Math.min(360, HK_MAP_VIEWBOX.width - HK_MAP_VIEWBOX.padding * 2)
const POPUP_HEIGHT = 170

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
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const isNarrow = useIsNarrow()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedName(null)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const marked = hospitals.filter((hospital) => hospital.details.location)
  const selected = marked.find((hospital) => hospital.hospitalName === selectedName) ?? null

  const selectHospital = (hospital: HospitalWaitingTime) => {
    setSelectedName(hospital.hospitalName)
    void trackEvent('map_marker_tapped', { hospitalName: hospital.hospitalName })
  }

  const closePopup = () => setSelectedName(null)

  const selectedPoint = selected?.details.location
    ? projectToSvg(selected.details.location.lat, selected.details.location.lng)
    : null

  let popupX: number = HK_MAP_VIEWBOX.padding
  let popupY: number = HK_MAP_VIEWBOX.padding
  if (selectedPoint) {
    popupX = selectedPoint.x - POPUP_WIDTH / 2
    popupY = isNarrow
      ? HK_MAP_VIEWBOX.height - POPUP_HEIGHT - HK_MAP_VIEWBOX.padding
      : selectedPoint.y - POPUP_HEIGHT - 12
    popupX = Math.max(HK_MAP_VIEWBOX.padding, Math.min(popupX, HK_MAP_VIEWBOX.width - POPUP_WIDTH - HK_MAP_VIEWBOX.padding))
    popupY = Math.max(HK_MAP_VIEWBOX.padding, Math.min(popupY, HK_MAP_VIEWBOX.height - POPUP_HEIGHT - HK_MAP_VIEWBOX.padding))
  }

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

  const userPoint = userLocation ? projectToSvg(userLocation.lat, userLocation.lng) : null
  const radius = kmToViewBoxPx(5)

  return (
    <div
      className="aspect-[4/3] w-full overflow-hidden border border-m3-outline-variant"
    >
      <svg
        viewBox={`0 0 ${HK_MAP_VIEWBOX.width} ${HK_MAP_VIEWBOX.height}`}
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full"
        role="img"
        aria-label={labels.viewMap}
      >
        <rect width={HK_MAP_VIEWBOX.width} height={HK_MAP_VIEWBOX.height} className="fill-m3-surface-container" />
        <rect
          width={HK_MAP_VIEWBOX.width}
          height={HK_MAP_VIEWBOX.height}
          fill="transparent"
          onClick={closePopup}
        />

        {/* Simplified HK coastline – rendered behind markers */}
        <g aria-hidden="true">
          <path d="M 130 417 L 762 417 L 762 56 L 130 56 Z" fill="#3A5550" fillOpacity={0.6} stroke="#7AA89E" strokeWidth={2} />
          <path d="M 509 450 L 527 467 L 581 450 L 544 417 Z" fill="#3A5550" fillOpacity={0.6} stroke="#7AA89E" strokeWidth={2} />
          <path d="M 435 516 L 491 483 L 544 483 L 617 483 L 671 500 L 617 550 L 544 550 L 491 550 Z" fill="#3A5550" fillOpacity={0.6} stroke="#7AA89E" strokeWidth={2} />
          <path d="M 76 533 L 166 500 L 257 533 L 166 566 Z" fill="#3A5550" fillOpacity={0.6} stroke="#7AA89E" strokeWidth={2} />
          <path d="M 320 555 L 340 548 L 355 555 L 340 562 Z" fill="#3A5550" fillOpacity={0.6} stroke="#7AA89E" strokeWidth={2} />
        </g>

        {userPoint && locationStatus === 'ready' && (
          <>
            <circle cx={userPoint.x} cy={userPoint.y} r={radius} fill="rgba(59,130,246,0.12)" />
            <circle data-testid="user-location" role="img" aria-label={labels.useMyLocation} cx={userPoint.x} cy={userPoint.y} r={6} fill="#3b82f6" stroke="#ffffff" strokeWidth={2} />
          </>
        )}

        {marked.map((hospital) => {
          const point = projectToSvg(hospital.details.location!.lat, hospital.details.location!.lng)
          const color = WAIT_STATUS_COLORS[hospital.triage[selectedTriageCategory].waitStatus]
          const isSelected = hospital.hospitalName === selectedName
          return (
            <circle
              key={hospital.hospitalName}
              cx={point.x}
              cy={point.y}
              r={isSelected ? 12 : 9}
              fill={color}
              stroke={isSelected ? '#ffffff' : 'transparent'}
              strokeWidth={isSelected ? 3 : 0}
              role="button"
              tabIndex={0}
              aria-label={`${hospital.hospitalName}: ${hospital.triage[selectedTriageCategory].waitingTimeText}`}
              className="cursor-pointer outline-none focus-visible:stroke-white"
              onClick={(event) => {
                event.stopPropagation()
                selectHospital(hospital)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  event.stopPropagation()
                  selectHospital(hospital)
                }
              }}
            />
          )
        })}

        {selected && selectedPoint && (
          <foreignObject x={popupX} y={popupY} width={POPUP_WIDTH} height={POPUP_HEIGHT}>
            <MapPopup
              hospital={selected}
              selectedTriageCategory={selectedTriageCategory}
              languageMode={languageMode}
              labels={labels.hospitalCard}
              onClose={closePopup}
            />
          </foreignObject>
        )}
      </svg>
    </div>
  )
}
