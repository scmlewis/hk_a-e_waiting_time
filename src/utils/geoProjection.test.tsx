// src/utils/geoProjection.test.ts
import { describe, it, expect } from 'vitest'
import { projectToSvg, kmToViewBoxPx, HK_MAP_BOUNDS, HK_MAP_VIEWBOX } from './geoProjection'

describe('geoProjection', () => {
  it('places max lat + max lng at top-right inside padding', () => {
    const p = projectToSvg(HK_MAP_BOUNDS.latMax, HK_MAP_BOUNDS.lngMax)
    expect(p.x).toBeCloseTo(HK_MAP_VIEWBOX.width - HK_MAP_VIEWBOX.padding, 1)
    expect(p.y).toBeCloseTo(HK_MAP_VIEWBOX.padding, 1)
  })

  it('places min lat + min lng at bottom-left inside padding', () => {
    const p = projectToSvg(HK_MAP_BOUNDS.latMin, HK_MAP_BOUNDS.lngMin)
    expect(p.x).toBeCloseTo(HK_MAP_VIEWBOX.padding, 1)
    expect(p.y).toBeCloseTo(HK_MAP_VIEWBOX.height - HK_MAP_VIEWBOX.padding, 1)
  })

  it('projects a known hospital within the padded viewBox', () => {
    const p = projectToSvg(22.2702, 114.1316) // Queen Mary Hospital
    expect(p.x).toBeGreaterThan(HK_MAP_VIEWBOX.padding)
    expect(p.x).toBeLessThan(HK_MAP_VIEWBOX.width - HK_MAP_VIEWBOX.padding)
    expect(p.y).toBeGreaterThan(HK_MAP_VIEWBOX.padding)
    expect(p.y).toBeLessThan(HK_MAP_VIEWBOX.height - HK_MAP_VIEWBOX.padding)
  })

  it('converts ~111km of latitude to the full inner height', () => {
    const innerHeight = HK_MAP_VIEWBOX.height - HK_MAP_VIEWBOX.padding * 2
    expect(kmToViewBoxPx(111)).toBeCloseTo(innerHeight, 0)
  })
})
