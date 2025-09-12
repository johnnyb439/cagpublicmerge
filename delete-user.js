const { CognitoIdentityProviderClient, AdminDeleteUserCommand, ListUsersCommand } = require('@aws-sdk/client-cognito-identity-provider');
const awsConfig = require('./src/aws-exports.js').default;

const client = new CognitoIdentityProviderClient({
  region: awsConfig.aws_project_region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

async function deleteUser(email) {
  try {
    console.log('🔍 Looking for user:', email);
    
    // First, list users to confirm existence
    const listCommand = new ListUsersCommand({
      UserPoolId: awsConfig.aws_user_pools_id,
      Filter: `email = "${email}"`
    });
    
    const listResult = await client.send(listCommand);
    
    if (listResult.Users.length === 0) {
      console.log('✅ User not found - already deleted or never existed');
      return;
    }
    
    const username = listResult.Users[0].Username;
    console.log('👤 Found user with username:', username);
    
    // Delete the user
    const deleteCommand = new AdminDeleteUserCommand({
      UserPoolId: awsConfig.aws_user_pools_id,
      Username: username
    });
    
    await client.send(deleteCommand);
    console.log('🗑️ User deleted successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('credentials')) {
      console.log('💡 Try running: aws configure');
      console.log('💡 Or use the AWS Console method instead');
    }
  }
}

// Run the deletion
deleteUser('terrence.uk1@gmail.com');