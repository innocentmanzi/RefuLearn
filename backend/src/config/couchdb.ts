import nano from 'nano';
import { logger } from '../utils/logger';

export interface CouchDBConfig {
  url: string;
  username: string;
  password: string;
  database: string;
}

export class CouchDBConnection {
  private static instance: CouchDBConnection | null = null;
  private nano: nano.ServerScope;
  private db!: nano.DocumentScope<any>;
  private config: CouchDBConfig;

  private constructor(config: CouchDBConfig) {
    this.config = config;
    this.nano = nano(config.url);
  }

  public static getInstance(config?: CouchDBConfig): CouchDBConnection {
    if (!CouchDBConnection.instance && config) {
      CouchDBConnection.instance = new CouchDBConnection(config);
    }
    if (!CouchDBConnection.instance) {
      throw new Error('CouchDBConnection not initialized. Call getInstance(config) first.');
    }
    return CouchDBConnection.instance;
  }

  public async connect(): Promise<void> {
    try {
      // Authenticate with CouchDB
      await this.nano.auth(this.config.username, this.config.password);
      logger.info(`Successfully authenticated with CouchDB using user: ${this.config.username}`);
      
      // Get or create database
      const dbName = this.config.database;
      let dbList: string[] = [];
      
      try {
        dbList = await this.nano.db.list();
      } catch (listError: any) {
        logger.warn('Could not list databases, attempting to use database directly:', listError.message);
      }
      
      if (dbList.length === 0 || !dbList.includes(dbName)) {
        try {
          await this.nano.db.create(dbName);
          logger.info(`Created CouchDB database: ${dbName}`);
        } catch (createError: any) {
          if (createError.error === 'file_exists') {
            logger.info(`Database ${dbName} already exists`);
          } else {
            logger.warn(`Could not create database ${dbName}:`, createError.message);
          }
        }
      }
      
      this.db = this.nano.use(dbName);
      
      // Test the connection by trying to get database info
      try {
        await this.db.info();
        logger.info(`Successfully connected to CouchDB database: ${dbName}`);
      } catch (infoError: any) {
        logger.error(`Could not access database ${dbName}:`, infoError.message);
        throw new Error(`Database connection failed: ${infoError.message}`);
      }
      
    } catch (error: any) {
      logger.error('CouchDB connection failed:', error.message || error);
      throw error;
    }
  }

  public getDatabase(): nano.DocumentScope<any> {
    if (!this.db) {
      throw new Error('CouchDB not connected. Call connect() first.');
    }
    
    // Add debugging to check what methods are available
    if (!this.db.get || !this.db.insert || !this.db.destroy) {
      logger.error('CouchDB database object is missing required methods');
      throw new Error('Invalid CouchDB database object');
    }
    
    return this.db;
  }

  public getNano(): nano.ServerScope {
    return this.nano;
  }

  public async disconnect(): Promise<void> {
    try {
      // CouchDB doesn't require explicit disconnection
      logger.info('CouchDB connection closed');
    } catch (error) {
      logger.error('Error disconnecting from CouchDB:', error);
    }
  }

  public async createIndex(designDoc: string, index: any): Promise<void> {
    try {
      await this.db.createIndex({
        index,
        name: designDoc
      });
      logger.info(`Created index: ${designDoc}`);
    } catch (error) {
      logger.error(`Error creating index ${designDoc}:`, error);
    }
  }

  public async createDesignDoc(designDoc: string, views: any): Promise<void> {
    try {
      await this.db.insert({
        _id: `_design/${designDoc}`,
        views
      });
      logger.info(`Created design document: ${designDoc}`);
    } catch (error: any) {
      // Don't log errors for document conflicts (409) as they're expected
      if (error.statusCode !== 409) {
        logger.error(`Error creating design document ${designDoc}:`, error);
      }
    }
  }
}

export const connectCouchDB = async (): Promise<CouchDBConnection> => {
  const config = {
    url: 'http://localhost:5984',
    username: 'Manzi',
    password: 'Clarisse101',
    database: 'refulearn'
  };

  try {
    logger.info(`Attempting to connect with username: ${config.username}`);
    
    const connection = CouchDBConnection.getInstance(config);
    await connection.connect();
    
    // Create necessary design documents and indexes
    await setupDesignDocuments(connection);
    
    logger.info(`Successfully connected to CouchDB with username: ${config.username}`);
    return connection;
  } catch (error: any) {
    logger.error('CouchDB connection failed:', error.message || error);
    throw error;
  }
};

