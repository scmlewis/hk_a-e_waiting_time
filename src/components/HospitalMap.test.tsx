// src/components/HospitalMap.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { HospitalMap } from './HospitalMap'
import type { HospitalWaitingTime } from '../types/ae'
import type { AppLabels } from '../constants/labels'

const makeHospital = (name: string, lat: number, lng: number, status: 'short' | 'moderate' | 'long' | 'unknown'): HospitalWaitingTime => ({
  hospitalName: name,
  updateTime: '2026-08-18 12:00',
  triage: {
    I: { waitingTimeText: '0 min', waitStatus: 'short', metricUsed: 't1wt', waitingMinutes: 0 },
    II: { waitingTimeText: '10 min', waitStatus: 'short', metricUsed: 't2wt', waitingMinutes: 10 },
    III: { waitingTimeText: '45 min', waitStatus: status, metricUsed: 't3p50', waitingMinutes: 45 },
    IV_V: { waitingTimeText: '90 min', waitStatus: 'long', metricUsed: 't45p50', waitingMinutes: 90 },
  },
  details: {
    cluster: 'Hong Kong West',
    district: 'Pok Fu Lam',
    address: '102 Pokfulam Road, HK',
    location: { lat, lng },
    phone: { display: '2255 3838', dialHref: 'tel:+85222553838' },
    mapsUrl: 'https://maps.example',
  },
})

const labels = {
  viewMap: 'Map',
  hospitalCard: { category: 'Category', callHospital: 'Call Hospital', viewOnMaps: 'View on Maps' },
} as unknown as AppLabels

const baseProps = {
  hospitals: [makeHospital('Queen Mary Hospital', 22.2702, 114.1316, 'moderate')],
  selectedTriageCategory: 'III' as const,
  userLocation: null,
  locationStatus: 'idle' as const,
  loading: false,
  error: null,
  labels,
  languageMode: 'en' as const,
}

beforeEach(() => {
  // jsdom lacks matchMedia; stub a desktop (non-narrow) viewport.
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  })
})

afterEach(() => {
  // @ts-expect-error restore
  delete window.matchMedia
})

describe('HospitalMap', () => {
  it('renders the map container with aria-label', () => {
    render(<HospitalMap {...baseProps} />)
    expect(screen.getByRole('img', { name: /Map/ })).toBeInTheDocument()
  })

  it('renders a Leaflet map container', () => {
    const { container } = render(<HospitalMap {...baseProps} />)
    expect(container.querySelector('.leaflet-container')).toBeInTheDocument()
  })

  it('shows the error message when error is set', () => {
    render(<HospitalMap {...baseProps} hospitals={[]} error="Unable to load data" />)
    expect(screen.getByRole('alert')).toHaveTextContent(/Unable to load data/)
  })

  it('shows loading placeholder when loading', () => {
    const { container } = render(<HospitalMap {...baseProps} loading={true} />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })
})
