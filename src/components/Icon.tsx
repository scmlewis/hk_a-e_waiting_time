type IconName = 'map-pin' | 'chevron-down' | 'refresh' | 'phone' | 'info' | 'close' | 'sun' | 'moon' | 'spinner' | 'chat' | 'dist'

interface IconProps {
  name: IconName
  className?: string
  size?: number
  strokeWidth?: number
}

const paths: Record<IconName, string[]> = {
  'map-pin': ['M12 21s7-5.33 7-11a7 7 0 1 0-14 0c0 5.67 7 11 7 11Z', 'M12 10m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0'],
  'chevron-down': ['M19 9l-7 7-7-7'],
  refresh: ['M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'],
  phone: ['M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3.08 5.18 2 2 0 0 1 5.06 3h3a2 2 0 0 1 2 1.72c.12.9.33 1.77.64 2.6a2 2 0 0 1-.45 2.11L9.1 10.58a16 16 0 0 0 4.32 4.32l1.15-1.15a2 2 0 0 1 2.11-.45c.83.31 1.7.52 2.6.64A2 2 0 0 1 22 16.92Z'],
  info: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z', 'M12 16v-4', 'M12 8h.01'],
  close: ['M6 18L18 6', 'M6 6l12 12'],
  sun: ['M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4', 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z'],
  moon: ['M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'],
  spinner: ['M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'],
  chat: ['M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'],
  dist: ['M3 21l1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z'],
}

export function Icon({ name, className = 'h-4 w-4', size, strokeWidth = 2 }: IconProps) {
  const style = size ? { width: size, height: size } : undefined

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={style}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {name === 'spinner' ? (
        <g>
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d={paths.spinner[0]} />
        </g>
      ) : (
        paths[name].map((d) => (
          <path key={d} d={d} />
        ))
      )}
    </svg>
  )
}
