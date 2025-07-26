// Google reCAPTCHA v3 integration

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY || ''
const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify'

export interface RecaptchaConfig {
  action: string
  threshold?: number // Score threshold (0.0 - 1.0)
}

// Load reCAPTCHA script
export function loadRecaptchaScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('reCAPTCHA can only be loaded in browser'))
      return
    }

    // Check if already loaded
    if ((window as any).grecaptcha) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`
    script.async = true
    script.defer = true
    
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load reCAPTCHA'))
    
    document.head.appendChild(script)
  })
}

// Execute reCAPTCHA
export async function executeRecaptcha(action: string): Promise<string> {
  if (!RECAPTCHA_SITE_KEY) {
    console.warn('reCAPTCHA site key not configured')
    return ''
  }

  await loadRecaptchaScript()
  
  return new Promise((resolve, reject) => {
    (window as any).grecaptcha.ready(() => {
      (window as any).grecaptcha
        .execute(RECAPTCHA_SITE_KEY, { action })
        .then(resolve)
        .catch(reject)
    })
  })
}

// Verify reCAPTCHA token on server
export async function verifyRecaptcha(
  token: string,
  config: RecaptchaConfig
): Promise<{ success: boolean; score?: number; action?: string; errors?: string[] }> {
  if (!RECAPTCHA_SECRET_KEY) {
    console.warn('reCAPTCHA secret key not configured')
    return { success: true } // Allow in development
  }

  if (!token) {
    return { success: false, errors: ['Missing reCAPTCHA token'] }
  }

  try {
    const response = await fetch(RECAPTCHA_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: RECAPTCHA_SECRET_KEY,
        response: token,
      }),
    })

    const data = await response.json()

    if (!data.success) {
      return {
        success: false,
        errors: data['error-codes'] || ['reCAPTCHA verification failed']
      }
    }

    // Check action matches
    if (data.action !== config.action) {
      return {
        success: false,
        errors: ['reCAPTCHA action mismatch']
      }
    }

    // Check score threshold
    const threshold = config.threshold || 0.5
    if (data.score < threshold) {
      return {
        success: false,
        score: data.score,
        errors: ['reCAPTCHA score too low']
      }
    }

    return {
      success: true,
      score: data.score,
      action: data.action
    }
  } catch (error) {
    console.error('reCAPTCHA verification error:', error)
    return {
      success: false,
      errors: ['reCAPTCHA verification error']
    }
  }
}

// React hook for reCAPTCHA
export function useRecaptcha() {
  const execute = async (action: string): Promise<string> => {
    try {
      return await executeRecaptcha(action)
    } catch (error) {
      console.error('reCAPTCHA execution error:', error)
      return ''
    }
  }

  return { execute, siteKey: RECAPTCHA_SITE_KEY }
}