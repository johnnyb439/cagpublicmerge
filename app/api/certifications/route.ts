import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand, DeleteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { UserCertificationItem } from '@/lib/dynamodb-schema';
import { v4 as uuidv4 } from 'uuid';

// Initialize DynamoDB client
const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

/**
 * GET /api/certifications - Get all certifications for a user
 */
export async function GET(request: NextRequest) {
  try {
    // Get userId from session/auth (mock for now)
    const userId = request.headers.get('x-user-id') || 'mock-user-123';

    const command = new QueryCommand({
      TableName: 'cag-user-certifications',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    });

    const response = await docClient.send(command);

    // Check expiry dates and update status
    const certsWithStatus = response.Items?.map((cert: any) => {
      if (cert.expiryDate) {
        const daysUntilExpiry = Math.ceil(
          (new Date(cert.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilExpiry < 0) {
          cert.status = 'expired';
        } else if (daysUntilExpiry <= 90) {
          cert.status = 'expiring_soon';
        } else {
          cert.status = 'active';
        }
      }
      return cert;
    });

    return NextResponse.json({
      success: true,
      certifications: certsWithStatus || [],
    });
  } catch (error) {
    console.error('Error fetching certifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch certifications' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/certifications - Add a new certification
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'mock-user-123';
    const body = await request.json();

    // Validate required fields
    if (!body.certId || !body.dateEarned) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate status based on expiry
    let status: UserCertificationItem['status'] = 'active';
    if (body.expiryDate) {
      const daysUntilExpiry = Math.ceil(
        (new Date(body.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilExpiry < 0) {
        status = 'expired';
      } else if (daysUntilExpiry <= 90) {
        status = 'expiring_soon';
      }
    }

    const certification: UserCertificationItem = {
      userId,
      certId: body.certId,
      dateEarned: body.dateEarned,
      expiryDate: body.expiryDate,
      credentialId: body.credentialId,
      status,
      verificationUrl: body.verificationUrl,
      score: body.score,
      notes: body.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: 'cag-user-certifications',
      Item: certification,
    });

    await docClient.send(command);

    return NextResponse.json({
      success: true,
      certification,
    });
  } catch (error) {
    console.error('Error adding certification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add certification' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/certifications - Update a certification
 */
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'mock-user-123';
    const body = await request.json();

    if (!body.certId) {
      return NextResponse.json(
        { success: false, error: 'CertId is required' },
        { status: 400 }
      );
    }

    const updateExpressions: string[] = [];
    const expressionAttributeNames: any = {};
    const expressionAttributeValues: any = {};

    // Build update expression dynamically
    Object.keys(body).forEach((key) => {
      if (key !== 'userId' && key !== 'certId') {
        updateExpressions.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = body[key];
      }
    });

    // Add updatedAt
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const command = new UpdateCommand({
      TableName: 'cag-user-certifications',
      Key: {
        userId,
        certId: body.certId,
      },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    const response = await docClient.send(command);

    return NextResponse.json({
      success: true,
      certification: response.Attributes,
    });
  } catch (error) {
    console.error('Error updating certification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update certification' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/certifications - Delete a certification
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'mock-user-123';
    const { searchParams } = new URL(request.url);
    const certId = searchParams.get('certId');

    if (!certId) {
      return NextResponse.json(
        { success: false, error: 'CertId is required' },
        { status: 400 }
      );
    }

    const command = new DeleteCommand({
      TableName: 'cag-user-certifications',
      Key: {
        userId,
        certId,
      },
    });

    await docClient.send(command);

    return NextResponse.json({
      success: true,
      message: 'Certification deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting certification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete certification' },
      { status: 500 }
    );
  }
}