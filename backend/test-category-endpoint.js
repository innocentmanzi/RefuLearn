const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

async function testCategoryEndpoint() {
  console.log('🧪 Testing category endpoint...\n');
  
  const categories = ['Technology', 'Business', 'Language', 'Mathematics'];
  
  for (const category of categories) {
    console.log(`\n🔍 Testing category: ${category}`);
    
    try {
      const response = await fetch(`${BASE_URL}/api/courses/category/${encodeURIComponent(category)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`📊 Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success! Found ${data.data?.courses?.length || 0} courses`);
        
        if (data.data?.courses?.length > 0) {
          console.log(`📚 Course titles:`);
          data.data.courses.forEach((course, index) => {
            console.log(`  ${index + 1}. ${course.title} (${course.level})`);
          });
        }
        
        console.log(`🐛 Debug info:`, data.debug);
      } else {
        const errorData = await response.json();
        console.log(`❌ Error: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`❌ Network error: ${error.message}`);
    }
  }
  
  console.log('\n🏁 Test completed!');
}

// Run the test
testCategoryEndpoint(); 