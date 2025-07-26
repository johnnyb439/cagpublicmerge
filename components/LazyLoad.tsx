'use client'

import React from 'react'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { cn } from '@/lib/utils'

interface LazyLoadProps {
  children: React.ReactNode
  className?: string
  placeholder?: React.ReactNode
  rootMargin?: string
  threshold?: number
}

export default function LazyLoad({
  children,
  className,
  placeholder,
  rootMargin = '50px',
  threshold = 0.1,
}: LazyLoadProps) {
  const [ref, isVisible] = useIntersectionObserver({
    threshold,
    rootMargin,
    freezeOnceVisible: true,
  })

  return (
    <div ref={ref} className={cn('min-h-[1px]', className)}>
      {isVisible ? (
        children
      ) : (
        placeholder || (
          <div className="w-full h-full animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg" />
        )
      )}
    </div>
  )
}