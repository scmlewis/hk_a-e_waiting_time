import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { FilterBar } from './components/FilterBar'
import { AeOverview } from './components/AeOverview'
import { HospitalCard } from './components/HospitalCard'
import { HospitalTable } from './components/HospitalTable'
import { CLUSTER_ORDER, CLUSTER_NAME_ZH_HK } from './constants/hospitalMeta'
import { getLabels } from './constants/labels'
import { TRIAGE_KEYS } from './constants/triage'
import { trackEvent } from './services/telemetry'
import type { HospitalWaitingTime, TriageCategory } from './types/ae'
import { haversineDistanceKm } from './utils/distance'
import { localizeWaitTimeText } from './utils/localizeWaitTime'
import { sortHospitals, type SortMode } from './utils/sort'
import { Icon } from './components/Icon'
import { Snackbar, type SnackbarType } from './components/Snackbar'

import { useSettings } from './hooks/useSettings'
import { useLocation } from './hooks/useLocation'
import { useWaitingTimes } from './hooks/useWaitingTimes'

type AppView = 'wait-times' | 'overview'

function App() {
  const { languageMode, isDark, toggleLanguageMode } = useSettings()
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
  const [snackVisible, setSnackVisible] = useState(false)
  const [snackMessage, setSnackMessage] = useState('')
  const [snackType, setSnackType] = useState<SnackbarType>('info')
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
    <div className="mt-2 flex flex-wrap items-center gap-2 border border-m3-outline-variant p-3 text-sm md:gap-2 md:p-2.5 md:text-sm text-m3-on-surface-variant">
      {userLocation === null && (
        <button
          type="button"
          onClick={() => void handleUseMyLocation()}
          disabled={locationStatus === 'locating'}
          className="inline-flex min-h-11 cursor-pointer items-center bg-m3-primary px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-m3-on-primary transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-primary focus-visible:ring-offset-2 focus-visible:ring-offset-m3-surface md:min-h-0 md:px-2.5 md:py-1.5"
        >
          <Icon name="map-pin" className="mr-1.5 h-3.5 w-3.5" strokeWidth={2.5} />
          {locationStatus === 'locating' ? labels.locating : labels.useMyLocation}
        </button>
      )}

      {userLocation && (
        <button
          type="button"
          onClick={handleClearLocation}
          className="inline-flex min-h-11 cursor-pointer items-center border border-m3-outline px-3.5 py-2 text-xs font-medium text-m3-on-surface-variant transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-primary focus-visible:ring-offset-2 focus-visible:ring-offset-m3-surface md:min-h-0 md:px-2.5 md:py-1.5"
        >
          {labels.clearLocation}
        </button>
      )}

      {locationStatusMessage && <span>{locationStatusMessage}</span>}
      <span className="text-m3-on-surface-variant/60">{labels.distanceEstimateHint}</span>
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

  useEffect(() => {
    if (!loading && isRefreshing) {
      setSnackMessage(labels.refreshingData)
      setSnackType('info')
      setSnackVisible(true)
    }
  }, [loading, isRefreshing, labels.refreshingData])

  useEffect(() => {
    if (!loading && refreshError && hospitals.length > 0) {
      setSnackMessage(`${refreshError}. ${labels.refreshErrorSuffix}`)
      setSnackType('error')
      setSnackVisible(true)
    }
  }, [loading, refreshError, hospitals.length, labels.refreshErrorSuffix])

  useEffect(() => {
    if (!loading && isSourceStale && hospitals.length > 0) {
      setSnackMessage(labels.staleTimestamp)
      setSnackType('warning')
      setSnackVisible(true)
    }
  }, [loading, isSourceStale, hospitals.length, labels.staleTimestamp])

  const handleSnackDismiss = useCallback(() => setSnackVisible(false), [])

  return (
    <div className={`relative overflow-x-clip pb-28 md:pb-10 text-m3-on-surface ${refreshPulse ? 'refresh-pulse' : ''}`}>
      <main className="mx-auto min-h-screen w-full max-w-6xl space-y-4 px-4 py-4 md:space-y-5 md:px-6 md:py-6 lg:px-8">
        <div className="md:sticky md:top-0 md:z-30 md:bg-m3-surface md:-mx-6 md:-mt-6 md:px-6 md:pt-6 lg:-mx-8 lg:px-8">
          <AppHeader
            labels={labels}
            languageMode={languageMode}
            loading={loading}
            isRefreshing={isRefreshing}
            activeView={activeView}
            isLegendExpanded={isLegendExpanded}
            sourceUpdateTime={sourceUpdateTime}
            countdownSeconds={countdown}
            isStale={isStale}
            waitSemanticsHint={waitSemanticsHint}
            toggleLanguageMode={toggleLanguageMode}
            loadData={loadData}
            handleViewChange={handleViewChange}
            setIsLegendExpanded={setIsLegendExpanded}
          />

        {activeView === 'wait-times' && (
          <div className="hidden md:block border-t border-m3-outline-variant">
            <FilterBar
              labels={{
                searchPlaceholder: labels.filter.searchPlaceholder,
                allClusters: labels.filter.allClusters,
              }}
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
        )}
        </div>

        {activeView === 'wait-times' && (
          <>
        {shouldShowLocationPrompt && (
          <section
            className="border border-m3-outline-variant p-3 md:p-4"
            aria-live="polite"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-m3-on-surface-variant md:text-base">
                {labels.sortNearest} &bull; {labels.distanceEstimateHint}
              </p>
              <button
                type="button"
                onClick={() => void handleUseMyLocation()}
                className="inline-flex min-h-11 items-center bg-m3-primary px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-m3-on-primary transition-colors duration-200 hover:bg-m3-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-primary focus-visible:ring-offset-2 focus-visible:ring-offset-m3-surface"
              >
                <Icon name="map-pin" className="mr-2 h-3.5 w-3.5" strokeWidth={2.5} />
                {labels.useMyLocation}
              </button>
            </div>
          </section>
        )}

        <section className="space-y-3 md:hidden">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center border border-m3-outline-variant bg-m3-surface-container px-3 py-1.5 text-[11px] font-medium tracking-wide text-m3-on-surface-variant">
              {labels.triageCategoryLabels[selectedTriageCategory]}
            </span>
            <span className="inline-flex items-center border border-m3-outline-variant bg-m3-surface-container px-3 py-1.5 text-[11px] font-medium tracking-wide text-m3-on-surface-variant">
              {activeClusterLabel}
            </span>
            <span className="inline-flex items-center border border-m3-outline-variant bg-m3-surface-container px-3 py-1.5 text-[11px] font-medium tracking-wide text-m3-on-surface-variant">
              {mobileSortLabel}
            </span>
          </div>

          {loading &&
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse border border-m3-outline-variant p-4 motion-reduce:animate-none"
              >
                <div className="h-3 w-2/3 bg-m3-surface-container-high" />
                <div className="mt-3 h-5 w-1/3 bg-m3-surface-container-high" />
                <div className="mt-2 h-2.5 w-1/4 bg-m3-surface-container" />
              </div>
            ))}

          {!loading && error && (
            <p className="border border-m3-error/50 p-4 text-sm text-m3-error" role="alert">
              {error}
            </p>
          )}

          {!loading && !error && hospitals.length === 0 && (
            <p className="p-4 text-sm text-m3-on-surface-variant">{labels.noDataFromSource}</p>
          )}

          {!loading && !error && hospitals.length > 0 && groupedHospitals.length === 0 && (
            <div className="space-y-3 p-4 text-sm text-m3-on-surface-variant">
              <p>{hasActiveFilters ? labels.noMatch : labels.noHospitals}</p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="inline-flex cursor-pointer items-center border border-m3-outline px-3 py-1.5 text-xs font-medium text-m3-on-surface-variant transition-colors duration-200 hover:bg-m3-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-primary focus-visible:ring-offset-2 focus-visible:ring-offset-m3-surface"
                >
                  {labels.clearFilters}
                </button>
              )}
            </div>
          )}

          {!loading &&
            groupedHospitals.map((group) => (
              <section key={group.cluster} className="space-y-2">
                <h2 className="border-l-[3px] border-l-m3-primary bg-m3-surface-container/50 px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] text-m3-on-surface-variant">
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

        {activeView === 'overview' && <AeOverview labels={labels.overview} />}

        {activeView === 'wait-times' && loading && (
          <section
            className="hidden animate-pulse space-y-2 border border-m3-outline-variant p-3 motion-reduce:animate-none md:block"
            aria-hidden
          >
            <div className="h-8 w-72 bg-m3-surface-container-high" />
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-10 bg-m3-surface-container" />
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
          <div className="hidden space-y-3 border border-m3-outline-variant p-4 text-sm text-m3-on-surface-variant md:block">
            <p>{hasActiveFilters ? labels.noMatch : labels.noHospitals}</p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex cursor-pointer items-center border border-m3-outline px-3 py-1.5 text-xs font-medium text-m3-on-surface-variant transition-colors duration-200 hover:bg-m3-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-primary focus-visible:ring-offset-2 focus-visible:ring-offset-m3-surface"
              >
                {labels.clearFilters}
              </button>
            )}
          </div>
        )}

        {activeView === 'wait-times' && !loading && error && hospitals.length === 0 && (
          <p className="hidden border border-m3-error/50 p-4 text-sm text-m3-error md:block" role="alert">
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
        className={`fixed inset-x-0 bottom-0 z-30 border-x border-t border-m3-outline-variant bg-m3-surface-container-low p-4 transition-transform duration-300 motion-reduce:transition-none md:hidden ${isMobileFilterSheetOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
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
          <p id={filterSheetTitleId} className="text-xs font-medium tracking-wide text-m3-on-surface-variant">{labels.showFiltersSettings}</p>
          <button
            ref={filterSheetCloseButtonRef}
            type="button"
            onClick={() => setIsMobileFilterSheetOpen(false)}
            className="border border-m3-outline px-3 py-1.5 text-xs font-medium text-m3-on-surface-variant transition-colors hover:bg-m3-surface-container-high"
          >
            {labels.hospitalTable.hide}
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto space-y-2.5 pb-1">
          <FilterBar
            labels={{
              searchPlaceholder: labels.filter.searchPlaceholder,
              allClusters: labels.filter.allClusters,
            }}
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
        className={`fixed inset-x-0 bottom-0 z-30 border-x border-t border-m3-outline-variant bg-m3-surface-container-low p-4 transition-transform duration-300 motion-reduce:transition-none md:hidden ${isMobileSortSheetOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
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
          <p id={sortSheetTitleId} className="text-xs font-medium tracking-wide text-m3-on-surface-variant">{labels.quickSort}</p>
          <button
            ref={sortSheetCloseButtonRef}
            type="button"
            onClick={() => setIsMobileSortSheetOpen(false)}
            className="border border-m3-outline px-3 py-1.5 text-xs font-medium text-m3-on-surface-variant transition-colors hover:bg-m3-surface-container-high"
          >
            {labels.hospitalTable.hide}
          </button>
        </div>
        <div className="grid gap-2">
          <button
            type="button"
            onClick={() => applyMobileSortMode('waiting')}
            className={`w-full border px-4 py-3 text-left text-sm font-medium transition-colors ${sortMode === 'waiting'
              ? 'border-m3-primary bg-m3-primary-container text-m3-on-primary-container'
              : 'border-m3-outline-variant text-m3-on-surface hover:bg-m3-surface-container-high'
              }`}
          >
            {labels.sortWaiting}
          </button>
          <button
            type="button"
            onClick={() => applyMobileSortMode('name')}
            className={`w-full border px-4 py-3 text-left text-sm font-medium transition-colors ${sortMode === 'name'
              ? 'border-m3-primary bg-m3-primary-container text-m3-on-primary-container'
              : 'border-m3-outline-variant text-m3-on-surface hover:bg-m3-surface-container-high'
              }`}
          >
            {labels.sortAZ}
          </button>
          <button
            type="button"
            onClick={() => applyMobileSortMode('nearest')}
            disabled={!isNearestSortAvailable}
            className={`w-full border px-4 py-3 text-left text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${sortMode === 'nearest'
              ? 'border-m3-primary bg-m3-primary-container text-m3-on-primary-container'
              : 'border-m3-outline-variant text-m3-on-surface hover:bg-m3-surface-container-high'
              }`}
          >
            {labels.sortNearest}
          </button>
        </div>
      </div>}

      {activeView === 'wait-times' && <div
        className={`fixed inset-x-0 bottom-0 z-30 border-t border-m3-outline-variant bg-m3-surface-container-low px-4 pt-3 pb-8 transition-transform duration-300 motion-reduce:transition-none md:hidden ${hasMobileOverlayOpen ? 'translate-y-full' : 'translate-y-0'
          }`}
      >
        <div className="mx-auto flex w-full max-w-6xl items-center gap-2">
          <button
            type="button"
            onClick={() => void loadData()}
            disabled={loading || isRefreshing}
            className="min-h-12 min-w-[3.5rem] flex items-center justify-center border border-m3-outline text-m3-on-surface transition-colors duration-200 hover:bg-m3-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-primary focus-visible:ring-offset-2 focus-visible:ring-offset-m3-surface"
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
            className="flex-1 min-h-12 cursor-pointer border border-m3-outline px-3 py-1.5 text-left transition-colors duration-200 hover:bg-m3-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-primary focus-visible:ring-offset-2 focus-visible:ring-offset-m3-surface"
          >
            <div className="text-[9px] font-medium uppercase tracking-widest text-m3-on-surface-variant">{labels.quickSort}</div>
            <div className="truncate text-xs font-medium text-m3-on-surface">{mobileSortLabel}</div>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsMobileSortSheetOpen(false)
              setIsMobileFilterSheetOpen((value) => !value)
            }}
            className="flex-1 min-h-12 cursor-pointer border border-m3-outline px-3 py-1.5 text-left transition-colors duration-200 hover:bg-m3-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-primary focus-visible:ring-offset-2 focus-visible:ring-offset-m3-surface"
          >
            <div className="text-[9px] font-medium uppercase tracking-widest text-m3-on-surface-variant">{labels.quickFilter}</div>
            <div className="truncate text-xs font-medium text-m3-on-surface">{activeClusterLabel}</div>
          </button>
        </div>
      </div>}

      {activeView === 'wait-times' && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll to top"
          className={`fixed bottom-24 right-4 z-40 flex h-10 w-10 items-center justify-center bg-m3-surface-container-high border border-m3-outline-variant text-m3-on-surface-variant transition-all duration-200 hover:bg-m3-surface-container-highest md:hidden ${
            showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
          }`}
        >
          <Icon name="chevron-down" className="h-4 w-4 -rotate-180" />
        </button>
      )}

      <Snackbar
        message={snackMessage}
        type={snackType}
        visible={snackVisible}
        onDismiss={handleSnackDismiss}
      />
    </div>
  )
}

export default App
