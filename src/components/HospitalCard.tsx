import { useEffect, useRef } from 'react'
import type { HospitalWaitingTime, TriageCategory } from '../types/ae'
import type { LanguageMode } from '../constants/labels'
import { HospitalDetails, type HospitalDetailsLabels } from './HospitalDetails'
import { deriveWaitStatusFromText } from '../utils/parseWaitTime'
import { formatDistanceKm } from '../utils/distance'
import { getWaitingTimeTone } from '../utils/waitTone'
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
      // Slight delay to allow CSS transitions to calculate layout
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
      className={`enter-fade-up group cursor-pointer rounded-2xl border p-4 shadow-sm backdrop-blur-xl transition-all duration-300 motion-reduce:transition-none hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${isDark ? 'bg-slate-900/60 focus-visible:ring-indigo-500' : 'bg-white/70 focus-visible:ring-indigo-400'
        } ${isExpanded
          ? isDark
            ? 'border-indigo-500/50 ring-2 ring-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
            : 'border-indigo-400/50 ring-2 ring-indigo-400/20 shadow-[0_0_15px_rgba(129,140,248,0.2)]'
          : isDark
            ? 'border-slate-700/80 hover:border-slate-600'
            : 'border-slate-200/80 hover:border-slate-300'
        }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className={`text-lg font-bold tracking-tight ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
            {hospital.hospitalName}
          </h3>
          {typeof hospital.distanceKm === 'number' && (
            <p className={`mt-1 inline-flex items-center gap-1 text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              <Icon name="map-pin" className="h-3.5 w-3.5" strokeWidth={1.8} />
              {formatDistanceKm(hospital.distanceKm, languageMode)}
            </p>
          )}
          <p className={`mt-1.5 text-base font-semibold tracking-tight md:text-lg ${getWaitingTimeTone(selectedTriage.waitStatus, isDark)}`}>
            <span className={`mr-2 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold uppercase leading-none ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'}`}>
              {selectedTriage.waitStatus === 'short' ? labels.shortWait : selectedTriage.waitStatus === 'moderate' ? labels.moderateWait : selectedTriage.waitStatus === 'long' ? labels.longWait : labels.unknownWait}
            </span>
            {selectedTriage.waitingTimeText}
            {selectedTriage.upperBoundText && (
              <>
                <span className={`ml-1.5 text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>(</span>
                <span
                  className={`text-sm font-medium md:text-base ${getWaitingTimeTone(selectedTriage.upperBoundWaitStatus ?? deriveWaitStatusFromText(selectedTriage.upperBoundText, selectedTriage.waitStatus), isDark)}`}
                >
                  {selectedTriage.upperBoundText}
                </span>
                <span className={`text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>)</span>
              </>
            )}
          </p>
        </div>
        <Icon
          name="chevron-down"
          className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 ${isDark ? 'text-slate-400' : 'text-slate-500'
            } ${isExpanded ? 'rotate-180' : ''}`}
        />
      </div>

      <div
        id={detailsId}
        role="region"
        aria-label={`${hospital.hospitalName} details`}
        aria-hidden={!isExpanded}
        className={`grid overflow-hidden transition-[grid-template-rows,opacity,margin] duration-300 motion-reduce:transition-none ${isExpanded ? 'mt-2.5 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-0'
          }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className={`space-y-2.5 rounded-xl border p-3 text-sm ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-slate-50/90'
              }`}
          >
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
