import { formatCountdown, formatRelativeTime } from '../utils/time'

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
  languageMode?: 'en' | 'zh-HK'
}

export function LastUpdated({ sourceUpdateTime, countdownSeconds, isStale, isDark, labels, languageMode = 'en' }: LastUpdatedProps) {
  const relativeTime = formatRelativeTime(sourceUpdateTime, languageMode)
  return (
    <section
      className={`space-y-2 border p-4 text-sm md:p-5 ${
        isDark ? 'border-neutral-800' : 'border-neutral-200'
      }`}
      aria-live="polite"
    >
      <p className={`flex flex-wrap items-baseline justify-between gap-2 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
        <span className="text-[10px] font-bold uppercase tracking-widest">{labels.lastSourceUpdate}</span>
        <span className={`flex items-center gap-2 font-semibold font-mono text-xs ${isDark ? 'text-neutral-200' : 'text-neutral-900'}`}>
          {sourceUpdateTime || labels.unknownTimestamp}
          {relativeTime && (
            <span className={`text-[10px] font-normal font-sans ${isDark ? 'text-neutral-600' : 'text-neutral-400'}`}>
              ({relativeTime})
            </span>
          )}
        </span>
      </p>
      <p className={`flex flex-wrap items-baseline justify-between gap-2 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
        <span className="text-[10px] font-bold uppercase tracking-widest">{labels.nextRefreshIn}</span>
        <span className={`font-mono font-bold text-xs ${isDark ? 'text-neutral-200' : 'text-neutral-900'}`}>{formatCountdown(countdownSeconds)}</span>
      </p>
      {isStale && (
        <p
          className={`border border-amber-700/50 px-3 py-2 ${
            isDark ? 'text-amber-300' : 'text-amber-700'
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
