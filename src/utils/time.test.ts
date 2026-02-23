import { describe, expect, it } from 'vitest'
import { formatCountdown, isSourceDataStale } from './time'

describe('formatCountdown', () => {
  it('formats mm:ss and clamps negative values', () => {
    expect(formatCountdown(0)).toBe('00:00')
    expect(formatCountdown(65)).toBe('01:05')
    expect(formatCountdown(-10)).toBe('00:00')
  })
})

describe('isSourceDataStale', () => {
  it('returns true when source timestamp is older than threshold', () => {
    const now = Date.parse('2026-02-23T12:00:00+08:00')
    expect(isSourceDataStale('2026-02-23T11:20:00+08:00', 30, now)).toBe(true)
  })

  it('returns false for fresh, invalid, empty, or future timestamps', () => {
    const now = Date.parse('2026-02-23T12:00:00+08:00')
    expect(isSourceDataStale('2026-02-23T11:40:00+08:00', 30, now)).toBe(false)
    expect(isSourceDataStale('', 30, now)).toBe(false)
    expect(isSourceDataStale('invalid-date', 30, now)).toBe(false)
    expect(isSourceDataStale('2026-02-23T12:30:00+08:00', 30, now)).toBe(false)
  })
})
