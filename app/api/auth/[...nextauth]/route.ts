import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { withRateLimit } from '@/lib/api/withRateLimit';

const handler = NextAuth(authOptions);

// Apply strict rate limiting to auth endpoints
export const GET = withRateLimit(handler, {
  interval: 15 * 60 * 1000, // 15 minutes
  uniqueTokenPerInterval: 5 // 5 requests per 15 minutes
});

export const POST = withRateLimit(handler, {
  interval: 15 * 60 * 1000, // 15 minutes  
  uniqueTokenPerInterval: 5 // 5 requests per 15 minutes
});