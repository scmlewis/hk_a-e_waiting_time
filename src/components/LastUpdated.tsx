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
  labels: LastUpdatedLabels
  languageMode?: 'en' | 'zh-HK'
}

export function LastUpdated({ sourceUpdateTime, countdownSeconds, isStale, labels, languageMode = 'en' }: LastUpdatedProps) {
  const relativeTime = formatRelativeTime(sourceUpdateTime, languageMode)
  return (
    <section className="space-y-2 border border-m3-outline-variant p-4 text-sm md:p-5" aria-live="polite">
      <p className="flex flex-wrap items-baseline justify-between gap-2 text-m3-on-surface-variant">
        <span className="text-[11px] font-medium uppercase tracking-widest">{labels.lastSourceUpdate}</span>
        <span className="flex items-center gap-2 font-semibold font-mono text-xs text-m3-on-surface">
          {sourceUpdateTime || labels.unknownTimestamp}
          {relativeTime && (
            <span className="text-[10px] font-normal font-sans text-m3-on-surface-variant/60">
              ({relativeTime})
            </span>
          )}
        </span>
      </p>
      <p className="flex flex-wrap items-baseline justify-between gap-2 text-m3-on-surface-variant">
        <span className="text-[11px] font-medium uppercase tracking-widest">{labels.nextRefreshIn}</span>
        <span className="font-mono font-bold text-xs text-m3-primary">{formatCountdown(countdownSeconds)}</span>
      </p>
      {isStale && (
        <p className="border border-m3-tertiary/50 px-3 py-2 text-sm text-m3-tertiary" role="status" aria-live="polite">
          {labels.staleNetworkMessage}
        </p>
      )}
    </section>
  )
}
