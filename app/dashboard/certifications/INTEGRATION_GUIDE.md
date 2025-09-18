# Career Roadmap UI Integration Guide

## Quick Start - Connect Your UI to the Backend

### 1. Update the Certifications Page

Replace mock data with real API calls in `/app/dashboard/certifications/page.tsx`:

```typescript
// Add at the top
import { useEffect } from 'react'

// Inside component, replace mockCertifications with:
const [certifications, setCertifications] = useState<Certification[]>([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  fetchCertifications()
}, [])

const fetchCertifications = async () => {
  try {
    const response = await fetch('/api/certifications', {
      headers: { 'x-user-id': 'current-user-id' } // Get from auth
    })
    const data = await response.json()
    if (data.success) {
      setCertifications(data.certifications)
    }
  } catch (error) {
    console.error('Failed to fetch certifications:', error)
  } finally {
    setLoading(false)
  }
}

// Update handleAddCertification:
const handleAddCertification = async () => {
  if (newCert.name && newCert.issuer) {
    try {
      const response = await fetch('/api/certifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'current-user-id'
        },
        body: JSON.stringify({
          certId: newCert.name.toLowerCase().replace(/\s+/g, '-'),
          dateEarned: newCert.issueDate,
          expiryDate: newCert.expiryDate,
          credentialId: newCert.credentialId,
        })
      })

      if (response.ok) {
        fetchCertifications() // Refresh list
        setShowAddForm(false)
      }
    } catch (error) {
      console.error('Failed to add certification:', error)
    }
  }
}

// Update handleDeleteCertification:
const handleDeleteCertification = async (certId: string) => {
  try {
    const response = await fetch(`/api/certifications?certId=${certId}`, {
      method: 'DELETE',
      headers: { 'x-user-id': 'current-user-id' }
    })

    if (response.ok) {
      fetchCertifications() // Refresh list
    }
  } catch (error) {
    console.error('Failed to delete certification:', error)
  }
}
```

### 2. Add Roadmap Component

Create a new component for roadmap visualization:

```typescript
// /components/dashboard/CareerRoadmap.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, AlertCircle, Award, Clock } from 'lucide-react'

export default function CareerRoadmap() {
  const [roadmap, setRoadmap] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRoadmap()
  }, [])

  const fetchRoadmap = async () => {
    try {
      const response = await fetch('/api/roadmap', {
        headers: { 'x-user-id': 'current-user-id' }
      })
      const data = await response.json()
      if (data.success) {
        setRoadmap(data.recommendations)
      }
    } catch (error) {
      console.error('Failed to fetch roadmap:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading roadmap...</div>

  return (
    <div className="space-y-6">
      {/* Renewal Reminders */}
      {roadmap?.renewals?.length > 0 && (
        <div className="bg-white dark:bg-command-black rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <AlertCircle className="mr-2 text-yellow-500" />
            Certification Renewals
          </h3>
          <div className="space-y-3">
            {roadmap.renewals.map((renewal: any) => (
              <div
                key={renewal.certId}
                className={`p-4 rounded-lg border-l-4 ${
                  renewal.urgency === 'high' ? 'border-red-500 bg-red-50' :
                  renewal.urgency === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                  'border-blue-500 bg-blue-50'
                }`}
              >
                <p className="font-medium">{renewal.message}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Expires: {new Date(renewal.expiryDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Next Certifications */}
      {roadmap?.upgrades?.length > 0 && (
        <div className="bg-white dark:bg-command-black rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="mr-2 text-green-500" />
            Recommended Next Steps
          </h3>
          <div className="space-y-4">
            {roadmap.upgrades.map((upgrade: any) => (
              <div key={upgrade.currentCertId} className="border-l-2 border-gray-200 pl-4">
                <p className="text-sm text-gray-600 mb-2">
                  Based on your <strong>{upgrade.currentCertName}</strong>:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {upgrade.recommendedCerts.map((cert: any) => (
                    <div
                      key={cert.certId}
                      className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <p className="font-medium">{cert.name}</p>
                      <div className="flex items-center text-sm text-gray-600 mt-2">
                        <Clock size={14} className="mr-1" />
                        {cert.timeToComplete} months
                      </div>
                      <div className="flex items-center text-sm text-green-600 mt-1">
                        <TrendingUp size={14} className="mr-1" />
                        +{cert.salaryBoost}% salary
                      </div>
                      {cert.prepResources?.udemy && (
                        <a
                          href={cert.prepResources.udemy}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline mt-2 block"
                        >
                          View Course →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Career Path Suggestion */}
      {roadmap?.careerPathSuggestion && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Award className="mr-2" />
            Your Career Path: {roadmap.careerPathSuggestion.pathName}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm opacity-90">Remaining Certs</p>
              <p className="text-xl font-bold">{roadmap.careerPathSuggestion.remainingCerts.length}</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Projected Salary</p>
              <p className="text-xl font-bold">${roadmap.careerPathSuggestion.projectedSalary.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

### 3. Add to Dashboard

Import and use the roadmap component in your dashboard:

```typescript
// In /app/dashboard/certifications/page.tsx, add after certifications grid:
import CareerRoadmap from '@/components/dashboard/CareerRoadmap'

// After the certifications grid, add:
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, delay: 0.6 }}
>
  <h2 className="text-2xl font-semibold mb-6">Your Career Roadmap</h2>
  <CareerRoadmap />
</motion.div>
```

### 4. Environment Variables

Add to your `.env.local`:

```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
```

### 5. Install AWS SDK

```bash
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb uuid
npm install --save-dev @types/uuid
```

## Testing the Integration

1. Start your dev server: `npm run dev`
2. Navigate to `/dashboard/certifications`
3. Add a certification using the form
4. Check the roadmap recommendations appear
5. Test renewal reminders by adding certs with expiry dates

## Next Steps

1. **Add Authentication** - Replace mock user ID with real auth
2. **Add Loading States** - Skeleton loaders for better UX
3. **Add Error Handling** - Toast notifications for failures
4. **Add Filtering** - Filter certs by status/category
5. **Add Export** - Download cert list as PDF/CSV