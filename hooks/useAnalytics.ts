import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { analytics } from '@/lib/analytics'

export function usePageView() {
  const pathname = usePathname()

  useEffect(() => {
    analytics.pageView(pathname)
  }, [pathname])
}

export function useAnalytics() {
  return analytics
}