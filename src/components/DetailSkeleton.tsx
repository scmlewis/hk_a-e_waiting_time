import React from 'react'

export function DetailSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-3 w-1/3 rounded bg-slate-200" />
      <div className="h-2 w-2/3 rounded bg-slate-100" />
    </div>
  )
}

export default DetailSkeleton
import React from 'react'

interface DetailSkeletonProps {
  isDark: boolean
}

export function DetailSkeleton({ isDark }: DetailSkeletonProps) {
  return (
    <div className={`space-y-2.5 rounded-xl border p-3 text-sm ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-slate-50/90'}`}>
      <div className={`${isDark ? 'bg-slate-700' : 'bg-slate-200'} h-3 w-2/3 rounded`} />
      <div className={`${isDark ? 'bg-slate-700' : 'bg-slate-200'} h-3 w-1/2 rounded`} />
      <div className={`${isDark ? 'bg-slate-800' : 'bg-slate-100'} h-10 w-full rounded`} />
    </div>
  )
}

export default React.memo(DetailSkeleton)
