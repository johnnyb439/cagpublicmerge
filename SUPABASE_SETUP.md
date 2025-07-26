# Supabase Setup Guide

## Prerequisites
1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Note down your project URL and keys

## Step 1: Environment Variables
Create a `.env.local` file in the root directory with:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32

# Security
ENCRYPTION_KEY=generate_with_openssl_rand_base64_32
JWT_SECRET=generate_with_openssl_rand_base64_32
```

## Step 2: Database Setup
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run the schema from `lib/supabase/schema.sql`

## Step 3: Authentication Setup
1. Enable Email authentication in Supabase Dashboard
2. Configure redirect URLs:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

## Step 4: Storage Setup
Create buckets for:
- `resumes` - For resume documents
- `certifications` - For certification files
- `avatars` - For profile pictures

## Step 5: Row Level Security
Enable RLS on all tables and configure policies as defined in the schema.

## Local Development
```bash
npm run dev
```

## Production Deployment
Update environment variables in Vercel:
- Add all variables from `.env.local`
- Update `NEXTAUTH_URL` to your production URL
- Ensure all keys are properly secured