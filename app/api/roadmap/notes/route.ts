import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';

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
 * POST /api/roadmap/notes - Update roadmap progress notes
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'mock-user-123';
    const body = await request.json();

    const { roadmapId, certId, status, notes } = body;

    if (!roadmapId || !certId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update the specific cert status in plannedCerts array
    const command = new UpdateCommand({
      TableName: 'cag-career-roadmaps',
      Key: {
        userId,
        roadmapId,
      },
      UpdateExpression: `
        SET plannedCerts = :plannedCerts,
            updatedAt = :updatedAt
      `,
      ExpressionAttributeValues: {
        ':plannedCerts': body.plannedCerts, // Client sends updated array
        ':updatedAt': new Date().toISOString(),
      },
      ReturnValues: 'ALL_NEW',
    });

    const response = await docClient.send(command);

    return NextResponse.json({
      success: true,
      roadmap: response.Attributes,
    });
  } catch (error) {
    console.error('Error updating roadmap notes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update roadmap notes' },
      { status: 500 }
    );
  }
}