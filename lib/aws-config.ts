// AWS Configuration for CAG Messaging Platform
// This connects to AWS services for production-ready messaging

export const awsConfig = {
  // AWS Region
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',

  // Cognito Configuration (User Authentication)
  cognito: {
    userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
    clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '',
    identityPoolId: process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID || ''
  },

  // DynamoDB Tables
  dynamodb: {
    conversationsTable: 'cag-conversations',
    messagesTable: 'cag-messages',
    usersTable: 'cag-users',
    presenceTable: 'cag-user-presence'
  },

  // S3 Bucket for Attachments
  s3: {
    bucketName: 'cag-message-attachments',
    region: 'us-east-1'
  },

  // API Gateway Endpoints
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.cagadvisor.com',
    websocketUrl: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'wss://ws.cagadvisor.com'
  },

  // Lambda Function Names
  lambda: {
    sendMessage: 'cag-send-message',
    getMessages: 'cag-get-messages',
    getConversations: 'cag-get-conversations',
    updatePresence: 'cag-update-presence',
    handleWebSocket: 'cag-websocket-handler'
  }
};

// AWS SDK Configuration
export const getAWSCredentials = () => {
  // In production, use Cognito Identity Pool for temporary credentials
  // In development, use local AWS credentials
  return {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    sessionToken: process.env.AWS_SESSION_TOKEN || ''
  };
};