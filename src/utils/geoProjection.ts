// src/utils/geoProjection.ts
export const HK_MAP_BOUNDS = {
  latMin: 22.15,
  latMax: 22.56,
  lngMin: 113.9,
  lngMax: 114.41,
} as const

export const HK_MAP_VIEWBOX = {
  width: 1000,
  height: 750,
  padding: 40,
} as const

export interface ProjectedPoint {
  x: number
  y: number
}

export function projectToSvg(lat: number, lng: number): ProjectedPoint {
  const { latMin, latMax, lngMin, lngMax } = HK_MAP_BOUNDS
  const { width, height, padding } = HK_MAP_VIEWBOX
  const innerWidth = width - padding * 2
  const innerHeight = height - padding * 2

  const x = padding + ((lng - lngMin) / (lngMax - lngMin)) * innerWidth
  // y flipped so north (higher lat) is toward the top
  const y = padding + ((latMax - lat) / (latMax - latMin)) * innerHeight

  return { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) }
}

export function kmToViewBoxPx(km: number): number {
  const { height, padding } = HK_MAP_VIEWBOX
  const innerHeight = height - padding * 2
  const pxPerKm = innerHeight / 111
  return Number((km * pxPerKm).toFixed(2))
}
