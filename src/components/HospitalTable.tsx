import { Fragment } from 'react'
import type { LanguageMode } from '../constants/labels'
import type { HospitalWaitingTime, TriageCategory } from '../types/ae'
import { HospitalDetails, type HospitalDetailsLabels } from './HospitalDetails'
import type { SortMode } from '../utils/sort'
import { formatDistanceKm } from '../utils/distance'
import { deriveWaitStatusFromText } from '../utils/parseWaitTime'
import { getWaitingTimeTone } from '../utils/waitTone'

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
      className={`hidden overflow-hidden rounded-2xl border shadow-[0_8px_24px_rgba(15,23,42,0.08)] backdrop-blur md:block ${
        isDark ? 'border-indigo-900/40 bg-slate-900/85' : 'border-slate-200 bg-white/90'
      }`}
    >
      <div className={`flex items-center gap-2 border-b p-3 ${isDark ? 'border-indigo-900/40 bg-indigo-950/20' : 'border-indigo-100 bg-indigo-50/55'}`}>
        <button
          type="button"
          onClick={() => onSortModeChange('waiting')}
          className={`cursor-pointer rounded-md px-3 py-1.5 text-sm transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-1 ${
            sortMode === 'waiting'
              ? isDark
                ? 'bg-slate-100 text-slate-900 shadow-sm'
                : 'bg-slate-900 text-white shadow-sm'
              : isDark
                ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                : 'bg-white text-slate-800 hover:bg-slate-100'
          }`}
        >
          {labels.sortByWaitingTime}
        </button>
        <button
          type="button"
          onClick={() => onSortModeChange('name')}
          className={`cursor-pointer rounded-md px-3 py-1.5 text-sm transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-1 ${
            sortMode === 'name'
              ? isDark
                ? 'bg-slate-100 text-slate-900 shadow-sm'
                : 'bg-slate-900 text-white shadow-sm'
              : isDark
                ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                : 'bg-white text-slate-800 hover:bg-slate-100'
          }`}
        >
          {labels.sortAlphabetically}
        </button>
        <button
          type="button"
          onClick={() => onSortModeChange('nearest')}
          disabled={!isNearestSortAvailable}
          className={`cursor-pointer rounded-md px-3 py-1.5 text-sm transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${
            sortMode === 'nearest'
              ? isDark
                ? 'bg-slate-100 text-slate-900 shadow-sm'
                : 'bg-slate-900 text-white shadow-sm'
              : isDark
                ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                : 'bg-white text-slate-800 hover:bg-slate-100'
          }`}
        >
          {labels.sortByNearest}
        </button>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead
          className={`text-left text-xs uppercase tracking-wide ${
            isDark ? 'bg-slate-900 text-slate-400' : 'bg-slate-50 text-slate-600'
          }`}
        >
          <tr>
            <th className="px-4 py-3 font-medium">{labels.hospital}</th>
            <th className="px-4 py-3 font-medium">{labels.waitingTime} ({triageCategoryLabels[selectedCategory]})</th>
            <th className="px-4 py-3 font-medium">{labels.details}</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <Fragment key={group.cluster}>
              <tr className={`border-t ${isDark ? 'border-slate-700 bg-slate-800/60' : 'border-slate-200 bg-slate-100'}`}>
                <td colSpan={3} className={`px-4 py-2 font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {group.displayCluster} ({group.hospitals.length})
                </td>
              </tr>

              {group.hospitals.map((hospital) => {
                const selectedTriage = hospital.triage[selectedCategory]
                const isExpanded = expandedHospitalName === hospital.hospitalName

                return (
                  <Fragment key={hospital.hospitalName}>
                    <tr
                      className={`border-t transition-colors duration-200 motion-reduce:transition-none ${
                        isDark ? 'border-slate-800 hover:bg-slate-800/60' : 'border-slate-100 hover:bg-slate-50/90'
                      }`}
                    >
                      <td className={`px-4 py-3 font-medium ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                        <div>{hospital.hospitalName}</div>
                        {typeof hospital.distanceKm === 'number' && (
                          <div className={`mt-0.5 inline-flex items-center gap-1 text-xs font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                              <path d="M12 21s7-5.33 7-11a7 7 0 1 0-14 0c0 5.67 7 11 7 11Z" />
                              <circle cx="12" cy="10" r="2.5" />
                            </svg>
                            {formatDistanceKm(hospital.distanceKm, languageMode)}
                          </div>
                        )}
                      </td>
                      <td className={`px-4 py-3 text-base font-semibold tracking-tight ${getWaitingTimeTone(selectedTriage.waitStatus, isDark)}`}>
                        {selectedTriage.waitingTimeText}
                        {selectedTriage.upperBoundText && (
                          <>
                            <span className={`mx-1.5 text-sm font-normal ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                              –
                            </span>
                            <span
                              className={`text-base font-semibold ${getWaitingTimeTone(selectedTriage.upperBoundWaitStatus ?? deriveWaitStatusFromText(selectedTriage.upperBoundText, selectedTriage.waitStatus), isDark)}`}
                            >
                              {selectedTriage.upperBoundText}
                            </span>
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => onToggleExpanded(hospital.hospitalName)}
                          className={`cursor-pointer rounded-md border px-2 py-1 text-xs transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-1 ${
                            isDark
                              ? 'border-slate-600 text-slate-200 hover:bg-slate-800'
                              : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {isExpanded ? labels.hide : labels.view}
                        </button>
                      </td>
                    </tr>

                    <tr className={`border-t ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-slate-50'}`}>
                      <td colSpan={3} className={`px-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        <div
                          className={`grid overflow-hidden transition-[grid-template-rows,opacity,margin] duration-300 motion-reduce:transition-none ${
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
