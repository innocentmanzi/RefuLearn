const PouchDB = require('pouchdb');

// Initialize database connection
const db = new PouchDB('http://Manzi:Clarisse101@localhost:5984/refulearn');

// Validation function for quiz questions
const validateQuizQuestion = (question) => {
  if (!question || !question.question) return { valid: false, error: 'Question text is required' };
  
  const questionText = question.question.toLowerCase().trim();
  
  // Check for common test/dummy patterns
  const testPatterns = [
    /^[a-z]+$/, // Only lowercase letters like "gfdgds"
    /^[a-zA-Z]{1,10}$/, // Short nonsense strings
    /^test\d*$/i, // "test", "test1", etc.
    /^asdf/i, // Common keyboard mashing
    /^qwerty/i, // Keyboard row
    /^[fgh]+[sdf]*$/i, // Common test patterns like "fgfgfsdf"
  ];
  
  // Check if question matches test patterns
  if (testPatterns.some(pattern => pattern.test(questionText))) {
    return { valid: false, error: `Question "${question.question}" appears to be test data` };
  }
  
  // Check minimum length and word count
  if (questionText.length < 10) {
    return { valid: false, error: `Question "${question.question}" is too short` };
  }
  
  if (questionText.split(' ').length < 3) {
    return { valid: false, error: `Question "${question.question}" should contain at least 3 words` };
  }
  
  // Check if it's a meaningful question (contains question words or has question mark)
  const questionWords = ['what', 'how', 'when', 'where', 'why', 'which', 'who', 'is', 'are', 'can', 'do', 'does', 'will', 'would', 'should'];
  const hasQuestionWord = questionWords.some(word => questionText.includes(word));
  const hasQuestionMark = questionText.includes('?');
  
  if (!hasQuestionWord && !hasQuestionMark) {
    return { valid: false, error: `Question "${question.question}" should be a proper question` };
  }
  
  return { valid: true };
};

async function cleanupInvalidQuizzes() {
  try {
    console.log('🔍 Scanning database for invalid quiz data...');
    
    // Get all documents
    const allDocsResult = await db.allDocs({ include_docs: true });
    
    // Filter for quizzes and assessments
    const quizzes = allDocsResult.rows
      .map(row => row.doc)
      .filter(doc => doc && (doc.type === 'quiz' || doc.type === 'assessment'));
    
    console.log(`📚 Found ${quizzes.length} quizzes/assessments in database`);
    
    let totalInvalid = 0;
    let totalQuizzes = 0;
    const invalidQuizzes = [];
    
    quizzes.forEach((quiz, index) => {
      console.log(`\n🧪 Checking Quiz ${index + 1}: "${quiz.title}"`);
      console.log(`   Course: ${quiz.courseId || quiz.course || 'Unknown'}`);
      console.log(`   Instructor: ${quiz.instructorName || quiz.instructor || 'Unknown'}`);
      console.log(`   Questions: ${quiz.questions ? quiz.questions.length : 0}`);
      
      if (quiz.questions && quiz.questions.length > 0) {
        totalQuizzes++;
        let invalidQuestions = [];
        
        quiz.questions.forEach((question, qIndex) => {
          const validation = validateQuizQuestion(question);
          if (!validation.valid) {
            invalidQuestions.push({
              index: qIndex + 1,
              question: question.question,
              error: validation.error,
              type: question.type
            });
          }
        });
        
        if (invalidQuestions.length > 0) {
          totalInvalid++;
          invalidQuizzes.push({
            id: quiz._id,
            title: quiz.title,
            course: quiz.courseId || quiz.course || 'Unknown',
            instructor: quiz.instructorName || quiz.instructor || 'Unknown',
            totalQuestions: quiz.questions.length,
            invalidQuestions: invalidQuestions
          });
          
          console.log(`   ❌ ${invalidQuestions.length} invalid questions found:`);
          invalidQuestions.forEach(q => {
            console.log(`      ${q.index}. "${q.question}" - ${q.error}`);
          });
        } else {
          console.log(`   ✅ All questions are valid`);
        }
      } else {
        console.log(`   ⚠️  No questions found`);
      }
    });
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total quizzes with questions: ${totalQuizzes}`);
    console.log(`   Quizzes with invalid questions: ${totalInvalid}`);
    console.log(`   Valid quizzes: ${totalQuizzes - totalInvalid}`);
    
    if (invalidQuizzes.length > 0) {
      console.log(`\n🔧 Suggested Actions:`);
      console.log(`   1. Contact instructors to update their quiz questions`);
      console.log(`   2. The system now prevents creating new invalid questions`);
      console.log(`   3. Students will see helpful error messages for invalid quizzes`);
      
      console.log(`\n📝 Invalid Quizzes Details:`);
      invalidQuizzes.forEach((quiz, index) => {
        console.log(`\n   ${index + 1}. "${quiz.title}" (ID: ${quiz.id})`);
        console.log(`      Course: ${quiz.course}`);
        console.log(`      Instructor: ${quiz.instructor}`);
        console.log(`      Invalid Questions: ${quiz.invalidQuestions.length}/${quiz.totalQuestions}`);
        quiz.invalidQuestions.forEach(q => {
          console.log(`         - "${q.question}" (${q.type})`);
        });
      });
    }
    
    console.log(`\n✅ Database scan complete!`);
    
  } catch (error) {
    console.error('❌ Error cleaning up quiz data:', error);
  }
}

// Run the cleanup
cleanupInvalidQuizzes(); 