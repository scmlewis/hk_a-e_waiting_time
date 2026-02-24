import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { HospitalDetails } from './HospitalDetails'
import type { HospitalWaitingTime } from '../types/ae'

const mockHospital: HospitalWaitingTime = {
    hospitalName: 'Test Hospital',
    updateTime: new Date().toISOString(),
    triage: {
        I: { waitingTimeText: '0 minute', waitingMinutes: 0, waitStatus: 'short', metricUsed: 't1wt' },
        II: { waitingTimeText: 'less than 15 minutes', waitingMinutes: 14, waitStatus: 'short', metricUsed: 't2wt' },
        III: { waitingTimeText: '1 hour', waitingMinutes: 60, waitStatus: 'moderate', metricUsed: 't3p50', upperBoundText: '2 hours', upperBoundMinutes: 120 },
        IV_V: { waitingTimeText: '3 hours', waitingMinutes: 180, waitStatus: 'long', metricUsed: 't45p50' },
    },
    details: {
        cluster: 'Test Cluster',
        district: 'Test District',
        address: '123 Test St',
        phone: { display: '1234 5678', dialHref: 'tel:12345678' },
        mapsUrl: 'https://maps.google.com'
    }
}

const mockLabels = {
    allTriageCategories: 'All triage categories',
    category: 'Category',
    address: 'Address',
    district: 'District',
    contact: 'Contact',
    callHospital: 'Call hospital',
    viewOnMaps: 'View on Maps'
}

describe('HospitalDetails UI', () => {
    it('renders triage categories in a grid', () => {
        const { container } = render(
            <HospitalDetails isDark={true} labels={mockLabels} hospital={mockHospital} />
        )

        // Check for the section title
        expect(screen.getByText('All triage categories')).toBeInTheDocument()

        // Check for triage category labels
        expect(screen.getByText('I')).toBeInTheDocument()
        expect(screen.getByText('0 minute')).toBeInTheDocument()

        // Check if grid classes are applied
        const grid = container.querySelector('.grid')
        expect(grid).toBeInTheDocument()
    })

    it('renders metadata with icons and uppercase labels', () => {
        render(
            <HospitalDetails isDark={true} labels={mockLabels} hospital={mockHospital} />
        )

        // Check for metadata labels
        // Check for metadata labels and uppercase class
        const addressLabel = screen.getByText('Address')
        const districtLabel = screen.getByText('District')
        const contactLabel = screen.getByText('Contact')

        expect(addressLabel).toBeInTheDocument()
        expect(addressLabel).toHaveClass('uppercase')
        expect(districtLabel).toHaveClass('uppercase')
        expect(contactLabel).toHaveClass('uppercase')

        // Check for metadata values
        expect(screen.getByText('123 Test St')).toBeInTheDocument()
        expect(screen.getByText('Test District')).toBeInTheDocument()
        expect(screen.getByText('1234 5678')).toBeInTheDocument()

        // Check for icons (via svg)
        const svgs = document.querySelectorAll('svg')
        expect(svgs.length).toBeGreaterThan(0)
    })

    it('renders action buttons with correct text and style classes', () => {
        render(
            <HospitalDetails isDark={true} labels={mockLabels} hospital={mockHospital} />
        )

        const callButton = screen.getByText('Call hospital').closest('a')
        const mapsButton = screen.getByText('View on Maps').closest('a')

        expect(callButton).toHaveAttribute('href', 'tel:12345678')
        expect(mapsButton).toHaveAttribute('href', 'https://maps.google.com')

        // Check for modern button classes
        expect(callButton).toHaveClass('rounded-xl')
        expect(callButton).toHaveClass('bg-rose-600')
        expect(mapsButton).toHaveClass('bg-sky-600')
    })
})
