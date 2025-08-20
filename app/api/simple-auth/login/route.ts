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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email/username and password are required' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        }
      )
    }

    const users = getUsers()
    
    // Find user by email or username (case-insensitive)
    const user = users.find((u: any) => 
      u.email.toLowerCase() === email.toLowerCase() ||
      u.username.toLowerCase() === email.toLowerCase()
    )

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { 
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        }
      )
    }

    // Check password (plain text for testing)
    if (user.password !== password) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { 
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        }
      )
    }

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user
    
    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Server error occurred' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    )
  }
}