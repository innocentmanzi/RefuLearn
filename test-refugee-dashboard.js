const fetch = require('node-fetch');

// Test refugee dashboard endpoints
async function testRefugeeDashboard() {
  const baseUrl = 'http://localhost:5000';
  
  // First, let's test if the server is running
  try {
    const healthResponse = await fetch(`${baseUrl}/health`);
    console.log('✅ Server is running:', healthResponse.status);
  } catch (error) {
    console.error('❌ Server is not running:', error.message);
    return;
  }

  // Test user profile endpoint (this should work for all authenticated users)
  try {
    const profileResponse = await fetch(`${baseUrl}/api/users/profile`, {
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ User profile endpoint accessible:', profileResponse.status);
  } catch (error) {
    console.error('❌ User profile endpoint error:', error.message);
  }

  // Test enrolled courses endpoint (this should work for refugees)
  try {
    const coursesResponse = await fetch(`${baseUrl}/api/courses/enrolled/courses`, {
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Enrolled courses endpoint accessible:', coursesResponse.status);
  } catch (error) {
    console.error('❌ Enrolled courses endpoint error:', error.message);
  }

  // Test user stats endpoint
  try {
    const statsResponse = await fetch(`${baseUrl}/api/courses/user/test-user/stats`, {
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ User stats endpoint accessible:', statsResponse.status);
  } catch (error) {
    console.error('❌ User stats endpoint error:', error.message);
  }

  // Test certificates endpoint
  try {
    const certificatesResponse = await fetch(`${baseUrl}/api/certificates/user`, {
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Certificates endpoint accessible:', certificatesResponse.status);
  } catch (error) {
    console.error('❌ Certificates endpoint error:', error.message);
  }
}

testRefugeeDashboard(); 