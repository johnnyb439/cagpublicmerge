import { NextRequest, NextResponse } from 'next/server'
import { CSPViolationReport } from '@/lib/security/csp'

// In-memory storage for CSP violations (use database in production)
const violations: Array<CSPViolationReport & { timestamp: number }> = []

export async function POST(request: NextRequest) {
  try {
    const violationReport: CSPViolationReport = await request.json()
    
    // Store violation with timestamp
    const violation = {
      ...violationReport,
      timestamp: Date.now()
    }
    
    violations.push(violation)
    
    // Keep only last 1000 violations
    if (violations.length > 1000) {
      violations.splice(0, violations.length - 1000)
    }
    
    // Log violation in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('🚨 CSP Violation:', {
        directive: violationReport['csp-report']['violated-directive'],
        blockedUri: violationReport['csp-report']['blocked-uri'],
        documentUri: violationReport['csp-report']['document-uri'],
        sourceFile: violationReport['csp-report']['source-file'],
        lineNumber: violationReport['csp-report']['line-number']
      })
    }
    
    // In production, you might want to send this to a monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Send to monitoring service (Sentry, DataDog, etc.)
      // await sendToMonitoringService(violation)
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing CSP violation report:', error)
    return NextResponse.json(
      { error: 'Failed to process violation report' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const directive = searchParams.get('directive')
    
    let filteredViolations = [...violations]
    
    // Filter by directive if specified
    if (directive) {
      filteredViolations = violations.filter(v => 
        v['csp-report']['violated-directive'].includes(directive)
      )
    }
    
    // Sort by timestamp (newest first) and limit
    const recentViolations = filteredViolations
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
    
    // Generate summary statistics
    const summary = {
      total: filteredViolations.length,
      byDirective: {} as Record<string, number>,
      byBlockedUri: {} as Record<string, number>,
      lastHour: 0
    }
    
    const oneHourAgo = Date.now() - (60 * 60 * 1000)
    
    filteredViolations.forEach(violation => {
      const directive = violation['csp-report']['violated-directive']
      const blockedUri = violation['csp-report']['blocked-uri']
      
      summary.byDirective[directive] = (summary.byDirective[directive] || 0) + 1
      summary.byBlockedUri[blockedUri] = (summary.byBlockedUri[blockedUri] || 0) + 1
      
      if (violation.timestamp > oneHourAgo) {
        summary.lastHour++
      }
    })
    
    return NextResponse.json({
      success: true,
      data: recentViolations,
      summary
    })
  } catch (error) {
    console.error('Error retrieving CSP violations:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve violations' },
      { status: 500 }
    )
  }
}