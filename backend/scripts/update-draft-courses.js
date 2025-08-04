const PouchDB = require('pouchdb');

// Initialize PouchDB
const db = new PouchDB('http://localhost:5984/refulearn');

async function updateDraftCourses() {
  try {
    console.log('🔍 Searching for courses with draft approval status...');
    
    // Find all courses with draft status
    const result = await db.find({
      selector: {
        type: 'course',
        approvalStatus: 'draft'
      }
    });
    
    console.log(`📚 Found ${result.docs.length} courses with draft status`);
    
    if (result.docs.length === 0) {
      console.log('✅ No courses with draft status found');
      return;
    }
    
    // Update each course to pending status
    for (const course of result.docs) {
      console.log(`🔄 Updating course: ${course.title} (${course._id})`);
      course.approvalStatus = 'pending';
      course.updatedAt = new Date();
      
      await db.put(course);
      console.log(`✅ Updated course: ${course.title}`);
    }
    
    console.log(`🎉 Successfully updated ${result.docs.length} courses from draft to pending status`);
    
  } catch (error) {
    console.error('❌ Error updating draft courses:', error);
  }
}

// Run the update
updateDraftCourses().then(() => {
  console.log('🏁 Script completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
}); 