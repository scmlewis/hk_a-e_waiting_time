import type { HospitalWaitingTime, RawAeRecord } from '../types/ae'
import { getHospitalDetails } from '../constants/hospitalMeta'
import { deriveWaitStatus, parseWaitingMinutes } from '../utils/parseWaitTime'

const PRIMARY_ENDPOINT =
  import.meta.env.VITE_AE_PRIMARY_ENDPOINT ?? 'https://www.ha.org.hk/opendata/aed/aedwtdata-en.json'

const FALLBACK_ENDPOINT =
  import.meta.env.VITE_AE_FALLBACK_ENDPOINT ?? 'https://www.ha.org.hk/opendata/aed/aedwtdata2-en.json'

interface RawAePayloadObject {
  waitTime?: RawAeRecord[]
  updateTime?: string
}

async function fetchWithTimeout(url: string, timeoutMs = 10000): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, { signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

function normalizeWaitText(value: unknown): string {
  const text = (value ?? '-').toString().trim()
  return text.length > 0 ? text : '-'
}

function toNormalizedRecord(raw: RawAeRecord): HospitalWaitingTime | null {
  const hospitalName = (raw.hospName ?? raw.hospitalName ?? '').toString().trim()
  if (!hospitalName) {
    return null
  }

  const t1wtText = normalizeWaitText(raw.t1wt)
  const t2wtText = normalizeWaitText(raw.t2wt)
  const t3p50Text = normalizeWaitText(raw.t3p50)
  const t3p95Text = normalizeWaitText(raw.t3p95)
  const t45p50Text = normalizeWaitText(raw.t45p50)
  const t45p95Text = normalizeWaitText(raw.t45p95)
  const t1Minutes = parseWaitingMinutes(t1wtText)
  const t2Minutes = parseWaitingMinutes(t2wtText)
  const t3p50Minutes = parseWaitingMinutes(t3p50Text)
  const t45p50Minutes = parseWaitingMinutes(t45p50Text)
  const t3p95Minutes = t3p95Text !== '-' ? parseWaitingMinutes(t3p95Text) : null
  const t45p95Minutes = t45p95Text !== '-' ? parseWaitingMinutes(t45p95Text) : null

  return {
    hospitalName,
    updateTime: (raw.updateTime ?? '').toString(),
    details: getHospitalDetails(hospitalName),
    triage: {
      I: {
        waitingTimeText: t1wtText,
        waitingMinutes: t1Minutes,
        waitStatus: deriveWaitStatus(t1Minutes),
        metricUsed: 't1wt',
      },
      II: {
        waitingTimeText: t2wtText,
        waitingMinutes: t2Minutes,
        waitStatus: deriveWaitStatus(t2Minutes),
        metricUsed: 't2wt',
      },
      III: {
        waitingTimeText: t3p50Text,
        upperBoundText: t3p95Text !== '-' ? t3p95Text : undefined,
        waitingMinutes: t3p50Minutes,
        upperBoundMinutes: t3p95Text !== '-' ? t3p95Minutes : undefined,
        waitStatus: deriveWaitStatus(t3p50Minutes),
        upperBoundWaitStatus: t3p95Text !== '-' ? deriveWaitStatus(t3p95Minutes) : undefined,
        metricUsed: 't3p50',
      },
      IV_V: {
        waitingTimeText: t45p50Text,
        upperBoundText: t45p95Text !== '-' ? t45p95Text : undefined,
        waitingMinutes: t45p50Minutes,
        upperBoundMinutes: t45p95Text !== '-' ? t45p95Minutes : undefined,
        waitStatus: deriveWaitStatus(t45p50Minutes),
        upperBoundWaitStatus: t45p95Text !== '-' ? deriveWaitStatus(t45p95Minutes) : undefined,
        metricUsed: 't45p50',
      },
    },
  }
}

function normalizePayload(payload: unknown): { records: RawAeRecord[]; updateTime: string } {
  if (Array.isArray(payload)) {
    return { records: payload as RawAeRecord[], updateTime: '' }
  }

  if (payload && typeof payload === 'object') {
    const objectPayload = payload as RawAePayloadObject
    if (Array.isArray(objectPayload.waitTime)) {
      return {
        records: objectPayload.waitTime,
        updateTime: typeof objectPayload.updateTime === 'string' ? objectPayload.updateTime : '',
      }
    }
  }

  throw new Error('Unexpected API payload format')
}

async function fetchFromEndpoint(endpoint: string): Promise<HospitalWaitingTime[]> {
  const response = await fetchWithTimeout(endpoint)

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  const payload = (await response.json()) as unknown
  const { records, updateTime } = normalizePayload(payload)

  const normalized = records
    .map((record) => toNormalizedRecord(record))
    .filter((record): record is HospitalWaitingTime => record !== null)
    .map((record) => ({
      ...record,
      updateTime: record.updateTime || updateTime,
    }))

  if (normalized.length === 0) {
    throw new Error('No valid hospital records found')
  }

  return normalized
}

export async function fetchWaitingTimes(): Promise<HospitalWaitingTime[]> {
  try {
    return await fetchFromEndpoint(PRIMARY_ENDPOINT)
  } catch {
    try {
      return await fetchFromEndpoint(FALLBACK_ENDPOINT)
    } catch {
      throw new Error('Unable to fetch A&E waiting-time data')
    }
  }
}
