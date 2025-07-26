// A/B Testing Experiments Configuration

export interface Experiment {
  id: string
  name: string
  description: string
  variants: Variant[]
  targetAudience?: TargetAudience
  metrics: string[]
  status: 'draft' | 'running' | 'paused' | 'completed'
  startDate?: string
  endDate?: string
}

export interface Variant {
  id: string
  name: string
  weight: number // Percentage of traffic (0-100)
  changes: Record<string, any>
}

export interface TargetAudience {
  newUsers?: boolean
  returningUsers?: boolean
  clearanceLevel?: string[]
  location?: string[]
  device?: ('mobile' | 'tablet' | 'desktop')[]
}

// Active experiments
export const experiments: Experiment[] = [
  {
    id: 'hero-cta-test',
    name: 'Hero CTA Button Test',
    description: 'Test different CTA button texts and colors',
    status: 'running',
    variants: [
      {
        id: 'control',
        name: 'Control - Browse Cleared Jobs',
        weight: 50,
        changes: {
          ctaText: 'Browse Cleared Jobs',
          ctaColor: 'bg-sky-blue'
        }
      },
      {
        id: 'variant-a',
        name: 'Variant A - Start Your Career',
        weight: 50,
        changes: {
          ctaText: 'Start Your Cleared Career',
          ctaColor: 'bg-neon-green'
        }
      }
    ],
    metrics: ['click_rate', 'conversion_rate', 'bounce_rate'],
  },
  {
    id: 'job-card-layout',
    name: 'Job Card Layout Test',
    description: 'Test compact vs detailed job card layouts',
    status: 'running',
    variants: [
      {
        id: 'control',
        name: 'Control - Compact Layout',
        weight: 50,
        changes: {
          layout: 'compact',
          showSalary: true,
          showDescription: false
        }
      },
      {
        id: 'variant-a',
        name: 'Variant A - Detailed Layout',
        weight: 50,
        changes: {
          layout: 'detailed',
          showSalary: true,
          showDescription: true,
          showRequirements: true
        }
      }
    ],
    metrics: ['engagement_rate', 'application_rate', 'time_on_page'],
  },
  {
    id: 'signup-flow',
    name: 'Signup Flow Optimization',
    description: 'Test single-step vs multi-step signup',
    status: 'draft',
    variants: [
      {
        id: 'control',
        name: 'Control - Single Step',
        weight: 50,
        changes: {
          steps: 1,
          showSocialLogin: true,
          requirePhone: false
        }
      },
      {
        id: 'variant-a',
        name: 'Variant A - Multi Step',
        weight: 50,
        changes: {
          steps: 3,
          showSocialLogin: true,
          requirePhone: true,
          showProgress: true
        }
      }
    ],
    metrics: ['completion_rate', 'drop_off_rate', 'time_to_complete'],
  }
]

// Get experiment by ID
export function getExperiment(id: string): Experiment | undefined {
  return experiments.find(exp => exp.id === id)
}

// Get active experiments
export function getActiveExperiments(): Experiment[] {
  return experiments.filter(exp => exp.status === 'running')
}

// Check if user matches target audience
export function matchesTargetAudience(
  audience: TargetAudience | undefined,
  userContext: {
    isNewUser?: boolean
    clearanceLevel?: string
    location?: string
    device?: string
  }
): boolean {
  if (!audience) return true

  if (audience.newUsers !== undefined && audience.newUsers !== userContext.isNewUser) {
    return false
  }

  if (audience.clearanceLevel && userContext.clearanceLevel) {
    if (!audience.clearanceLevel.includes(userContext.clearanceLevel)) {
      return false
    }
  }

  if (audience.device && userContext.device) {
    if (!audience.device.includes(userContext.device as any)) {
      return false
    }
  }

  return true
}