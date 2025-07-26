// Content Security Policy configuration
export interface CSPConfig {
  directives: Record<string, string[]>
  reportOnly?: boolean
  reportUri?: string
}

export const getCSPDirectives = (isDev: boolean = false): CSPConfig => {
  const baseDirectives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'", // Required for Next.js in development
      "'unsafe-eval'", // Required for Next.js in development
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
      'https://static.hotjar.com',
      'https://script.hotjar.com',
      'https://js.stripe.com',
      'https://checkout.stripe.com'
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Required for styled-components and CSS-in-JS
      'https://fonts.googleapis.com'
    ],
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      'https:',
      'https://www.google-analytics.com',
      'https://www.googletagmanager.com',
      'https://static.hotjar.com'
    ],
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com',
      'https://fonts.googleapis.com'
    ],
    'connect-src': [
      "'self'",
      'https://api.openai.com',
      'https://www.google-analytics.com',
      'https://region1.google-analytics.com',
      'https://analytics.google.com',
      'https://stats.g.doubleclick.net',
      'https://api.stripe.com',
      'https://checkout.stripe.com',
      'wss://ws.hotjar.com',
      'https://*.hotjar.com',
      'https://*.supabase.co',
      'wss://*.supabase.co'
    ],
    'frame-src': [
      "'self'",
      'https://js.stripe.com',
      'https://checkout.stripe.com',
      'https://www.google.com'
    ],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'block-all-mixed-content': [],
    'upgrade-insecure-requests': []
  }

  // Development-specific adjustments
  if (isDev) {
    baseDirectives['script-src'].push(
      'http://localhost:*',
      'ws://localhost:*',
      'http://127.0.0.1:*',
      'ws://127.0.0.1:*'
    )
    baseDirectives['connect-src'].push(
      'http://localhost:*',
      'ws://localhost:*',
      'http://127.0.0.1:*',
      'ws://127.0.0.1:*'
    )
    // Remove upgrade-insecure-requests for development
    delete baseDirectives['upgrade-insecure-requests']
  }

  return {
    directives: baseDirectives,
    reportOnly: isDev, // Only report in development
    reportUri: '/api/security/csp-report'
  }
}

export const generateCSPHeader = (config: CSPConfig): string => {
  const directiveStrings = Object.entries(config.directives).map(([key, values]) => {
    if (values.length === 0) {
      return key
    }
    return `${key} ${values.join(' ')}`
  })

  let csp = directiveStrings.join('; ')

  if (config.reportUri) {
    csp += `; report-uri ${config.reportUri}`
  }

  return csp
}

export const generateCSPMeta = (config: CSPConfig): string => {
  return `<meta http-equiv="Content-Security-Policy" content="${generateCSPHeader(config)}">`
}

// Nonce generation for inline scripts
export const generateNonce = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for environments without crypto.randomUUID
  return Array.from({ length: 16 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('')
}

// CSP violation reporting endpoint types
export interface CSPViolationReport {
  'csp-report': {
    'document-uri': string
    referrer: string
    'violated-directive': string
    'effective-directive': string
    'original-policy': string
    disposition: string
    'blocked-uri': string
    'line-number': number
    'column-number': number
    'source-file': string
    'status-code': number
    'script-sample': string
  }
}