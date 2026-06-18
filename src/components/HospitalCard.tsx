import { useEffect, useRef } from 'react'
import type { HospitalWaitingTime, TriageCategory } from '../types/ae'
import type { LanguageMode } from '../constants/labels'
import { HospitalDetails, type HospitalDetailsLabels } from './HospitalDetails'
import { deriveWaitStatusFromText } from '../utils/parseWaitTime'
import { formatDistanceKm } from '../utils/distance'
import { getWaitingTimeTone, getWaitingTimeBorder, getWaitingTimeDot } from '../utils/waitTone'
import { Icon } from './Icon'

type HospitalCardLabels = HospitalDetailsLabels

interface HospitalCardProps {
  isDark: boolean
  labels: HospitalCardLabels
  languageMode: LanguageMode
  hospital: HospitalWaitingTime
  selectedCategory: TriageCategory
  isExpanded: boolean
  onToggleExpanded: () => void
}

export function HospitalCard({
  isDark,
  labels,
  languageMode,
  hospital,
  selectedCategory,
  isExpanded,
  onToggleExpanded,
}: HospitalCardProps) {
  const selectedTriage = hospital.triage[selectedCategory]
  const detailsId = `hospital-details-${hospital.hospitalName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  const cardRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (isExpanded && cardRef.current) {
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 150)
    }
  }, [isExpanded])

  return (
    <article
      ref={cardRef}
      onClick={onToggleExpanded}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onToggleExpanded()
        }
      }}
      aria-expanded={isExpanded}
      aria-controls={detailsId}
      className={`enter-fade-up cursor-pointer border-l-[3px] border-r border-y border-t-transparent border-b-transparent p-4 transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${getWaitingTimeBorder(selectedTriage.waitStatus, isDark)} ${
        isExpanded
          ? 'bg-neutral-900'
          : 'bg-transparent hover:bg-neutral-900/50'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold tracking-tight truncate text-white">
            {hospital.hospitalName}
          </h3>
          {typeof hospital.distanceKm === 'number' && (
            <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-neutral-400">
              <Icon name="map-pin" className="h-3 w-3" strokeWidth={2} />
              {formatDistanceKm(hospital.distanceKm, languageMode)}
            </p>
          )}
          <p className={`mt-2 flex items-center gap-2 text-base font-bold font-mono tracking-tight ${getWaitingTimeTone(selectedTriage.waitStatus, isDark)}`}>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              <span className={`h-1.5 w-1.5 rounded-full ${getWaitingTimeDot(selectedTriage.waitStatus)}`} />
              {selectedTriage.waitStatus === 'short' ? labels.shortWait : selectedTriage.waitStatus === 'moderate' ? labels.moderateWait : selectedTriage.waitStatus === 'long' ? labels.longWait : labels.unknownWait}
            </span>
            <span>{selectedTriage.waitingTimeText}</span>
            {selectedTriage.upperBoundText && (
              <>
                <span className="text-sm font-normal text-neutral-500">(</span>
                <span
                  className={`text-sm font-semibold font-mono ${getWaitingTimeTone(selectedTriage.upperBoundWaitStatus ?? deriveWaitStatusFromText(selectedTriage.upperBoundText, selectedTriage.waitStatus), isDark)}`}
                >
                  {selectedTriage.upperBoundText}
                </span>
                <span className="text-sm font-normal text-neutral-500">)</span>
              </>
            )}
          </p>
        </div>
        <Icon
          name="chevron-down"
          className={`h-4 w-4 flex-shrink-0 transition-transform duration-150 ${isExpanded ? 'rotate-180' : ''} text-neutral-400`}
        />
      </div>

      <div
        id={detailsId}
        role="region"
        aria-label={`${hospital.hospitalName} details`}
        aria-hidden={!isExpanded}
        className={`grid overflow-hidden transition-[grid-template-rows,opacity,margin] duration-200 motion-reduce:transition-none ${isExpanded ? 'mt-3 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-0'}`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="space-y-3 border-t border-neutral-700 pt-3 text-sm">
            <HospitalDetails
              isDark={isDark}
              labels={labels}
              hospital={hospital}
              onActionClick={(event) => {
                event.stopPropagation()
              }}
            />
          </div>
        </div>
      </div>
    </article>
  )
}
