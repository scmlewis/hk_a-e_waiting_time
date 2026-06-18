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
      className={`mt-2 flex flex-wrap items-center gap-2 border p-3 text-sm md:gap-2 md:p-2.5 md:text-sm ${isDark
        ? 'border-neutral-800 text-neutral-400'
        : 'border-neutral-200 text-neutral-600'
        }`}
    >
      {userLocation === null && (
        <button
          type="button"
          onClick={() => void handleUseMyLocation()}
          disabled={locationStatus === 'locating'}
          className={`inline-flex min-h-11 cursor-pointer items-center px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-1 md:min-h-0 md:px-2.5 md:py-1.5 ${isDark
            ? 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
            : 'bg-neutral-900 text-neutral-50 hover:bg-neutral-800'
            }`}
        >
          <Icon name="map-pin" className="mr-1.5 h-3.5 w-3.5" strokeWidth={2.5} />
          {locationStatus === 'locating' ? labels.locating : labels.useMyLocation}
        </button>
      )}

      {userLocation && (
        <button
          type="button"
          onClick={handleClearLocation}
          className={`inline-flex min-h-11 cursor-pointer items-center border px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-1 md:min-h-0 md:px-2.5 md:py-1.5 ${isDark
            ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
            : 'border-neutral-300 text-neutral-700 hover:bg-neutral-100'
            }`}
        >
          {labels.clearLocation}
        </button>
      )}

      {locationStatusMessage && <span>{locationStatusMessage}</span>}
      <span className={isDark ? 'text-neutral-600' : 'text-neutral-400'}>{labels.distanceEstimateHint}</span>
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
    <div className={`relative overflow-x-clip pb-28 md:pb-10 ${isDark ? 'text-neutral-100' : 'text-neutral-900'} ${refreshPulse ? 'refresh-pulse' : ''}`}>
      <main className="mx-auto min-h-screen w-full max-w-6xl space-y-4 px-4 py-4 md:space-y-5 md:px-6 md:py-6 lg:px-8">
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
            className={`border p-3 md:p-4 ${isDark ? 'border-neutral-800' : 'border-neutral-200'
              }`}
            aria-live="polite"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className={`text-sm md:text-base ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                {labels.sortNearest} &bull; {labels.distanceEstimateHint}
              </p>
              <button
                type="button"
                onClick={() => void handleUseMyLocation()}
                className={`inline-flex min-h-11 items-center px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-1 ${isDark
                  ? 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                  : 'bg-neutral-900 text-neutral-50 hover:bg-neutral-800'
                  }`}
              >
                <Icon name="map-pin" className="mr-2 h-3.5 w-3.5" strokeWidth={2.5} />
                {labels.useMyLocation}
              </button>
            </div>
          </section>
        )}


        {!loading && isRefreshing && (
          <p
            className={`border p-3 text-xs font-medium uppercase tracking-wider ${isDark ? 'border-neutral-800 text-neutral-400' : 'border-neutral-200 text-neutral-500'
              }`}
            role="status"
            aria-live="polite"
          >
            {labels.refreshingData}
          </p>
        )}

        {!loading && refreshError && hospitals.length > 0 && (
          <p
            className={`border border-red-800/50 p-3 text-sm ${isDark ? 'text-red-300' : 'text-red-700'
              }`}
            role="status"
            aria-live="polite"
          >
            {refreshError}. {labels.refreshErrorSuffix}
          </p>
        )}

        {!loading && isSourceStale && hospitals.length > 0 && (
          <p
            className={`border border-amber-700/50 p-3 text-sm ${isDark ? 'text-amber-300' : 'text-amber-700'
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
              className={`inline-flex items-center border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${isDark ? 'border-neutral-700 text-neutral-400' : 'border-neutral-300 text-neutral-500'
                }`}
            >
              {labels.triageCategoryLabels[selectedTriageCategory]}
            </span>
            <span
              className={`inline-flex items-center border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${isDark ? 'border-neutral-700 text-neutral-400' : 'border-neutral-300 text-neutral-500'
                }`}
            >
              {activeClusterLabel}
            </span>
            <span
              className={`inline-flex items-center border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${isDark ? 'border-neutral-700 text-neutral-400' : 'border-neutral-300 text-neutral-500'
                }`}
            >
              {mobileSortLabel}
            </span>
          </div>

          {loading &&
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className={`animate-pulse border p-4 motion-reduce:animate-none ${isDark ? 'border-neutral-800' : 'border-neutral-200'
                  }`}
              >
                <div className={`h-3 w-2/3 ${isDark ? 'bg-neutral-800' : 'bg-neutral-200'}`} />
                <div className={`mt-3 h-5 w-1/3 ${isDark ? 'bg-neutral-800' : 'bg-neutral-200'}`} />
                <div className={`mt-2 h-2.5 w-1/4 ${isDark ? 'bg-neutral-800' : 'bg-neutral-100'}`} />
              </div>
            ))}

          {!loading && error && (
            <p
              className={`border border-red-800/50 p-4 text-sm ${isDark ? 'text-red-300' : 'text-red-700'
                }`}
              role="alert"
            >
              {error}
            </p>
          )}

          {!loading && !error && hospitals.length === 0 && (
            <p className={`p-4 text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              {labels.noDataFromSource}
            </p>
          )}

          {!loading && !error && hospitals.length > 0 && groupedHospitals.length === 0 && (
            <div className={`space-y-3 p-4 text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              <p>{hasActiveFilters ? labels.noMatch : labels.noHospitals}</p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className={`inline-flex cursor-pointer items-center border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-1 ${isDark
                    ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                    : 'border-neutral-300 text-neutral-700 hover:bg-neutral-100'
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
                  className={`border-l-4 border-y border-r px-3 py-2 text-[11px] font-bold uppercase tracking-wider ${isDark
                    ? 'border-l-neutral-400 border-y-neutral-800 border-r-neutral-800 text-neutral-300'
                    : 'border-l-neutral-900 border-y-neutral-200 border-r-neutral-200 text-neutral-600'
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
            className={`hidden animate-pulse space-y-2 border p-3 motion-reduce:animate-none md:block ${isDark ? 'border-neutral-800' : 'border-neutral-200'
              }`}
            aria-hidden
          >
            <div className={`h-8 w-72 ${isDark ? 'bg-neutral-800' : 'bg-neutral-200'}`} />
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className={`h-10 ${isDark ? 'bg-neutral-800' : 'bg-neutral-100'}`} />
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
            className={`hidden space-y-3 border p-4 text-sm md:block ${isDark ? 'border-neutral-800 text-neutral-400' : 'border-neutral-200 text-neutral-500'
              }`}
          >
            <p>{hasActiveFilters ? labels.noMatch : labels.noHospitals}</p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className={`inline-flex cursor-pointer items-center border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-1 ${isDark
                  ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                  : 'border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                  }`}
              >
                {labels.clearFilters}
              </button>
            )}
          </div>
        )}

        {activeView === 'wait-times' && !loading && error && hospitals.length === 0 && (
          <p
            className={`hidden border border-red-800/50 p-4 text-sm md:block ${isDark ? 'text-red-300' : 'text-red-700'
              }`}
            role="alert"
          >
            {error}
          </p>
        )}
      </main>

      {activeView === 'wait-times' && hasMobileOverlayOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => {
            setIsMobileFilterSheetOpen(false)
            setIsMobileSortSheetOpen(false)
          }}
          aria-hidden="true"
        />
      )}

      {activeView === 'wait-times' && <div
        className={`fixed inset-x-0 bottom-0 z-30 border-x border-t p-4 transition-transform duration-300 motion-reduce:transition-none md:hidden ${isMobileFilterSheetOpen ? 'translate-y-0' : 'translate-y-full'
          } ${isDark ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-200 bg-white'}`}
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
          <p id={filterSheetTitleId} className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>{labels.showFiltersSettings}</p>
          <button
            ref={filterSheetCloseButtonRef}
            type="button"
            onClick={() => setIsMobileFilterSheetOpen(false)}
            className={`border px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${isDark ? 'border-neutral-700 text-neutral-300' : 'border-neutral-300 text-neutral-700'
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
        className={`fixed inset-x-0 bottom-0 z-30 border-x border-t p-4 transition-transform duration-300 motion-reduce:transition-none md:hidden ${isMobileSortSheetOpen ? 'translate-y-0' : 'translate-y-full'
          } ${isDark ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-200 bg-white'}`}
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
          <p id={sortSheetTitleId} className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>{labels.quickSort}</p>
          <button
            ref={sortSheetCloseButtonRef}
            type="button"
            onClick={() => setIsMobileSortSheetOpen(false)}
            className={`border px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${isDark ? 'border-neutral-700 text-neutral-300' : 'border-neutral-300 text-neutral-700'
              }`}
          >
            {labels.hospitalTable.hide}
          </button>
        </div>
        <div className="grid gap-2">
          <button
            type="button"
            onClick={() => applyMobileSortMode('waiting')}
            className={`w-full border px-4 py-3 text-left text-sm font-medium ${sortMode === 'waiting'
              ? isDark
                ? 'border-neutral-100 bg-neutral-100 text-neutral-900'
                : 'border-neutral-900 bg-neutral-900 text-white'
              : isDark
                ? 'border-neutral-800 text-neutral-300'
                : 'border-neutral-200 text-neutral-700'
              }`}
          >
            {labels.sortWaiting}
          </button>
          <button
            type="button"
            onClick={() => applyMobileSortMode('name')}
            className={`w-full border px-4 py-3 text-left text-sm font-medium ${sortMode === 'name'
              ? isDark
                ? 'border-neutral-100 bg-neutral-100 text-neutral-900'
                : 'border-neutral-900 bg-neutral-900 text-white'
              : isDark
                ? 'border-neutral-800 text-neutral-300'
                : 'border-neutral-200 text-neutral-700'
              }`}
          >
            {labels.sortAZ}
          </button>
          <button
            type="button"
            onClick={() => applyMobileSortMode('nearest')}
            disabled={!isNearestSortAvailable}
            className={`w-full border px-4 py-3 text-left text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40 ${sortMode === 'nearest'
              ? isDark
                ? 'border-neutral-100 bg-neutral-100 text-neutral-900'
                : 'border-neutral-900 bg-neutral-900 text-white'
              : isDark
                ? 'border-neutral-800 text-neutral-300'
                : 'border-neutral-200 text-neutral-700'
              }`}
          >
            {labels.sortNearest}
          </button>
        </div>
      </div>}

      {activeView === 'wait-times' && <div
        className={`fixed inset-x-0 bottom-0 z-30 border-t px-4 pt-3 pb-8 transition-transform duration-300 motion-reduce:transition-none md:hidden ${hasMobileOverlayOpen ? 'translate-y-full' : 'translate-y-0'
          } ${isDark ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-200 bg-white'
          }`}
      >
        <div className="mx-auto flex w-full max-w-6xl items-center gap-2">
          <button
            type="button"
            onClick={() => void loadData()}
            disabled={loading || isRefreshing}
            className={`min-h-12 min-w-[3.5rem] flex items-center justify-center border transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-1 ${isDark
              ? 'border-neutral-800 text-neutral-300'
              : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
              }`}
            aria-label={labels.refreshNow}
          >
            <Icon name="refresh" className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => {
              setIsMobileFilterSheetOpen(false)
              setIsMobileSortSheetOpen(true)
            }}
            className={`flex-1 min-h-12 cursor-pointer border px-3 py-1.5 text-left text-xs font-bold uppercase tracking-wider transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-1 ${isDark
              ? 'border-neutral-800 text-neutral-300'
              : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
              }`}
          >
            <div className="text-[9px] opacity-50 mb-0.5">{labels.quickSort}</div>
            <div className="truncate text-xs font-semibold normal-case tracking-normal">{mobileSortLabel}</div>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsMobileSortSheetOpen(false)
              setIsMobileFilterSheetOpen((value) => !value)
            }}
            className={`flex-1 min-h-12 cursor-pointer border px-3 py-1.5 text-left text-xs font-bold uppercase tracking-wider transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-1 ${isDark
              ? 'border-neutral-800 text-neutral-300'
              : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
              }`}
          >
            <div className="text-[9px] opacity-50 mb-0.5">{labels.quickFilter}</div>
            <div className="truncate text-xs font-semibold normal-case tracking-normal">{activeClusterLabel}</div>
          </button>
        </div>
      </div>}

      {activeView === 'wait-times' && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll to top"
          className={`fixed bottom-24 right-4 z-40 flex h-10 w-10 items-center justify-center border transition-all duration-200 md:hidden ${
            showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
          } ${isDark ? 'border-neutral-700 bg-neutral-950 text-neutral-400 hover:bg-neutral-800' : 'border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-100'}`}
        >
          <Icon name="chevron-down" className="h-4 w-4 -rotate-180" />
        </button>
      )}
    </div>
  )
}

export default App
