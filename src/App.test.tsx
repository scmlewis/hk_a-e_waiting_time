import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'

describe('App integration', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('loads data, supports sort toggling, and filters by hospital name', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          hospName: 'Queen Mary Hospital',
          t1wt: '0 minute',
          t2wt: 'less than 15 minutes',
          t3p50: '1 hour',
          t45p50: '2.5 hours',
          updateTime: '2026-02-23T10:20:00+08:00',
        },
        {
          hospName: 'Ruttonjee Hospital',
          t1wt: '0 minute',
          t2wt: 'less than 15 minutes',
          t3p50: '2 hours',
          t45p50: '3.5 hours',
          updateTime: '2026-02-23T10:20:00+08:00',
        },
        {
          hospName: 'St John Hospital',
          t1wt: '0 minute',
          t2wt: 'less than 15 minutes',
          t3p50: '30 minutes',
          t45p50: '1 hour',
          updateTime: '2026-02-23T10:20:00+08:00',
        },
      ],
    })

    vi.stubGlobal('fetch', fetchMock)

    render(<App />)

    await waitFor(() => {
      const headings = screen.getAllByRole('heading', { level: 3 })
      expect(headings).toHaveLength(3)
      expect(headings.map((heading) => heading.textContent)).toEqual([
        'St John Hospital',
        'Ruttonjee Hospital',
        'Queen Mary Hospital',
      ])
    })

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /Sort:/i }))
    await user.click(screen.getByRole('button', { name: 'A-Z' }))

    const sortedHeadings = screen.getAllByRole('heading', { level: 3 })
    expect(sortedHeadings.map((heading) => heading.textContent)).toEqual([
      'Ruttonjee Hospital',
      'St John Hospital',
      'Queen Mary Hospital',
    ])

    expect(screen.getAllByText('Hong Kong East (2)').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Hong Kong West (1)').length).toBeGreaterThan(0)

    await user.type(screen.getByLabelText('Search hospital'), 'queen')

    const filteredHeadings = screen.getAllByRole('heading', { level: 3 })
    expect(filteredHeadings).toHaveLength(1)
    expect(filteredHeadings[0]).toHaveTextContent('Queen Mary Hospital')

    await user.clear(screen.getByLabelText('Search hospital'))
    await user.type(screen.getByLabelText('Search hospital'), 'not-a-real-hospital')
    expect(screen.getAllByText('No hospitals match your current filters.')).toHaveLength(2)
  })

  it('expands hospital details and shows all triage categories', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          hospName: 'Queen Mary Hospital',
          t1wt: '0 minute',
          t2wt: 'less than 15 minutes',
          t3p50: '1 hour',
          t45p50: '2.5 hours',
          updateTime: '2026-02-23T10:20:00+08:00',
        },
      ],
    })

    vi.stubGlobal('fetch', fetchMock)

    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 3, name: 'Queen Mary Hospital' })).toBeInTheDocument()
    })

    const user = userEvent.setup()
    // Click the hospital card (now fully clickable instead of separate "View details" button)
    await user.click(screen.getByRole('heading', { level: 3, name: 'Queen Mary Hospital' }))

    expect(screen.getAllByText('All triage categories').length).toBeGreaterThan(0)
    // Check for both label and wait time (now split into separate elements for color coding)
    expect(screen.getAllByText(/Category I:/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText('0 minute').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Category II:/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText('less than 15 minutes').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Category III:/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText('1 hour').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Category IV & V:/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText('2.5 hours').length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /View on Maps/i }).length).toBeGreaterThan(0)
    expect(screen.queryByRole('link', { name: /Website/i })).not.toBeInTheDocument()
  })

  it('shows blocking error when initial load fails', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('Unable to fetch A&E waiting-time data'))
    vi.stubGlobal('fetch', fetchMock)

    render(<App />)

    await waitFor(() => {
      expect(screen.getAllByText('Unable to fetch A&E waiting-time data')).toHaveLength(2)
    })
  })

  it('shows source stale warning when update timestamp is older than threshold', async () => {
    const staleUpdateTime = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          hospName: 'Queen Mary Hospital',
          t1wt: '0 minute',
          t2wt: 'less than 15 minutes',
          t3p50: '1 hour',
          t45p50: '2.5 hours',
          updateTime: staleUpdateTime,
        },
      ],
    })

    vi.stubGlobal('fetch', fetchMock)

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Source update timestamp appears stale (older than 30 minutes).')).toBeInTheDocument()
    })
  })
})
