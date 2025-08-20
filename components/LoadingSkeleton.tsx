'use client'

interface LoadingSkeletonProps {
  type?: 'card' | 'text' | 'button' | 'image'
  className?: string
  count?: number
}

export default function LoadingSkeleton({ type = 'text', className = '', count = 1 }: LoadingSkeletonProps) {
  const skeletons = Array.from({ length: count }, (_, i) => i)

  switch (type) {
    case 'card':
      return (
        <>
          {skeletons.map((i) => (
            <div key={i} className={`skeleton rounded-xl p-6 ${className}`}>
              <div className="skeleton h-6 w-3/4 mb-4 rounded"></div>
              <div className="skeleton-text mb-2"></div>
              <div className="skeleton-text mb-2"></div>
              <div className="skeleton-text w-2/3 mb-4"></div>
              <div className="skeleton h-10 rounded-lg"></div>
            </div>
          ))}
        </>
      )
    
    case 'button':
      return (
        <>
          {skeletons.map((i) => (
            <div key={i} className={`skeleton h-12 w-32 rounded-lg ${className}`}></div>
          ))}
        </>
      )
    
    case 'image':
      return (
        <>
          {skeletons.map((i) => (
            <div key={i} className={`skeleton aspect-video rounded-lg ${className}`}></div>
          ))}
        </>
      )
    
    default:
      return (
        <>
          {skeletons.map((i) => (
            <div key={i} className={`skeleton-text ${className}`}></div>
          ))}
        </>
      )
  }
}