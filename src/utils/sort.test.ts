import { describe, expect, it } from 'vitest'
import type { HospitalWaitingTime } from '../types/ae'
import { sortHospitals } from './sort'

const sample: HospitalWaitingTime[] = [
  {
    hospitalName: 'Queen Mary Hospital',
    updateTime: '2026-02-23T10:00:00+08:00',
    triage: {
      I: { waitingTimeText: '0 minute', waitingMinutes: 0, waitStatus: 'short', metricUsed: 't1wt' },
      II: {
        waitingTimeText: 'less than 15 minutes',
        waitingMinutes: null,
        waitStatus: 'unknown',
        metricUsed: 't2wt',
      },
      III: { waitingTimeText: '2 hours', waitingMinutes: 120, waitStatus: 'long', metricUsed: 't3p50' },
      IV_V: { waitingTimeText: '3 hours', waitingMinutes: 180, waitStatus: 'long', metricUsed: 't45p50' },
    },
    details: {
      cluster: 'Hong Kong West',
      district: 'Pok Fu Lam',
      address: 'Pok Fu Lam, Hong Kong',
      location: { lat: 22.2702, lng: 114.1316 },
      phone: {
        display: 'Contact HA for phone number',
        dialHref: null,
      },
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Queen%20Mary%20Hospital%2C%20Hong%20Kong',
    },
  },
  {
    hospitalName: 'Alice Ho Miu Ling Nethersole Hospital',
    updateTime: '2026-02-23T10:00:00+08:00',
    triage: {
      I: { waitingTimeText: '0 minute', waitingMinutes: 0, waitStatus: 'short', metricUsed: 't1wt' },
      II: {
        waitingTimeText: 'less than 15 minutes',
        waitingMinutes: null,
        waitStatus: 'unknown',
        metricUsed: 't2wt',
      },
      III: { waitingTimeText: '1 hour', waitingMinutes: 60, waitStatus: 'moderate', metricUsed: 't3p50' },
      IV_V: { waitingTimeText: '2 hours', waitingMinutes: 120, waitStatus: 'long', metricUsed: 't45p50' },
    },
    details: {
      cluster: 'New Territories East',
      district: 'Tai Po',
      address: 'Tai Po, Hong Kong',
      location: { lat: 22.4501, lng: 114.1694 },
      phone: {
        display: 'Contact HA for phone number',
        dialHref: null,
      },
      mapsUrl:
        'https://www.google.com/maps/search/?api=1&query=Alice%20Ho%20Miu%20Ling%20Nethersole%20Hospital%2C%20Hong%20Kong',
    },
  },
  {
    hospitalName: 'Pamela Youde Nethersole Eastern Hospital',
    updateTime: '2026-02-23T10:00:00+08:00',
    triage: {
      I: { waitingTimeText: '0 minute', waitingMinutes: 0, waitStatus: 'short', metricUsed: 't1wt' },
      II: {
        waitingTimeText: 'less than 15 minutes',
        waitingMinutes: null,
        waitStatus: 'unknown',
        metricUsed: 't2wt',
      },
      III: { waitingTimeText: '-', waitingMinutes: null, waitStatus: 'unknown', metricUsed: 't3p50' },
      IV_V: { waitingTimeText: '-', waitingMinutes: null, waitStatus: 'unknown', metricUsed: 't45p50' },
    },
    details: {
      cluster: 'Hong Kong East',
      district: 'Chai Wan',
      address: 'Chai Wan, Hong Kong',
      location: { lat: 22.2696, lng: 114.2369 },
      phone: {
        display: 'Contact HA for phone number',
        dialHref: null,
      },
      mapsUrl:
        'https://www.google.com/maps/search/?api=1&query=Pamela%20Youde%20Nethersole%20Eastern%20Hospital%2C%20Hong%20Kong',
    },
  },
]

describe('sortHospitals', () => {
  it('sorts by waiting time asc with nulls last and name tie-break', () => {
    const result = sortHospitals(sample, 'waiting', 'III')
    expect(result.map((item) => item.hospitalName)).toEqual([
      'Alice Ho Miu Ling Nethersole Hospital',
      'Queen Mary Hospital',
      'Pamela Youde Nethersole Eastern Hospital',
    ])
  })

  it('sorts by name asc', () => {
    const result = sortHospitals(sample, 'name', 'III')
    expect(result.map((item) => item.hospitalName)).toEqual([
      'Alice Ho Miu Ling Nethersole Hospital',
      'Pamela Youde Nethersole Eastern Hospital',
      'Queen Mary Hospital',
    ])
  })

  it('sorts by nearest distance when user location is available', () => {
    const result = sortHospitals(sample, 'nearest', 'III', { lat: 22.276, lng: 114.175 })
    expect(result.map((item) => item.hospitalName)).toEqual([
      'Queen Mary Hospital',
      'Pamela Youde Nethersole Eastern Hospital',
      'Alice Ho Miu Ling Nethersole Hospital',
    ])
  })
})
