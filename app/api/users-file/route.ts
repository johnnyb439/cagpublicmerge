import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const usersFilePath = path.join(process.cwd(), 'data', 'users.json')

function getUsers() {
  try {
    const data = fs.readFileSync(usersFilePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
    },
  })
}

export async function GET(request: NextRequest) {
  try {
    const users = getUsers()
    
    // Return users without passwords
    const safeUsers = users.map((user: any) => ({
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      clearanceLevel: user.clearanceLevel,
      createdAt: user.createdAt,
      source: 'public_site'
    }))

    return NextResponse.json({
      success: true,
      message: 'Users from file storage',
      totalUsers: safeUsers.length,
      users: safeUsers,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
        }
      }
    )
  }
}