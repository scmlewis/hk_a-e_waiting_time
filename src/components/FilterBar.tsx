import type { TriageCategory } from '../types/ae'
import { Icon } from './Icon'

interface FilterBarLabels {
  searchPlaceholder: string
  allClusters: string
}

interface FilterBarProps {
  labels: FilterBarLabels
  searchValue: string
  onSearchChange: (value: string) => void
  selectedTriageCategory: TriageCategory
  onTriageCategoryChange: (value: TriageCategory) => void
  clusterOptions: Array<{ value: string; label: string }>
  selectedCluster: string
  onClusterChange: (value: string) => void
}

export function FilterBar({
  labels,
  searchValue,
  onSearchChange,
  selectedTriageCategory,
  onTriageCategoryChange,
  clusterOptions,
  selectedCluster,
  onClusterChange,
}: FilterBarProps) {
  return (
    <section className="flex flex-wrap items-end gap-3 border border-m3-outline-variant p-3 md:p-4">
      <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Triage category">
        {(['I', 'II', 'III', 'IV_V'] as const).map((category) => {
          const selected = selectedTriageCategory === category
          const label = category === 'IV_V' ? 'IV & V' : category

          return (
            <button
              key={category}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onTriageCategoryChange(category)}
              className={`min-h-10 cursor-pointer px-3 py-1.5 text-xs font-medium transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-primary focus-visible:ring-offset-2 focus-visible:ring-offset-m3-surface ${
                selected
                  ? 'border border-m3-primary bg-m3-primary-container text-m3-on-primary-container'
                  : 'border border-m3-outline text-m3-on-surface-variant hover:bg-m3-surface-container-high'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>

      <div className="flex-1 min-w-[160px]">
        <div className="relative">
          <input
            type="text"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={labels.searchPlaceholder}
            className="w-full border-b border-m3-outline bg-transparent px-1 py-2 pr-8 text-sm font-medium text-m3-on-surface placeholder:text-m3-on-surface-variant/50 transition-colors duration-200 focus-visible:border-m3-primary focus-visible:outline-none"
          />
          {searchValue.length > 0 && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-m3-on-surface-variant hover:text-m3-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-primary"
              aria-label="Clear search"
            >
              <Icon name="close" className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {clusterOptions.length > 0 && (
        <div className="min-w-[140px]">
          <select
            value={selectedCluster}
            onChange={(event) => onClusterChange(event.target.value)}
            style={{ colorScheme: 'dark' }}
            className="w-full cursor-pointer border-b border-m3-outline bg-transparent px-1 py-2 text-sm font-medium text-m3-on-surface transition-colors duration-200 focus-visible:border-m3-primary focus-visible:outline-none"
          >
            <option value="">{labels.allClusters}</option>
            {clusterOptions.map((cluster) => (
              <option key={cluster.value} value={cluster.value}>
                {cluster.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </section>
  )
}
