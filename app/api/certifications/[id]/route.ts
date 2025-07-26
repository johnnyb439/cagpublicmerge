import { NextRequest, NextResponse } from 'next/server'
import { Certification } from '../route'
// // import { withRateLimit } from '@/lib/api/withRateLimit'

// Mock database - replace with actual database in production
let certifications: Certification[] = []

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

// GET /api/certifications/[id] - Get specific certification
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || '1'
    
    const certification = certifications.find(cert => 
      cert.id === id && cert.userId === userId
    )
    
    if (!certification) {
      return NextResponse.json(
        { success: false, error: 'Certification not found' },
        { status: 404 }
      )
    }

    // Update status based on expiry date
    const updatedCertification = {
      ...certification,
      status: getCertificationStatus(certification.expiryDate)
    }

    return NextResponse.json({
      success: true,
      data: updatedCertification
    })
  } catch (error) {
    console.error('Error fetching certification:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch certification' },
      { status: 500 }
    )
  }
}

// PUT /api/certifications/[id] - Update certification
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json()
    const userId = body.userId || '1'
    
    const certificationIndex = certifications.findIndex(cert => 
      cert.id === id && cert.userId === userId
    )
    
    if (certificationIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Certification not found' },
        { status: 404 }
      )
    }

    const existingCert = certifications[certificationIndex]
    
    // Update certification with new data
    const updatedCertification: Certification = {
      ...existingCert,
      ...body,
      id: id, // Ensure ID doesn't change
      userId, // Ensure user ID doesn't change
      status: getCertificationStatus(body.expiryDate || existingCert.expiryDate),
      updatedAt: new Date().toISOString().split('T')[0]
    }

    certifications[certificationIndex] = updatedCertification

    return NextResponse.json({
      success: true,
      data: updatedCertification,
      message: 'Certification updated successfully'
    })
  } catch (error) {
    console.error('Error updating certification:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update certification' },
      { status: 500 }
    )
  }
}

// DELETE /api/certifications/[id] - Delete specific certification
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || '1'
    
    const certificationIndex = certifications.findIndex(cert => 
      cert.id === id && cert.userId === userId
    )
    
    if (certificationIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Certification not found' },
        { status: 404 }
      )
    }

    const deletedCertification = certifications[certificationIndex]
    certifications.splice(certificationIndex, 1)

    return NextResponse.json({
      success: true,
      data: deletedCertification,
      message: 'Certification deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting certification:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete certification' },
      { status: 500 }
    )
  }
}

// PATCH /api/certifications/[id] - Verify certification
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json()
    const userId = body.userId || '1'
    
    const certificationIndex = certifications.findIndex(cert => 
      cert.id === id && cert.userId === userId
    )
    
    if (certificationIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Certification not found' },
        { status: 404 }
      )
    }

    if (body.action === 'verify') {
      certifications[certificationIndex].verificationStatus = 'verified'
      certifications[certificationIndex].updatedAt = new Date().toISOString().split('T')[0]
      
      return NextResponse.json({
        success: true,
        data: certifications[certificationIndex],
        message: 'Certification verified successfully'
      })
    }

    if (body.action === 'add_document' && body.document) {
      const newDocument = {
        name: body.document.name,
        url: body.document.url,
        uploadDate: new Date().toISOString().split('T')[0]
      }
      
      certifications[certificationIndex].documents.push(newDocument)
      certifications[certificationIndex].updatedAt = new Date().toISOString().split('T')[0]
      
      return NextResponse.json({
        success: true,
        data: certifications[certificationIndex],
        message: 'Document added successfully'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error updating certification:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update certification' },
      { status: 500 }
    )
  }
}