import { Fragment } from 'react'
import type { LanguageMode } from '../constants/labels'
import type { HospitalWaitingTime, TriageCategory } from '../types/ae'
import { HospitalDetails, type HospitalDetailsLabels } from './HospitalDetails'
import type { SortMode } from '../utils/sort'
import { formatDistanceKm } from '../utils/distance'
import { deriveWaitStatusFromText } from '../utils/parseWaitTime'
import { getWaitingTimeTone, getWaitingTimeDot } from '../utils/waitTone'
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
    <section
      className={`hidden overflow-hidden border md:block transition-colors duration-200 ${
        isDark ? 'border-neutral-700' : 'border-neutral-200'
      }`}
    >
      <div className={`flex items-center gap-2 border-b border-neutral-700 p-3`}>
        <button
          type="button"
          onClick={() => onSortModeChange('waiting')}
          className={`cursor-pointer px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-1 ${
            sortMode === 'waiting'
              ? 'bg-neutral-100 text-neutral-900'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          {labels.sortByWaitingTime}
        </button>
        <button
          type="button"
          onClick={() => onSortModeChange('name')}
          className={`cursor-pointer px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-1 ${
            sortMode === 'name'
              ? 'bg-neutral-100 text-neutral-900'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          {labels.sortAlphabetically}
        </button>
        <button
          type="button"
          onClick={() => onSortModeChange('nearest')}
          disabled={!isNearestSortAvailable}
          className={`cursor-pointer px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40 ${
            sortMode === 'nearest'
              ? 'bg-neutral-100 text-neutral-900'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          {labels.sortByNearest}
        </button>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead className="border-b border-neutral-700 text-left text-[10px] font-bold uppercase tracking-widest text-neutral-400">
          <tr>
            <th className="px-4 py-3 font-inherit">{labels.hospital}</th>
            <th className="px-4 py-3 font-inherit">{labels.waitingTime} ({triageCategoryLabels[selectedCategory]})</th>
            <th className="px-4 py-3 font-inherit">{labels.details}</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <Fragment key={group.cluster}>
              <tr className="border-y border-neutral-700 bg-neutral-900">
                <td colSpan={3} className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-neutral-200">
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
                      className="group cursor-pointer border-t border-neutral-800 transition-colors duration-100 hover:bg-neutral-900"
                    >
                      <td className="px-4 py-3">
                        <div className="text-sm font-bold text-white">{hospital.hospitalName}</div>
                        {typeof hospital.distanceKm === 'number' && (
                          <div className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-normal text-neutral-400">
                            <Icon name="map-pin" className="h-3 w-3" strokeWidth={2} />
                            {formatDistanceKm(hospital.distanceKm, languageMode)}
                          </div>
                        )}
                      </td>
                      <td className={`px-4 py-3 text-base font-bold font-mono tracking-tight ${getWaitingTimeTone(selectedTriage.waitStatus, isDark)}`}>
                        <span className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                            <span className={`h-1.5 w-1.5 rounded-full ${getWaitingTimeDot(selectedTriage.waitStatus)}`} />
                            {selectedTriage.waitStatus === 'short' ? labels.shortWait : selectedTriage.waitStatus === 'moderate' ? labels.moderateWait : selectedTriage.waitStatus === 'long' ? labels.longWait : labels.unknownWait}
                          </span>
                          <span>{selectedTriage.waitingTimeText}</span>
                        </span>
                        {selectedTriage.upperBoundText && (
                          <span className="ml-2 text-sm font-normal">
                            <span className="text-neutral-500">(</span>
                            <span
                              className={`font-semibold font-mono ${getWaitingTimeTone(selectedTriage.upperBoundWaitStatus ?? deriveWaitStatusFromText(selectedTriage.upperBoundText, selectedTriage.waitStatus), isDark)}`}
                            >
                              {selectedTriage.upperBoundText}
                            </span>
                            <span className="text-neutral-500">)</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleExpanded(hospital.hospitalName);
                          }}
                          aria-expanded={isExpanded}
                          aria-controls={detailsId}
                          className="cursor-pointer border border-neutral-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-neutral-300 transition-colors duration-150 hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-1"
                        >
                          {isExpanded ? labels.hide : labels.view}
                        </button>
                      </td>
                    </tr>

                    <tr className="border-t border-neutral-800 bg-neutral-950">
                      <td colSpan={3} className="px-4 text-neutral-300">
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
