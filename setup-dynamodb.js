const AWS = require('aws-sdk');

// Configure AWS SDK with your credentials
AWS.config.update({
  region: 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamodb = new AWS.DynamoDB();
const docClient = new AWS.DynamoDB.DocumentClient();

async function createTable() {
  const params = {
    TableName: 'InterviewQuestions-dev',
    KeySchema: [
      { AttributeName: 'category', KeyType: 'HASH' },
      { AttributeName: 'questionId', KeyType: 'RANGE' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'category', AttributeType: 'S' },
      { AttributeName: 'questionId', AttributeType: 'S' }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  };

  try {
    console.log('🚀 Creating DynamoDB table...');
    const result = await dynamodb.createTable(params).promise();
    console.log('✅ Table created successfully!', result.TableDescription.TableName);
    
    // Wait for table to be active
    console.log('⏳ Waiting for table to become active...');
    await dynamodb.waitFor('tableExists', { TableName: 'InterviewQuestions-dev' }).promise();
    console.log('🎯 Table is now active!');
    
  } catch (error) {
    if (error.code === 'ResourceInUseException') {
      console.log('📊 Table already exists!');
    } else {
      console.error('❌ Error creating table:', error);
      throw error;
    }
  }
}

async function importSampleQuestions() {
  const sampleQuestions = [
    {
      category: 'helpdesk',
      questionId: 'easy-001',
      question: 'A user forgot their password and needs to access their computer. What steps do you take to help them?',
      answer: 'I would first verify the user\'s identity through security questions or employee ID. Then access Active Directory to generate a temporary password, provide it securely, and instruct immediate change upon login. Finally, document the reset in the ticket system.',
      difficulty: 'easy'
    },
    {
      category: 'helpdesk', 
      questionId: 'easy-002',
      question: 'A user says their computer is running very slowly. What are your first steps?',
      answer: 'I would open Task Manager to check CPU, memory, and disk usage. Look for resource-heavy programs, restart if uptime is over 7 days, close unnecessary applications, and run basic cleanup tools. If issues persist, check for malware.',
      difficulty: 'easy'
    },
    {
      category: 'network',
      questionId: 'medium-001', 
      question: 'How do you troubleshoot a VLAN configuration issue?',
      answer: 'I would verify the VLAN exists in the database, check port assignments for access/trunk modes, validate IP addressing, and use "show vlan brief" commands. Common issues include VTP propagation problems and native VLAN mismatches.',
      difficulty: 'medium'
    }
  ];

  console.log('📊 Importing sample questions...');
  
  for (const question of sampleQuestions) {
    try {
      await docClient.put({
        TableName: 'InterviewQuestions-dev',
        Item: question
      }).promise();
      console.log(`✅ Imported: ${question.category} - ${question.questionId}`);
    } catch (error) {
      console.error(`❌ Error importing question ${question.questionId}:`, error);
    }
  }
  
  console.log('🎉 Sample questions imported successfully!');
}

async function main() {
  try {
    await createTable();
    await importSampleQuestions();
    console.log('🏆 DynamoDB setup complete!');
  } catch (error) {
    console.error('💥 Setup failed:', error);
  }
}

main();