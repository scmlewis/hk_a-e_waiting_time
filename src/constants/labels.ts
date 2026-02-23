import type { TriageCategory } from '../types/ae'
import type { AeOverviewLabels } from '../components/AeOverview'
import type { HospitalDetailsLabels } from '../components/HospitalDetails'

export type LanguageMode = 'en' | 'zh-HK'

interface FilterLabels {
  defaultTriageView: string
  triageCategory: string
  searchHospital: string
  searchPlaceholder: string
  cluster: string
  allClusters: string
}

interface LastUpdatedLabels {
  lastSourceUpdate: string
  nextRefreshIn: string
  staleNetworkMessage: string
  unknownTimestamp: string
}

interface HospitalTableLabels extends HospitalDetailsLabels {
  sortByWaitingTime: string
  sortAlphabetically: string
  sortByNearest: string
  hospital: string
  waitingTime: string
  details: string
  view: string
  hide: string
}

export interface AppLabels {
  title: string
  subtitle: string
  refreshNow: string
  refreshing: string
  themeLight: string
  themeDark: string
  themeAuto: string
  languageEnglish: string
  languageTraditionalChinese: string
  legendTitle: string
  shortWait: string
  moderateWait: string
  longWait: string
  unknownWait: string
  refreshingData: string
  staleTimestamp: string
  refreshErrorSuffix: string
  noMatch: string
  noHospitals: string
  noDataFromSource: string
  clearFilters: string
  viewWaitTimes: string
  viewOverview: string
  sortWaiting: string
  sortAZ: string
  sortNearest: string
  quickSort: string
  quickFilter: string
  showFiltersSettings: string
  hideFiltersSettings: string
  useMyLocation: string
  clearLocation: string
  locating: string
  locationReady: string
  locationNotSupported: string
  locationPermissionDenied: string
  locationFailed: string
  distanceEstimateHint: string
  filter: FilterLabels
  triageCategoryLabels: Record<TriageCategory, string>
  overview: AeOverviewLabels
  lastUpdated: LastUpdatedLabels
  hospitalCard: HospitalDetailsLabels
  hospitalTable: HospitalTableLabels
}

