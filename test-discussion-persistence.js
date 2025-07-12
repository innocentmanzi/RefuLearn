const fetch = require('node-fetch');

// Test configuration
const BASE_URL = 'http://localhost:3001/api';
const TEST_DISCUSSION_ID = 'discussion_1751999999999_test';

async function testDiscussionPersistence() {
  console.log('🧪 Testing Discussion Persistence and Backend-Frontend Connection\n');
  
  try {
    // Test 1: Check if backend is running
    console.log('1. Testing backend connection...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    console.log(`   Backend status: ${healthResponse.status}`);
    
    // Test 2: Test authentication (you'll need a valid token)
    console.log('\n2. Testing authentication...');
    const token = 'your-test-token-here'; // Replace with actual token
    
    // Test 3: Create a test discussion
    console.log('\n3. Creating test discussion...');
    const createDiscussionResponse = await fetch(`${BASE_URL}/discussions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Test Discussion - Persistence Check',
        content: 'This is a test discussion to verify persistence.',
        moduleId: 'test-module-123',
        courseId: 'test-course-456'
      })
    });
    
    console.log(`   Create discussion status: ${createDiscussionResponse.status}`);
    
    let discussionId;
    if (createDiscussionResponse.ok) {
      const createData = await createDiscussionResponse.json();
      discussionId = createData.data?._id || TEST_DISCUSSION_ID;
      console.log(`   Discussion created with ID: ${discussionId}`);
    } else {
      discussionId = TEST_DISCUSSION_ID;
      console.log('   Using test discussion ID for further tests');
    }
    
    // Test 4: Add multiple replies
    console.log('\n4. Adding test replies...');
    const replies = [
      { content: 'First test reply', author: 'Test User 1' },
      { content: 'Second test reply with more content', author: 'Test User 2' },
      { content: 'Third reply to test persistence', author: 'Test User 3' }
    ];
    
    for (let i = 0; i < replies.length; i++) {
      const reply = replies[i];
      const addReplyResponse = await fetch(`${BASE_URL}/discussions/${discussionId}/replies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reply)
      });
      
      console.log(`   Reply ${i + 1} status: ${addReplyResponse.status}`);
      
      if (addReplyResponse.ok) {
        const replyData = await addReplyResponse.json();
        console.log(`   Reply ${i + 1} added successfully`);
      }
    }
    
    // Test 5: Fetch replies to verify persistence
    console.log('\n5. Fetching replies to verify persistence...');
    const fetchRepliesResponse = await fetch(`${BASE_URL}/discussions/${discussionId}/replies`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   Fetch replies status: ${fetchRepliesResponse.status}`);
    
    if (fetchRepliesResponse.ok) {
      const repliesData = await fetchRepliesResponse.json();
      console.log(`   Replies data structure:`, JSON.stringify(repliesData, null, 2));
      
      let actualReplies = [];
      if (repliesData.success && repliesData.data) {
        actualReplies = repliesData.data.replies || [];
      } else if (Array.isArray(repliesData)) {
        actualReplies = repliesData;
      }
      
      console.log(`   Found ${actualReplies.length} replies`);
      
      actualReplies.forEach((reply, index) => {
        console.log(`   Reply ${index + 1}: "${reply.content}" by ${reply.author}`);
      });
      
      // Test persistence by checking if all replies are there
      if (actualReplies.length >= 3) {
        console.log('   ✅ Persistence test PASSED - All replies found');
      } else {
        console.log('   ❌ Persistence test FAILED - Some replies missing');
      }
    } else {
      console.log('   ❌ Failed to fetch replies');
    }
    
    // Test 6: Test reply after page refresh simulation
    console.log('\n6. Testing reply after "page refresh" simulation...');
    
    // Add another reply
    const postRefreshReply = await fetch(`${BASE_URL}/discussions/${discussionId}/replies`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: 'Reply after page refresh simulation',
        author: 'Test User 4'
      })
    });
    
    console.log(`   Post-refresh reply status: ${postRefreshReply.status}`);
    
    // Fetch again to verify
    const fetchAgainResponse = await fetch(`${BASE_URL}/discussions/${discussionId}/replies`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (fetchAgainResponse.ok) {
      const fetchAgainData = await fetchAgainResponse.json();
      let actualReplies = [];
      if (fetchAgainData.success && fetchAgainData.data) {
        actualReplies = fetchAgainData.data.replies || [];
      }
      
      console.log(`   Total replies after refresh: ${actualReplies.length}`);
      
      if (actualReplies.length >= 4) {
        console.log('   ✅ Post-refresh persistence test PASSED');
      } else {
        console.log('   ❌ Post-refresh persistence test FAILED');
      }
    }
    
    // Test 7: Database connection test
    console.log('\n7. Testing database connection...');
    const dbTestResponse = await fetch(`${BASE_URL}/test-db-connection`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`   Database test status: ${dbTestResponse.status}`);
    
    if (dbTestResponse.ok) {
      const dbData = await dbTestResponse.json();
      console.log(`   Database connection: ${dbData.success ? 'OK' : 'FAILED'}`);
    }
    
    console.log('\n🎉 Discussion Persistence Test Complete!');
    console.log('\n📋 Test Summary:');
    console.log('   - Backend connection: Tested');
    console.log('   - Discussion creation: Tested');
    console.log('   - Reply submission: Tested');
    console.log('   - Reply retrieval: Tested');
    console.log('   - Persistence across requests: Tested');
    console.log('   - Database connection: Tested');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Instructions for running the test
console.log('📝 Instructions for running this test:');
console.log('1. Make sure your backend server is running on port 3001');
console.log('2. Get a valid authentication token from your login');
console.log('3. Replace "your-test-token-here" with your actual token');
console.log('4. Run: node test-discussion-persistence.js');
console.log('5. Check the results to verify persistence\n');

// Run the test
testDiscussionPersistence(); 