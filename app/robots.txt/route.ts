import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clearedadvisorygroup.com'
  
  const robots = `# Robots.txt for Cleared Advisory Group
# Generated automatically

User-agent: *
Allow: /

# Disallow admin and private areas
Disallow: /admin/
Disallow: /api/
Disallow: /dashboard/
Disallow: /_next/
Disallow: /.next-temp/

# Disallow sensitive pages
Disallow: /login
Disallow: /register
Disallow: /profile
Disallow: /settings

# Allow important pages
Allow: /jobs
Allow: /services
Allow: /about
Allow: /contact
Allow: /resources
Allow: /pricing
Allow: /mock-interview

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay for better server performance
Crawl-delay: 1

# Specific rules for search engines
User-agent: Googlebot
Allow: /
Crawl-delay: 0

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: LinkedInBot
Allow: /

# Block AI training crawlers (optional)
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Claude-Web
Disallow: /`

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
    },
  })
}