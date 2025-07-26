import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

export async function POST(req: NextRequest) {
  try {
    // Get session for user info
    const session = await getServerSession(authOptions)
    
    const body = await req.json()
    const { title, description, type, priority, url, userAgent, sentryEventId } = body

    // Format issue body
    const issueBody = `
## Bug Report

**Type:** ${type}
**Priority:** ${priority}
**URL:** ${url}
**Reported by:** ${session?.user?.email || 'Anonymous'}
${sentryEventId ? `**Sentry Event:** ${sentryEventId}` : ''}

### Description
${description}

### System Information
\`\`\`
User Agent: ${userAgent}
Time: ${new Date().toISOString()}
\`\`\`

### Additional Context
- User authenticated: ${!!session}
- Environment: ${process.env.NODE_ENV}
${session?.user?.id ? `- User ID: ${session.user.id}` : ''}

---
*This issue was automatically created from the bug reporter in the application.*
`

    // Create GitHub issue using GitHub API
    const githubResponse = await fetch(
      `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/issues`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `[${type}] ${title}`,
          body: issueBody,
          labels: [type, `priority-${priority}`, 'from-app'],
        }),
      }
    )

    if (!githubResponse.ok) {
      console.error('GitHub API error:', await githubResponse.text())
      return NextResponse.json(
        { error: 'Failed to create GitHub issue' },
        { status: 500 }
      )
    }

    const issue = await githubResponse.json()

    return NextResponse.json({
      success: true,
      issueNumber: issue.number,
      issueUrl: issue.html_url,
    })
  } catch (error) {
    console.error('Bug report error:', error)
    return NextResponse.json(
      { error: 'Failed to submit bug report' },
      { status: 500 }
    )
  }
}