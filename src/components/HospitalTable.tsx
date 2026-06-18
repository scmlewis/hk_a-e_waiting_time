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
        isDark ? 'border-neutral-800' : 'border-neutral-200'
      }`}
    >
      <div className={`flex items-center gap-2 border-b p-3 ${isDark ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-200 bg-neutral-50'}`}>
        <button
          type="button"
          onClick={() => onSortModeChange('waiting')}
          className={`cursor-pointer px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-1 ${
            sortMode === 'waiting'
              ? isDark
                ? 'bg-neutral-100 text-neutral-900'
                : 'bg-neutral-900 text-white'
              : isDark
                ? 'text-neutral-500 hover:text-neutral-300'
                : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          {labels.sortByWaitingTime}
        </button>
        <button
          type="button"
          onClick={() => onSortModeChange('name')}
          className={`cursor-pointer px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-1 ${
            sortMode === 'name'
              ? isDark
                ? 'bg-neutral-100 text-neutral-900'
                : 'bg-neutral-900 text-white'
              : isDark
                ? 'text-neutral-500 hover:text-neutral-300'
                : 'text-neutral-500 hover:text-neutral-700'
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
              ? isDark
                ? 'bg-neutral-100 text-neutral-900'
                : 'bg-neutral-900 text-white'
              : isDark
                ? 'text-neutral-500 hover:text-neutral-300'
                : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          {labels.sortByNearest}
        </button>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead
          className={`border-b text-left text-[10px] font-bold uppercase tracking-widest ${
            isDark ? 'border-neutral-800 text-neutral-500' : 'border-neutral-200 text-neutral-400'
          }`}
        >
          <tr>
            <th className="px-4 py-3 font-inherit">{labels.hospital}</th>
            <th className="px-4 py-3 font-inherit">{labels.waitingTime} ({triageCategoryLabels[selectedCategory]})</th>
            <th className="px-4 py-3 font-inherit">{labels.details}</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <Fragment key={group.cluster}>
              <tr className={`border-t border-b ${isDark ? 'border-neutral-800 bg-neutral-900' : 'border-neutral-200 bg-neutral-100'}`}>
                <td colSpan={3} className={`px-4 py-2 text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>
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
                      className={`group cursor-pointer border-t transition-colors duration-100 motion-reduce:transition-none ${
                        isDark ? 'border-neutral-800/60 hover:bg-neutral-900' : 'border-neutral-100 hover:bg-neutral-50'
                      }`}
                    >
                      <td className={`px-4 py-3 font-medium ${isDark ? 'text-neutral-100' : 'text-neutral-900'}`}>
                        <div className="text-sm font-semibold">{hospital.hospitalName}</div>
                        {typeof hospital.distanceKm === 'number' && (
                          <div className={`mt-0.5 inline-flex items-center gap-1 text-[11px] font-normal ${isDark ? 'text-neutral-600' : 'text-neutral-400'}`}>
                            <Icon name="map-pin" className="h-3 w-3" strokeWidth={2} />
                            {formatDistanceKm(hospital.distanceKm, languageMode)}
                          </div>
                        )}
                      </td>
                      <td className={`px-4 py-3 text-base font-bold font-mono tracking-tight ${getWaitingTimeTone(selectedTriage.waitStatus, isDark)}`}>
                        <span className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${getWaitingTimeDot(selectedTriage.waitStatus)}`} />
                            {selectedTriage.waitStatus === 'short' ? labels.shortWait : selectedTriage.waitStatus === 'moderate' ? labels.moderateWait : selectedTriage.waitStatus === 'long' ? labels.longWait : labels.unknownWait}
                          </span>
                          <span>{selectedTriage.waitingTimeText}</span>
                        </span>
                        {selectedTriage.upperBoundText && (
                          <span className="ml-2 text-sm font-normal">
                            <span className={isDark ? 'text-neutral-600' : 'text-neutral-400'}>(</span>
                            <span
                              className={`font-semibold font-mono ${getWaitingTimeTone(selectedTriage.upperBoundWaitStatus ?? deriveWaitStatusFromText(selectedTriage.upperBoundText, selectedTriage.waitStatus), isDark)}`}
                            >
                              {selectedTriage.upperBoundText}
                            </span>
                            <span className={isDark ? 'text-neutral-600' : 'text-neutral-400'}>)</span>
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
                          className={`cursor-pointer border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-1 ${
                            isDark
                              ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                              : 'border-neutral-300 text-neutral-600 hover:bg-neutral-100'
                          }`}
                        >
                          {isExpanded ? labels.hide : labels.view}
                        </button>
                      </td>
                    </tr>

                    <tr className={`border-t ${isDark ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-100 bg-neutral-50'}`}>
                      <td colSpan={3} className={`px-4 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
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
