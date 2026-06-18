import { TRIAGE_KEYS, getTriageCategoryShortLabel } from '../constants/triage'
import type { MouseEvent } from 'react'
import type { HospitalWaitingTime } from '../types/ae'
import { deriveWaitStatusFromText } from '../utils/parseWaitTime'
import { getWaitingTimeTone, getWaitingTimeDot } from '../utils/waitTone'
import { Icon } from './Icon'

export interface HospitalDetailsLabels {
  allTriageCategories: string
  category: string
  address: string
  district: string
  contact: string
  callHospital: string
  viewOnMaps: string
  shortWait: string
  moderateWait: string
  longWait: string
  unknownWait: string
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
    <div className={`flex flex-col gap-5 ${layout === 'columns' ? 'md:grid md:grid-cols-2 md:gap-8' : ''}`}>
      <section>
        <div className="mb-3 flex items-center gap-2">
          <div className={`h-1 w-1 rounded-full ${isDark ? 'bg-neutral-400' : 'bg-neutral-900'}`} />
          <h4 className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
            {labels.allTriageCategories}
          </h4>
        </div>

        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {TRIAGE_KEYS.map((category) => {
            const label = getTriageCategoryShortLabel(category)
            const triage = hospital.triage[category]
            const mainWaitStatus = triage.waitStatus
            const upperBoundStatus = triage.upperBoundText
              ? triage.upperBoundWaitStatus ?? deriveWaitStatusFromText(triage.upperBoundText, mainWaitStatus)
              : null

            return (
              <div
                key={category}
                className={`flex items-center justify-between border px-3 py-2 ${isDark ? 'border-neutral-800' : 'border-neutral-200'
                  }`}
              >
                <span className="flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  <span className={`h-1.5 w-1.5 rounded-full ${getWaitingTimeDot(mainWaitStatus)}`} />
                  {label}
                </span>
                <span className={`text-sm font-bold font-mono tabular-nums tracking-tight ${getWaitingTimeTone(mainWaitStatus, isDark)}`}>
                  {triage.waitingTimeText}
                  {triage.upperBoundText && upperBoundStatus && (
                    <span className="ml-1 opacity-80">
                      <span className={isDark ? 'text-neutral-600' : 'text-neutral-400'}>&ndash;</span>
                      <span className={getWaitingTimeTone(upperBoundStatus, isDark)}> {triage.upperBoundText}</span>
                    </span>
                  )}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-1">
          <div className="flex gap-3">
            <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
              <Icon name="map-pin" className="h-4 w-4" strokeWidth={2} />
            </div>
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-neutral-600' : 'text-neutral-400'}`}>{labels.address}</p>
              <p className={`mt-0.5 text-sm font-medium leading-relaxed ${isDark ? 'text-neutral-200' : 'text-neutral-700'}`}>{hospital.details.address}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                <Icon name="chat" className="h-4 w-4" strokeWidth={2} />
              </div>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-neutral-600' : 'text-neutral-400'}`}>{labels.district}</p>
                <p className={`mt-0.5 text-sm font-medium ${isDark ? 'text-neutral-200' : 'text-neutral-700'}`}>{hospital.details.district}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                <Icon name="phone" className="h-4 w-4" strokeWidth={2} />
              </div>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-neutral-600' : 'text-neutral-400'}`}>{labels.contact}</p>
                <p className={`mt-0.5 text-sm font-medium font-mono ${isDark ? 'text-neutral-200' : 'text-neutral-700'}`}>{hospital.details.phone.display}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          {hospital.details.phone.dialHref && (
            <a
              href={hospital.details.phone.dialHref}
              onClick={onActionClick}
              className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 bg-red-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors duration-150 hover:bg-red-500 sm:flex-none"
            >
              <Icon name="phone" className="h-3.5 w-3.5" strokeWidth={2.5} />
              {labels.callHospital}
            </a>
          )}
          <a
            href={hospital.details.mapsUrl}
            target="_blank"
            rel="noreferrer"
            onClick={onActionClick}
            className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 border border-neutral-900 bg-neutral-900 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors duration-150 hover:bg-neutral-800 dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 sm:flex-none"
          >
            <Icon name="map-pin" className="h-3.5 w-3.5" strokeWidth={2.5} />
            {labels.viewOnMaps}
          </a>
        </div>
      </section>
    </div>
  )
}
