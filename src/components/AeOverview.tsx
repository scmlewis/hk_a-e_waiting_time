interface TriageRow {
  level: string
  description: string
  target: string
  tone: 'red' | 'orange' | 'yellow' | 'green' | 'blue'
}

interface FlowStep {
  title: string
  description: string
}

interface DataSourceItem {
  label: string
  url: string
}

export interface AeOverviewLabels {
  title: string
  intro: string
  triageTitle: string
  triageLevelLabel: string
  triageDescLabel: string
  triageTargetLabel: string
  triageRows: TriageRow[]
  flowTitle: string
  flowIntro: string
  flowSteps: FlowStep[]
  dataSourcesTitle: string
  dataSourcesIntro: string
  dataSources: DataSourceItem[]
  disclaimerTitle: string
  disclaimerBody: string
}

interface AeOverviewProps {
  isDark: boolean
  labels: AeOverviewLabels
}

const toneClassMap = {
  red: 'bg-rose-500',
  orange: 'bg-orange-500',
  yellow: 'bg-amber-500',
  green: 'bg-emerald-500',
  blue: 'bg-sky-500',
} as const

export function AeOverview({ isDark, labels }: AeOverviewProps) {
  return (
    <section
      className={`enter-fade-up space-y-4 rounded-2xl border p-4 shadow-sm md:p-5 ${
        isDark ? 'border-slate-700 bg-slate-900/80 text-slate-100' : 'border-slate-200 bg-white text-slate-900'
      }`}
    >
      <div className="space-y-2">
        <h2 className={`text-2xl font-bold tracking-tight md:text-3xl ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{labels.title}</h2>
        <p className={`text-sm leading-7 md:text-base ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{labels.intro}</p>
      </div>

      <section className="space-y-3">
        <h3 className={`text-xl font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{labels.triageTitle}</h3>

        <div className={`hidden grid-cols-[1.3fr_2fr_1fr] gap-3 rounded-xl border px-4 py-2 text-xs font-semibold uppercase tracking-wide md:grid ${
          isDark ? 'border-slate-700 bg-slate-900 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'
        }`}>
          <span>{labels.triageLevelLabel}</span>
          <span>{labels.triageDescLabel}</span>
          <span>{labels.triageTargetLabel}</span>
        </div>

        <div className="space-y-2.5">
          {labels.triageRows.map((row) => (
            <article
              key={row.level}
              className={`rounded-xl border px-4 py-3 ${
                isDark ? 'border-slate-700 bg-slate-900/90' : 'border-slate-200 bg-slate-50/85'
              }`}
            >
              <div className="grid gap-2 md:grid-cols-[1.3fr_2fr_1fr] md:items-start md:gap-3">
                <div className={`flex items-start gap-2.5 font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  <span className={`mt-2 h-2.5 w-2.5 flex-shrink-0 rounded-full ${toneClassMap[row.tone]}`} />
                  <span>{row.level}</span>
                </div>
                <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{row.description}</p>
                <p className={`text-sm font-semibold md:text-right ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{row.target}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h3 className={`text-xl font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{labels.flowTitle}</h3>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{labels.flowIntro}</p>
        <div className="space-y-2">
          {labels.flowSteps.map((step, index) => (
            <div key={step.title} className="flex items-start gap-3">
              <span className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-cyan-500 text-sm font-bold text-slate-950">
                {index + 1}
              </span>
              <div>
                <p className={`text-lg font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{step.title}</p>
                <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={`space-y-2 rounded-xl border p-3 md:p-4 ${isDark ? 'border-slate-700 bg-slate-900/90' : 'border-slate-200 bg-slate-50/85'}`}>
        <h3 className={`text-lg font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{labels.dataSourcesTitle}</h3>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{labels.dataSourcesIntro}</p>
        <ul className="space-y-2">
          {labels.dataSources.map((source) => (
            <li key={source.url}>
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className={`text-sm font-medium underline-offset-2 hover:underline ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}
              >
                {source.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className={`rounded-xl border p-3 text-sm ${isDark ? 'border-amber-600/40 bg-amber-900/20 text-amber-100' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
        <p className="font-semibold">{labels.disclaimerTitle}</p>
        <p className="mt-1 leading-6">{labels.disclaimerBody}</p>
      </section>
    </section>
  )
}
