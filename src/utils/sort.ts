import type { HospitalWaitingTime, TriageCategory } from '../types/ae'
import type { Coordinate } from './distance'
import { haversineDistanceKm } from './distance'

export type SortMode = 'waiting' | 'name' | 'nearest'

function compareByName(left: HospitalWaitingTime, right: HospitalWaitingTime): number {
  return left.hospitalName.localeCompare(right.hospitalName)
}

function compareByWaitingTime(left: HospitalWaitingTime, right: HospitalWaitingTime, triageCategory: TriageCategory): number {
  const leftMinutes = left.triage[triageCategory].waitingMinutes
  const rightMinutes = right.triage[triageCategory].waitingMinutes

  if (leftMinutes === null && rightMinutes === null) {
    return compareByName(left, right)
  }

  if (leftMinutes === null) {
    return 1
  }

  if (rightMinutes === null) {
    return -1
  }

  if (leftMinutes === rightMinutes) {
    return compareByName(left, right)
  }

  return leftMinutes - rightMinutes
}

function getDistanceForSort(hospital: HospitalWaitingTime, userLocation: Coordinate | null | undefined): number | null {
  if (typeof hospital.distanceKm === 'number') {
    return hospital.distanceKm
  }

  if (!userLocation || !hospital.details.location) {
    return null
  }

  return haversineDistanceKm(userLocation, hospital.details.location)
}

export function sortHospitals(
  hospitals: HospitalWaitingTime[],
  mode: SortMode,
  triageCategory: TriageCategory,
  userLocation?: Coordinate | null,
): HospitalWaitingTime[] {
  const copy = [...hospitals]

  if (mode === 'name') {
    return copy.sort(compareByName)
  }

  if (mode === 'nearest') {
    return copy.sort((left, right) => {
      const leftDistance = getDistanceForSort(left, userLocation)
      const rightDistance = getDistanceForSort(right, userLocation)

      if (leftDistance === null && rightDistance === null) {
        return compareByWaitingTime(left, right, triageCategory)
      }

      if (leftDistance === null) {
        return 1
      }

      if (rightDistance === null) {
        return -1
      }

      if (leftDistance === rightDistance) {
        return compareByWaitingTime(left, right, triageCategory)
      }

      return leftDistance - rightDistance
    })
  }

  return copy.sort((left, right) => compareByWaitingTime(left, right, triageCategory))
}
