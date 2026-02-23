type TelemetryPayload = {
  type: 'event' | 'error'
  name: string
  timestamp: string
  properties?: Record<string, unknown>
  error?: {
    message: string
    stack?: string
  }
}

let telemetryEndpoint = import.meta.env.VITE_TELEMETRY_ENDPOINT?.toString().trim() || ''
let hasAttachedGlobalHandlers = false

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function toError(input: unknown): Error {
  if (input instanceof Error) {
    return input
  }

  if (typeof input === 'string') {
    return new Error(input)
  }

  if (isObject(input) && typeof input.message === 'string') {
    return new Error(input.message)
  }

  return new Error('Unknown telemetry error')
}

function devLog(payload: TelemetryPayload) {
  if (import.meta.env.DEV && import.meta.env.MODE !== 'test') {
    console.info('[telemetry]', payload)
  }
}

async function sendPayload(payload: TelemetryPayload): Promise<void> {
  devLog(payload)

  if (!telemetryEndpoint) {
    return
  }

  const body = JSON.stringify(payload)

  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    const sent = navigator.sendBeacon(telemetryEndpoint, body)
    if (sent) {
      return
    }
  }

  await fetch(telemetryEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  })
}

export async function trackEvent(name: string, properties?: Record<string, unknown>): Promise<void> {
  await sendPayload({
    type: 'event',
    name,
    timestamp: new Date().toISOString(),
    properties,
  })
}

export async function trackError(error: unknown, properties?: Record<string, unknown>): Promise<void> {
  const normalizedError = toError(error)

  await sendPayload({
    type: 'error',
    name: 'client_error',
    timestamp: new Date().toISOString(),
    properties,
    error: {
      message: normalizedError.message,
      stack: normalizedError.stack,
    },
  })
}

export function initGlobalErrorTracking(): void {
  if (typeof window === 'undefined' || hasAttachedGlobalHandlers) {
    return
  }

  hasAttachedGlobalHandlers = true

  window.addEventListener('error', (event) => {
    void trackError(event.error ?? event.message, {
      source: 'window.error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    })
  })

  window.addEventListener('unhandledrejection', (event) => {
    void trackError(event.reason, {
      source: 'window.unhandledrejection',
    })
  })
}

export function setTelemetryEndpointForTests(endpoint: string): void {
  telemetryEndpoint = endpoint
}