const setupDesignDocuments = async (connection: CouchDBConnection): Promise<void> => {
  const db = connection.getDatabase();

  // Users design document
  try {
    await connection.createDesignDoc('users', {
      byEmail: {
        map: 'function(doc) { if (doc.type === "user") { emit(doc.email, doc); } }'
      },
      byRole: {
        map: 'function(doc) { if (doc.type === "user") { emit(doc.role, doc); } }'
      },
      byCountry: {
        map: 'function(doc) { if (doc.type === "user") { emit(doc.country, doc); } }'
      }
    });
  } catch (error) {
    // Design doc might already exist
  }

  // Courses design document
  try {
    await connection.createDesignDoc('courses', {
      byCategory: {
        map: 'function(doc) { if (doc.type === "course") { emit(doc.category, doc); } }'
      },
      byLevel: {
        map: 'function(doc) { if (doc.type === "course") { emit(doc.level, doc); } }'
      },
      byInstructor: {
        map: 'function(doc) { if (doc.type === "course") { emit(doc.instructor, doc); } }'
      },
      search: {
        map: 'function(doc) { if (doc.type === "course") { emit(doc.title.toLowerCase(), doc); emit(doc.description.toLowerCase(), doc); } }'
      }
    });
  } catch (error) {
    // Design doc might already exist
  }

  // Jobs design document
  try {
    await connection.createDesignDoc('jobs', {
      byCategory: {
        map: 'function(doc) { if (doc.type === "job") { emit(doc.category, doc); } }'
      },
      byEmployer: {
        map: 'function(doc) { if (doc.type === "job") { emit(doc.employer, doc); } }'
      },
      byStatus: {
        map: 'function(doc) { if (doc.type === "job") { emit(doc.isActive, doc); } }'
      }
    });
  } catch (error) {
    // Design doc might already exist
  }

  // Sessions design document
  try {
    await connection.createDesignDoc('sessions', {
      byUser: {
        map: 'function(doc) { if (doc.type === "session") { emit(doc.user, doc); } }'
      },
      byStatus: {
        map: 'function(doc) { if (doc.type === "session") { emit(doc.status, doc); } }'
      }
    });
  } catch (error) {
    // Design doc might already exist
  }

  // Assessments design document
  try {
    await connection.createDesignDoc('assessments', {
      byCourse: {
        map: 'function(doc) { if (doc.type === "assessment") { emit(doc.course, doc); } }'
      },
      byInstructor: {
        map: 'function(doc) { if (doc.type === "assessment") { emit(doc.instructor, doc); } }'
      }
    });
  } catch (error) {
    // Design doc might already exist
  }

  // Certificates design document
  try {
    await connection.createDesignDoc('certificates', {
      byUser: {
        map: 'function(doc) { if (doc.type === "certificate") { emit(doc.user, doc); } }'
      },
      byCourse: {
        map: 'function(doc) { if (doc.type === "certificate") { emit(doc.course, doc); } }'
      }
    });
  } catch (error) {
    // Design doc might already exist
  }

  // Help tickets design document
  try {
    await connection.createDesignDoc('help', {
      byUser: {
        map: 'function(doc) { if (doc.type === "help") { emit(doc.user, doc); } }'
      },
      byStatus: {
        map: 'function(doc) { if (doc.type === "help") { emit(doc.status, doc); } }'
      },
      byPriority: {
        map: 'function(doc) { if (doc.type === "help") { emit(doc.priority, doc); } }'
      }
    });
  } catch (error) {
    // Design doc might already exist
  }

  // Scholarships design document
  try {
    await connection.createDesignDoc('scholarships', {
      byCategory: {
        map: 'function(doc) { if (doc.type === "scholarship") { emit(doc.category, doc); } }'
      },
      byEmployer: {
        map: 'function(doc) { if (doc.type === "scholarship") { emit(doc.employer, doc); } }'
      },
      byAmount: {
        map: 'function(doc) { if (doc.type === "scholarship") { emit(doc.amount, doc); } }'
      }
    });
  } catch (error) {
    // Design doc might already exist
  }

  // Design documents setup completed silently
};

export const disconnectCouchDB = async (): Promise<void> => {
  const connection = CouchDBConnection.getInstance();
  await connection.disconnect();
}; 