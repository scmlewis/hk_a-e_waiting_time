import { describe, it, expect } from 'vitest'
import { sortHospitals } from './sort'
import type { HospitalWaitingTime } from '../types/ae'

describe('sortHospitals utility', () => {
  const mockHospitals: HospitalWaitingTime[] = [
    {
      hospitalName: 'Hospital B',
      updateTime: '12:00',
      details: { cluster: 'KWC', address: 'B', location: { lat: 2, lng: 2 } },
      distanceKm: 20,
      triage: {
        'III': { waitingMinutes: 120, waitStatus: 'moderate', waitingTimeText: '2 hours' }
      }
    } as any,
    {
      hospitalName: 'Hospital A',
      updateTime: '12:00',
      details: { cluster: 'HKWC', address: 'A', location: { lat: 1, lng: 1 } },
      distanceKm: 10,
      triage: {
        'III': { waitingMinutes: 60, waitStatus: 'short', waitingTimeText: '1 hour' }
      }
    } as any,
    {
      hospitalName: 'Hospital C',
      updateTime: '12:00',
      details: { cluster: 'NTWC', address: 'C', location: { lat: 3, lng: 3 } },
      distanceKm: 5,
      triage: {
        'III': { waitingMinutes: null, waitStatus: 'unknown', waitingTimeText: 'Unknown' }
      }
    } as any,
  ]

  it('sorts by name A-Z', () => {
    const result = sortHospitals(mockHospitals, 'name', 'III')
    expect(result[0].hospitalName).toBe('Hospital A')
    expect(result[1].hospitalName).toBe('Hospital B')
    expect(result[2].hospitalName).toBe('Hospital C')
  })

  it('sorts by waiting time (estimated minutes)', () => {
    const result = sortHospitals(mockHospitals, 'waiting', 'III')
    // A (60) < B (120) < C (null)
    expect(result[0].hospitalName).toBe('Hospital A')
    expect(result[1].hospitalName).toBe('Hospital B')
    expect(result[2].hospitalName).toBe('Hospital C')
  })

  it('sorts by nearest distance', () => {
    const result = sortHospitals(mockHospitals, 'nearest', 'III')
    // C (5) < A (10) < B (20)
    expect(result[0].hospitalName).toBe('Hospital C')
    expect(result[1].hospitalName).toBe('Hospital A')
    expect(result[2].hospitalName).toBe('Hospital B')
  })

  it('falls back to waiting time if distances are equal/null in nearest mode', () => {
    const equalDistances: HospitalWaitingTime[] = [
      {
        hospitalName: 'B',
        distanceKm: 10,
        triage: { 'III': { waitingMinutes: 120 } }
      } as any,
      {
        hospitalName: 'A',
        distanceKm: 10,
        triage: { 'III': { waitingMinutes: 60 } }
      } as any,
    ]

    const result = sortHospitals(equalDistances, 'nearest', 'III')
    expect(result[0].hospitalName).toBe('A') // 60 < 120
  })
})
