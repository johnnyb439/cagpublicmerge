// Structured data helpers for SEO

export interface JobPosting {
  title: string;
  description: string;
  company: string;
  location: string;
  salary?: string;
  employmentType?: string;
  clearanceLevel?: string;
  postedDate?: string;
  validThrough?: string;
  skills?: string[];
}

export function generateJobPostingStructuredData(job: JobPosting, baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.company
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.location
      }
    },
    "baseSalary": job.salary ? {
      "@type": "MonetaryAmount",
      "currency": "USD",
      "value": {
        "@type": "QuantitativeValue",
        "value": job.salary
      }
    } : undefined,
    "employmentType": job.employmentType || "FULL_TIME",
    "datePosted": job.postedDate || new Date().toISOString().split('T')[0],
    "validThrough": job.validThrough || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    "skills": job.skills?.join(", "),
    "qualifications": job.clearanceLevel ? `Security Clearance: ${job.clearanceLevel}` : undefined,
    "url": `${baseUrl}/jobs/${job.title.toLowerCase().replace(/\s+/g, '-')}`
  };
}

export function generateOrganizationStructuredData(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Cleared Advisory Group",
    "description": "Leading career advisory services for security cleared IT professionals in government contracting.",
    "url": baseUrl,
    "logo": `${baseUrl}/images/cag-logo.png`,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-XXX-XXX-XXXX",
      "contactType": "Customer Service",
      "email": "info@clearedadvisorygroup.com"
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Washington",
      "addressRegion": "DC",
      "addressCountry": "US"
    },
    "sameAs": [
      "https://linkedin.com/company/cleared-advisory-group",
      "https://twitter.com/clearedadvisory"
    ],
    "foundingDate": "2024",
    "numberOfEmployees": {
      "@type": "QuantitativeValue",
      "value": "10-50"
    },
    "industry": "Career Services",
    "serviceArea": {
      "@type": "Place",
      "name": "United States"
    }
  };
}

export function generateBreadcrumbStructuredData(breadcrumbs: Array<{name: string, url: string}>, baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": `${baseUrl}${crumb.url}`
    }))
  };
}

export function generateServiceStructuredData(service: {
  name: string;
  description: string;
  price?: string;
  duration?: string;
}, baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.name,
    "description": service.description,
    "provider": {
      "@type": "Organization",
      "name": "Cleared Advisory Group",
      "url": baseUrl
    },
    "offers": service.price ? {
      "@type": "Offer",
      "price": service.price,
      "priceCurrency": "USD"
    } : undefined,
    "duration": service.duration,
    "serviceType": "Career Consulting",
    "areaServed": "United States"
  };
}

export function generateFAQStructuredData(faqs: Array<{question: string, answer: string}>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

export function generateWebsiteStructuredData(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Cleared Advisory Group",
    "url": baseUrl,
    "description": "Premier career advisory services for security cleared IT professionals",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/jobs?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Cleared Advisory Group"
    }
  };
}

export function generateLocalBusinessStructuredData(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "Cleared Advisory Group",
    "description": "Career advisory services for security cleared professionals",
    "url": baseUrl,
    "telephone": "+1-XXX-XXX-XXXX",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Business St",
      "addressLocality": "Washington",
      "addressRegion": "DC",
      "postalCode": "20001",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "38.9072",
      "longitude": "-77.0369"
    },
    "openingHours": "Mo-Fr 09:00-17:00",
    "priceRange": "$$",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "127"
    }
  };
}

export function generateArticleStructuredData(article: {
  title: string;
  description: string;
  author?: string;
  publishDate?: string;
  modifiedDate?: string;
  image?: string;
}, baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.description,
    "author": {
      "@type": "Person",
      "name": article.author || "Cleared Advisory Group"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Cleared Advisory Group",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/images/cag-logo.png`
      }
    },
    "datePublished": article.publishDate || new Date().toISOString(),
    "dateModified": article.modifiedDate || new Date().toISOString(),
    "image": article.image ? `${baseUrl}${article.image}` : `${baseUrl}/images/default-article.jpg`,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": baseUrl
    }
  };
}

// Helper function to inject structured data into page head
export function injectStructuredData(data: any): string {
  return `<script type="application/ld+json">${JSON.stringify(data, null, 2)}</script>`;
}