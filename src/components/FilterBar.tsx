import type { TriageCategory } from '../types/ae'
import { Icon } from './Icon'

interface FilterBarLabels {
  defaultTriageView: string
  triageCategory: string
  searchHospital: string
  searchPlaceholder: string
  cluster: string
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
    <section className="space-y-4 border border-m3-outline-variant p-4 md:space-y-4 md:p-5">
      <div className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-widest text-m3-on-surface-variant">
          {labels.defaultTriageView}
        </p>
        <div
          className="flex w-full gap-1.5"
          role="radiogroup"
          aria-label={labels.triageCategory}
        >
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
                className={`min-h-11 flex-1 cursor-pointer px-2 py-2.5 text-sm font-medium transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-primary focus-visible:ring-offset-2 focus-visible:ring-offset-m3-surface sm:px-3 md:min-h-0 md:flex-none md:px-4 md:py-2 ${
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
      </div>

      <div className="grid gap-3 md:grid-cols-2 md:gap-3">
        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium uppercase tracking-widest text-m3-on-surface-variant" htmlFor="hospital-search">
            {labels.searchHospital}
          </label>
          <div className="relative">
            <input
              id="hospital-search"
              type="text"
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={labels.searchPlaceholder}
              className="w-full border-b border-m3-outline bg-transparent px-1 py-2.5 pr-10 text-sm font-medium text-m3-on-surface placeholder:text-m3-on-surface-variant/50 transition-colors duration-200 focus-visible:border-m3-primary focus-visible:outline-none md:py-2"
            />
            {searchValue.length > 0 && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-m3-on-surface-variant hover:text-m3-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-primary"
                  aria-label="Clear search"
                >
                  <Icon name="close" className="h-3.5 w-3.5" />
                </button>
            )}
          </div>
        </div>

        {clusterOptions.length > 0 && (
          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium uppercase tracking-widest text-m3-on-surface-variant" htmlFor="cluster-filter">
              {labels.cluster}
            </label>
            <select
              id="cluster-filter"
              value={selectedCluster}
              onChange={(event) => onClusterChange(event.target.value)}
              style={{ colorScheme: 'dark' }}
              className="w-full cursor-pointer border-b border-m3-outline bg-transparent px-1 py-2.5 text-sm font-medium text-m3-on-surface transition-colors duration-200 focus-visible:border-m3-primary focus-visible:outline-none md:py-2"
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
      </div>
    </section>
  )
}
