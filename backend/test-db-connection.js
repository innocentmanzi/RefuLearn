const PouchDB = require('pouchdb');

// Test the database connection
const testConnection = async () => {
  try {
    console.log('Testing CouchDB connection...');
    const db = new PouchDB('http://Manzi:Clarisse101@localhost:5984/refulearn');
    
    // Test basic connection
    const info = await db.info();
    console.log('✅ Database connection successful!');
    console.log('Database info:', info);
    
    // Test if we can query documents
    const result = await db.allDocs({ limit: 5 });
    console.log('✅ Database query successful!');
    console.log('Total documents:', result.total_rows);
    
    // Test if we can find courses
    const courses = await db.find({ 
      selector: { type: 'course' }, 
      limit: 10 
    });
    console.log('✅ Course query successful!');
    console.log('Found courses:', courses.docs.length);
    
    if (courses.docs.length > 0) {
      console.log('Sample course:', {
        id: courses.docs[0]._id,
        title: courses.docs[0].title,
        isPublished: courses.docs[0].isPublished
      });
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error details:', error);
  }
};

testConnection(); 