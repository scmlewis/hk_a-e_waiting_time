import type { AppLabels, LanguageMode } from '../constants/labels'
import { Icon } from './Icon'

export type AppView = 'wait-times' | 'overview'

interface AppHeaderProps {
  labels: AppLabels
  languageMode: LanguageMode
  loading: boolean
  isRefreshing: boolean
  activeView: AppView
  isLegendExpanded: boolean
  waitSemanticsHint: string
  toggleLanguageMode: () => void
  loadData: () => Promise<void>
  handleViewChange: (view: AppView) => void
  setIsLegendExpanded: (expanded: boolean) => void
}

export function AppHeader({
  labels,
  languageMode,
  loading,
  isRefreshing,
  activeView,
  isLegendExpanded,
  waitSemanticsHint,
  toggleLanguageMode,
  loadData,
  handleViewChange,
  setIsLegendExpanded,
}: AppHeaderProps) {
  return (
    <header className="enter-fade-up border-b border-m3-outline-variant pb-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center text-2xl font-black tracking-tight text-m3-on-surface md:text-3xl">
            <img
              src="/emergency-icon.svg"
              alt=""
              aria-hidden="true"
              className="mr-3 h-8 w-8 rounded-lg md:h-9 md:w-9"
            />
            {labels.title}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={toggleLanguageMode}
            className="inline-flex min-h-10 items-center gap-1 border border-m3-outline px-2.5 py-1.5 text-xs font-medium tracking-wide text-m3-on-surface-variant transition-colors duration-200 hover:bg-m3-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-primary focus-visible:ring-offset-2 focus-visible:ring-offset-m3-surface"
            aria-label={`${labels.languageTraditionalChinese} / ${labels.languageEnglish}`}
            aria-pressed={languageMode === 'zh-HK'}
          >
            <span className="font-bold">語</span>
            <span>{languageMode === 'en' ? 'EN' : '繁'}</span>
          </button>

          <button
            type="button"
            onClick={() => void loadData()}
            disabled={loading || isRefreshing}
            className="hidden cursor-pointer items-center bg-m3-primary px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-m3-on-primary transition-colors duration-200 hover:bg-m3-primary/90 disabled:cursor-not-allowed disabled:opacity-40 md:inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-primary focus-visible:ring-offset-2 focus-visible:ring-offset-m3-surface"
          >
            {isRefreshing ? (
              <Icon name="spinner" className="animate-spin -ml-1 mr-1.5 h-3.5 w-3.5" />
            ) : null}
            {isRefreshing ? labels.refreshing : labels.refreshNow}
          </button>
        </div>
      </div>

      <div className="mt-4 flex w-full gap-0 border-b border-m3-outline-variant" role="tablist" aria-label="Main views">
        <button
          type="button"
          role="tab"
          aria-selected={activeView === 'wait-times'}
          onClick={() => handleViewChange('wait-times')}
          className={`relative px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${
            activeView === 'wait-times'
              ? 'text-m3-primary'
              : 'text-m3-on-surface-variant hover:text-m3-on-surface'
          }`}
        >
          {labels.viewWaitTimes}
          {activeView === 'wait-times' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 -mb-px bg-m3-primary" />
          )}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeView === 'overview'}
          onClick={() => handleViewChange('overview')}
          className={`relative px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${
            activeView === 'overview'
              ? 'text-m3-primary'
              : 'text-m3-on-surface-variant hover:text-m3-on-surface'
          }`}
        >
          {labels.viewOverview}
          {activeView === 'overview' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 -mb-px bg-m3-primary" />
          )}
        </button>
      </div>

      {activeView === 'wait-times' && (
        <div className="md:hidden mt-4">
          <button
            type="button"
            onClick={() => setIsLegendExpanded(!isLegendExpanded)}
            className="flex w-full items-center justify-between gap-2 border border-m3-outline-variant px-3 py-2.5 text-xs font-medium tracking-wide text-m3-on-surface-variant transition-colors duration-200 hover:bg-m3-surface-container-high"
          >
            <span className="flex items-center gap-2">
              <Icon name="info" className="h-3.5 w-3.5" strokeWidth={2.5} />
              {labels.legendTitle}
            </span>
            <Icon
              name="chevron-down"
              className={`h-3.5 w-3.5 transition-transform duration-200 ${isLegendExpanded ? 'rotate-180' : ''}`}
              strokeWidth={2.5}
            />
          </button>
          <div
            className={`grid overflow-hidden transition-all duration-200 ${
              isLegendExpanded ? 'mt-3 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-0'
            }`}
          >
            <div className="min-h-0">
              <div className="flex flex-wrap gap-3 px-2 py-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide text-green-400">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  {labels.shortWait}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide text-amber-400">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  {labels.moderateWait}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide text-red-400">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  {labels.longWait}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide text-m3-on-surface-variant">
                  <span className="h-2 w-2 rounded-full bg-m3-outline" />
                  {labels.unknownWait}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'wait-times' && (
        <div className="hidden flex-wrap items-center gap-4 md:flex mt-4">
          <span className="text-[10px] font-medium uppercase tracking-widest text-m3-on-surface-variant">
            {labels.legendTitle}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide text-green-400">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            {labels.shortWait}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide text-amber-400">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            {labels.moderateWait}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide text-red-400">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            {labels.longWait}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide text-m3-on-surface-variant">
            <span className="h-2 w-2 rounded-full bg-m3-outline" />
            {labels.unknownWait}
          </span>
        </div>
      )}

      {activeView === 'wait-times' && (
        <div
          className="mt-4 border-l-2 border-m3-outline pl-3 text-xs leading-relaxed font-medium text-m3-on-surface-variant"
          role="note"
        >
          {waitSemanticsHint}
        </div>
      )}
    </header>
  )
}
