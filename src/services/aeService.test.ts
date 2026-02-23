import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchWaitingTimes } from './aeService'

describe('fetchWaitingTimes', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('falls back to secondary endpoint when primary fails and normalizes records', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('primary failed'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          waitTime: [
            {
              hospName: 'Queen Elizabeth Hospital',
              t45p50: '1 hour 15 minutes',
            },
          ],
          updateTime: '2026-02-23T10:20:00+08:00',
        }),
      })

    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchWaitingTimes()

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      hospitalName: 'Queen Elizabeth Hospital',
      updateTime: '2026-02-23T10:20:00+08:00',
      details: {
        cluster: 'Kowloon Central',
      },
      triage: {
        I: {
          waitingTimeText: '-',
          waitingMinutes: null,
          waitStatus: 'unknown',
          metricUsed: 't1wt',
        },
        II: {
          waitingTimeText: '-',
          waitingMinutes: null,
          waitStatus: 'unknown',
          metricUsed: 't2wt',
        },
        III: {
          waitingTimeText: '-',
          waitingMinutes: null,
          waitStatus: 'unknown',
          metricUsed: 't3p50',
        },
        IV_V: {
          waitingTimeText: '1 hour 15 minutes',
          waitingMinutes: 75,
          waitStatus: 'moderate',
          metricUsed: 't45p50',
        },
      },
    })
  })

  it('falls back when primary endpoint returns only invalid records', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            hospName: '   ',
            t45p50: '1 hour',
          },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          waitTime: [
            {
              hospName: 'Princess Margaret Hospital',
              t45p50: '45 minutes',
            },
          ],
          updateTime: '2026-02-23T10:20:00+08:00',
        }),
      })

    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchWaitingTimes()

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      hospitalName: 'Princess Margaret Hospital',
      updateTime: '2026-02-23T10:20:00+08:00',
      details: {
        cluster: 'Kowloon West',
      },
      triage: {
        IV_V: {
          waitingTimeText: '45 minutes',
          waitingMinutes: 45,
          waitStatus: 'short',
          metricUsed: 't45p50',
        },
      },
    })
  })

  it('throws a readable error when all endpoints fail', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('network down'))
    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchWaitingTimes()).rejects.toThrow('Unable to fetch A&E waiting-time data')
  })
})
