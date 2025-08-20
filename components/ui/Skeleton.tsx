import React from 'react'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

export default function Skeleton({ 
  className = '', 
  variant = 'text',
  width,
  height,
  animation = 'pulse'
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700'
  
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: ''
  }
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg'
  }
  
  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1em' : '100%')
  }
  
  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  )
}

// Skeleton container for loading states
export function SkeletonContainer({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {children}
    </div>
  )
}

// Pre-built skeleton patterns
export function JobCardSkeleton() {
  return (
    <div className="bg-white dark:bg-command-black rounded-lg shadow-md p-6">
      <SkeletonContainer>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <Skeleton variant="text" width="60%" height={24} className="mb-2" />
            <Skeleton variant="text" width="40%" height={20} />
          </div>
          <Skeleton variant="rounded" width={80} height={32} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Skeleton variant="rounded" width={100} height={24} />
          <Skeleton variant="rounded" width={120} height={24} />
          <Skeleton variant="rounded" width={90} height={24} />
        </div>
        <Skeleton variant="text" width="100%" height={16} className="mt-4" />
        <Skeleton variant="text" width="80%" height={16} />
      </SkeletonContainer>
    </div>
  )
}

export function DashboardCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton variant="circular" width={48} height={48} />
        <Skeleton variant="text" width={60} height={32} />
      </div>
      <Skeleton variant="text" width="50%" height={20} className="mb-2" />
      <Skeleton variant="text" width="80%" height={16} />
    </div>
  )
}