import { NextRequest, NextResponse } from 'next/server'
import { mockDatabase } from '@/lib/mock-db'
// // // import { withRateLimit } from '@/lib/api/withRateLimit'

export interface Certification {
  id: string
  userId: string
  name: string
  issuer: string
  issueDate: string
  expiryDate?: string
  credentialId?: string
  credentialUrl?: string
  category: 'security' | 'cloud' | 'network' | 'development' | 'infrastructure' | 'other'
  status: 'active' | 'expired' | 'expiring_soon'
  verificationStatus: 'verified' | 'pending' | 'unverified'
  documents: {
    name: string
    url: string
    uploadDate: string
  }[]
  createdAt: string
  updatedAt: string
}

// Use shared mock database

// Helper function to determine certification status
function getCertificationStatus(expiryDate?: string): 'active' | 'expired' | 'expiring_soon' {
  if (!expiryDate) return 'active'
  
  const expiry = new Date(expiryDate)
  const now = new Date()
  const threeMonthsFromNow = new Date()
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3)
  
  if (expiry < now) return 'expired'
  if (expiry <= threeMonthsFromNow) return 'expiring_soon'
  return 'active'
}

// GET /api/certifications - Get all certifications for user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || '1' // Mock user ID
    const category = searchParams.get('category')
    const status = searchParams.get('status')

    let userCertifications = mockDatabase.certifications.filter(cert => cert.userId === userId)

    // Apply filters
    if (category && category !== 'all') {
      userCertifications = userCertifications.filter(cert => cert.category === category)
    }

    if (status && status !== 'all') {
      userCertifications = userCertifications.filter(cert => cert.status === status)
    }

    // Update status based on expiry dates
    userCertifications = userCertifications.map(cert => ({
      ...cert,
      status: getCertificationStatus(cert.expiryDate)
    }))

    // Calculate statistics
    const stats = {
      total: userCertifications.length,
      active: userCertifications.filter(c => c.status === 'active').length,
      expiring: userCertifications.filter(c => c.status === 'expiring_soon').length,
      expired: userCertifications.filter(c => c.status === 'expired').length,
      byCategory: userCertifications.reduce((acc, cert) => {
        acc[cert.category] = (acc[cert.category] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }

    return NextResponse.json({
      success: true,
      data: userCertifications,
      stats
    })
  } catch (error) {
    console.error('Error fetching certifications:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch certifications' },
      { status: 500 }
    )
  }
}