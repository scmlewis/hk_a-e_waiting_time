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
              className="inline-flex cursor-pointer items-center rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 motion-reduce:transition-none hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-1"
            >
              {labels.callHospital}
            </a>
          )}
          <a
            href={hospital.details.mapsUrl}
            target="_blank"
            rel="noreferrer"
            onClick={onActionClick}
            className="inline-flex cursor-pointer items-center rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 motion-reduce:transition-none hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-1"
          >
            {labels.viewOnMaps}
          </a>
        </div>
      </div>
    </div>
  )
}
