import Spinner from '@/components/ui/Spinner'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-ops-charcoal">
      <div className="text-center">
        <Spinner size="lg" className="mx-auto mb-4" />
        <p className="text-intel-gray animate-pulse">Loading...</p>
      </div>
    </div>
  )
}