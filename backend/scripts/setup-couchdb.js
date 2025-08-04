const nano = require('nano');

const COUCHDB_URL = process.env.COUCHDB_URL || 'http://localhost:5984';
const COUCHDB_USERNAME = process.env.COUCHDB_USERNAME || 'Manzi';
const COUCHDB_PASSWORD = process.env.COUCHDB_PASSWORD || 'Clarisse101';
const COUCHDB_DATABASE = process.env.COUCHDB_DATABASE || 'refulearn';

async function setupCouchDB() {
  console.log('🚀 Setting up CouchDB for RefuLearn...\n');

  try {
    // Connect to CouchDB
    const couch = nano(COUCHDB_URL);
    
    // Authenticate
    await couch.auth(COUCHDB_USERNAME, COUCHDB_PASSWORD);
    console.log('✅ Authenticated with CouchDB');

    // Check if database exists
    const dbList = await couch.db.list();
    
    if (!dbList.includes(COUCHDB_DATABASE)) {
      await couch.db.create(COUCHDB_DATABASE);
      console.log(`✅ Created database: ${COUCHDB_DATABASE}`);
    } else {
      console.log(`✅ Database already exists: ${COUCHDB_DATABASE}`);
    }

    const db = couch.use(COUCHDB_DATABASE);

    // Create design documents
    const designDocs = {
      users: {
        byEmail: {
          map: 'function(doc) { if (doc.type === "user") { emit(doc.email, doc); } }'
        },
        byRole: {
          map: 'function(doc) { if (doc.type === "user") { emit(doc.role, doc); } }'
        }
      },
      courses: {
        byCategory: {
          map: 'function(doc) { if (doc.type === "course") { emit(doc.category, doc); } }'
        },
        byLevel: {
          map: 'function(doc) { if (doc.type === "course") { emit(doc.level, doc); } }'
        }
      },
      jobs: {
        byCategory: {
          map: 'function(doc) { if (doc.type === "job") { emit(doc.category, doc); } }'
        },
        byLocation: {
          map: 'function(doc) { if (doc.type === "job") { emit(doc.location, doc); } }'
        }
      }
    };

    for (const [docName, views] of Object.entries(designDocs)) {
      try {
        await db.insert({
          _id: `_design/${docName}`,
          views
        });
        console.log(`✅ Created design document: ${docName}`);
      } catch (error) {
        if (error.error === 'conflict') {
          console.log(`⚠️  Design document already exists: ${docName}`);
        } else {
          console.log(`❌ Error creating design document ${docName}:`, error.message);
        }
      }
    }

    console.log('\n🎉 CouchDB setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Start your backend server: npm run dev');
    console.log('   2. Test the API endpoints');
    console.log('   3. Configure PouchDB in the frontend for sync');

  } catch (error) {
    console.error('❌ CouchDB setup failed:', error.message);
    console.log('\n💡 Make sure CouchDB is running and accessible at:', COUCHDB_URL);
    process.exit(1);
  }
}

setupCouchDB(); 