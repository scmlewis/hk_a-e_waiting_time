import { describe, it, expect } from 'vitest'
import { parseWaitingMinutes, deriveWaitStatus } from './parseWaitTime'

describe('parseWaitingMinutes utility', () => {
  it('parses direct numbers', () => {
    expect(parseWaitingMinutes('120')).toBe(120)
    expect(parseWaitingMinutes(' 45 ')).toBe(45)
  })

  it('parses "less than X hour"', () => {
    // "less than 1 hour" -> 60-1 = 59
    expect(parseWaitingMinutes('less than 1 hour')).toBe(59)
    expect(parseWaitingMinutes('less than 2 hours')).toBe(119)
  })

  it('parses "over X hour"', () => {
    // "over 2 hours" -> 2*60 = 120
    expect(parseWaitingMinutes('over 2 hours')).toBe(120)
    expect(parseWaitingMinutes('over 1 hour')).toBe(60)
  })

  it('parses combined "X hour Y minute"', () => {
    expect(parseWaitingMinutes('1 hour 30 minutes')).toBe(90)
    expect(parseWaitingMinutes('2 hours 15 minute')).toBe(135)
    expect(parseWaitingMinutes('45 minutes')).toBe(45)
    expect(parseWaitingMinutes('1 hour')).toBe(60)
  })

  it('returns null for unknown formats', () => {
    expect(parseWaitingMinutes('-')).toBeNull()
    expect(parseWaitingMinutes('N/A')).toBeNull()
    expect(parseWaitingMinutes('Currently unavailable')).toBeNull()
  })
})

describe('deriveWaitStatus utility', () => {
  it('categorizes minutes correctly', () => {
    // short: < 60
    // moderate: < 120
    // long: >= 120
    expect(deriveWaitStatus(30)).toBe('short')
    expect(deriveWaitStatus(59)).toBe('short')
    expect(deriveWaitStatus(60)).toBe('moderate')
    expect(deriveWaitStatus(119)).toBe('moderate')
    expect(deriveWaitStatus(120)).toBe('long')
    expect(deriveWaitStatus(200)).toBe('long')
    expect(deriveWaitStatus(null)).toBe('unknown')
  })
})
