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
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  yellow: 'bg-amber-500',
  green: 'bg-green-500',
  blue: 'bg-sky-500',
} as const

export function AeOverview({ isDark, labels }: AeOverviewProps) {
  return (
    <section
      className={`enter-fade-up space-y-4 border p-4 md:p-5 ${
        isDark ? 'border-neutral-800' : 'border-neutral-200'
      }`}
    >
      <div className="space-y-2">
        <h2 className={`text-2xl font-black tracking-tight md:text-3xl ${isDark ? 'text-neutral-100' : 'text-neutral-900'}`}>{labels.title}</h2>
        <p className={`text-sm leading-7 md:text-base ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>{labels.intro}</p>
      </div>

      <section className="space-y-3">
        <h3 className={`text-lg font-bold ${isDark ? 'text-neutral-100' : 'text-neutral-900'}`}>{labels.triageTitle}</h3>

        <div className={`hidden grid-cols-[1.3fr_2fr_1fr] gap-3 border px-4 py-2 text-[10px] font-bold uppercase tracking-widest md:grid ${
          isDark ? 'border-neutral-800 text-neutral-500' : 'border-neutral-200 text-neutral-400'
        }`}>
          <span>{labels.triageLevelLabel}</span>
          <span>{labels.triageDescLabel}</span>
          <span>{labels.triageTargetLabel}</span>
        </div>

        <div className="space-y-1.5">
          {labels.triageRows.map((row) => (
            <article
              key={row.level}
              className={`border px-4 py-3 ${
                isDark ? 'border-neutral-800' : 'border-neutral-200'
              }`}
            >
              <div className="grid gap-2 md:grid-cols-[1.3fr_2fr_1fr] md:items-start md:gap-3">
                <div className={`flex items-start gap-2.5 font-semibold ${isDark ? 'text-neutral-100' : 'text-neutral-900'}`}>
                  <span className={`mt-2 h-2 w-2 flex-shrink-0 rounded-full ${toneClassMap[row.tone]}`} />
                  <span>{row.level}</span>
                </div>
                <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>{row.description}</p>
                <p className={`text-sm font-semibold font-mono md:text-right ${isDark ? 'text-neutral-200' : 'text-neutral-800'}`}>{row.target}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h3 className={`text-lg font-bold ${isDark ? 'text-neutral-100' : 'text-neutral-900'}`}>{labels.flowTitle}</h3>
        <p className={`text-sm ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>{labels.flowIntro}</p>
        <div className="space-y-2">
          {labels.flowSteps.map((step, index) => (
            <div key={step.title} className="flex items-start gap-3">
              <span className={`inline-flex h-6 w-6 flex-shrink-0 items-center justify-center text-xs font-bold ${isDark ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-900 text-white'}`}>
                {index + 1}
              </span>
              <div>
                <p className={`text-sm font-semibold ${isDark ? 'text-neutral-100' : 'text-neutral-900'}`}>{step.title}</p>
                <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={`space-y-2 border p-3 md:p-4 ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
        <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-neutral-200' : 'text-neutral-900'}`}>{labels.dataSourcesTitle}</h3>
        <p className={`text-sm ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>{labels.dataSourcesIntro}</p>
        <ul className="space-y-1.5">
          {labels.dataSources.map((source) => (
            <li key={source.url}>
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className={`text-sm font-medium underline-offset-2 hover:underline ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}
              >
                {source.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className={`border-l-2 border-amber-500 pl-3 py-3 text-sm ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
        <p className="font-bold uppercase tracking-wider text-xs">{labels.disclaimerTitle}</p>
        <p className="mt-1 leading-6 text-neutral-500 dark:text-neutral-400">{labels.disclaimerBody}</p>
      </section>
    </section>
  )
}
