export interface Coordinate {
  lat: number
  lng: number
}

const EARTH_RADIUS_KM = 6371

function toRadians(value: number): number {
  return (value * Math.PI) / 180
}

export function haversineDistanceKm(origin: Coordinate, destination: Coordinate): number {
  const latitudeDelta = toRadians(destination.lat - origin.lat)
  const longitudeDelta = toRadians(destination.lng - origin.lng)
  const latitudeOrigin = toRadians(origin.lat)
  const latitudeDestination = toRadians(destination.lat)

  const chord =
    Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
    Math.cos(latitudeOrigin) * Math.cos(latitudeDestination) * Math.sin(longitudeDelta / 2) * Math.sin(longitudeDelta / 2)

  const angularDistance = 2 * Math.atan2(Math.sqrt(chord), Math.sqrt(1 - chord))

  return EARTH_RADIUS_KM * angularDistance
}

export function formatDistanceKm(distanceKm: number, locale: 'en' | 'zh-HK'): string {
  const rounded = distanceKm < 10 ? distanceKm.toFixed(1) : Math.round(distanceKm).toString()
  return locale === 'zh-HK' ? `距離：${rounded} 公里` : `Distance: ${rounded} km`
}
