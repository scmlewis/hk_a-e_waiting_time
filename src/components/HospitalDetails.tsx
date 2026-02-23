import { TRIAGE_KEYS, getTriageCategoryShortLabel } from '../constants/triage'
import type { MouseEvent } from 'react'
import type { HospitalWaitingTime } from '../types/ae'
import { deriveWaitStatusFromText } from '../utils/parseWaitTime'
import { getWaitingTimeTone } from '../utils/waitTone'

export interface HospitalDetailsLabels {
  allTriageCategories: string
  category: string
  address: string
  district: string
  contact: string
  callHospital: string
  viewOnMaps: string
}

interface HospitalDetailsProps {
  isDark: boolean
  labels: HospitalDetailsLabels
  hospital: HospitalWaitingTime
  layout?: 'stack' | 'columns'
  onActionClick?: (event: MouseEvent<HTMLAnchorElement>) => void
}

export function HospitalDetails({
  isDark,
  labels,
  hospital,
  layout = 'stack',
  onActionClick,
}: HospitalDetailsProps) {
  return (
    <div className={layout === 'columns' ? 'grid grid-cols-2 gap-4' : 'space-y-2'}>
      <div>
        <p className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{labels.allTriageCategories}</p>
        <ul className={`mt-1 space-y-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          {TRIAGE_KEYS.map((category) => {
            const label = getTriageCategoryShortLabel(category)
            const triage = hospital.triage[category]
            const mainWaitStatus = triage.waitStatus
            const upperBoundStatus = triage.upperBoundText
              ? triage.upperBoundWaitStatus ?? deriveWaitStatusFromText(triage.upperBoundText, mainWaitStatus)
              : null

            return (
              <li key={category}>
                {labels.category} {label}: <span className={getWaitingTimeTone(mainWaitStatus, isDark)}>{triage.waitingTimeText}</span>
                {triage.upperBoundText && upperBoundStatus && (
                  <>
                    <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>
                      {' '}–{' '}
                    </span>
                    <span className={getWaitingTimeTone(upperBoundStatus, isDark)}>
                      {triage.upperBoundText}
                    </span>
                  </>
                )}
              </li>
            )
          })}
        </ul>
      </div>

      <div className="space-y-2">
        <dl className={`space-y-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          <div>
            <dt className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{labels.address}</dt>
            <dd>{hospital.details.address}</dd>
          </div>
          <div>
            <dt className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{labels.district}</dt>
            <dd>{hospital.details.district}</dd>
          </div>
          <div>
            <dt className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{labels.contact}</dt>
            <dd>{hospital.details.phone.display}</dd>
          </div>
        </dl>
        <div className="flex flex-wrap gap-2 pt-2">
          {hospital.details.phone.dialHref && (
            <a
              href={hospital.details.phone.dialHref}
              onClick={onActionClick}
              className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 motion-reduce:transition-none hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-1"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3.08 5.18 2 2 0 0 1 5.06 3h3a2 2 0 0 1 2 1.72c.12.9.33 1.77.64 2.6a2 2 0 0 1-.45 2.11L9.1 10.58a16 16 0 0 0 4.32 4.32l1.15-1.15a2 2 0 0 1 2.11-.45c.83.31 1.7.52 2.6.64A2 2 0 0 1 22 16.92Z" />
              </svg>
              {labels.callHospital}
            </a>
          )}
          <a
            href={hospital.details.mapsUrl}
            target="_blank"
            rel="noreferrer"
            onClick={onActionClick}
            className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 motion-reduce:transition-none hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-1"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 22s7-5.33 7-12a7 7 0 1 0-14 0c0 6.67 7 12 7 12Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            {labels.viewOnMaps}
          </a>
        </div>
      </div>
    </div>
  )
}
