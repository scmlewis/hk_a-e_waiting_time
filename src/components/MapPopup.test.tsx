// src/components/MapPopup.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MapPopup } from './MapPopup'
import type { HospitalWaitingTime } from '../types/ae'

const makeHospital = (): HospitalWaitingTime => ({
  hospitalName: 'Queen Mary Hospital',
  updateTime: '2026-08-18 12:00',
  triage: {
    I: { waitingTimeText: '0 min', waitStatus: 'short', metricUsed: 't1wt', waitingMinutes: 0 },
    II: { waitingTimeText: '10 min', waitStatus: 'short', metricUsed: 't2wt', waitingMinutes: 10 },
    III: { waitingTimeText: '45 min', upperBoundText: '≤ 60', waitStatus: 'moderate', metricUsed: 't3p50', waitingMinutes: 45, upperBoundMinutes: 60 },
    IV_V: { waitingTimeText: '90 min', waitStatus: 'long', metricUsed: 't45p50', waitingMinutes: 90 },
  },
  details: {
    cluster: 'Hong Kong West',
    district: 'Pok Fu Lam',
    address: '102 Pokfulam Road, HK',
    location: { lat: 22.2702, lng: 114.1316 },
    phone: { display: '2255 3838', dialHref: 'tel:+85222553838' },
    mapsUrl: 'https://maps.example',
  },
})

const labels = {
  category: 'Category',
  callHospital: 'Call Hospital',
  viewOnMaps: 'View on Maps',
} as unknown as import('../constants/labels').HospitalDetailsLabels

describe('MapPopup', () => {
  it('renders hospital name, wait time, phone and maps links', () => {
    render(
      <MapPopup
        hospital={makeHospital()}
        selectedTriageCategory="III"
        languageMode="en"
        labels={labels}
        onClose={() => {}}
      />,
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Queen Mary Hospital')).toBeInTheDocument()
    expect(screen.getByText(/45 min/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Call Hospital/i })).toHaveAttribute('href', 'tel:+85222553838')
    expect(screen.getByRole('link', { name: /View on Maps/i })).toHaveAttribute('href', 'https://maps.example')
  })

  it('fires onClose from the close button', () => {
    const onClose = vi.fn()
    render(
      <MapPopup
        hospital={makeHospital()}
        selectedTriageCategory="III"
        languageMode="en"
        labels={labels}
        onClose={onClose}
      />,
    )
    screen.getByRole('button', { name: /close/i }).click()
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
