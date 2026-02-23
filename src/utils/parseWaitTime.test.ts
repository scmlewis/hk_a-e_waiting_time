import { describe, expect, it } from 'vitest'
import { deriveWaitStatus, parseWaitingMinutes } from './parseWaitTime'

describe('parseWaitingMinutes', () => {
  it('parses minute values', () => {
    expect(parseWaitingMinutes('45 minutes')).toBe(45)
  })

  it('parses hour and minute values', () => {
    expect(parseWaitingMinutes('1 hour 30 minutes')).toBe(90)
  })

  it('parses decimal hour values', () => {
    expect(parseWaitingMinutes('1.5 hours')).toBe(90)
    expect(parseWaitingMinutes('0.5 hours')).toBe(30)
  })

  it('parses over-hour values', () => {
    expect(parseWaitingMinutes('over 8 hours')).toBe(480)
  })

  it('parses less-than-hour values conservatively', () => {
    expect(parseWaitingMinutes('less than 1 hour')).toBe(59)
  })

  it('returns null for unavailable values', () => {
    expect(parseWaitingMinutes('-')).toBeNull()
    expect(parseWaitingMinutes('N/A')).toBeNull()
  })
})

describe('deriveWaitStatus', () => {
  it('maps thresholds to status', () => {
    expect(deriveWaitStatus(30)).toBe('short')
    expect(deriveWaitStatus(90)).toBe('moderate')
    expect(deriveWaitStatus(120)).toBe('long')
    expect(deriveWaitStatus(null)).toBe('unknown')
  })
})
