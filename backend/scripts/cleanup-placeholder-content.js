const PouchDB = require('pouchdb');

// Initialize PouchDB
const db = new PouchDB('http://localhost:5984/refulearn');

async function cleanupPlaceholderContent() {
  try {
    console.log('🧹 Starting cleanup of placeholder content...');
    
    // Get all documents
    const allDocs = await db.allDocs({ include_docs: true });
    console.log(`📚 Total documents found: ${allDocs.rows.length}`);
    
    let cleanedCount = 0;
    let deletedCount = 0;
    
    for (const row of allDocs.rows) {
      const doc = row.doc;
      if (!doc) continue;
      
      let shouldDelete = false;
      let shouldUpdate = false;
      let updates = {};
      
      // Check for placeholder patterns in various fields
      const placeholderPatterns = [
        'fsfhsadhfas', 'sjdfsdfsdf', 'gjkh', 'dvdfvsdgs', 
        'fsdgfsdgdg', 'sfgsdgfsdgfsd', 'ddhd', 'fhg', 'fsdfgds'
      ];
      
      // Check title field
      if (doc.title) {
        const title = doc.title.toLowerCase();
        const hasPlaceholder = placeholderPatterns.some(pattern => title.includes(pattern));
        if (hasPlaceholder && title.length < 10) {
          console.log(`🗑️ Deleting document with placeholder title: ${doc.title} (${doc._id})`);
          shouldDelete = true;
        } else if (hasPlaceholder) {
          console.log(`🔄 Cleaning placeholder from title: ${doc.title} (${doc._id})`);
          updates.title = 'Content Title';
          shouldUpdate = true;
        }
      }
      
      // Check description field
      if (doc.description) {
        const description = doc.description.toLowerCase();
        const hasPlaceholder = placeholderPatterns.some(pattern => description.includes(pattern));
        if (hasPlaceholder) {
          console.log(`🔄 Cleaning placeholder from description: ${doc._id}`);
          updates.description = 'Content description';
          shouldUpdate = true;
        }
      }
      
      // Check content field
      if (doc.content) {
        const content = doc.content.toLowerCase();
        const hasPlaceholder = placeholderPatterns.some(pattern => content.includes(pattern));
        if (hasPlaceholder) {
          console.log(`🔄 Cleaning placeholder from content: ${doc._id}`);
          updates.content = 'Content text';
          shouldUpdate = true;
        }
      }
      
      // Check data field
      if (doc.data) {
        const data = doc.data.toLowerCase();
        const hasPlaceholder = placeholderPatterns.some(pattern => data.includes(pattern));
        if (hasPlaceholder) {
          console.log(`🔄 Cleaning placeholder from data: ${doc._id}`);
          updates.data = 'Content data';
          shouldUpdate = true;
        }
      }
      
      // Check name field
      if (doc.name) {
        const name = doc.name.toLowerCase();
        const hasPlaceholder = placeholderPatterns.some(pattern => name.includes(pattern));
        if (hasPlaceholder) {
          console.log(`🔄 Cleaning placeholder from name: ${doc._id}`);
          updates.name = 'Content name';
          shouldUpdate = true;
        }
      }
      
      // Check filename field
      if (doc.filename) {
        const filename = doc.filename.toLowerCase();
        const hasPlaceholder = placeholderPatterns.some(pattern => filename.includes(pattern));
        if (hasPlaceholder) {
          console.log(`🔄 Cleaning placeholder from filename: ${doc._id}`);
          updates.filename = 'content_file';
          shouldUpdate = true;
        }
      }
      
      // Check contentItems array
      if (doc.contentItems && Array.isArray(doc.contentItems)) {
        const cleanedContentItems = doc.contentItems.filter(item => {
          if (!item) return false;
          
          const title = (item.title || '').toLowerCase();
          const description = (item.description || '').toLowerCase();
          const data = (item.data || '').toLowerCase();
          
          const hasPlaceholder = placeholderPatterns.some(pattern => 
            title.includes(pattern) || description.includes(pattern) || data.includes(pattern)
          );
          
          if (hasPlaceholder) {
            console.log(`🗑️ Removing placeholder content item: ${item.title || 'unnamed'} from ${doc._id}`);
            return false;
          }
          
          return true;
        });
        
        if (cleanedContentItems.length !== doc.contentItems.length) {
          updates.contentItems = cleanedContentItems;
          shouldUpdate = true;
        }
      }
      
      // Check quizzes array
      if (doc.quizzes && Array.isArray(doc.quizzes)) {
        const cleanedQuizzes = doc.quizzes.filter(quiz => {
          if (!quiz) return false;
          
          const title = (quiz.title || '').toLowerCase();
          const description = (quiz.description || '').toLowerCase();
          
          const hasPlaceholder = placeholderPatterns.some(pattern => 
            title.includes(pattern) || description.includes(pattern)
          );
          
          if (hasPlaceholder) {
            console.log(`🗑️ Removing placeholder quiz: ${quiz.title || 'unnamed'} from ${doc._id}`);
            return false;
          }
          
          return true;
        });
        
        if (cleanedQuizzes.length !== doc.quizzes.length) {
          updates.quizzes = cleanedQuizzes;
          shouldUpdate = true;
        }
      }
      
      // Check discussions array
      if (doc.discussions && Array.isArray(doc.discussions)) {
        const cleanedDiscussions = doc.discussions.filter(discussion => {
          if (!discussion) return false;
          
          const title = (discussion.title || '').toLowerCase();
          const content = (discussion.content || '').toLowerCase();
          
          const hasPlaceholder = placeholderPatterns.some(pattern => 
            title.includes(pattern) || content.includes(pattern)
          );
          
          if (hasPlaceholder) {
            console.log(`🗑️ Removing placeholder discussion: ${discussion.title || 'unnamed'} from ${doc._id}`);
            return false;
          }
          
          return true;
        });
        
        if (cleanedDiscussions.length !== doc.discussions.length) {
          updates.discussions = cleanedDiscussions;
          shouldUpdate = true;
        }
      }
      
      // Apply updates or deletions
      if (shouldDelete) {
        try {
          await db.remove(doc);
          deletedCount++;
        } catch (error) {
          console.error(`❌ Failed to delete document ${doc._id}:`, error);
        }
      } else if (shouldUpdate) {
        try {
          const updatedDoc = { ...doc, ...updates };
          await db.put(updatedDoc);
          cleanedCount++;
        } catch (error) {
          console.error(`❌ Failed to update document ${doc._id}:`, error);
        }
      }
    }
    
    console.log(`✅ Cleanup completed!`);
    console.log(`🗑️ Deleted ${deletedCount} documents with placeholder content`);
    console.log(`🔄 Updated ${cleanedCount} documents with cleaned content`);
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

// Run the cleanup
cleanupPlaceholderContent().then(() => {
  console.log('🏁 Cleanup script completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Cleanup script failed:', error);
  process.exit(1);
}); 