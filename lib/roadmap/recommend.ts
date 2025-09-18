import { UserCertificationItem } from '@/lib/dynamodb-schema';
import roadmapRules from './rules.json';

export interface RenewalReminder {
  certId: string;
  certName: string;
  expiryDate: string;
  daysUntilExpiry: number;
  urgency: 'low' | 'medium' | 'high';
  message: string;
  color: string;
}

export interface CertUpgrade {
  currentCertId: string;
  currentCertName: string;
  recommendedCerts: {
    certId: string;
    name: string;
    timeToComplete: number;
    salaryBoost: number;
    prepResources?: any;
  }[];
}

export interface RoadmapRecommendations {
  renewals: RenewalReminder[];
  upgrades: CertUpgrade[];
  careerPathSuggestion?: {
    pathName: string;
    remainingCerts: string[];
    estimatedTimeMonths: number;
    projectedSalary: number;
  };
}

/**
 * Calculate days between two dates
 */
function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
}

/**
 * Get certification name from ID (mock for now - would query catalog)
 */
function getCertName(certId: string): string {
  // Convert cert ID to readable name
  return certId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Check for expiring certifications
 */
function checkRenewals(userCerts: UserCertificationItem[]): RenewalReminder[] {
  const renewals: RenewalReminder[] = [];
  const now = new Date();

  userCerts.forEach(cert => {
    if (cert.expiryDate && cert.status === 'active') {
      const expiryDate = new Date(cert.expiryDate);
      const daysUntilExpiry = daysBetween(expiryDate, now);

      // Check 90, 60, 30 day windows
      let window = null;
      if (daysUntilExpiry <= 90 && daysUntilExpiry > 60) {
        window = roadmapRules.renewalWindows['90'];
      } else if (daysUntilExpiry <= 60 && daysUntilExpiry > 30) {
        window = roadmapRules.renewalWindows['60'];
      } else if (daysUntilExpiry <= 30 && daysUntilExpiry >= 0) {
        window = roadmapRules.renewalWindows['30'];
      }

      if (window) {
        renewals.push({
          certId: cert.certId,
          certName: getCertName(cert.certId),
          expiryDate: cert.expiryDate,
          daysUntilExpiry,
          urgency: window.urgency as 'low' | 'medium' | 'high',
          message: window.message.replace('{certName}', getCertName(cert.certId)),
          color: window.color
        });
      }
    }
  });

  return renewals.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
}

/**
 * Get upgrade recommendations based on current certifications
 */
function getUpgrades(userCerts: UserCertificationItem[]): CertUpgrade[] {
  const upgrades: CertUpgrade[] = [];
  const activeCerts = userCerts.filter(c => c.status === 'active');

  activeCerts.forEach(cert => {
    const progression = roadmapRules.certificationProgressions[cert.certId as keyof typeof roadmapRules.certificationProgressions];

    if (progression) {
      const recommendedCerts = progression.next.map(nextCertId => ({
        certId: nextCertId,
        name: getCertName(nextCertId),
        timeToComplete: progression.timeToNext,
        salaryBoost: progression.salaryBoost,
        prepResources: roadmapRules.prepResources[nextCertId as keyof typeof roadmapRules.prepResources]
      }));

      upgrades.push({
        currentCertId: cert.certId,
        currentCertName: getCertName(cert.certId),
        recommendedCerts
      });
    }
  });

  return upgrades;
}

/**
 * Suggest a career path based on current certifications
 */
function suggestCareerPath(userCerts: UserCertificationItem[]) {
  const activeCertIds = userCerts
    .filter(c => c.status === 'active')
    .map(c => c.certId);

  // Find best matching career path
  let bestMatch = null;
  let bestScore = 0;

  Object.entries(roadmapRules.careerPaths).forEach(([pathName, pathData]) => {
    const pathCerts = pathData.certs;
    const matchingCerts = pathCerts.filter(cert => activeCertIds.includes(cert));
    const score = matchingCerts.length / pathCerts.length;

    if (score > bestScore && score > 0) {
      bestScore = score;
      bestMatch = {
        pathName: pathName.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        remainingCerts: pathCerts.filter(cert => !activeCertIds.includes(cert)),
        estimatedTimeMonths: Math.round(pathData.timeline * (1 - score)),
        projectedSalary: pathData.avgSalary
      };
    }
  });

  return bestMatch;
}

/**
 * Main recommendation function
 */
export function getRecommendations(userCerts: UserCertificationItem[]): RoadmapRecommendations {
  const renewals = checkRenewals(userCerts);
  const upgrades = getUpgrades(userCerts);
  const careerPathSuggestion = suggestCareerPath(userCerts);

  return {
    renewals,
    upgrades,
    careerPathSuggestion
  };
}

/**
 * Check if a reminder should be sent
 */
export function shouldSendReminder(
  cert: UserCertificationItem,
  reminderType: '90days' | '60days' | '30days'
): boolean {
  if (!cert.expiryDate || cert.status !== 'active') return false;

  const daysUntilExpiry = daysBetween(new Date(cert.expiryDate), new Date());
  const reminderAlreadySent = cert.renewalReminderSent?.[reminderType];

  switch (reminderType) {
    case '90days':
      return daysUntilExpiry <= 90 && daysUntilExpiry > 60 && !reminderAlreadySent;
    case '60days':
      return daysUntilExpiry <= 60 && daysUntilExpiry > 30 && !reminderAlreadySent;
    case '30days':
      return daysUntilExpiry <= 30 && daysUntilExpiry >= 0 && !reminderAlreadySent;
    default:
      return false;
  }
}