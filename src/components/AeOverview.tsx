import { Icon } from './Icon'

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
  aboutTitle: string
  authorName: string
  authorBio: string
  githubLabel: string
}

interface AeOverviewProps {
  labels: AeOverviewLabels
}

const toneClassMap = {
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  yellow: 'bg-amber-500',
  green: 'bg-green-500',
  blue: 'bg-m3-tertiary',
} as const

export function AeOverview({ labels }: AeOverviewProps) {
  return (
    <section className="enter-fade-up space-y-4 border border-m3-outline-variant p-4 md:p-5">
      <div className="space-y-2">
        <h2 className="text-2xl font-black tracking-tight text-m3-on-surface md:text-3xl">{labels.title}</h2>
        <p className="text-sm leading-7 text-m3-on-surface-variant md:text-base">{labels.intro}</p>
      </div>

      <section className="space-y-3">
        <h3 className="text-lg font-bold text-m3-on-surface">{labels.triageTitle}</h3>

        <div className="hidden grid-cols-[1.3fr_2fr_1fr] gap-3 border border-m3-outline-variant px-4 py-2 text-[10px] font-medium uppercase tracking-widest text-m3-on-surface-variant md:grid">
          <span>{labels.triageLevelLabel}</span>
          <span>{labels.triageDescLabel}</span>
          <span>{labels.triageTargetLabel}</span>
        </div>

        <div className="space-y-1.5">
          {labels.triageRows.map((row) => (
            <article key={row.level} className="border border-m3-outline-variant px-4 py-3">
              <div className="grid gap-2 md:grid-cols-[1.3fr_2fr_1fr] md:items-start md:gap-3">
                <div className="flex items-start gap-2.5 font-semibold text-m3-on-surface">
                  <span className={`mt-2 h-2 w-2 flex-shrink-0 rounded-full ${toneClassMap[row.tone]}`} />
                  <span>{row.level}</span>
                </div>
                <p className="text-sm text-m3-on-surface-variant">{row.description}</p>
                <p className="text-sm font-semibold font-mono md:text-right text-m3-on-surface">{row.target}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-bold text-m3-on-surface">{labels.flowTitle}</h3>
        <p className="text-sm text-m3-on-surface-variant">{labels.flowIntro}</p>
        <div className="space-y-2">
          {labels.flowSteps.map((step, index) => (
            <div key={step.title} className="flex items-start gap-3">
              <span className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center bg-m3-primary-container text-xs font-bold text-m3-on-primary-container">
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-m3-on-surface">{step.title}</p>
                <p className="text-sm text-m3-on-surface-variant">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2 border border-m3-outline-variant p-3 md:p-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-m3-on-surface">{labels.dataSourcesTitle}</h3>
        <p className="text-sm text-m3-on-surface-variant">{labels.dataSourcesIntro}</p>
        <ul className="space-y-1.5">
          {labels.dataSources.map((source) => (
            <li key={source.url}>
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-m3-primary underline-offset-2 hover:underline"
              >
                {source.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-l-2 border-m3-tertiary pl-3 py-3 text-sm text-m3-tertiary">
        <p className="font-bold uppercase tracking-wider text-xs">{labels.disclaimerTitle}</p>
        <p className="mt-1 leading-6 text-m3-on-surface-variant">{labels.disclaimerBody}</p>
      </section>

      <section className="space-y-3 border border-m3-outline-variant p-3 md:p-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-m3-on-surface">{labels.aboutTitle}</h3>
        <div className="space-y-1">
          <p className="text-base font-semibold text-m3-on-surface">{labels.authorName}</p>
          <p className="text-sm text-m3-on-surface-variant">{labels.authorBio}</p>
        </div>
        <a
          href="https://github.com/scmlewis/hk_a-e_waiting_time"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-m3-primary underline-offset-2 hover:underline"
        >
          <Icon name="github" className="h-4 w-4" />
          {labels.githubLabel}
        </a>
      </section>
    </section>
  )
}
