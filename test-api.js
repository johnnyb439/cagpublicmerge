// Simple test script to verify API endpoints
const baseUrl = 'http://localhost:3000';

async function testAPI() {
  console.log('Testing Backend APIs...\n');

  // Test Applications API
  try {
    console.log('1. Testing GET /api/applications');
    const response = await fetch(`${baseUrl}/api/applications`);
    const data = await response.json();
    console.log('✓ Success:', data.total, 'applications found');
    console.log('  Sample data:', data.data[0]?.jobTitle || 'No data');
  } catch (error) {
    console.log('✗ Error:', error.message);
  }

  // Test Profile API
  try {
    console.log('\n2. Testing GET /api/profile');
    const response = await fetch(`${baseUrl}/api/profile?userId=1`);
    const data = await response.json();
    console.log('✓ Success:', data.data?.name || 'No profile');
  } catch (error) {
    console.log('✗ Error:', error.message);
  }

  // Test Certifications API
  try {
    console.log('\n3. Testing GET /api/certifications');
    const response = await fetch(`${baseUrl}/api/certifications?userId=1`);
    const data = await response.json();
    console.log('✓ Success:', data.stats?.total || 0, 'certifications found');
  } catch (error) {
    console.log('✗ Error:', error.message);
  }

  // Test Dashboard Analytics API
  try {
    console.log('\n4. Testing GET /api/dashboard/analytics');
    const response = await fetch(`${baseUrl}/api/dashboard/analytics?userId=1`);
    const data = await response.json();
    console.log('✓ Success: Analytics data retrieved');
    console.log('  Applications:', data.data?.applications?.total || 0);
    console.log('  Certifications:', data.data?.certifications?.total || 0);
  } catch (error) {
    console.log('✗ Error:', error.message);
  }

  // Test Job Matching API
  try {
    console.log('\n5. Testing POST /api/jobs/match');
    const response = await fetch(`${baseUrl}/api/jobs/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        skills: ['AWS', 'React', 'Node.js'],
        clearanceLevel: 'Secret',
        location: 'Arlington, VA',
        yearsExperience: 5
      })
    });
    const data = await response.json();
    console.log('✓ Success:', data.total || 0, 'job matches found');
    if (data.data?.[0]) {
      console.log('  Top match:', data.data[0].title, '-', data.data[0].matchPercentage + '%');
    }
  } catch (error) {
    console.log('✗ Error:', error.message);
  }

  console.log('\n✅ API testing complete!');
}

// Run the test
testAPI();