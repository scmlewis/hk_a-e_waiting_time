// src/components/MapPopup.tsx
import type { HospitalWaitingTime, TriageCategory } from '../types/ae'
import type { HospitalDetailsLabels } from '../components/HospitalDetails'
import type { LanguageMode } from '../constants/labels'
import { Icon } from './Icon'

interface MapPopupProps {
  hospital: HospitalWaitingTime
  selectedTriageCategory: TriageCategory
  languageMode: LanguageMode
  labels: HospitalDetailsLabels
  onClose: () => void
}

export function MapPopup({ hospital, selectedTriageCategory, languageMode, labels, onClose }: MapPopupProps) {
  const triage = hospital.triage[selectedTriageCategory]
  const localizedName =
    languageMode === 'zh-HK'
      ? hospital.details.localized?.['zh-HK']?.hospitalName ?? hospital.hospitalName
      : hospital.hospitalName

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={localizedName}
      className="m-3 border border-m3-outline-variant bg-m3-surface p-4 text-m3-on-surface shadow-lg"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-bold">{localizedName}</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="shrink-0 border border-m3-outline px-2 py-1 text-xs text-m3-on-surface-variant transition-colors hover:bg-m3-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-primary"
        >
          <Icon name="close" className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-1 text-xs text-m3-on-surface-variant">
        {labels.category}: {selectedTriageCategory} · {triage.waitingTimeText}
        {triage.upperBoundText ? ` (${triage.upperBoundText})` : ''}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {hospital.details.phone.dialHref && (
          <a
            href={hospital.details.phone.dialHref}
            className="inline-flex items-center border border-m3-outline px-3 py-1.5 text-xs font-medium text-m3-on-surface transition-colors hover:bg-m3-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-primary"
          >
            <Icon name="phone" className="mr-1.5 h-3.5 w-3.5" />
            {labels.callHospital}
          </a>
        )}
        <a
          href={hospital.details.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center border border-m3-outline px-3 py-1.5 text-xs font-medium text-m3-on-surface transition-colors hover:bg-m3-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-primary"
        >
          <Icon name="map-pin" className="mr-1.5 h-3.5 w-3.5" />
          {labels.viewOnMaps}
        </a>
      </div>
    </div>
  )
}
