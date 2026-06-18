import type { AppLabels, LanguageMode } from '../constants/labels'
import { Icon } from './Icon'

export type AppView = 'wait-times' | 'overview'

interface AppHeaderProps {
  isDark: boolean
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
  isDark,
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
    <header
      className={`enter-fade-up border-b pb-5 transition-colors duration-200 ${
        isDark
          ? 'border-neutral-800'
          : 'border-neutral-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className={`flex items-center text-2xl font-black tracking-tight md:text-3xl ${isDark ? 'text-neutral-50' : 'text-neutral-900'}`}>
            <span className={`mr-3 inline-block h-2.5 w-2.5 rounded-full ${isDark ? 'bg-red-400' : 'bg-red-500'}`} />
            {labels.title}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={toggleLanguageMode}
            className={`inline-flex min-h-10 items-center gap-1 border px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors duration-150 hover:scale-100 active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-1 ${
              isDark
                ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                : 'border-neutral-300 text-neutral-600 hover:bg-neutral-100'
            }`}
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
            className={`hidden cursor-pointer items-center border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 md:inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-1 ${
              isDark
                ? 'border-neutral-100 bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                : 'border-neutral-900 bg-neutral-900 text-neutral-50 hover:bg-neutral-800'
            }`}
          >
            {isRefreshing ? (
              <Icon name="spinner" className="animate-spin -ml-1 mr-1.5 h-3.5 w-3.5" />
            ) : null}
            {isRefreshing ? labels.refreshing : labels.refreshNow}
          </button>
        </div>
      </div>

      <div
        className={`mt-4 flex w-full gap-0 border-b ${
          isDark ? 'border-neutral-800' : 'border-neutral-200'
        }`}
        role="tablist"
        aria-label="Main views"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeView === 'wait-times'}
          onClick={() => handleViewChange('wait-times')}
          className={`relative px-4 py-2.5 text-sm font-semibold transition-colors duration-150 ${
            activeView === 'wait-times'
              ? isDark
                ? 'text-neutral-100'
                : 'text-neutral-900'
              : isDark
                ? 'text-neutral-500 hover:text-neutral-300'
                : 'text-neutral-400 hover:text-neutral-700'
          }`}
        >
          {labels.viewWaitTimes}
          {activeView === 'wait-times' && (
            <span className={`absolute bottom-0 left-0 right-0 h-0.5 -mb-px ${isDark ? 'bg-neutral-100' : 'bg-neutral-900'}`} />
          )}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeView === 'overview'}
          onClick={() => handleViewChange('overview')}
          className={`relative px-4 py-2.5 text-sm font-semibold transition-colors duration-150 ${
            activeView === 'overview'
              ? isDark
                ? 'text-neutral-100'
                : 'text-neutral-900'
              : isDark
                ? 'text-neutral-500 hover:text-neutral-300'
                : 'text-neutral-400 hover:text-neutral-700'
          }`}
        >
          {labels.viewOverview}
          {activeView === 'overview' && (
            <span className={`absolute bottom-0 left-0 right-0 h-0.5 -mb-px ${isDark ? 'bg-neutral-100' : 'bg-neutral-900'}`} />
          )}
        </button>
      </div>

      {activeView === 'wait-times' && (
        <div className="md:hidden mt-4">
          <button
            type="button"
            onClick={() => setIsLegendExpanded(!isLegendExpanded)}
            className={`flex w-full items-center justify-between gap-2 border px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors duration-150 ${
              isDark
                ? 'border-neutral-800 text-neutral-400 hover:bg-neutral-900'
                : 'border-neutral-200 text-neutral-500 hover:bg-neutral-50'
            }`}
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
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  {labels.shortWait}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  {labels.moderateWait}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  {labels.longWait}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  <span className="h-2 w-2 rounded-full bg-neutral-400" />
                  {labels.unknownWait}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'wait-times' && (
        <div className="hidden flex-wrap items-center gap-4 md:flex mt-4">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-neutral-600' : 'text-neutral-400'}`}>
            {labels.legendTitle}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            {labels.shortWait}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            {labels.moderateWait}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            {labels.longWait}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            <span className="h-2 w-2 rounded-full bg-neutral-400" />
            {labels.unknownWait}
          </span>
        </div>
      )}

      {activeView === 'wait-times' && (
        <div
          className={`mt-4 border-l-2 pl-3 text-xs leading-relaxed font-medium ${
            isDark
              ? 'border-neutral-700 text-neutral-500'
              : 'border-neutral-300 text-neutral-400'
          }`}
          role="note"
        >
          {waitSemanticsHint}
        </div>
      )}
    </header>
  )
}
