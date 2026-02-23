import type { TriageCategory } from '../types/ae'

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
      className={`space-y-3 rounded-2xl border p-3 shadow-[0_8px_24px_rgba(15,23,42,0.08)] backdrop-blur md:p-5 md:space-y-4 md:backdrop-blur-none ${
        isDark ? 'border-sky-900/50 bg-sky-950/25 md:bg-slate-950' : 'border-sky-100/80 bg-sky-50/70 md:bg-white'
      }`}
    >
      <div className="space-y-1.5">
        <p className={`text-[10px] font-semibold uppercase tracking-wide md:text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {labels.defaultTriageView}
        </p>
        <div
          className={`inline-flex flex-wrap gap-1.5 rounded-xl border p-1 ${
            isDark ? 'border-sky-900/50 bg-slate-900/80' : 'border-sky-100 bg-white/90'
          }`}
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
                className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-1 md:px-3 md:py-1.5 md:text-sm ${
                  selected
                    ? isDark
                      ? 'bg-slate-100 text-slate-900 shadow-sm'
                      : 'bg-slate-900 text-white shadow-sm'
                    : isDark
                      ? 'bg-transparent text-slate-300 hover:bg-slate-800'
                      : 'bg-transparent text-slate-700 hover:bg-white'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-2 md:gap-3">
        <div className="space-y-1">
          <label className={`block text-xs font-medium md:text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`} htmlFor="hospital-search">
            {labels.searchHospital}
          </label>
          <input
            id="hospital-search"
            type="text"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={labels.searchPlaceholder}
            className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors duration-200 motion-reduce:transition-none focus-visible:border-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500/30 ${
              isDark
                ? 'border-slate-600 bg-slate-900 text-slate-100 placeholder:text-slate-400'
                : 'border-slate-300 bg-white text-slate-800 placeholder:text-slate-400'
            }`}
          />
        </div>

        {clusterOptions.length > 0 && (
          <div className="space-y-1">
            <label className={`block text-xs font-medium md:text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`} htmlFor="cluster-filter">
              {labels.cluster}
            </label>
            <select
              id="cluster-filter"
              value={selectedCluster}
              onChange={(event) => onClusterChange(event.target.value)}
              style={{ colorScheme: isDark ? 'dark' : 'light' }}
              className={`w-full cursor-pointer rounded-lg border px-3 py-2 text-sm transition-colors duration-200 motion-reduce:transition-none focus-visible:border-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500/30 ${
                isDark ? 'border-slate-600 bg-slate-900 text-slate-100' : 'border-slate-300 bg-white text-slate-800'
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
