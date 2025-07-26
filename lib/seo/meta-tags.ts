// SEO meta tags generator

export interface MetaTagsConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
  noFollow?: boolean;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export class SEOMetaTags {
  private baseUrl: string;
  private siteName: string;
  private defaultImage: string;
  private twitterHandle: string;

  constructor(config: {
    baseUrl: string;
    siteName: string;
    defaultImage: string;
    twitterHandle: string;
  }) {
    this.baseUrl = config.baseUrl;
    this.siteName = config.siteName;
    this.defaultImage = config.defaultImage;
    this.twitterHandle = config.twitterHandle;
  }

  generateMetaTags(config: MetaTagsConfig) {
    const {
      title,
      description,
      keywords = [],
      canonical,
      ogImage = this.defaultImage,
      ogType = 'website',
      twitterCard = 'summary_large_image',
      author,
      publishedTime,
      modifiedTime,
      noIndex = false,
      noFollow = false
    } = config;

    const fullTitle = title.includes(this.siteName) ? title : `${title} | ${this.siteName}`;
    const imageUrl = ogImage.startsWith('http') ? ogImage : `${this.baseUrl}${ogImage}`;
    const canonicalUrl = canonical ? `${this.baseUrl}${canonical}` : undefined;

    return {
      title: fullTitle,
      description,
      keywords: keywords.join(', '),
      robots: this.generateRobotsContent(noIndex, noFollow),
      canonical: canonicalUrl,
      
      // Open Graph
      'og:title': fullTitle,
      'og:description': description,
      'og:image': imageUrl,
      'og:image:alt': title,
      'og:type': ogType,
      'og:url': canonicalUrl || this.baseUrl,
      'og:site_name': this.siteName,
      'og:locale': 'en_US',
      
      // Twitter Card
      'twitter:card': twitterCard,
      'twitter:site': this.twitterHandle,
      'twitter:creator': this.twitterHandle,
      'twitter:title': fullTitle,
      'twitter:description': description,
      'twitter:image': imageUrl,
      'twitter:image:alt': title,
      
      // Article specific
      ...(ogType === 'article' && {
        'article:author': author,
        'article:published_time': publishedTime,
        'article:modified_time': modifiedTime,
        'article:section': 'Career Advice'
      }),
      
      // Additional SEO
      'theme-color': '#1e40af',
      'msapplication-TileColor': '#1e40af',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default'
    };
  }

  generateHomePageMeta() {
    return this.generateMetaTags({
      title: 'Cleared Advisory Group - Premier Career Services for Security Cleared Professionals',
      description: 'Expert career guidance, job placement, and professional development for security cleared IT professionals in government contracting. Find your next cleared position today.',
      keywords: [
        'security clearance jobs',
        'cleared professionals',
        'government contracting careers',
        'IT security clearance',
        'defense contractor jobs',
        'cleared job placement',
        'security cleared resume',
        'clearance interview prep'
      ],
      canonical: '/',
      ogType: 'website'
    });
  }

  generateJobsPageMeta() {
    return this.generateMetaTags({
      title: 'Security Cleared Jobs - Find Your Next Cleared Position',
      description: 'Browse thousands of security cleared job opportunities across government contracting. Filter by clearance level, location, and skills to find your perfect match.',
      keywords: [
        'security clearance jobs',
        'cleared job board',
        'government contractor positions',
        'secret clearance jobs',
        'top secret jobs',
        'SCI clearance positions',
        'defense jobs',
        'federal contractor careers'
      ],
      canonical: '/jobs',
      ogType: 'website'
    });
  }

  generateJobDetailMeta(job: {
    title: string;
    company: string;
    location: string;
    clearanceLevel?: string;
    description: string;
    id: string;
  }) {
    const title = `${job.title} at ${job.company} - ${job.location}`;
    const description = `${job.clearanceLevel ? `${job.clearanceLevel} clearance required. ` : ''}${job.description.substring(0, 150)}...`;
    
    return this.generateMetaTags({
      title,
      description,
      keywords: [
        job.title.toLowerCase(),
        job.company.toLowerCase(),
        job.location.toLowerCase(),
        job.clearanceLevel?.toLowerCase() || '',
        'security clearance job',
        'government contractor'
      ].filter(Boolean),
      canonical: `/jobs/${job.id}`,
      ogType: 'article',
      publishedTime: new Date().toISOString()
    });
  }

  generateServicesPageMeta() {
    return this.generateMetaTags({
      title: 'Career Services for Cleared Professionals - Resume, Interview & Career Coaching',
      description: 'Professional career services including resume translation, interview preparation, career planning, and clearance guidance for security cleared professionals.',
      keywords: [
        'cleared resume services',
        'security clearance interview prep',
        'government contractor career coaching',
        'cleared professional development',
        'federal resume writing',
        'clearance career guidance',
        'contractor interview training'
      ],
      canonical: '/services',
      ogType: 'website'
    });
  }

  generateAboutPageMeta() {
    return this.generateMetaTags({
      title: 'About Cleared Advisory Group - Expert Career Guidance for Cleared Professionals',
      description: 'Learn about our mission to advance careers of security cleared professionals through expert guidance, industry connections, and proven strategies.',
      keywords: [
        'cleared advisory group',
        'security clearance career experts',
        'government contracting advisors',
        'cleared professional services',
        'defense contractor career guidance'
      ],
      canonical: '/about',
      ogType: 'website'
    });
  }

  generateContactPageMeta() {
    return this.generateMetaTags({
      title: 'Contact Cleared Advisory Group - Get Expert Career Guidance',
      description: 'Ready to advance your cleared career? Contact our expert advisors for personalized guidance, job placement assistance, and professional development.',
      keywords: [
        'contact cleared advisory',
        'career consultation',
        'cleared job placement',
        'professional career guidance',
        'security clearance career help'
      ],
      canonical: '/contact',
      ogType: 'website'
    });
  }

  generateResourcesPageMeta() {
    return this.generateMetaTags({
      title: 'Career Resources for Cleared Professionals - Guides, Templates & Tools',
      description: 'Access comprehensive career resources including resume templates, interview guides, salary data, and career planning tools for security cleared professionals.',
      keywords: [
        'cleared career resources',
        'security clearance guides',
        'federal resume templates',
        'contractor interview guides',
        'clearance career tools',
        'government job resources'
      ],
      canonical: '/resources',
      ogType: 'website'
    });
  }

  generatePricingPageMeta() {
    return this.generateMetaTags({
      title: 'Pricing - Affordable Career Services for Cleared Professionals',
      description: 'Transparent pricing for professional career services. Choose from individual consultations, comprehensive packages, or ongoing membership support.',
      keywords: [
        'cleared career services pricing',
        'professional career consultation cost',
        'resume writing service pricing',
        'interview prep cost',
        'career coaching fees'
      ],
      canonical: '/pricing',
      ogType: 'website'
    });
  }

  generateMockInterviewMeta() {
    return this.generateMetaTags({
      title: 'AI-Powered Mock Interviews for Cleared Professionals - Practice & Excel',
      description: 'Practice for your next cleared position interview with our AI-powered mock interview tool. Get real-time feedback and improve your interview skills.',
      keywords: [
        'mock interview tool',
        'AI interview practice',
        'cleared interview preparation',
        'government contractor interview',
        'interview skills training',
        'security clearance interview prep'
      ],
      canonical: '/mock-interview',
      ogType: 'website'
    });
  }

  private generateRobotsContent(noIndex: boolean, noFollow: boolean): string {
    const directives = [];
    
    if (noIndex) directives.push('noindex');
    else directives.push('index');
    
    if (noFollow) directives.push('nofollow');
    else directives.push('follow');
    
    return directives.join(', ');
  }
}

