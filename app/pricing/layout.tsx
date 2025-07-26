import { Metadata } from 'next'
import { seoConfig } from '@/lib/seo/meta-tags'
import { generateBreadcrumbStructuredData } from '@/lib/structured-data'

export async function generateMetadata(): Promise<Metadata> {
  return seoConfig.generatePricingPageMeta()
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clearedadvisorygroup.com'
const breadcrumbData = generateBreadcrumbStructuredData([
  { name: 'Home', url: '/' },
  { name: 'Pricing', url: '/pricing' }
], baseUrl)

export default function PricingLayout({
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
      {children}
    </>
  )
}