import { NextResponse } from 'next/server';

// Static pages
const staticPages = [
  '',
  '/about',
  '/services',
  '/contact',
  '/pricing',
  '/resources',
  '/mock-interview',
  '/login',
  '/register',
  '/privacy',
  '/terms',
  '/security',
];

// Dynamic pages that need to be generated
const dynamicPages = [
  '/jobs',
  '/dashboard',
  '/networking',
];

// Categories for better organization
const categories = [
  'entry-level',
  'mid-level',
  'senior-level',
  'executive',
];

const clearanceLevels = [
  'public-trust',
  'secret',
  'top-secret',
  'sci',
];

const locations = [
  'washington-dc',
  'northern-virginia',
  'maryland',
  'remote',
];

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clearedadvisorygroup.com';
  const currentDate = new Date().toISOString();

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">`;

  // Add static pages
  staticPages.forEach((page) => {
    const priority = page === '' ? '1.0' : '0.8';
    const changefreq = page === '' ? 'daily' : 'weekly';
    
    sitemap += `
  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  });

  // Add dynamic pages
  dynamicPages.forEach((page) => {
    sitemap += `
  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
  });

  // Add job category pages
  categories.forEach((category) => {
    sitemap += `
  <url>
    <loc>${baseUrl}/jobs/category/${category}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`;
  });

  // Add clearance level pages
  clearanceLevels.forEach((level) => {
    sitemap += `
  <url>
    <loc>${baseUrl}/jobs/clearance/${level}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`;
  });

  // Add location pages
  locations.forEach((location) => {
    sitemap += `
  <url>
    <loc>${baseUrl}/jobs/location/${location}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`;
  });

  // Add resource pages
  const resourceTypes = ['guides', 'templates', 'checklists', 'videos'];
  resourceTypes.forEach((type) => {
    sitemap += `
  <url>
    <loc>${baseUrl}/resources/${type}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
  });

  // Add service pages
  const services = [
    'career-planning',
    'resume-translation',
    'interview-prep',
    'clearance-guidance',
    'networking-support',
  ];
  
  services.forEach((service) => {
    sitemap += `
  <url>
    <loc>${baseUrl}/services/${service}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
  });

  // Add blog/news pages if they exist
  const blogPosts = [
    'clearance-application-tips',
    'government-contracting-guide',
    'interview-preparation',
    'resume-optimization',
    'networking-strategies',
  ];

  blogPosts.forEach((post) => {
    sitemap += `
  <url>
    <loc>${baseUrl}/blog/${post}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`;
  });

  // Add image sitemap for important images
  sitemap += `
  <url>
    <loc>${baseUrl}</loc>
    <image:image>
      <image:loc>${baseUrl}/images/cag-logo.png</image:loc>
      <image:title>Cleared Advisory Group Logo</image:title>
      <image:caption>Official logo of Cleared Advisory Group</image:caption>
    </image:image>
    <image:image>
      <image:loc>${baseUrl}/images/hero-bg.jpg</image:loc>
      <image:title>Cleared Professionals Hero Image</image:title>
      <image:caption>Hero background for cleared IT professionals</image:caption>
    </image:image>
  </url>`;

  sitemap += `
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=86400, stale-while-revalidate',
    },
  });
}