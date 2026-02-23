import { describe, expect, it } from 'vitest'
import { formatDistanceKm, haversineDistanceKm } from './distance'

describe('haversineDistanceKm', () => {
  it('returns zero for same coordinates', () => {
    const distance = haversineDistanceKm({ lat: 22.3193, lng: 114.1694 }, { lat: 22.3193, lng: 114.1694 })
    expect(distance).toBeCloseTo(0, 6)
  })

  it('returns realistic distance for two Hong Kong points', () => {
    const distance = haversineDistanceKm({ lat: 22.2702, lng: 114.1316 }, { lat: 22.3121, lng: 114.1748 })
    expect(distance).toBeGreaterThan(5)
    expect(distance).toBeLessThan(8)
  })
})

describe('formatDistanceKm', () => {
  it('formats English and Chinese labels', () => {
    expect(formatDistanceKm(3.24, 'en')).toBe('Distance: 3.2 km')
    expect(formatDistanceKm(3.24, 'zh-HK')).toBe('距離：3.2 公里')
  })
})