const EN_LABELS: AppLabels = {
  title: 'Hong Kong A&E Waiting Time',
  subtitle: 'Live view based on HA open data across triage categories.',
  refreshNow: 'Refresh now',
  refreshing: 'Refreshing...',
  themeLight: 'Light theme',
  themeDark: 'Dark theme',
  themeAuto: 'Auto theme',
  languageEnglish: 'English',
  languageTraditionalChinese: 'Traditional Chinese',
  legendTitle: 'Wait-time color legend',
  shortWait: 'Short wait',
  moderateWait: 'Moderate wait',
  longWait: 'Long wait',
  unknownWait: 'Unknown',
  refreshingData: 'Refreshing latest waiting-time data...',
  staleTimestamp: 'Source update timestamp appears stale (older than 30 minutes).',
  refreshErrorSuffix: 'Showing last successful data snapshot.',
  noMatch: 'No hospitals match your current filters.',
  noHospitals: 'No hospitals are available to display.',
  noDataFromSource: 'No hospital data is currently available from the source.',
  clearFilters: 'Clear filters',
  viewWaitTimes: 'Wait Times',
  viewOverview: 'A&E Overview',
  sortWaiting: 'Waiting time',
  sortAZ: 'A-Z',
  sortNearest: 'Nearest',
  quickSort: 'Sort',
  quickFilter: 'Filter',
  showFiltersSettings: 'Filter & settings',
  hideFiltersSettings: 'Hide filter & settings',
  useMyLocation: 'Use my location',
  clearLocation: 'Clear location',
  locating: 'Locating...',
  locationReady: 'Location enabled for distance sorting.',
  locationNotSupported: 'Location is not supported on this device/browser.',
  locationPermissionDenied: 'Location permission denied. You can still sort by wait time or name.',
  locationFailed: 'Unable to get your location right now. Please try again.',
  distanceEstimateHint: 'Straight-line distance estimate.',
  filter: {
    defaultTriageView: 'Default triage view',
    triageCategory: 'Triage category',
    searchHospital: 'Search hospital',
    searchPlaceholder: 'Type hospital name',
    cluster: 'Cluster',
    allClusters: 'All clusters',
  },
  triageCategoryLabels: {
    I: 'Triage Category I',
    II: 'Triage Category II',
    III: 'Triage Category III',
    IV_V: 'Triage Category IV & V',
  },
  overview: {
    title: 'A&E Overview',
    intro: 'Triage ensures the most urgent patients are seen first. Below is a quick guide to triage levels and the visit flow.',
    triageTitle: 'Triage Levels',
    triageLevelLabel: 'Level',
    triageDescLabel: 'Description',
    triageTargetLabel: 'Target Wait',
    triageRows: [
      {
        level: 'I Resuscitation',
        description: 'Life-threatening; immediate care required.',
        target: 'Immediate',
        tone: 'red',
      },
      {
        level: 'II Very Urgent',
        description: 'High risk of deterioration; rapid treatment needed.',
        target: '< 15 min',
        tone: 'orange',
      },
      {
        level: 'III Urgent',
        description: 'Marked symptoms; prompt medical attention needed.',
        target: '< 30 min',
        tone: 'yellow',
      },
      {
        level: 'IV Semi-urgent',
        description: 'Stable condition; still requires doctor assessment.',
        target: '< 120 min',
        tone: 'green',
      },
      {
        level: 'V Non-urgent',
        description: 'Stable and can usually wait longer.',
        target: '< 180 min',
        tone: 'blue',
      },
    ],
    flowTitle: 'Visit Flow',
    flowIntro: 'Actual steps may vary by hospital arrangement.',
    flowSteps: [
      { title: 'Register', description: 'Check in at reception with basic information.' },
      { title: 'Triage', description: 'Nurse evaluates urgency and assigns triage level.' },
      { title: 'Waiting', description: 'Queue is prioritized by triage level and clinical need.' },
      { title: 'Treatment', description: 'Doctor assessment, tests, and treatment as needed.' },
      { title: 'Observation / Discharge', description: 'Observe further, admit, or discharge based on condition.' },
    ],
    disclaimerTitle: 'Disclaimer',
    disclaimerBody:
      'This web app provides reference information only and does not replace professional medical advice or hospital triage decisions. Waiting times are estimates and may change rapidly. If you have severe symptoms or emergency conditions, seek immediate medical care and call emergency services.',
  },
  lastUpdated: {
    lastSourceUpdate: 'Last source update',
    nextRefreshIn: 'Next refresh in',
    staleNetworkMessage: 'Showing last successful data due to a network error.',
    unknownTimestamp: 'Unknown',
  },
  hospitalCard: {
    allTriageCategories: 'All triage categories',
    category: 'Category',
    address: 'Address',
    district: 'District',
    contact: 'Contact',
    callHospital: 'Call Hospital',
    viewOnMaps: 'View on Maps',
  },
  hospitalTable: {
    sortByWaitingTime: 'Sort by waiting time',
    sortAlphabetically: 'Sort alphabetically',
    sortByNearest: 'Sort by nearest',
    hospital: 'Hospital',
    waitingTime: 'Waiting Time',
    details: 'Details',
    view: 'View',
    hide: 'Hide',
    allTriageCategories: 'All triage categories',
    category: 'Category',
    address: 'Address',
    district: 'District',
    contact: 'Contact',
    callHospital: 'Call Hospital',
    viewOnMaps: 'View on Maps',
  },
}

