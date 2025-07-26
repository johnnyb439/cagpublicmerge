import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
// // import { withRateLimit } from '@/lib/api/withRateLimit';

const handler = NextAuth(authOptions);

// Apply strict rate limiting to auth endpoints - disabled for now
export const GET = handler;
export const POST = handler;