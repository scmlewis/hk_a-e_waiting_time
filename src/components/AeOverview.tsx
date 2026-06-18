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
        isDark ? 'border-neutral-700' : 'border-neutral-200'
      }`}
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-black tracking-tight md:text-3xl text-white">{labels.title}</h2>
        <p className="text-sm leading-7 md:text-base text-neutral-300">{labels.intro}</p>
      </div>

      <section className="space-y-3">
        <h3 className="text-lg font-bold text-white">{labels.triageTitle}</h3>

        <div className="hidden grid-cols-[1.3fr_2fr_1fr] gap-3 border border-neutral-700 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400 md:grid">
          <span>{labels.triageLevelLabel}</span>
          <span>{labels.triageDescLabel}</span>
          <span>{labels.triageTargetLabel}</span>
        </div>

        <div className="space-y-1.5">
          {labels.triageRows.map((row) => (
            <article
              key={row.level}
              className="border border-neutral-700 px-4 py-3"
            >
              <div className="grid gap-2 md:grid-cols-[1.3fr_2fr_1fr] md:items-start md:gap-3">
                <div className="flex items-start gap-2.5 font-semibold text-white">
                  <span className={`mt-2 h-2 w-2 flex-shrink-0 rounded-full ${toneClassMap[row.tone]}`} />
                  <span>{row.level}</span>
                </div>
                <p className="text-sm text-neutral-300">{row.description}</p>
                <p className="text-sm font-semibold font-mono md:text-right text-neutral-200">{row.target}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-bold text-white">{labels.flowTitle}</h3>
        <p className="text-sm text-neutral-400">{labels.flowIntro}</p>
        <div className="space-y-2">
          {labels.flowSteps.map((step, index) => (
            <div key={step.title} className="flex items-start gap-3">
              <span className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center bg-neutral-800 text-xs font-bold text-neutral-300">
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{step.title}</p>
                <p className="text-sm text-neutral-300">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2 border border-neutral-700 p-3 md:p-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-200">{labels.dataSourcesTitle}</h3>
        <p className="text-sm text-neutral-400">{labels.dataSourcesIntro}</p>
        <ul className="space-y-1.5">
          {labels.dataSources.map((source) => (
            <li key={source.url}>
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-neutral-200 underline-offset-2 hover:underline"
              >
                {source.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-l-2 border-amber-500 pl-3 py-3 text-sm text-amber-200">
        <p className="font-bold uppercase tracking-wider text-xs">{labels.disclaimerTitle}</p>
        <p className="mt-1 leading-6 text-neutral-400">{labels.disclaimerBody}</p>
      </section>
    </section>
  )
}
