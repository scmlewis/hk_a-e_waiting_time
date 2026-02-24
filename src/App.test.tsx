import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from './App'

// Mock fetch to prevent network calls
vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => []
}))

describe('App UI - Modern Enhancements', () => {
    it('renders a prominent "Use my location" button with an icon', async () => {
        render(<App />)

        // The button might not be visible immediately depending on loading state, 
        // but in initial state it should show the prompt if no location is set.
        const locationButtons = screen.getAllByRole('button').filter(btn =>
            btn.textContent?.includes('Use my location')
        )

        expect(locationButtons.length).toBeGreaterThan(0)

        locationButtons.forEach(btn => {
            // Check for the icon
            const icon = btn.querySelector('svg')
            expect(icon).toBeInTheDocument()

            // Check for prominent coloring (sky-600 or indigo-600)
            expect(btn.className).toSatisfy((className: string) =>
                className.includes('bg-sky-600') || className.includes('bg-indigo-600')
            )
        })
    })

    it('renders the mobile navigation bar with Refresh, Sort, and Filter buttons', () => {
        render(<App />)

        // Bottom bar is hidden on md+ but visible on mobile
        // Since jsdom doesn't really "hide" based on tailwind classes unless we use a specific lib,
        // we just check if the elements exist in the DOM with the expected classes.

        const refreshButton = screen.getByLabelText(/Refresh now|正在更新/i)
        expect(refreshButton).toBeInTheDocument()
        expect(refreshButton.querySelector('svg')).toBeInTheDocument()

        const quickSortDivs = screen.getAllByText(/Sort|排序/i)
        expect(quickSortDivs.length).toBeGreaterThan(0)

        const quickFilterDivs = screen.getAllByText(/Filter|篩選/i)
        expect(quickFilterDivs.length).toBeGreaterThan(0)
    })
})
