import React from 'react'

interface SummaryCardProps {
  isDark: boolean
  hospitalCount: number
  avgMinutes: number | null
  worst: { name: string; minutes: number | null } | null
}

export function SummaryCard({ isDark, hospitalCount, avgMinutes, worst }: SummaryCardProps) {
  return (
    <section className={`rounded-2xl border p-4 ${isDark ? 'border-slate-700 bg-slate-900/80' : 'border-slate-200 bg-white/90'}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">Hospitals</div>
          <div className="text-2xl font-bold">{hospitalCount}</div>
        </div>
        <div>
          <div className="text-sm font-medium">Avg wait</div>
          <div className="text-2xl font-bold">{avgMinutes === null ? '-' : `${avgMinutes} min`}</div>
        </div>
        <div>
          <div className="text-sm font-medium">Worst</div>
          <div className="text-2xl font-bold">{worst ? `${worst.name} (${worst.minutes ?? '-' }m)` : '-'}</div>
        </div>
      </div>
    </section>
  )
}

export default SummaryCard
import React from 'react'

interface SummaryCardProps {
  isDark: boolean
  hospitalCount: number
  avgMinutes: number | null
  worst?: { name: string; minutes: number | null } | null
}

export function SummaryCard({ isDark, hospitalCount, avgMinutes, worst }: SummaryCardProps) {
  return (
    <div
      className={`enter-fade-up rounded-2xl border p-4 shadow-md flex items-center justify-between gap-4 ${
        isDark ? 'border-slate-700 bg-slate-900/85 text-slate-100' : 'border-slate-200 bg-white text-slate-900'
      }`}
    >
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide">Hospitals</div>
        <div className="text-2xl font-bold">{hospitalCount}</div>
      </div>

      <div>
        <div className="text-xs font-semibold uppercase tracking-wide">Avg wait</div>
        <div className="text-2xl font-bold">{avgMinutes === null ? '—' : `${avgMinutes} min`}</div>
      </div>

      <div className="text-right">
        <div className="text-xs font-semibold uppercase tracking-wide">Worst</div>
        <div className="text-base font-semibold">{worst ? `${worst.name}${worst.minutes ? ` • ${worst.minutes}m` : ''}` : '—'}</div>
      </div>
    </div>
  )
}

export default React.memo(SummaryCard)
