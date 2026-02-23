import { WAIT_THRESHOLDS } from '../constants/thresholds'

export function parseWaitingMinutes(waitingTimeText: string): number | null {
  const normalized = waitingTimeText.trim().toLowerCase()

  if (!normalized || normalized === '-' || normalized === 'n/a' || normalized === 'na') {
    return null
  }

  const directNumber = normalized.match(/^\d+$/)
  if (directNumber) {
    return Number(directNumber[0])
  }

  const lessThanHour = normalized.match(/less than\s+(\d+)\s*hour/)
  if (lessThanHour) {
    return Math.max(Number(lessThanHour[1]) * 60 - 1, 0)
  }

  const overHours = normalized.match(/over\s+(\d+)\s*hour/)
  if (overHours) {
    return Number(overHours[1]) * 60
  }

  let totalMinutes = 0
  let matched = false

  const hourMatch = normalized.match(/(\d+(?:\.\d+)?)\s*hour/)
  if (hourMatch) {
    totalMinutes += Math.round(Number(hourMatch[1]) * 60)
    matched = true
  }

  const minuteMatch = normalized.match(/(\d+)\s*minute/)
  if (minuteMatch) {
    totalMinutes += Number(minuteMatch[1])
    matched = true
  }

  if (matched) {
    return totalMinutes
  }

  return null
}

export function deriveWaitStatus(
  waitingMinutes: number | null,
): 'short' | 'moderate' | 'long' | 'unknown' {
  if (waitingMinutes === null) {
    return 'unknown'
  }

  if (waitingMinutes < WAIT_THRESHOLDS.shortMaxExclusive) {
    return 'short'
  }

  if (waitingMinutes < WAIT_THRESHOLDS.moderateMaxExclusive) {
    return 'moderate'
  }

  return 'long'
}

export function deriveWaitStatusFromText(
  waitingTimeText: string,
  fallback: 'short' | 'moderate' | 'long' | 'unknown' = 'unknown',
): 'short' | 'moderate' | 'long' | 'unknown' {
  const parsedMinutes = parseWaitingMinutes(waitingTimeText)
  if (parsedMinutes === null) {
    return fallback
  }

  return deriveWaitStatus(parsedMinutes)
}
