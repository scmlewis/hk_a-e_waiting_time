import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { FilterBar } from './components/FilterBar'
import { AeOverview } from './components/AeOverview'
import { HospitalCard } from './components/HospitalCard'
import { HospitalTable } from './components/HospitalTable'
import { LastUpdated } from './components/LastUpdated'
import { CLUSTER_ORDER, CLUSTER_NAME_ZH_HK } from './constants/hospitalMeta'
import { getLabels } from './constants/labels'
import { TRIAGE_KEYS } from './constants/triage'
import { trackEvent } from './services/telemetry'
import type { HospitalWaitingTime, TriageCategory } from './types/ae'
import { haversineDistanceKm } from './utils/distance'
import { localizeWaitTimeText } from './utils/localizeWaitTime'
import { sortHospitals, type SortMode } from './utils/sort'
import { Icon } from './components/Icon'

import { useSettings } from './hooks/useSettings'
import { useLocation } from './hooks/useLocation'
import { useWaitingTimes } from './hooks/useWaitingTimes'

type AppView = 'wait-times' | 'overview'

function App() {
  const { languageMode, resolvedTheme, isDark, toggleThemeMode, toggleLanguageMode } = useSettings()
  const { userLocation, locationStatus, handleUseMyLocation, handleClearLocation } = useLocation()
  const { hospitals, loading, isRefreshing, error, refreshError, isStale, isSourceStale, countdown, sourceUpdateTime, loadData } = useWaitingTimes()

  const [searchValue, setSearchValue] = useState('')
  const [selectedCluster, setSelectedCluster] = useState('')
  const [selectedTriageCategory, setSelectedTriageCategory] = useState<TriageCategory>('III')
  const [sortMode, setSortMode] = useState<SortMode>('waiting')
  const [activeView, setActiveView] = useState<AppView>('wait-times')
  const [expandedHospitalName, setExpandedHospitalName] = useState<string | null>(null)
  const [isLegendExpanded, setIsLegendExpanded] = useState(false)
  const [isMobileFilterSheetOpen, setIsMobileFilterSheetOpen] = useState(false)
  const [isMobileSortSheetOpen, setIsMobileSortSheetOpen] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [refreshPulse, setRefreshPulse] = useState(false)
  const prevHospitalCountRef = useRef(0)
  
  const hasTrackedPageViewRef = useRef(false)
  const hadSearchValueRef = useRef(false)
  const filterSheetTitleId = 'mobile-filter-sheet-title'
  const sortSheetTitleId = 'mobile-sort-sheet-title'
  const filterSheetCloseButtonRef = useRef<HTMLButtonElement | null>(null)
  const sortSheetCloseButtonRef = useRef<HTMLButtonElement | null>(null)
  const lastFocusedElementBeforeSheetRef = useRef<HTMLElement | null>(null)

  const handleSortModeChange = useCallback((mode: SortMode) => {
    setSortMode((previousMode) => {
      if (previousMode !== mode) {
        void trackEvent('sort_mode_changed', { mode })
      }

      return mode
    })
  }, [])


  const handleViewChange = useCallback((nextView: AppView) => {
    setActiveView(nextView)
    void trackEvent('view_changed', { view: nextView })
  }, [])


  const handleClusterChange = useCallback((value: string) => {
    setSelectedCluster((previousValue) => {
      if (previousValue !== value) {
        void trackEvent('cluster_filter_changed', {
          from: previousValue || 'all',
          to: value || 'all',
        })
      }

      return value
    })
  }, [])

  const handleTriageCategoryChange = useCallback((value: TriageCategory) => {
    setSelectedTriageCategory((previousValue) => {
      if (previousValue !== value) {
        void trackEvent('triage_category_changed', {
          from: previousValue,
          to: value,
        })
      }

      return value
    })
  }, [])

  const handleSearchChange = useCallback((value: string) => {
    const trimmed = value.trim()
    const hasSearchNow = trimmed.length > 0

    if (!hadSearchValueRef.current && hasSearchNow) {
      void trackEvent('search_started', { queryLength: trimmed.length })
    }

    if (hadSearchValueRef.current && !hasSearchNow) {
      void trackEvent('search_cleared')
    }

    hadSearchValueRef.current = hasSearchNow
    setSearchValue(value)
  }, [])


  useEffect(() => {
    if (hasTrackedPageViewRef.current) {
      return
    }

    hasTrackedPageViewRef.current = true
    void trackEvent('app_page_view')
  }, [])


  const displayHospitals = useMemo(() => {
    if (languageMode !== 'zh-HK') {
      return hospitals
    }

    return hospitals.map((hospital) => {
      const localized = hospital.details.localized?.['zh-HK']

      return {
        ...hospital,
        hospitalName: localized?.hospitalName ?? hospital.hospitalName,
        details: {
          ...hospital.details,
          district: localized?.district ?? hospital.details.district,
          address: localized?.address ?? hospital.details.address,
        },
        triage: TRIAGE_KEYS.reduce<HospitalWaitingTime['triage']>((accumulator, category) => {
          const original = hospital.triage[category]
          accumulator[category] = {
            ...original,
            waitingTimeText: localizeWaitTimeText(original.waitingTimeText, languageMode),
            upperBoundText: original.upperBoundText ? localizeWaitTimeText(original.upperBoundText, languageMode) : undefined,
          }
          return accumulator
        }, { ...hospital.triage }),
      }
    })
  }, [hospitals, languageMode])

  const availableClusters = useMemo(() => {
    const unique = new Set(
      displayHospitals
        .map((hospital) => hospital.details.cluster)
        .filter((cluster): cluster is string => typeof cluster === 'string' && cluster.trim().length > 0),
    )

    const knownOrder = CLUSTER_ORDER.filter((cluster) => unique.has(cluster))
    const remaining = [...unique]
      .filter((cluster) => !CLUSTER_ORDER.includes(cluster as (typeof CLUSTER_ORDER)[number]))
      .sort((left, right) => left.localeCompare(right))

    return [...knownOrder, ...remaining]
  }, [displayHospitals])

  const visibleHospitals = useMemo(() => {
    const query = searchValue.trim().toLowerCase()

    const filtered = displayHospitals.filter((hospital) => {
      const matchesName = hospital.hospitalName.toLowerCase().includes(query)
      const matchesCluster = selectedCluster ? hospital.details.cluster === selectedCluster : true
      return matchesName && matchesCluster
    })

    const withDistance = filtered.map((hospital) => {
      const distanceKm = userLocation && hospital.details.location ? haversineDistanceKm(userLocation, hospital.details.location) : null

      return {
        ...hospital,
        distanceKm,
      }
    })

    return sortHospitals(withDistance, sortMode, selectedTriageCategory, userLocation)
  }, [displayHospitals, searchValue, selectedCluster, sortMode, selectedTriageCategory, userLocation])

  const groupedHospitals = useMemo(() => {
    const byCluster = new Map<string, HospitalWaitingTime[]>()

    visibleHospitals.forEach((hospital) => {
      const cluster = hospital.details.cluster
      const list = byCluster.get(cluster) ?? []
      list.push(hospital)
      byCluster.set(cluster, list)
    })

    const orderedClusters = [...availableClusters, ...byCluster.keys()].filter(
      (cluster, index, array) => array.indexOf(cluster) === index,
    )

    return orderedClusters
      .map((cluster) => ({
        cluster,
        displayCluster: languageMode === 'zh-HK' ? (CLUSTER_NAME_ZH_HK[cluster] ?? cluster) : cluster,
        hospitals: byCluster.get(cluster) ?? [],
      }))
      .filter((group) => group.hospitals.length > 0)
  }, [availableClusters, languageMode, visibleHospitals])

  const hasActiveFilters = searchValue.trim().length > 0 || selectedCluster.length > 0
  const isNearestSortAvailable = userLocation !== null && locationStatus === 'ready'

  const labels = useMemo(() => getLabels(languageMode), [languageMode])

  const clusterOptions = useMemo(
    () =>
      availableClusters.map((cluster) => ({
        value: cluster,
        label: languageMode === 'zh-HK' ? (CLUSTER_NAME_ZH_HK[cluster] ?? cluster) : cluster,
      })),
    [availableClusters, languageMode],
  )

  const handleToggleExpanded = useCallback((hospitalName: string) => {
    setExpandedHospitalName((currentValue) => (currentValue === hospitalName ? null : hospitalName))
  }, [])

  const handleClearFilters = useCallback(() => {
    handleSearchChange('')
    handleClusterChange('')
  }, [handleClusterChange, handleSearchChange])

  useEffect(() => {
    if (sortMode === 'nearest' && !isNearestSortAvailable) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSortMode('waiting')
    }
  }, [isNearestSortAvailable, sortMode])

  useEffect(() => {
    if (!isNearestSortAvailable && isMobileSortSheetOpen && sortMode === 'nearest') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsMobileSortSheetOpen(false)
    }
  }, [isMobileSortSheetOpen, isNearestSortAvailable, sortMode])

  useEffect(() => {
    if (sortMode === 'nearest') {
      void trackEvent('nearest_sort_used', { hasLocation: isNearestSortAvailable })
    }
  }, [isNearestSortAvailable, sortMode])

  const locationStatusMessage = useMemo(() => {
    switch (locationStatus) {
      case 'locating':
        return labels.locating
      case 'ready':
        return labels.locationReady
      case 'unsupported':
        return labels.locationNotSupported
      case 'denied':
        return labels.locationPermissionDenied
      case 'error':
        return labels.locationFailed
      default:
        return null
    }
  }, [labels, locationStatus])

  const mobileSortLabel = useMemo(() => {
    if (sortMode === 'name') {
      return labels.sortAZ
    }

    if (sortMode === 'nearest') {
      return labels.sortNearest
    }

    return labels.sortWaiting
  }, [labels.sortAZ, labels.sortNearest, labels.sortWaiting, sortMode])

  const applyMobileSortMode = useCallback(
    (mode: SortMode) => {
      handleSortModeChange(mode)
      setIsMobileSortSheetOpen(false)
    },
    [handleSortModeChange],
  )

  const activeClusterLabel = useMemo(() => {
    if (!selectedCluster) {
      return labels.filter.allClusters
    }

    return languageMode === 'zh-HK' ? (CLUSTER_NAME_ZH_HK[selectedCluster] ?? selectedCluster) : selectedCluster
  }, [languageMode, labels.filter.allClusters, selectedCluster])

  const hasMobileOverlayOpen = isMobileFilterSheetOpen || isMobileSortSheetOpen
  const waitSemanticsHint =
    languageMode === 'zh-HK'
      ? '一半輪候病人能在以下時間內就診，大部份人可於括號內顯示的時間就診。'
      : 'Half of waiting patients can be seen within the following time, and most can be seen within the time shown in brackets.'
  const shouldShowLocationPrompt = locationStatus === 'idle' && userLocation === null

  const locationControls = (userLocation !== null || locationStatus !== 'idle') && (
    <div
      className={`mt-2.5 flex flex-wrap items-center gap-2.5 rounded-xl border p-3 text-sm md:gap-2 md:p-2.5 md:text-sm ${isDark
        ? 'border-sky-900/50 bg-sky-950/20 text-slate-300 md:bg-slate-950'
        : 'border-sky-100/80 bg-sky-50/70 text-slate-600 md:bg-white'
        }`}
    >
      {userLocation === null && (
        <button
          type="button"
          onClick={() => void handleUseMyLocation()}
          disabled={locationStatus === 'locating'}
          className={`inline-flex min-h-11 cursor-pointer items-center rounded-md px-3.5 py-2 text-sm font-semibold shadow-sm transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-1 md:min-h-0 md:px-2.5 md:py-1.5 md:text-xs ${isDark
            ? 'bg-sky-600 text-white hover:bg-sky-500 active:scale-[0.98]'
            : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]'
            }`}
        >
          <Icon name="map-pin" className="mr-1.5 h-4 w-4 md:h-3.5 md:w-3.5" strokeWidth={2} />
          {locationStatus === 'locating' ? labels.locating : labels.useMyLocation}
        </button>
      )}

      {userLocation && (
        <button
          type="button"
          onClick={handleClearLocation}
          className={`inline-flex min-h-11 cursor-pointer items-center rounded-md border px-3.5 py-2 text-sm font-medium transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-1 md:min-h-0 md:px-2.5 md:py-1.5 md:text-xs ${isDark
            ? 'border-slate-600 bg-slate-900 text-slate-200 hover:bg-slate-800'
            : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
        >
          {labels.clearLocation}
        </button>
      )}

      {locationStatusMessage && <span>{locationStatusMessage}</span>}
      <span className={isDark ? 'text-slate-500' : 'text-slate-500'}>{labels.distanceEstimateHint}</span>
    </div>
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExpandedHospitalName(null)
  }, [selectedCluster, selectedTriageCategory, searchValue])



  useEffect(() => {
    if (!isMobileFilterSheetOpen) {
      return
    }

    lastFocusedElementBeforeSheetRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    filterSheetCloseButtonRef.current?.focus()
  }, [isMobileFilterSheetOpen])

  useEffect(() => {
    if (!isMobileSortSheetOpen) {
      return
    }

    lastFocusedElementBeforeSheetRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    sortSheetCloseButtonRef.current?.focus()
  }, [isMobileSortSheetOpen])

  useEffect(() => {
    if (hasMobileOverlayOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }

    document.body.style.overflow = ''
    lastFocusedElementBeforeSheetRef.current?.focus()
  }, [hasMobileOverlayOpen])

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const currentCount = hospitals.length
    if (prevHospitalCountRef.current > 0 && currentCount > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRefreshPulse(true)
      const timer = setTimeout(() => setRefreshPulse(false), 1500)
      return () => clearTimeout(timer)
    }
    prevHospitalCountRef.current = currentCount
  }, [hospitals])

  return (
    <div className={`relative isolate overflow-x-clip pb-28 md:pb-10 ${isDark ? 'bg-slate-950 text-slate-100' : 'text-slate-900'} ${refreshPulse ? 'refresh-pulse' : ''}`}>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className={`absolute left-1/2 top-[-220px] h-[420px] w-[420px] -translate-x-1/2 rounded-full blur-3xl ${isDark ? 'bg-cyan-500/15' : 'bg-cyan-200/35'
            }`}
        />
        <div
          className={`absolute right-[-140px] top-[180px] h-[280px] w-[280px] rounded-full blur-3xl ${isDark ? 'bg-indigo-500/15' : 'bg-sky-200/35'
            }`}
        />
      </div>

      <main className="mx-auto min-h-screen w-full max-w-6xl space-y-6 px-4 py-4 md:space-y-7 md:px-6 md:py-6 lg:px-8">
        <AppHeader
          isDark={isDark}
          labels={labels}
          languageMode={languageMode}
          resolvedTheme={resolvedTheme}
          loading={loading}
          isRefreshing={isRefreshing}
          activeView={activeView}
          isLegendExpanded={isLegendExpanded}
          waitSemanticsHint={waitSemanticsHint}
          toggleLanguageMode={toggleLanguageMode}
          toggleThemeMode={toggleThemeMode}
          loadData={loadData}
          handleViewChange={handleViewChange}
          setIsLegendExpanded={setIsLegendExpanded}
        />

        {activeView === 'wait-times' && (
          <>
        <LastUpdated
          sourceUpdateTime={sourceUpdateTime}
          countdownSeconds={countdown}
          isStale={isStale}
          isDark={isDark}
          labels={labels.lastUpdated}
          languageMode={languageMode}
        />

        {shouldShowLocationPrompt && (
          <section
            className={`rounded-xl border p-3 md:p-4 ${isDark ? 'border-sky-900/50 bg-sky-950/25' : 'border-sky-100 bg-sky-50/70'
              }`}
            aria-live="polite"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className={`text-sm md:text-base ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                {labels.sortNearest} • {labels.distanceEstimateHint}
              </p>
              <button
                type="button"
                onClick={() => void handleUseMyLocation()}
                className={`inline-flex min-h-11 items-center rounded-lg px-4 py-2.5 text-sm font-bold shadow-md transition-all duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-1 active:scale-[0.98] ${isDark
                  ? 'bg-sky-600 text-white hover:bg-sky-500'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
              >
                <Icon name="map-pin" className="mr-2 h-4 w-4" strokeWidth={2.5} />
                {labels.useMyLocation}
              </button>
            </div>
          </section>
        )}


        {!loading && isRefreshing && (
          <p
            className={`rounded-lg border p-3 text-sm ${isDark ? 'border-sky-600/50 bg-sky-900/35 text-sky-200' : 'border-sky-200 bg-sky-50 text-sky-700'
              }`}
            role="status"
            aria-live="polite"
          >
            {labels.refreshingData}
          </p>
        )}

        {!loading && refreshError && hospitals.length > 0 && (
          <p
            className={`rounded-lg border p-3 text-sm ${isDark ? 'border-amber-600/50 bg-amber-900/25 text-amber-200' : 'border-amber-200 bg-amber-50 text-amber-800'
              }`}
            role="status"
            aria-live="polite"
          >
            {refreshError}. {labels.refreshErrorSuffix}
          </p>
        )}

        {!loading && isSourceStale && hospitals.length > 0 && (
          <p
            className={`rounded-lg border p-3 text-sm ${isDark ? 'border-amber-600/50 bg-amber-900/25 text-amber-200' : 'border-amber-200 bg-amber-50 text-amber-800'
              }`}
            role="status"
            aria-live="polite"
          >
            {labels.staleTimestamp}
          </p>
        )}

        <div className="enter-fade-up md:sticky md:top-4 md:z-20">
          <div className="hidden md:block">
            <FilterBar
              isDark={isDark}
              labels={labels.filter}
              searchValue={searchValue}
              onSearchChange={handleSearchChange}
              selectedTriageCategory={selectedTriageCategory}
              onTriageCategoryChange={handleTriageCategoryChange}
              clusterOptions={clusterOptions}
              selectedCluster={selectedCluster}
              onClusterChange={handleClusterChange}
            />
            {locationControls}
          </div>
        </div>

        <section className="space-y-3 md:hidden">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${isDark ? 'border-slate-700 bg-slate-900/80 text-slate-300' : 'border-slate-200 bg-white/90 text-slate-600'
                }`}
            >
              {labels.triageCategoryLabels[selectedTriageCategory]}
            </span>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${isDark ? 'border-slate-700 bg-slate-900/80 text-slate-300' : 'border-slate-200 bg-white/90 text-slate-600'
                }`}
            >
              {activeClusterLabel}
            </span>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${isDark ? 'border-slate-700 bg-slate-900/80 text-slate-300' : 'border-slate-200 bg-white/90 text-slate-600'
                }`}
            >
              {mobileSortLabel}
            </span>
          </div>

          {loading &&
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className={`animate-pulse rounded-lg border p-4 motion-reduce:animate-none ${isDark ? 'border-slate-700 bg-slate-900/80' : 'border-slate-200 bg-white'
                  }`}
              >
                <div className={`h-4 w-2/3 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
                <div className={`mt-3 h-6 w-1/3 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
                <div className={`mt-2 h-3 w-1/4 rounded ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
              </div>
            ))}

          {!loading && error && (
            <p
              className={`rounded-lg border p-4 text-sm ${isDark ? 'border-rose-700/60 bg-rose-900/30 text-rose-200' : 'border-rose-200 bg-rose-50 text-rose-700'
                }`}
              role="alert"
            >
              {error}
            </p>
          )}

          {!loading && !error && hospitals.length === 0 && (
            <p className={`rounded-lg p-4 text-sm ${isDark ? 'bg-slate-900/80 text-slate-300' : 'bg-white text-slate-600'}`}>
              {labels.noDataFromSource}
            </p>
          )}

          {!loading && !error && hospitals.length > 0 && groupedHospitals.length === 0 && (
            <div className={`space-y-3 rounded-lg p-4 text-sm ${isDark ? 'bg-slate-900/80 text-slate-300' : 'bg-white text-slate-600'}`}>
              <p>{hasActiveFilters ? labels.noMatch : labels.noHospitals}</p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className={`inline-flex cursor-pointer items-center rounded-md border px-3 py-1.5 text-xs font-medium transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-1 ${isDark
                    ? 'border-slate-600 bg-slate-900 text-slate-200 hover:bg-slate-800'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  {labels.clearFilters}
                </button>
              )}
            </div>
          )}

          {!loading &&
            groupedHospitals.map((group) => (
              <section key={group.cluster} className="space-y-2">
                <h2
                  className={`rounded-lg border-l-4 border-y border-r px-3 py-2 text-sm font-semibold tracking-tight shadow-md backdrop-blur ${isDark
                    ? 'border-l-sky-500 border-y-slate-700 border-r-slate-700 bg-slate-900 text-slate-100'
                    : 'border-l-sky-500 border-y-slate-200 border-r-slate-200 bg-slate-50 text-slate-900'
                    }`}
                >
                  {group.displayCluster} ({group.hospitals.length})
                </h2>
                <div className="space-y-2">
                  {group.hospitals.map((hospital) => (
                    <HospitalCard
                      isDark={isDark}
                      labels={labels.hospitalCard}
                      languageMode={languageMode}
                      key={hospital.hospitalName}
                      hospital={hospital}
                      selectedCategory={selectedTriageCategory}
                      isExpanded={expandedHospitalName === hospital.hospitalName}
                      onToggleExpanded={() => handleToggleExpanded(hospital.hospitalName)}
                    />
                  ))}
                </div>
              </section>
              ))}
            </section>
            </>
            )}

        {activeView === 'overview' && <AeOverview isDark={isDark} labels={labels.overview} />}

        {activeView === 'wait-times' && loading && (
          <section
            className={`hidden animate-pulse space-y-2 rounded-2xl border p-3 motion-reduce:animate-none md:block ${isDark ? 'border-slate-700 bg-slate-900/80' : 'border-slate-200 bg-white/90'
              }`}
            aria-hidden
          >
            <div className={`h-9 w-72 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className={`h-12 rounded ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
            ))}
          </section>
        )}

        {activeView === 'wait-times' && !loading && !error && groupedHospitals.length > 0 && (
          <HospitalTable
            isDark={isDark}
            labels={labels.hospitalTable}
            languageMode={languageMode}
            triageCategoryLabels={labels.triageCategoryLabels}
            groups={groupedHospitals}
            sortMode={sortMode}
            onSortModeChange={handleSortModeChange}
            isNearestSortAvailable={isNearestSortAvailable}
            selectedCategory={selectedTriageCategory}
            expandedHospitalName={expandedHospitalName}
            onToggleExpanded={handleToggleExpanded}
          />
        )}

        {activeView === 'wait-times' && !loading && !error && hospitals.length > 0 && groupedHospitals.length === 0 && (
          <div
            className={`hidden space-y-3 rounded-lg border p-4 text-sm shadow-sm md:block ${isDark ? 'border-slate-700 bg-slate-900/80 text-slate-300' : 'border-slate-200 bg-white text-slate-600'
              }`}
          >
            <p>{hasActiveFilters ? labels.noMatch : labels.noHospitals}</p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className={`inline-flex cursor-pointer items-center rounded-md border px-3 py-1.5 text-xs font-medium transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-1 ${isDark
                  ? 'border-slate-600 bg-slate-900 text-slate-200 hover:bg-slate-800'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
              >
                {labels.clearFilters}
              </button>
            )}
          </div>
        )}

        {activeView === 'wait-times' && !loading && error && hospitals.length === 0 && (
          <p
            className={`hidden rounded-lg border p-4 text-sm md:block ${isDark ? 'border-rose-700/60 bg-rose-900/30 text-rose-200' : 'border-rose-200 bg-rose-50 text-rose-700'
              }`}
            role="alert"
          >
            {error}
          </p>
        )}
      </main>

      {activeView === 'wait-times' && hasMobileOverlayOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-950/40 md:hidden"
          onClick={() => {
            setIsMobileFilterSheetOpen(false)
            setIsMobileSortSheetOpen(false)
          }}
          aria-hidden="true"
        />
      )}

      {activeView === 'wait-times' && <div
        className={`fixed inset-x-0 bottom-0 z-30 rounded-t-2xl border-x border-t p-4 shadow-2xl backdrop-blur transition-transform duration-300 motion-reduce:transition-none md:hidden ${isMobileFilterSheetOpen ? 'translate-y-0' : 'translate-y-full'
          } ${isDark ? 'border-sky-900/50 bg-slate-900/95' : 'border-sky-100 bg-white/98'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={filterSheetTitleId}
        aria-hidden={!isMobileFilterSheetOpen}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setIsMobileFilterSheetOpen(false)
          }
        }}
      >
        <div className="mb-3 flex items-center justify-between">
          <p id={filterSheetTitleId} className={`text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{labels.showFiltersSettings}</p>
          <button
            ref={filterSheetCloseButtonRef}
            type="button"
            onClick={() => setIsMobileFilterSheetOpen(false)}
            className={`rounded-md border px-3 py-1.5 text-sm font-semibold ${isDark ? 'border-slate-700 bg-slate-900 text-slate-200' : 'border-slate-300 bg-white text-slate-700'
              }`}
          >
            {labels.hospitalTable.hide}
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto space-y-2.5 pb-1">
          <FilterBar
            isDark={isDark}
            labels={labels.filter}
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            selectedTriageCategory={selectedTriageCategory}
            onTriageCategoryChange={handleTriageCategoryChange}
            clusterOptions={clusterOptions}
            selectedCluster={selectedCluster}
            onClusterChange={handleClusterChange}
          />
          {locationControls}
        </div>
      </div>}

      {activeView === 'wait-times' && <div
        className={`fixed inset-x-0 bottom-0 z-30 rounded-t-2xl border-x border-t p-4 shadow-2xl backdrop-blur transition-transform duration-300 motion-reduce:transition-none md:hidden ${isMobileSortSheetOpen ? 'translate-y-0' : 'translate-y-full'
          } ${isDark ? 'border-indigo-900/50 bg-slate-900/95' : 'border-indigo-100 bg-white/98'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={sortSheetTitleId}
        aria-hidden={!isMobileSortSheetOpen}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setIsMobileSortSheetOpen(false)
          }
        }}
      >
        <div className="mb-3 flex items-center justify-between">
          <p id={sortSheetTitleId} className={`text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{labels.quickSort}</p>
          <button
            ref={sortSheetCloseButtonRef}
            type="button"
            onClick={() => setIsMobileSortSheetOpen(false)}
            className={`rounded-md border px-3 py-1.5 text-sm font-semibold ${isDark ? 'border-slate-700 bg-slate-900 text-slate-200' : 'border-slate-300 bg-white text-slate-700'
              }`}
          >
            {labels.hospitalTable.hide}
          </button>
        </div>
        <div className="grid gap-2">
          <button
            type="button"
            onClick={() => applyMobileSortMode('waiting')}
            className={`w-full rounded-lg border px-4 py-3 text-left text-base font-medium ${sortMode === 'waiting'
              ? isDark
                ? 'border-slate-600 bg-slate-100 text-slate-900'
                : 'border-slate-900 bg-slate-900 text-white'
              : isDark
                ? 'border-slate-700 bg-slate-900 text-slate-200'
                : 'border-slate-300 bg-white text-slate-700'
              }`}
          >
            {labels.sortWaiting}
          </button>
          <button
            type="button"
            onClick={() => applyMobileSortMode('name')}
            className={`w-full rounded-lg border px-4 py-3 text-left text-base font-medium ${sortMode === 'name'
              ? isDark
                ? 'border-slate-600 bg-slate-100 text-slate-900'
                : 'border-slate-900 bg-slate-900 text-white'
              : isDark
                ? 'border-slate-700 bg-slate-900 text-slate-200'
                : 'border-slate-300 bg-white text-slate-700'
              }`}
          >
            {labels.sortAZ}
          </button>
          <button
            type="button"
            onClick={() => applyMobileSortMode('nearest')}
            disabled={!isNearestSortAvailable}
            className={`w-full rounded-lg border px-4 py-3 text-left text-base font-medium disabled:cursor-not-allowed disabled:opacity-50 ${sortMode === 'nearest'
              ? isDark
                ? 'border-slate-600 bg-slate-100 text-slate-900'
                : 'border-slate-900 bg-slate-900 text-white'
              : isDark
                ? 'border-slate-700 bg-slate-900 text-slate-200'
                : 'border-slate-300 bg-white text-slate-700'
              }`}
          >
            {labels.sortNearest}
          </button>
        </div>
      </div>}

      {activeView === 'wait-times' && <div
        className={`fixed inset-x-0 bottom-0 z-30 border-t px-4 pt-3 pb-8 backdrop-blur transition-transform duration-300 motion-reduce:transition-none md:hidden ${hasMobileOverlayOpen ? 'translate-y-full' : 'translate-y-0'
          } ${isDark ? 'border-slate-800/80 bg-slate-900/82' : 'border-indigo-100 bg-white/92'
          }`}
      >
        <div className="mx-auto flex w-full max-w-6xl items-center gap-2.5">
          <button
            type="button"
            onClick={() => void loadData()}
            disabled={loading || isRefreshing}
            className={`min-h-12 min-w-[3.5rem] flex items-center justify-center rounded-lg border transition-all duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-1 active:scale-[0.98] ${isDark
              ? 'border-slate-700 bg-slate-900 text-slate-100'
              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            aria-label={labels.refreshNow}
          >
            <Icon name="refresh" className={`h-6 w-6 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => {
              setIsMobileFilterSheetOpen(false)
              setIsMobileSortSheetOpen(true)
            }}
            className={`flex-1 min-h-12 cursor-pointer rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-1 ${isDark
              ? 'border-slate-700 bg-slate-900 text-slate-100'
              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
          >
            <div className="text-[10px] uppercase tracking-wider opacity-60 mb-0.5">{labels.quickSort}</div>
            <div className="truncate">{mobileSortLabel}</div>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsMobileSortSheetOpen(false)
              setIsMobileFilterSheetOpen((value) => !value)
            }}
            className={`flex-1 min-h-12 cursor-pointer rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-1 ${isDark
              ? 'border-slate-700 bg-slate-900 text-slate-100'
              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
          >
            <div className="text-[10px] uppercase tracking-wider opacity-60 mb-0.5">{labels.quickFilter}</div>
            <div className="truncate">{activeClusterLabel}</div>
          </button>
        </div>
      </div>}

      {activeView === 'wait-times' && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll to top"
          className={`fixed bottom-24 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border shadow-lg backdrop-blur transition-all duration-300 hover:scale-110 active:scale-95 md:hidden ${
            showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
          } ${isDark ? 'border-slate-700 bg-slate-900/90 text-slate-200 hover:bg-slate-800' : 'border-slate-300 bg-white/90 text-slate-700 hover:bg-slate-100'}`}
        >
          <Icon name="chevron-down" className="h-5 w-5 -rotate-180" />
        </button>
      )}
    </div>
  )
}

export default App
