import { useEffect, useState } from 'react'

interface DemoData {
  users: any[]
  jobs: any[]
  certifications: any[]
}

export function useDemoData() {
  const [demoData, setDemoData] = useState<DemoData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const loadDemoData = async () => {
      try {
        // Check if we're in development mode
        if (process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
          // Try to load demo data
          const response = await fetch('/demo-data.json')
          if (response.ok) {
            const data = await response.json()
            setDemoData(data)
            
            // Store demo users in localStorage for auth fallback
            if (typeof window !== 'undefined') {
              localStorage.setItem('users', JSON.stringify(data.users))
              localStorage.setItem('jobs', JSON.stringify(data.jobs))
              localStorage.setItem('certifications', JSON.stringify(data.certifications))
            }
          }
        }
      } catch (error) {
        console.error('Failed to load demo data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadDemoData()
  }, [])
  
  return { demoData, isLoading }
}