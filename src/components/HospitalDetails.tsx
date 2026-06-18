import { TRIAGE_KEYS, getTriageCategoryShortLabel } from '../constants/triage'
import type { MouseEvent } from 'react'
import type { HospitalWaitingTime } from '../types/ae'
import { deriveWaitStatusFromText } from '../utils/parseWaitTime'
import { getWaitingTimeTone } from '../utils/waitTone'
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
      {/* Triage Section */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <div className={`h-1 w-1 rounded-full ${isDark ? 'bg-sky-500' : 'bg-indigo-500'}`} />
          <h4 className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {labels.allTriageCategories}
          </h4>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
                className={`flex items-center justify-between rounded-lg border px-3 py-2 transition-colors ${isDark ? 'border-slate-800 bg-slate-800/20' : 'border-slate-100 bg-slate-50/50'
                  }`}
              >
                <span className={`text-[13px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {label}
                </span>
                <span className={`text-sm font-bold tabular-nums tracking-tight ${getWaitingTimeTone(mainWaitStatus, isDark)}`}>
                  {triage.waitingTimeText}
                  {triage.upperBoundText && upperBoundStatus && (
                    <span className="ml-1 opacity-80">
                      <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>–</span>
                      <span className={getWaitingTimeTone(upperBoundStatus, isDark)}> {triage.upperBoundText}</span>
                    </span>
                  )}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      {/* Info & Actions Section */}
      <section className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-1">
          {/* Address */}
          <div className="flex gap-3">
            <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
              <Icon name="map-pin" className="h-4 w-4" />
            </div>
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{labels.address}</p>
              <p className={`mt-0.5 text-sm font-medium leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{hospital.details.address}</p>
            </div>
          </div>

          {/* District & Phone */}
          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                <Icon name="chat" className="h-4 w-4" strokeWidth={2} />
              </div>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{labels.district}</p>
                <p className={`mt-0.5 text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{hospital.details.district}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                <Icon name="phone" className="h-4 w-4" />
              </div>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{labels.contact}</p>
                <p className={`mt-0.5 text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{hospital.details.phone.display}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-2 flex flex-wrap gap-2.5">
          {hospital.details.phone.dialHref && (
            <a
              href={hospital.details.phone.dialHref}
              onClick={onActionClick}
              className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-900/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-rose-500 hover:shadow-rose-900/20 active:translate-y-0 sm:flex-none"
            >
              <Icon name="phone" className="h-4 w-4" strokeWidth={2.5} />
              {labels.callHospital}
            </a>
          )}
          <a
            href={hospital.details.mapsUrl}
            target="_blank"
            rel="noreferrer"
            onClick={onActionClick}
            className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-900/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-500 hover:shadow-sky-900/20 active:translate-y-0 sm:flex-none"
          >
            <Icon name="map-pin" className="h-4 w-4" strokeWidth={2.5} />
            {labels.viewOnMaps}
          </a>
        </div>
      </section>
    </div>
  )
}
