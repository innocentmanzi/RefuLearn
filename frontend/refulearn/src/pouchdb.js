import PouchDB from 'pouchdb';
import PouchDBHttp from 'pouchdb-adapter-http';
import PouchDBIdb from 'pouchdb-adapter-idb';

// Register adapters
PouchDB.plugin(PouchDBHttp);
PouchDB.plugin(PouchDBIdb);

// Configuration
const COUCHDB_URL = process.env.REACT_APP_COUCHDB_URL || 'http://localhost:5984';
const COUCHDB_DATABASE = process.env.REACT_APP_COUCHDB_DATABASE || 'refulearn';
const COUCHDB_USERNAME = process.env.REACT_APP_COUCHDB_USERNAME || 'admin';
const COUCHDB_PASSWORD = process.env.REACT_APP_COUCHDB_PASSWORD || 'password';

// Create local database (IndexedDB)
const localDB = new PouchDB('refulearn-local', { adapter: 'idb' });

// Create remote database (CouchDB)
const remoteDB = new PouchDB(`${COUCHDB_URL}/${COUCHDB_DATABASE}`, {
  auth: {
    username: COUCHDB_USERNAME,
    password: COUCHDB_PASSWORD
  }
});

// Sync function
const syncDatabases = () => {
  return localDB.sync(remoteDB, {
    live: true,
    retry: true,
    continuous: true,
    filter: (doc) => {
      // Only sync documents that have a type field
      return doc.type !== undefined;
    }
  });
};

// Initialize sync
let syncHandler = null;

const initializeSync = () => {
  if (syncHandler) {
    syncHandler.cancel();
  }
  
  syncHandler = syncDatabases();
  
  syncHandler
    .on('change', (change) => {
      console.log('Sync change:', change);
    })
    .on('paused', () => {
      console.log('Sync paused');
    })
    .on('active', () => {
      console.log('Sync active');
    })
    .on('error', (err) => {
      console.error('Sync error:', err);
    });
};

// Database operations
const db = {
  // Get document by ID
  async get(id) {
    try {
      return await localDB.get(id);
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  },

  // Put document
  async put(doc) {
    try {
      return await localDB.put(doc);
    } catch (error) {
      console.error('Error putting document:', error);
      throw error;
    }
  },

  // Post document (auto-generate ID)
  async post(doc) {
    try {
      return await localDB.post(doc);
    } catch (error) {
      console.error('Error posting document:', error);
      throw error;
    }
  },

  // Remove document
  async remove(doc) {
    try {
      return await localDB.remove(doc);
    } catch (error) {
      console.error('Error removing document:', error);
      throw error;
    }
  },

  // Query documents
  async query(designDoc, viewName, options = {}) {
    try {
      return await localDB.query(`${designDoc}/${viewName}`, options);
    } catch (error) {
      console.error('Error querying documents:', error);
      throw error;
    }
  },

  // All documents
  async allDocs(options = {}) {
    try {
      return await localDB.allDocs(options);
    } catch (error) {
      console.error('Error getting all documents:', error);
      throw error;
    }
  },

  // Find documents (Mango queries)
  async find(selector, options = {}) {
    try {
      return await localDB.find({ selector, ...options });
    } catch (error) {
      console.error('Error finding documents:', error);
      throw error;
    }
  },

  // Bulk operations
  async bulkDocs(docs) {
    try {
      return await localDB.bulkDocs(docs);
    } catch (error) {
      console.error('Error bulk operations:', error);
      throw error;
    }
  },

  // Get database info
  async info() {
    try {
      return await localDB.info();
    } catch (error) {
      console.error('Error getting database info:', error);
      throw error;
    }
  },

  // Check if online
  async isOnline() {
    try {
      await remoteDB.info();
      return true;
    } catch (error) {
      return false;
    }
  },

  // Initialize sync
  initializeSync,

  // Get sync status
  getSyncStatus() {
    return syncHandler ? 'active' : 'inactive';
  },

  // Cancel sync
  cancelSync() {
    if (syncHandler) {
      syncHandler.cancel();
      syncHandler = null;
    }
  },

  // Get local database
  getLocalDB() {
    return localDB;
  },

  // Get remote database
  getRemoteDB() {
    return remoteDB;
  }
};

// Initialize sync when module is loaded
if (typeof window !== 'undefined') {
  // Only initialize sync in browser environment
  initializeSync();
}

export default db; 