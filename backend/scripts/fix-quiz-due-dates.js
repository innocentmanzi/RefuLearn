const PouchDB = require('pouchdb');

// Initialize database connection
const db = new PouchDB('http://Manzi:Clarisse101@localhost:5984/refulearn');

async function fixQuizDueDates() {
  try {
    console.log('🔍 Checking all quizzes for due dates...');

    // Get all documents
    const result = await db.allDocs({ include_docs: true });
    
    // Filter for quiz documents
    const quizzes = result.rows
      .map(row => row.doc)
      .filter(doc => doc && doc.type === 'quiz');
    
    console.log(`📝 Found ${quizzes.length} quizzes in database`);
    
    let updatedCount = 0;
    
    for (const quiz of quizzes) {
      console.log(`\n🎯 Quiz: "${quiz.title}" (ID: ${quiz._id})`);
      console.log(`   Current dueDate: ${quiz.dueDate || 'NULL'}`);
      console.log(`   Created: ${quiz.createdAt || 'Unknown'}`);
      
      // If quiz doesn't have a due date, add one (7 days from creation or now)
      if (!quiz.dueDate) {
        const createdDate = quiz.createdAt ? new Date(quiz.createdAt) : new Date();
        const dueDate = new Date(createdDate);
        dueDate.setDate(dueDate.getDate() + 7); // Due 7 days after creation
        
        quiz.dueDate = dueDate.toISOString();
        quiz.updatedAt = new Date().toISOString();
        
        console.log(`   ✅ Setting dueDate to: ${quiz.dueDate}`);
        
        try {
          await db.put(quiz);
          updatedCount++;
          console.log(`   ✅ Updated successfully`);
        } catch (error) {
          console.error(`   ❌ Failed to update: ${error.message}`);
        }
      } else {
        console.log(`   ℹ️  Already has due date, skipping`);
      }
    }
    
    console.log(`\n🎉 Complete! Updated ${updatedCount} quizzes with due dates`);
    
    // Show updated quiz details
    if (updatedCount > 0) {
      console.log('\n📊 Updated quiz summary:');
      const updatedResult = await db.allDocs({ include_docs: true });
      const updatedQuizzes = updatedResult.rows
        .map(row => row.doc)
        .filter(doc => doc && doc.type === 'quiz');
      
      updatedQuizzes.forEach(quiz => {
        console.log(`   📝 "${quiz.title}" - Due: ${quiz.dueDate ? new Date(quiz.dueDate).toLocaleDateString() : 'No date'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error fixing quiz due dates:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
fixQuizDueDates(); 