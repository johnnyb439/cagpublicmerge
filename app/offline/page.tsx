import React from 'react'
import { WifiOff, RefreshCw } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div className="min-h-screen glass-bg flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <WifiOff className="w-24 h-24 mx-auto text-gray-400 mb-6" />
        <h1 className="text-3xl font-bold text-white mb-4">You're Offline</h1>
        <p className="text-gray-400 mb-8">
          It looks like you've lost your internet connection. Some features may be unavailable until you're back online.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-sky-blue text-white rounded-lg hover:bg-sky-blue/80 transition-all flex items-center gap-2 mx-auto"
        >
          <RefreshCw size={20} />
          Try Again
        </button>
      </div>
    </div>
  )
}