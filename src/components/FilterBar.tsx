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
  isDark: boolean
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
  isDark,
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
    <section
      className={`space-y-4 border p-4 md:space-y-4 md:p-5 ${
        isDark ? 'border-neutral-700' : 'border-neutral-200'
      }`}
    >
      <div className="space-y-2">
        <p className={`text-[10px] font-bold uppercase tracking-widest md:text-[10px] ${isDark ? 'text-neutral-400' : 'text-neutral-400'}`}>
          {labels.defaultTriageView}
        </p>
        <div
          className={`flex w-full gap-1 border-b ${isDark ? 'border-neutral-700' : 'border-neutral-200'}`}
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
                className={`relative min-h-11 flex-1 cursor-pointer px-2 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-1 sm:px-3 sm:text-sm md:min-h-0 md:flex-none md:px-4 md:py-2 ${
                  selected
                    ? isDark ? 'text-white' : 'text-neutral-900'
                    : isDark ? 'text-neutral-400 hover:text-neutral-200' : 'text-neutral-400 hover:text-neutral-600'
                }`}
              >
                {label}
                {selected && (
                  <span className={`absolute bottom-0 left-0 right-0 h-0.5 -mb-px ${isDark ? 'bg-white' : 'bg-neutral-900'}`} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 md:gap-3">
        <div className="space-y-1.5">
          <label className={`block text-[10px] font-bold uppercase tracking-widest md:text-[10px] ${isDark ? 'text-neutral-400' : 'text-neutral-400'}`} htmlFor="hospital-search">
            {labels.searchHospital}
          </label>
          <div className="relative">
            <input
              id="hospital-search"
              type="text"
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={labels.searchPlaceholder}
              className={`w-full border-b bg-transparent px-1 py-2.5 pr-10 text-sm font-medium transition-colors duration-150 motion-reduce:transition-none focus-visible:border-neutral-400 focus-visible:outline-none md:py-2 ${
                isDark
                  ? 'border-neutral-600 text-white placeholder:text-neutral-500'
                  : 'border-neutral-300 text-neutral-900 placeholder:text-neutral-400'
              }`}
            />
            {searchValue.length > 0 && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-neutral-400 hover:text-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500"
                  aria-label="Clear search"
                >
                  <Icon name="close" className="h-3.5 w-3.5" />
                </button>
            )}
          </div>
        </div>

        {clusterOptions.length > 0 && (
          <div className="space-y-1.5">
            <label className={`block text-[10px] font-bold uppercase tracking-widest md:text-[10px] ${isDark ? 'text-neutral-400' : 'text-neutral-400'}`} htmlFor="cluster-filter">
              {labels.cluster}
            </label>
            <select
              id="cluster-filter"
              value={selectedCluster}
              onChange={(event) => onClusterChange(event.target.value)}
              style={{ colorScheme: isDark ? 'dark' : 'light' }}
              className={`w-full cursor-pointer border-b bg-transparent px-1 py-2.5 text-sm font-medium transition-colors duration-150 motion-reduce:transition-none focus-visible:border-neutral-400 focus-visible:outline-none md:py-2 ${
                isDark ? 'border-neutral-600 text-white' : 'border-neutral-300 text-neutral-900'
              }`}
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
