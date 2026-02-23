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
  dataConfidenceTitle: string
  dataConfidenceFresh: string
  dataConfidenceStaleSource: string
  dataConfidenceStaleNetwork: string
  dataConfidenceStaleBoth: string
  emergencyHint: string
  callEmergencyNow: string
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
  dataConfidenceTitle: 'Data confidence',
  dataConfidenceFresh: 'Live data looks current.',
  dataConfidenceStaleSource: 'Source timestamp is stale (over 30 minutes).',
  dataConfidenceStaleNetwork: 'Latest refresh failed. Showing last successful snapshot.',
  dataConfidenceStaleBoth: 'Latest refresh failed and source timestamp is stale. Treat waiting times as reference only.',
  emergencyHint: 'Severe symptoms or emergency condition?',
  callEmergencyNow: 'Call 999 now',
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
        level: 'I Critical',
        description: 'Life-threatening condition requiring immediate treatment.',
        target: 'Immediate',
        tone: 'red',
      },
      {
        level: 'II Emergency',
        description: 'Emergency condition needing prompt treatment.',
        target: '95% within 15 min',
        tone: 'orange',
      },
      {
        level: 'III Urgent',
        description: 'Urgent condition requiring early medical attention.',
        target: '90% within 30 min',
        tone: 'yellow',
      },
      {
        level: 'IV Semi-urgent',
        description: 'Stable but still needs A&E doctor assessment.',
        target: 'No HA pledge (usually longer wait)',
        tone: 'green',
      },
      {
        level: 'V Non-urgent',
        description: 'Minor/stable condition with lower treatment priority.',
        target: 'No HA pledge (usually longest wait)',
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
    dataSourcesTitle: 'Data Sources',
    dataSourcesIntro: 'Official references used for this tab and waiting-time data feed.',
    dataSources: [
      {
        label: 'Hospital Authority — Accident & Emergency (A&E) Service Guide',
        url: 'https://www.ha.org.hk/visitor/ha_visitor_index.asp?Content_ID=10051&Lang=ENG',
      },
      {
        label: 'DATA.GOV.HK — Accident and Emergency Waiting Time Dataset',
        url: 'https://data.gov.hk/en-data/dataset/hospital-hadata-ae-waiting-time',
      },
      {
        label: 'HA Open Data — A&E Waiting Time Data Specification',
        url: 'https://www.ha.org.hk/opendata/Data-Specification-for-A&E-Waiting-Time-en.pdf',
      },
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
  dataConfidenceTitle: '資料可信度',
  dataConfidenceFresh: '即時資料看來屬於最新狀態。',
  dataConfidenceStaleSource: '來源時間戳已過舊（超過 30 分鐘）。',
  dataConfidenceStaleNetwork: '最近一次更新失敗，現正顯示最近一次成功快照。',
  dataConfidenceStaleBoth: '最近一次更新失敗且來源時間戳過舊，輪候時間只供參考。',
  emergencyHint: '如有嚴重症狀或緊急情況？',
  callEmergencyNow: '立即致電 999',
  noMatch: '沒有醫院符合目前篩選條件。',
  noHospitals: '目前沒有可顯示的醫院資料。',
  noDataFromSource: '來源目前沒有可用的醫院資料。',
  clearFilters: '清除篩選',
  viewWaitTimes: '輪候時間',
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
        level: 'I 危殆',
        description: '危及生命，需要即時搶救。',
        target: '立即',
        tone: 'red',
      },
      {
        level: 'II 危急',
        description: '病情屬緊急狀況，需盡快處理。',
        target: '95% 於 15 分鐘內',
        tone: 'orange',
      },
      {
        level: 'III 緊急',
        description: '病情需要及早由醫護評估及處理。',
        target: '90% 於 30 分鐘內',
        tone: 'yellow',
      },
      {
        level: 'IV 次緊急',
        description: '病情相對穩定，但仍需急症室醫生診治。',
        target: '醫管局未設服務承諾（一般需較長輪候）',
        tone: 'green',
      },
      {
        level: 'V 非緊急',
        description: '病情輕微及穩定，治療優先次序較後。',
        target: '醫管局未設服務承諾（通常輪候最長）',
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
    dataSourcesTitle: '資料來源',
    dataSourcesIntro: '本頁內容及輪候數據主要參考以下官方來源。',
    dataSources: [
      {
        label: '醫院管理局 — 急症室服務指南',
        url: 'https://www.ha.org.hk/visitor/ha_visitor_index.asp?Content_ID=10051&Lang=CHI',
      },
      {
        label: 'DATA.GOV.HK — 急症室輪候時間數據集',
        url: 'https://data.gov.hk/tc-data/dataset/hospital-hadata-ae-waiting-time',
      },
      {
        label: '醫管局開放數據 — 急症室輪候時間數據規格',
        url: 'https://www.ha.org.hk/opendata/Data-Specification-for-A&E-Waiting-Time-en.pdf',
      },
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
