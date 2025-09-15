// Lambda Function: Send Message
// Handles sending messages, storing in DynamoDB, and triggering WebSocket notifications

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const s3 = new S3Client({});

export const handler = async (event: any) => {
  console.log('Send Message Lambda triggered:', JSON.stringify(event));

  try {
    // Parse request body
    const body = JSON.parse(event.body);
    const {
      conversationId,
      senderId,
      senderName,
      content,
      messageType = 'text',
      attachment,
      replyTo
    } = body;

    // Validate required fields
    if (!conversationId || !senderId || !content) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Generate message ID with timestamp for sorting
    const timestamp = new Date().toISOString();
    const messageId = `${timestamp}#${uuidv4()}`;

    // Handle file attachment if present
    let attachmentData = null;
    if (attachment && attachment.file) {
      // Generate S3 key
      const fileKey = `attachments/${conversationId}/${messageId}/${attachment.fileName}`;

      // Upload to S3
      await s3.send(new PutObjectCommand({
        Bucket: 'cag-message-attachments',
        Key: fileKey,
        Body: Buffer.from(attachment.file, 'base64'),
        ContentType: attachment.fileType,
        Metadata: {
          senderId,
          conversationId,
          messageId
        }
      }));

      // Generate pre-signed URL (valid for 7 days)
      const url = await getSignedUrl(s3, new PutObjectCommand({
        Bucket: 'cag-message-attachments',
        Key: fileKey
      }), { expiresIn: 604800 });

      attachmentData = {
        fileKey,
        fileName: attachment.fileName,
        fileSize: attachment.fileSize,
        fileType: attachment.fileType,
        url
      };
    }

    // Create message item
    const messageItem = {
      conversationId,
      messageId,
      senderId,
      senderName,
      content,
      messageType,
      timestamp,
      deliveredTo: [senderId],  // Sender has it delivered
      readBy: [senderId],       // Sender has read it
      deliveredAt: { [senderId]: timestamp },
      readAt: { [senderId]: timestamp },
      ...(attachmentData && { attachment: attachmentData }),
      ...(replyTo && { replyTo })
    };

    // Store message in DynamoDB
    await dynamodb.send(new PutCommand({
      TableName: 'cag-messages',
      Item: messageItem
    }));

    // Update conversation's last message
    await dynamodb.send(new UpdateCommand({
      TableName: 'cag-conversations',
      Key: { conversationId, createdAt: conversationId }, // Use conversationId as createdAt for main record
      UpdateExpression: 'SET lastMessage = :lastMsg, updatedAt = :now',
      ExpressionAttributeValues: {
        ':lastMsg': {
          messageId,
          content: content.substring(0, 100),  // Preview
          senderId,
          timestamp
        },
        ':now': timestamp
      }
    }));

    // Get conversation participants
    const conversation = await dynamodb.send(new QueryCommand({
      TableName: 'cag-conversations',
      KeyConditionExpression: 'conversationId = :convId',
      ExpressionAttributeValues: {
        ':convId': conversationId
      },
      Limit: 1
    }));

    const participants = conversation.Items?.[0]?.participants || [];

    // Send WebSocket notifications to all online participants
    if (process.env.WEBSOCKET_ENDPOINT) {
      const apiGateway = new ApiGatewayManagementApiClient({
        endpoint: process.env.WEBSOCKET_ENDPOINT
      });

      // Get active WebSocket connections for participants
      const connectionPromises = participants.map(async (participantId: string) => {
        if (participantId === senderId) return; // Don't notify sender

        try {
          // Get user's active connections from presence table
          const presenceResult = await dynamodb.send(new QueryCommand({
            TableName: 'cag-user-presence',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
              ':userId': participantId
            }
          }));

          const connectionId = presenceResult.Items?.[0]?.connectionId;
          if (connectionId) {
            // Send real-time notification
            await apiGateway.send(new PostToConnectionCommand({
              ConnectionId: connectionId,
              Data: JSON.stringify({
                type: 'new_message',
                conversationId,
                message: messageItem,
                timestamp
              })
            }));

            // Update delivered status
            await dynamodb.send(new UpdateCommand({
              TableName: 'cag-messages',
              Key: { conversationId, messageId },
              UpdateExpression: 'SET deliveredTo = list_append(deliveredTo, :userId), deliveredAt.#uid = :now',
              ExpressionAttributeNames: {
                '#uid': participantId
              },
              ExpressionAttributeValues: {
                ':userId': [participantId],
                ':now': new Date().toISOString()
              }
            }));
          }
        } catch (error) {
          console.error(`Failed to notify participant ${participantId}:`, error);
        }
      });

      await Promise.all(connectionPromises);
    }

    // Return success response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: messageItem,
        delivered: participants.length
      })
    };

  } catch (error) {
    console.error('Error sending message:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Failed to send message',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};