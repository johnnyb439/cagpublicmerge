import { NextResponse } from 'next/server'

export async function GET() {
  const response = NextResponse.json({
    version: '2.0.0-fixed',
    lastUpdate: '2024-08-04 - Registration flow completely fixed',
    features: {
      registration: 'No errors on success - graceful redirect',
      username: 'Enabled - login with email or username',
      inMemoryStorage: 'Active for CodeSandbox',
      autoLogin: 'Graceful fallback to manual login'
    },
    fixes: [
      'Line 73 no longer throws error',
      'Success messages show properly',
      'Login page shows registration success',
      'Email pre-filled after registration'
    ],
    testEndpoints: {
      version: '/api/version',
      users: '/api/auth/users',
      clearUsers: '/api/auth/clear-users',
      debug: '/api/auth/debug'
    },
    message: 'If you see old errors, your CodeSandbox needs updating!'
  })
  
  response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3003')
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  
  return response
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'http://localhost:3003',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}