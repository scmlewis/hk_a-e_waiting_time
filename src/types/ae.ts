export type WaitStatus = 'short' | 'moderate' | 'long' | 'unknown'

export type TriageCategory = 'I' | 'II' | 'III' | 'IV_V'

export interface TriageWaitingTime {
  waitingTimeText: string
  upperBoundText?: string
  waitingMinutes: number | null
  upperBoundMinutes?: number | null
  waitStatus: WaitStatus
  upperBoundWaitStatus?: WaitStatus
  metricUsed: 't1wt' | 't2wt' | 't3p50' | 't45p50'
}

export interface HospitalDetails {
  cluster: string
  district: string
  address: string
  location?: {
    lat: number
    lng: number
  }
  localized?: {
    'zh-HK'?: {
      hospitalName?: string
      district?: string
      address?: string
    }
  }
  phone: {
    display: string
    dialHref: string | null
  }
  mapsUrl: string
}

export interface HospitalWaitingTime {
  hospitalName: string
  updateTime: string
  triage: Record<TriageCategory, TriageWaitingTime>
  details: HospitalDetails
  distanceKm?: number | null
}

export interface RawAeRecord {
  hospName?: string
  hospitalName?: string
  t1wt?: string | number
  t2wt?: string | number
  t3p50?: string | number
  t3p95?: string | number
  t45p50?: string | number
  t45p95?: string | number
  updateTime?: string
  region?: string
  [key: string]: unknown
}
