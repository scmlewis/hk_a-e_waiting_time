import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  initGlobalErrorTracking,
  setTelemetryEndpointForTests,
  trackError,
  trackEvent,
} from './telemetry'

describe('telemetry service', () => {
  beforeEach(() => {
    setTelemetryEndpointForTests('')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('does not send network requests when endpoint is not configured', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await trackEvent('app_page_view')

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('uses sendBeacon when available and successful', async () => {
    const fetchMock = vi.fn()
    const beaconMock = vi.fn().mockReturnValue(true)

    vi.stubGlobal('fetch', fetchMock)
    Object.defineProperty(navigator, 'sendBeacon', {
      value: beaconMock,
      configurable: true,
    })

    setTelemetryEndpointForTests('https://example.com/telemetry')

    await trackEvent('wait_data_loaded', { hospitalCount: 18 })

    expect(beaconMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('falls back to fetch when sendBeacon fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    const beaconMock = vi.fn().mockReturnValue(false)

    vi.stubGlobal('fetch', fetchMock)
    Object.defineProperty(navigator, 'sendBeacon', {
      value: beaconMock,
      configurable: true,
    })

    setTelemetryEndpointForTests('https://example.com/telemetry')

    await trackError('network issue', { area: 'wait_data_load' })

    expect(beaconMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.com/telemetry',
      expect.objectContaining({
        method: 'POST',
        keepalive: true,
      }),
    )
  })

  it('attaches global error handlers only once', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')

    initGlobalErrorTracking()
    initGlobalErrorTracking()

    const trackedEvents = addEventListenerSpy.mock.calls
      .map((call) => call[0])
      .filter((eventName) => eventName === 'error' || eventName === 'unhandledrejection')

    expect(trackedEvents).toEqual(['error', 'unhandledrejection'])
  })
})
