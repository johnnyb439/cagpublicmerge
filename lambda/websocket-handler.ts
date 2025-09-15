// Lambda Function: WebSocket Handler
// Manages WebSocket connections for real-time messaging

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, DeleteCommand, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';

const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = async (event: any) => {
  console.log('WebSocket event:', JSON.stringify(event));

  const { requestContext, body } = event;
  const { connectionId, routeKey } = requestContext;

  try {
    switch (routeKey) {
      case '$connect':
        return await handleConnect(connectionId, event);

      case '$disconnect':
        return await handleDisconnect(connectionId);

      case 'sendMessage':
        return await handleSendMessage(connectionId, body, requestContext);

      case 'typing':
        return await handleTypingIndicator(connectionId, body);

      case 'markRead':
        return await handleMarkAsRead(connectionId, body);

      case 'updatePresence':
        return await handlePresenceUpdate(connectionId, body);

      default:
        return { statusCode: 400, body: 'Unknown route' };
    }
  } catch (error) {
    console.error('WebSocket handler error:', error);
    return { statusCode: 500, body: 'Internal server error' };
  }
};

// Handle new WebSocket connection
async function handleConnect(connectionId: string, event: any) {
  const queryParams = event.queryStringParameters || {};
  const userId = queryParams.userId || 'anonymous';

  // Store connection in DynamoDB
  await dynamodb.send(new PutCommand({
    TableName: 'cag-websocket-connections',
    Item: {
      connectionId,
      userId,
      connectedAt: new Date().toISOString(),
      ttl: Math.floor(Date.now() / 1000) + 86400  // Expire after 24 hours
    }
  }));

  // Update user presence
  await dynamodb.send(new UpdateCommand({
    TableName: 'cag-user-presence',
    Key: { userId },
    UpdateExpression: 'SET #status = :online, connectionId = :connId, lastSeen = :now',
    ExpressionAttributeNames: {
      '#status': 'status'
    },
    ExpressionAttributeValues: {
      ':online': 'online',
      ':connId': connectionId,
      ':now': new Date().toISOString()
    }
  }));

  return { statusCode: 200, body: 'Connected' };
}

// Handle WebSocket disconnection
async function handleDisconnect(connectionId: string) {
  // Get user ID from connection
  const connection = await dynamodb.send(new QueryCommand({
    TableName: 'cag-websocket-connections',
    KeyConditionExpression: 'connectionId = :connId',
    ExpressionAttributeValues: {
      ':connId': connectionId
    }
  }));

  const userId = connection.Items?.[0]?.userId;

  if (userId) {
    // Update user presence to offline
    await dynamodb.send(new UpdateCommand({
      TableName: 'cag-user-presence',
      Key: { userId },
      UpdateExpression: 'SET #status = :offline, lastSeen = :now REMOVE connectionId',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':offline': 'offline',
        ':now': new Date().toISOString()
      }
    }));
  }

  // Remove connection from DynamoDB
  await dynamodb.send(new DeleteCommand({
    TableName: 'cag-websocket-connections',
    Key: { connectionId }
  }));

  return { statusCode: 200, body: 'Disconnected' };
}

// Handle sending messages through WebSocket
async function handleSendMessage(connectionId: string, body: string, requestContext: any) {
  const message = JSON.parse(body);
  const { conversationId, content, senderId, senderName } = message;

  // Generate message ID
  const timestamp = new Date().toISOString();
  const messageId = `${timestamp}#${connectionId}`;

  // Store message in DynamoDB
  const messageItem = {
    conversationId,
    messageId,
    senderId,
    senderName,
    content,
    messageType: 'text',
    timestamp,
    deliveredTo: [senderId],
    readBy: [],
    reactions: {}
  };

  await dynamodb.send(new PutCommand({
    TableName: 'cag-messages',
    Item: messageItem
  }));

  // Get conversation participants
  const conversation = await dynamodb.send(new QueryCommand({
    TableName: 'cag-conversations',
    KeyConditionExpression: 'conversationId = :convId',
    ExpressionAttributeValues: {
      ':convId': conversationId
    }
  }));

  const participants = conversation.Items?.[0]?.participants || [];

  // Send to all participants' WebSocket connections
  const apiGateway = new ApiGatewayManagementApiClient({
    endpoint: `https://${requestContext.domainName}/${requestContext.stage}`
  });

  const notifications = participants.map(async (participantId: string) => {
    // Get participant's connection
    const presence = await dynamodb.send(new QueryCommand({
      TableName: 'cag-user-presence',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': participantId
      }
    }));

    const targetConnectionId = presence.Items?.[0]?.connectionId;

    if (targetConnectionId && targetConnectionId !== connectionId) {
      try {
        await apiGateway.send(new PostToConnectionCommand({
          ConnectionId: targetConnectionId,
          Data: JSON.stringify({
            type: 'new_message',
            conversationId,
            message: messageItem
          })
        }));

        // Mark as delivered
        messageItem.deliveredTo.push(participantId);
      } catch (error) {
        console.error(`Failed to send to ${targetConnectionId}:`, error);
      }
    }
  });

  await Promise.all(notifications);

  return { statusCode: 200, body: 'Message sent' };
}

// Handle typing indicators
async function handleTypingIndicator(connectionId: string, body: string) {
  const { conversationId, userId, isTyping } = JSON.parse(body);

  // Update user's typing status
  await dynamodb.send(new UpdateCommand({
    TableName: 'cag-user-presence',
    Key: { userId },
    UpdateExpression: isTyping
      ? 'SET typingIn = :convId'
      : 'REMOVE typingIn',
    ExpressionAttributeValues: isTyping
      ? { ':convId': conversationId }
      : {}
  }));

  // Notify other participants
  const conversation = await dynamodb.send(new QueryCommand({
    TableName: 'cag-conversations',
    KeyConditionExpression: 'conversationId = :convId',
    ExpressionAttributeValues: {
      ':convId': conversationId
    }
  }));

  const participants = conversation.Items?.[0]?.participants || [];

  // Send typing indicator to other participants
  // Implementation similar to handleSendMessage

  return { statusCode: 200, body: 'Typing indicator updated' };
}

// Handle marking messages as read
async function handleMarkAsRead(connectionId: string, body: string) {
  const { conversationId, messageIds, userId } = JSON.parse(body);

  // Update read status for multiple messages
  const updates = messageIds.map(async (messageId: string) => {
    await dynamodb.send(new UpdateCommand({
      TableName: 'cag-messages',
      Key: { conversationId, messageId },
      UpdateExpression: 'SET readBy = list_append(if_not_exists(readBy, :empty), :userId), readAt.#uid = :now',
      ExpressionAttributeNames: {
        '#uid': userId
      },
      ExpressionAttributeValues: {
        ':empty': [],
        ':userId': [userId],
        ':now': new Date().toISOString()
      }
    }));
  });

  await Promise.all(updates);

  // Notify sender about read receipts
  // Implementation similar to handleSendMessage

  return { statusCode: 200, body: 'Messages marked as read' };
}

// Handle presence updates
async function handlePresenceUpdate(connectionId: string, body: string) {
  const { userId, status, customStatus } = JSON.parse(body);

  await dynamodb.send(new UpdateCommand({
    TableName: 'cag-user-presence',
    Key: { userId },
    UpdateExpression: 'SET #status = :status, customStatus = :customStatus, lastSeen = :now',
    ExpressionAttributeNames: {
      '#status': 'status'
    },
    ExpressionAttributeValues: {
      ':status': status,
      ':customStatus': customStatus || null,
      ':now': new Date().toISOString()
    }
  }));

  return { statusCode: 200, body: 'Presence updated' };
}