// Default configuration
export const seoConfig = new SEOMetaTags({
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://clearedadvisorygroup.com',
  siteName: 'Cleared Advisory Group',
  defaultImage: '/images/og-default.jpg',
  twitterHandle: '@clearedadvisory'
});

// Utility function to format meta tags for Next.js
export function formatMetaTagsForNext(tags: Record<string, string>) {
  return Object.entries(tags).reduce((acc, [key, value]) => {
    if (key === 'title') {
      acc.title = value;
    } else if (key === 'description') {
      acc.description = value;
    } else if (key === 'keywords') {
      acc.keywords = value;
    } else if (key === 'robots') {
      acc.robots = value;
    } else if (key === 'canonical') {
      acc.alternates = { canonical: value };
    } else if (key.startsWith('og:') || key.startsWith('twitter:') || key.startsWith('article:')) {
      if (!acc.openGraph) acc.openGraph = {};
      if (!acc.twitter) acc.twitter = {};
      
      if (key.startsWith('og:')) {
        const ogKey = key.replace('og:', '');
        if (ogKey === 'image') {
          acc.openGraph.images = [{ url: value, alt: tags['og:image:alt'] || tags.title }];
        } else {
          acc.openGraph[ogKey] = value;
        }
      } else if (key.startsWith('twitter:')) {
        const twitterKey = key.replace('twitter:', '');
        if (twitterKey === 'image') {
          acc.twitter.images = [value];
        } else {
          acc.twitter[twitterKey] = value;
        }
      }
    } else {
      if (!acc.other) acc.other = {};
      acc.other[key] = value;
    }
    
    return acc;
  }, {} as any);
}