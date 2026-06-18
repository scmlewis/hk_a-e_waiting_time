import type { AppLabels, LanguageMode } from '../constants/labels'
import { Icon } from './Icon'

export type AppView = 'wait-times' | 'overview'

interface AppHeaderProps {
  isDark: boolean
  labels: AppLabels
  languageMode: LanguageMode
  resolvedTheme: string
  loading: boolean
  isRefreshing: boolean
  activeView: AppView
  isLegendExpanded: boolean
  waitSemanticsHint: string
  toggleLanguageMode: () => void
  toggleThemeMode: () => void
  loadData: () => Promise<void>
  handleViewChange: (view: AppView) => void
  setIsLegendExpanded: (expanded: boolean) => void
}

export function AppHeader({
  isDark,
  labels,
  languageMode,
  resolvedTheme,
  loading,
  isRefreshing,
  activeView,
  isLegendExpanded,
  waitSemanticsHint,
  toggleLanguageMode,
  toggleThemeMode,
  loadData,
  handleViewChange,
  setIsLegendExpanded,
}: AppHeaderProps) {
  return (
    <header
      className={`enter-fade-up space-y-5 rounded-2xl border p-5 backdrop-blur-xl md:space-y-6 md:p-6 transition-all duration-300 ${
        isDark
          ? 'border-slate-800/80 bg-slate-900/60 shadow-[0_8px_32px_rgba(0,0,0,0.5)]'
          : 'border-white/60 bg-white/70 shadow-[0_8px_32px_rgba(15,23,42,0.06)]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className={`flex items-center text-2xl font-extrabold tracking-tight md:text-3xl transition-colors duration-300 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
            <img src={`${import.meta.env.BASE_URL}emergency-icon.svg`} alt="" aria-hidden="true" className="mr-3 h-8 w-8 rounded-lg shadow-sm" />
            <span className="bg-gradient-to-br from-indigo-500 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-500">
              {labels.title}
            </span>
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={toggleLanguageMode}
            className={`inline-flex min-h-11 items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition-all duration-300 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 ${
              isDark
                ? 'border-slate-700 bg-slate-800/80 text-slate-100 hover:bg-slate-700 hover:border-slate-600'
                : 'border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
            }`}
            aria-label={`${labels.languageTraditionalChinese} / ${labels.languageEnglish}`}
            aria-pressed={languageMode === 'zh-HK'}
          >
            <span className="font-bold">語</span>
            <span>{languageMode === 'en' ? 'EN' : '繁'}</span>
          </button>

          <button
            type="button"
            onClick={toggleThemeMode}
            className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border px-3 py-2 transition-all duration-300 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 ${
              isDark
                ? 'border-slate-700 bg-slate-800/80 text-yellow-400 hover:bg-slate-700 hover:border-slate-600'
                : 'border-slate-200 bg-white/80 text-indigo-600 hover:bg-slate-50 hover:border-slate-300'
            }`}
            aria-label={resolvedTheme === 'dark' ? labels.themeLight : labels.themeDark}
            aria-pressed={resolvedTheme === 'dark'}
          >
            {resolvedTheme === 'dark' ? (
              <Icon name="sun" className="h-5 w-5" strokeWidth={2} />
            ) : (
              <Icon name="moon" className="h-5 w-5" strokeWidth={2} />
            )}
          </button>

          <button
            type="button"
            onClick={() => void loadData()}
            disabled={loading || isRefreshing}
            className={`hidden cursor-pointer items-center rounded-xl border px-4 py-2 text-sm font-semibold shadow-sm transition-all duration-300 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 md:inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 ${
              isDark
                ? 'border-indigo-600 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 hover:border-indigo-500'
                : 'border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isRefreshing ? (
              <Icon name="spinner" className="animate-spin -ml-1 mr-2 h-4 w-4" />
            ) : null}
            {isRefreshing ? labels.refreshing : labels.refreshNow}
          </button>
        </div>
      </div>

      <div
        className={`grid w-full grid-cols-2 items-center gap-1 rounded-xl border p-1.5 md:inline-flex md:w-auto transition-colors duration-300 ${
          isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-100/50'
        }`}
        role="tablist"
        aria-label="Main views"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeView === 'wait-times'}
          onClick={() => handleViewChange('wait-times')}
          className={`w-full rounded-lg px-4 py-2 text-[15px] font-semibold transition-all duration-300 md:w-auto md:py-1.5 md:text-sm ${
            activeView === 'wait-times'
              ? isDark
                ? 'bg-slate-700 text-white shadow-sm'
                : 'bg-white text-slate-900 shadow-sm'
              : isDark
                ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          {labels.viewWaitTimes}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeView === 'overview'}
          onClick={() => handleViewChange('overview')}
          className={`w-full rounded-lg px-4 py-2 text-[15px] font-semibold transition-all duration-300 md:w-auto md:py-1.5 md:text-sm ${
            activeView === 'overview'
              ? isDark
                ? 'bg-slate-700 text-white shadow-sm'
                : 'bg-white text-slate-900 shadow-sm'
              : isDark
                ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          {labels.viewOverview}
        </button>
      </div>

      {activeView === 'wait-times' && (
        <div className="md:hidden">
          <button
            type="button"
            onClick={() => setIsLegendExpanded(!isLegendExpanded)}
            className={`flex w-full items-center justify-between gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-300 ${
              isDark
                ? 'border-slate-800 bg-slate-900/40 text-slate-300 hover:bg-slate-800/80'
                : 'border-slate-200 bg-slate-50/80 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center gap-2">
              <Icon name="info" className="h-4 w-4 text-indigo-500" strokeWidth={2.5} />
              {labels.legendTitle}
            </span>
            <Icon
              name="chevron-down"
              className={`h-4 w-4 transition-transform duration-300 ${isLegendExpanded ? 'rotate-180' : ''}`}
              strokeWidth={2.5}
            />
          </button>
          <div
            className={`grid overflow-hidden transition-all duration-300 ${
              isLegendExpanded ? 'mt-3 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-0'
            }`}
          >
            <div className="min-h-0">
              <div className="flex flex-wrap gap-3 px-2 py-1">
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-500 dark:text-emerald-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  {labels.shortWait}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-500 dark:text-amber-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                  {labels.moderateWait}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-500 dark:text-rose-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                  {labels.longWait}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-400 shadow-[0_0_8px_rgba(148,163,184,0.5)]" />
                  {labels.unknownWait}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'wait-times' && (
        <div className="hidden flex-wrap items-center gap-4 md:flex">
          <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {labels.legendTitle}
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            {labels.shortWait}
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 dark:text-amber-400">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
            {labels.moderateWait}
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-600 dark:text-rose-400">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
            {labels.longWait}
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-400 shadow-[0_0_8px_rgba(148,163,184,0.4)]" />
            {labels.unknownWait}
          </span>
        </div>
      )}

      {activeView === 'wait-times' && (
        <div
          className={`rounded-xl border px-4 py-3 text-xs leading-relaxed font-medium transition-colors duration-300 ${
            isDark 
              ? 'border-indigo-500/20 bg-indigo-500/10 text-indigo-200' 
              : 'border-indigo-100 bg-indigo-50/60 text-indigo-800'
          }`}
          role="note"
        >
          {waitSemanticsHint}
        </div>
      )}
    </header>
  )
}
