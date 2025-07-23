import Link from 'next/link'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-ops-charcoal">
      <div className="text-center">
        <div className="w-20 h-20 bg-dynamic-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileQuestion className="w-10 h-10 text-dynamic-green" />
        </div>
        <h2 className="text-2xl font-montserrat font-bold mb-4">Page Not Found</h2>
        <p className="text-intel-gray mb-8 max-w-md mx-auto">
          Sorry, we couldn't find the page you're looking for. It may have been moved or doesn't exist.
        </p>
        <Link href="/" className="btn-primary">
          Return Home
        </Link>
      </div>
    </div>
  )
}