const ZH_HK_LABELS: AppLabels = {
  title: '香港急症室等候時間',
  subtitle: '根據醫管局公開數據顯示的急症室預計等候時間。',
  refreshNow: '立即更新',
  refreshing: '更新中...',
  themeLight: '淺色模式',
  themeDark: '深色模式',
  themeAuto: '跟隨系統',
  languageEnglish: 'English',
  languageTraditionalChinese: '繁體中文',
  legendTitle: '輪候時間顏色圖例',
  shortWait: '輪候較短',
  moderateWait: '輪候中等',
  longWait: '輪候較長',
  unknownWait: '未有資料',
  refreshingData: '正在更新最新輪候時間資料...',
  staleTimestamp: '來源更新時間可能過舊（超過 30 分鐘）。',
  refreshErrorSuffix: '現正顯示最近一次成功更新的資料。',
  noMatch: '沒有醫院符合目前篩選條件。',
  noHospitals: '目前沒有可顯示的醫院資料。',
  noDataFromSource: '來源目前沒有可用的醫院資料。',
  clearFilters: '清除篩選',
  viewWaitTimes: '時間表',
  viewOverview: '急症室簡介',
  sortWaiting: '按輪候時間排序',
  sortAZ: '按名稱排序',
  sortNearest: '按距離排序',
  quickSort: '排序',
  quickFilter: '篩選',
  showFiltersSettings: '篩選與設定',
  hideFiltersSettings: '收起篩選與設定',
  useMyLocation: '使用我的位置',
  clearLocation: '清除位置',
  locating: '定位中...',
  locationReady: '已啟用位置距離排序。',
  locationNotSupported: '此裝置或瀏覽器不支援定位。',
  locationPermissionDenied: '未授權定位。你仍可按輪候時間或名稱排序。',
  locationFailed: '暫時未能取得你的位置，請稍後再試。',
  distanceEstimateHint: '直線距離（估算）。',
  filter: {
    defaultTriageView: '預設分流顯示',
    triageCategory: '分流類別',
    searchHospital: '搜尋醫院',
    searchPlaceholder: '輸入醫院名稱',
    cluster: '聯網',
    allClusters: '所有聯網',
  },
  triageCategoryLabels: {
    I: '分流類別 I（危殆）',
    II: '分流類別 II（危急）',
    III: '分流類別 III（緊急）',
    IV_V: '分流類別 IV & V（次緊急及非緊急）',
  },
  overview: {
    title: '急症室簡介',
    intro: '分流制度確保最有需要的病人能優先得到治療。以下為分流級別與就診流程簡介。',
    triageTitle: '分流級別',
    triageLevelLabel: '級別',
    triageDescLabel: '說明',
    triageTargetLabel: '等候時間',
    triageRows: [
      {
        level: 'I 緊急',
        description: '危及生命，需要即時搶救。',
        target: '立即',
        tone: 'red',
      },
      {
        level: 'II 非常緊急',
        description: '生命有威脅或惡化風險高，需要盡快處理。',
        target: '< 15 分鐘',
        tone: 'orange',
      },
      {
        level: 'III 甚為緊急',
        description: '痛楚或症狀明顯，需儘快治療。',
        target: '< 30 分鐘',
        tone: 'yellow',
      },
      {
        level: 'IV 緊急',
        description: '病情相對穩定，但仍需醫生診治。',
        target: '< 120 分鐘',
        tone: 'green',
      },
      {
        level: 'V 非緊急',
        description: '病情穩定，一般可等候較長時間。',
        target: '< 180 分鐘',
        tone: 'blue',
      },
    ],
    flowTitle: '就診流程',
    flowIntro: '實際流程或因醫院安排有所不同。',
    flowSteps: [
      { title: '報到', description: '到接待處登記基本資料。' },
      { title: '分流評估', description: '護士評估病情並分配分流級別。' },
      { title: '等候', description: '按分流級別及臨床需要安排就診次序。' },
      { title: '診治', description: '醫生檢查、化驗及提供治療。' },
      { title: '觀察 / 離院', description: '按情況觀察、入院或安排離院。' },
    ],
    disclaimerTitle: '免責聲明',
    disclaimerBody:
      '本網頁資料僅供參考，不能取代專業醫療意見或醫院分流決定。等候時間為估算，可能因實際情況隨時變動。如出現嚴重症狀或緊急情況，請立即求醫及致電緊急服務。',
  },
  lastUpdated: {
    lastSourceUpdate: '來源最後更新',
    nextRefreshIn: '下次更新倒數',
    staleNetworkMessage: '因網絡錯誤，現正顯示最近一次成功更新的資料。',
    unknownTimestamp: '未知',
  },
  hospitalCard: {
    allTriageCategories: '所有分流類別',
    category: '類別',
    address: '地址',
    district: '地區',
    contact: '聯絡方式',
    callHospital: '致電醫院',
    viewOnMaps: '在地圖查看',
  },
  hospitalTable: {
    sortByWaitingTime: '按輪候時間排序',
    sortAlphabetically: '按名稱排序',
    sortByNearest: '按距離排序',
    hospital: '醫院',
    waitingTime: '輪候時間',
    details: '詳情',
    view: '查看',
    hide: '隱藏',
    allTriageCategories: '所有分流類別',
    category: '類別',
    address: '地址',
    district: '地區',
    contact: '聯絡方式',
    callHospital: '致電醫院',
    viewOnMaps: '在地圖查看',
  },
}

export function getLabels(languageMode: LanguageMode): AppLabels {
  return languageMode === 'zh-HK' ? ZH_HK_LABELS : EN_LABELS
}
