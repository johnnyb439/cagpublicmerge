import Head from 'next/head'
import { usePathname } from 'next/navigation'

interface SEOProps {
  title?: string
  description?: string
  image?: string
  article?: boolean
  keywords?: string
  author?: string
  publishedTime?: string
  modifiedTime?: string
}

const defaultMeta = {
  title: 'Cleared Advisory Group - Your Gateway to Cleared IT Opportunities',
  description: 'Bridging the gap for National Guard, Reservists, Veterans, and cleared professionals seeking government contracting opportunities.',
  image: 'https://caglive.vercel.app/images/cag-logo.png',
  type: 'website',
  siteName: 'Cleared Advisory Group',
  keywords: 'security clearance, government contracting, IT jobs, military transition, cleared jobs, SECRET clearance, TS/SCI, federal jobs'
}

export default function SEO({
  title,
  description,
  image,
  article = false,
  keywords,
  author,
  publishedTime,
  modifiedTime
}: SEOProps) {
  const pathname = usePathname()
  const meta = {
    title: title ? `${title} | ${defaultMeta.siteName}` : defaultMeta.title,
    description: description || defaultMeta.description,
    image: image || defaultMeta.image,
    keywords: keywords || defaultMeta.keywords,
    type: article ? 'article' : defaultMeta.type
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Cleared Advisory Group',
    url: 'https://caglive.vercel.app',
    logo: 'https://caglive.vercel.app/images/cag-logo.png',
    description: defaultMeta.description,
    sameAs: [
      'https://www.linkedin.com/company/cleared-advisory-group',
      'https://twitter.com/clearedadvisory'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-555-CAG-JOBS',
      contactType: 'customer service',
      availableLanguage: 'English'
    }
  }

  const jobPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    '@id': 'https://caglive.vercel.app/jobs',
    title: 'Cleared IT Professional',
    description: 'Various IT positions requiring security clearance',
    datePosted: new Date().toISOString(),
    hiringOrganization: {
      '@type': 'Organization',
      name: 'Cleared Advisory Group',
      sameAs: 'https://caglive.vercel.app'
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'US'
      }
    },
    employmentType: 'FULL_TIME',
    jobBenefits: 'Competitive salary, benefits, and career growth opportunities'
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://caglive.vercel.app'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Jobs',
        item: 'https://caglive.vercel.app/jobs'
      }
    ]
  }

  return (
    <Head>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta name="keywords" content={meta.keywords} />
      <link rel="canonical" href={`https://caglive.vercel.app${pathname || ''}`} />
      
      {/* Open Graph */}
      <meta property="og:url" content={`https://caglive.vercel.app${pathname || ''}`} />
      <meta property="og:type" content={meta.type} />
      <meta property="og:site_name" content={defaultMeta.siteName} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:image" content={meta.image} />
      <meta property="og:image:alt" content={meta.title} />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@clearedadvisory" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={meta.image} />
      
      {/* Article specific */}
      {article && (
        <>
          {author && <meta property="article:author" content={author} />}
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
        </>
      )}
      
      {/* Additional SEO tags */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="google" content="notranslate" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {pathname === '/jobs' && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }}
        />
      )}
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </Head>
  )
}