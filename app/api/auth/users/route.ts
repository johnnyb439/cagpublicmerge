import { NextResponse } from 'next/server'
import { getUsersDB } from '@/auth.config'

export async function GET() {
  const users = getUsersDB()
  
  // Return users without passwords
  const safeUsers = users.map(user => ({
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
    clearanceLevel: user.clearanceLevel,
    createdAt: user.createdAt
  }))

  const response = NextResponse.json({
    message: 'Registered Users (in current session)',
    totalUsers: safeUsers.length,
    users: safeUsers,
    note: 'Users are stored in memory and will be lost on server restart'
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