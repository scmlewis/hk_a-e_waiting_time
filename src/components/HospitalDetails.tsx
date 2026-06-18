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
          <div className="h-1 w-1 rounded-full bg-m3-primary" />
          <h4 className="text-[10px] font-medium uppercase tracking-widest text-m3-on-surface-variant">
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
                className="flex items-center justify-between border border-m3-outline-variant px-3 py-2"
              >
                <span className="flex items-center gap-2 text-xs font-medium text-m3-on-surface-variant">
                  <span className={`h-1.5 w-1.5 rounded-full ${getWaitingTimeDot(mainWaitStatus)}`} />
                  {label}
                </span>
                <span className={`text-sm font-bold font-mono tabular-nums tracking-tight ${getWaitingTimeTone(mainWaitStatus, isDark)}`}>
                  {triage.waitingTimeText}
                  {triage.upperBoundText && upperBoundStatus && (
                    <span className="ml-1 opacity-80">
                      <span className="text-m3-on-surface-variant/60">&ndash;</span>
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
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center text-m3-on-surface-variant">
              <Icon name="map-pin" className="h-4 w-4" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-m3-on-surface-variant">{labels.address}</p>
              <p className="mt-0.5 text-sm font-medium leading-relaxed text-m3-on-surface">{hospital.details.address}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center text-m3-on-surface-variant">
                <Icon name="chat" className="h-4 w-4" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-m3-on-surface-variant">{labels.district}</p>
                <p className="mt-0.5 text-sm font-medium text-m3-on-surface">{hospital.details.district}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center text-m3-on-surface-variant">
                <Icon name="phone" className="h-4 w-4" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-m3-on-surface-variant">{labels.contact}</p>
                <p className="mt-0.5 text-sm font-medium font-mono text-m3-on-surface">{hospital.details.phone.display}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          {hospital.details.phone.dialHref && (
            <a
              href={hospital.details.phone.dialHref}
              onClick={onActionClick}
              className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 bg-m3-error-container px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-m3-on-error-container transition-colors duration-200 hover:bg-m3-error-container/80 sm:flex-none"
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
            className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 border border-m3-primary bg-transparent px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-m3-primary transition-colors duration-200 hover:bg-m3-primary-container sm:flex-none"
          >
            <Icon name="map-pin" className="h-3.5 w-3.5" strokeWidth={2.5} />
            {labels.viewOnMaps}
          </a>
        </div>
      </section>
    </div>
  )
}
