import { Metadata } from 'next'
import { seoConfig } from '@/lib/seo/meta-tags'
import { generateBreadcrumbStructuredData, generateLocalBusinessStructuredData } from '@/lib/structured-data'

export async function generateMetadata(): Promise<Metadata> {
  return seoConfig.generateContactPageMeta()
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clearedadvisorygroup.com'
const breadcrumbData = generateBreadcrumbStructuredData([
  { name: 'Home', url: '/' },
  { name: 'Contact', url: '/contact' }
], baseUrl)
const localBusinessData = generateLocalBusinessStructuredData(baseUrl)

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessData),
        }}
      />
      {children}
    </>
  )
}