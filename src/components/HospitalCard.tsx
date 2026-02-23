import type { HospitalWaitingTime, TriageCategory } from '../types/ae'
import type { LanguageMode } from '../constants/labels'
import { HospitalDetails, type HospitalDetailsLabels } from './HospitalDetails'
import { deriveWaitStatusFromText } from '../utils/parseWaitTime'
import { formatDistanceKm } from '../utils/distance'
import { getWaitingTimeTone } from '../utils/waitTone'

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

  return (
    <article
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
      className={`enter-fade-up group cursor-pointer rounded-2xl border p-3 shadow-sm backdrop-blur transition duration-200 motion-reduce:transition-none hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
        isDark ? 'bg-slate-900/80 focus-visible:ring-slate-500' : 'bg-white/90 focus-visible:ring-slate-400'
      } ${
        isExpanded
          ? isDark
            ? 'border-sky-600 ring-2 ring-sky-900/60'
            : 'border-sky-200 ring-2 ring-sky-100'
          : isDark
            ? 'border-slate-800/90'
            : 'border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className={`text-lg font-bold tracking-tight ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
            {hospital.hospitalName}
          </h3>
          {typeof hospital.distanceKm === 'number' && (
            <p className={`mt-1 inline-flex items-center gap-1 text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M12 21s7-5.33 7-11a7 7 0 1 0-14 0c0 5.67 7 11 7 11Z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              {formatDistanceKm(hospital.distanceKm, languageMode)}
            </p>
          )}
          <p className={`mt-1.5 text-base font-semibold tracking-tight md:text-lg ${getWaitingTimeTone(selectedTriage.waitStatus, isDark)}`}>
            {selectedTriage.waitingTimeText}
            {selectedTriage.upperBoundText && (
              <>
                <span className={`mx-1 text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>(</span>
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
        <svg
          viewBox="0 0 24 24"
          className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          } ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      <div
        id={detailsId}
        role="region"
        aria-label={`${hospital.hospitalName} details`}
        aria-hidden={!isExpanded}
        className={`grid overflow-hidden transition-[grid-template-rows,opacity,margin] duration-300 motion-reduce:transition-none ${
          isExpanded ? 'mt-2.5 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className={`space-y-2.5 rounded-xl border p-3 text-sm ${
              isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-slate-50/90'
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
