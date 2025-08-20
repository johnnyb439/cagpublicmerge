export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-ops-charcoal">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-dynamic-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-intel-gray">Loading...</p>
      </div>
    </div>
  )
}