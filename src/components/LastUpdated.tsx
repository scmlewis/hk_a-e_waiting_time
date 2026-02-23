import { formatCountdown } from '../utils/time'

interface LastUpdatedLabels {
  lastSourceUpdate: string
  nextRefreshIn: string
  staleNetworkMessage: string
  unknownTimestamp: string
}

interface LastUpdatedProps {
  sourceUpdateTime: string
  countdownSeconds: number
  isStale: boolean
  isDark: boolean
  labels: LastUpdatedLabels
}

export function LastUpdated({ sourceUpdateTime, countdownSeconds, isStale, isDark, labels }: LastUpdatedProps) {
  return (
    <section
      className={`space-y-2 rounded-xl border p-4 text-sm shadow-sm md:p-5 ${
        isDark ? 'border-indigo-900/50 bg-indigo-950/20' : 'border-indigo-100 bg-indigo-50/60'
      }`}
      aria-live="polite"
    >
      <p className={`flex flex-wrap items-baseline justify-between gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
        <span className="font-medium">{labels.lastSourceUpdate}</span>
        <span className={`font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{sourceUpdateTime || labels.unknownTimestamp}</span>
      </p>
      <p className={`flex flex-wrap items-baseline justify-between gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
        <span className="font-medium">{labels.nextRefreshIn}</span>
        <span className={`font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{formatCountdown(countdownSeconds)}</span>
      </p>
      {isStale && (
        <p
          className={`rounded-md border px-3 py-2 ${
            isDark ? 'border-amber-600/50 bg-amber-900/25 text-amber-200' : 'border-amber-200 bg-amber-50 text-amber-800'
          }`}
          role="status"
          aria-live="polite"
        >
          {labels.staleNetworkMessage}
        </p>
      )}
    </section>
  )
}
