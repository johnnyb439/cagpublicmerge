import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { getRecommendations, shouldSendReminder } from '@/lib/roadmap/recommend';
import { UserCertificationItem, CareerRoadmapItem } from '@/lib/dynamodb-schema';
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
 * GET /api/roadmap - Get roadmap recommendations for a user
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'mock-user-123';

    // Fetch user's certifications
    const certsCommand = new QueryCommand({
      TableName: 'cag-user-certifications',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    });

    const certsResponse = await docClient.send(certsCommand);
    const userCerts = (certsResponse.Items || []) as UserCertificationItem[];

    // Generate recommendations
    const recommendations = getRecommendations(userCerts);

    // Check and mark reminders that should be sent
    const remindersToSend: string[] = [];
    for (const cert of userCerts) {
      if (shouldSendReminder(cert, '90days')) {
        remindersToSend.push(`90-day reminder for ${cert.certId}`);
      }
      if (shouldSendReminder(cert, '60days')) {
        remindersToSend.push(`60-day reminder for ${cert.certId}`);
      }
      if (shouldSendReminder(cert, '30days')) {
        remindersToSend.push(`30-day reminder for ${cert.certId}`);
      }
    }

    // Fetch any saved roadmaps
    const roadmapCommand = new QueryCommand({
      TableName: 'cag-career-roadmaps',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      Limit: 1,
      ScanIndexForward: false, // Get most recent first
    });

    const roadmapResponse = await docClient.send(roadmapCommand);
    const savedRoadmap = roadmapResponse.Items?.[0];

    return NextResponse.json({
      success: true,
      recommendations,
      savedRoadmap,
      pendingReminders: remindersToSend,
    });
  } catch (error) {
    console.error('Error generating roadmap:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate roadmap' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/roadmap - Save a career roadmap plan
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'mock-user-123';
    const body = await request.json();

    const roadmap: CareerRoadmapItem = {
      userId,
      roadmapId: uuidv4(),
      currentRole: body.currentRole,
      targetRole: body.targetRole,
      targetSalary: body.targetSalary,
      timelineMonths: body.timelineMonths,
      plannedCerts: body.plannedCerts || [],
      milestones: body.milestones || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: 'cag-career-roadmaps',
      Item: roadmap,
    });

    await docClient.send(command);

    return NextResponse.json({
      success: true,
      roadmap,
    });
  } catch (error) {
    console.error('Error saving roadmap:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save roadmap' },
      { status: 500 }
    );
  }
}