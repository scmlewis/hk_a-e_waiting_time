import { Fragment } from 'react'
import type { LanguageMode } from '../constants/labels'
import type { HospitalWaitingTime, TriageCategory } from '../types/ae'
import { HospitalDetails, type HospitalDetailsLabels } from './HospitalDetails'
import type { SortMode } from '../utils/sort'
import { formatDistanceKm } from '../utils/distance'
import { deriveWaitStatusFromText } from '../utils/parseWaitTime'
import { getWaitingTimeTone, getWaitingTimeDot, getWaitingTimeBorderColor } from '../utils/waitTone'
import { Icon } from './Icon'

interface HospitalTableLabels extends HospitalDetailsLabels {
  sortByWaitingTime: string
  sortAlphabetically: string
  sortByNearest: string
  hospital: string
  waitingTime: string
  details: string
  view: string
  hide: string
}

interface HospitalTableProps {
  isDark: boolean
  labels: HospitalTableLabels
  languageMode: LanguageMode
  triageCategoryLabels: Record<TriageCategory, string>
  groups: Array<{ cluster: string; displayCluster: string; hospitals: HospitalWaitingTime[] }>
  sortMode: SortMode
  onSortModeChange: (mode: SortMode) => void
  isNearestSortAvailable: boolean
  selectedCategory: TriageCategory
  expandedHospitalName: string | null
  onToggleExpanded: (hospitalName: string) => void
}

export function HospitalTable({
  isDark,
  labels,
  languageMode,
  triageCategoryLabels,
  groups,
  sortMode,
  onSortModeChange,
  isNearestSortAvailable,
  selectedCategory,
  expandedHospitalName,
  onToggleExpanded,
}: HospitalTableProps) {
  return (
    <section className="hidden overflow-hidden border border-m3-outline-variant md:block">
      <div className="flex items-center gap-2 border-b border-m3-outline-variant bg-m3-surface-container p-3">
        <button
          type="button"
          onClick={() => onSortModeChange('waiting')}
          className={`cursor-pointer px-3 py-1.5 text-xs font-medium tracking-wide transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-primary focus-visible:ring-offset-2 focus-visible:ring-offset-m3-surface ${
            sortMode === 'waiting'
              ? 'bg-m3-primary-container text-m3-on-primary-container'
              : 'text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-container-high'
          }`}
        >
          {labels.sortByWaitingTime}
        </button>
        <button
          type="button"
          onClick={() => onSortModeChange('name')}
          className={`cursor-pointer px-3 py-1.5 text-xs font-medium tracking-wide transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-primary focus-visible:ring-offset-2 focus-visible:ring-offset-m3-surface ${
            sortMode === 'name'
              ? 'bg-m3-primary-container text-m3-on-primary-container'
              : 'text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-container-high'
          }`}
        >
          {labels.sortAlphabetically}
        </button>
        <button
          type="button"
          onClick={() => onSortModeChange('nearest')}
          disabled={!isNearestSortAvailable}
          className={`cursor-pointer px-3 py-1.5 text-xs font-medium tracking-wide transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-primary focus-visible:ring-offset-2 focus-visible:ring-offset-m3-surface disabled:cursor-not-allowed disabled:opacity-40 ${
            sortMode === 'nearest'
              ? 'bg-m3-primary-container text-m3-on-primary-container'
              : 'text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-container-high'
          }`}
        >
          {labels.sortByNearest}
        </button>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead className="border-b border-m3-outline-variant bg-m3-surface-container-low text-left text-[10px] font-medium uppercase tracking-widest text-m3-on-surface-variant">
          <tr>
            <th className="px-4 py-3 font-inherit">{labels.hospital}</th>
            <th className="px-4 py-3 font-inherit">{labels.waitingTime} ({triageCategoryLabels[selectedCategory]})</th>
            <th className="px-4 py-3 font-inherit">{labels.details}</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <Fragment key={group.cluster}>
              <tr>
                <td colSpan={3} className="border-l-2 border-l-m3-primary px-4 pt-5 pb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-m3-on-surface-variant">
                  {group.displayCluster} ({group.hospitals.length})
                </td>
              </tr>

              {group.hospitals.map((hospital) => {
                const selectedTriage = hospital.triage[selectedCategory]
                const isExpanded = expandedHospitalName === hospital.hospitalName
                const detailsId = `hospital-table-details-${hospital.hospitalName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

                return (
                  <Fragment key={hospital.hospitalName}>
                    <tr
                      onClick={() => onToggleExpanded(hospital.hospitalName)}
                      className={`group cursor-pointer border-t border-m3-outline-variant border-l-[4px] transition-colors duration-150 hover:bg-m3-surface-container-low ${getWaitingTimeBorderColor(selectedTriage.waitStatus, isDark)}`}
                    >
                      <td className="px-4 py-3">
                        <div className="text-base font-bold text-m3-on-surface">{hospital.hospitalName}</div>
                        {typeof hospital.distanceKm === 'number' && (
                          <div className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-normal text-m3-on-surface-variant">
                            <Icon name="map-pin" className="h-3 w-3" strokeWidth={2} />
                            {formatDistanceKm(hospital.distanceKm, languageMode)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-m3-on-surface-variant">
                            <span className={`h-1.5 w-1.5 rounded-full ${getWaitingTimeDot(selectedTriage.waitStatus)}`} />
                            {selectedTriage.waitStatus === 'short' ? labels.shortWait : selectedTriage.waitStatus === 'moderate' ? labels.moderateWait : selectedTriage.waitStatus === 'long' ? labels.longWait : labels.unknownWait}
                          </span>
                          <span className={`text-lg font-bold font-mono tracking-tight ${getWaitingTimeTone(selectedTriage.waitStatus, isDark)}`}>
                            {selectedTriage.waitingTimeText}
                          </span>
                          {selectedTriage.upperBoundText && (
                            <span className="text-sm font-normal text-m3-on-surface-variant/60">
                              (<span className={`font-semibold font-mono ${getWaitingTimeTone(selectedTriage.upperBoundWaitStatus ?? deriveWaitStatusFromText(selectedTriage.upperBoundText, selectedTriage.waitStatus), isDark)}`}>
                                {selectedTriage.upperBoundText}
                              </span>)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Icon
                          name="chevron-down"
                          className="h-4 w-4 -rotate-90 text-m3-on-surface-variant group-hover:text-m3-on-surface"
                        />
                      </td>
                    </tr>

                    <tr className="border-t border-m3-outline-variant bg-m3-surface-container-lowest">
                      <td colSpan={3} className="px-4 text-m3-on-surface-variant">
                        <div
                          id={detailsId}
                          role="region"
                          aria-label={`${hospital.hospitalName} details`}
                          aria-hidden={!isExpanded}
                          className={`grid overflow-hidden transition-[grid-template-rows,opacity,margin] duration-200 motion-reduce:transition-none ${
                            isExpanded ? 'my-3 grid-rows-[1fr] opacity-100' : 'my-0 grid-rows-[0fr] opacity-0'
                          }`}
                        >
                          <div className="min-h-0 overflow-hidden">
                            <HospitalDetails isDark={isDark} labels={labels} hospital={hospital} layout="columns" />
                          </div>
                        </div>
                      </td>
                    </tr>
                  </Fragment>
                )
              })}
            </Fragment>
          ))}
        </tbody>
      </table>
    </section>
  )
}
