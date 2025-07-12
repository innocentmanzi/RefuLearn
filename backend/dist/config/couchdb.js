"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectCouchDB = exports.connectCouchDB = exports.CouchDBConnection = void 0;
const nano_1 = __importDefault(require("nano"));
const logger_1 = require("../utils/logger");
class CouchDBConnection {
    constructor(config) {
        this.config = config;
        this.nano = (0, nano_1.default)(config.url);
    }
    static getInstance(config) {
        if (!CouchDBConnection.instance && config) {
            CouchDBConnection.instance = new CouchDBConnection(config);
        }
        return CouchDBConnection.instance;
    }
    async connect() {
        try {
            try {
                await this.nano.auth(this.config.username, this.config.password);
                logger_1.logger.info(`Successfully authenticated with CouchDB using user: ${this.config.username}`);
            }
            catch (authError) {
                logger_1.logger.error(`CouchDB authentication failed for user ${this.config.username}:`, authError.message);
                logger_1.logger.info('Attempting to connect without authentication...');
            }
            const dbName = this.config.database;
            let dbList = [];
            try {
                dbList = await this.nano.db.list();
            }
            catch (listError) {
                logger_1.logger.warn('Could not list databases, attempting to use database directly:', listError.message);
            }
            if (dbList.length === 0 || !dbList.includes(dbName)) {
                try {
                    await this.nano.db.create(dbName);
                    logger_1.logger.info(`Created CouchDB database: ${dbName}`);
                }
                catch (createError) {
                    if (createError.error === 'file_exists') {
                        logger_1.logger.info(`Database ${dbName} already exists`);
                    }
                    else {
                        logger_1.logger.warn(`Could not create database ${dbName}:`, createError.message);
                    }
                }
            }
            this.db = this.nano.use(dbName);
            try {
                await this.db.info();
                logger_1.logger.info(`Successfully connected to CouchDB database: ${dbName}`);
            }
            catch (infoError) {
                logger_1.logger.error(`Could not access database ${dbName}:`, infoError.message);
                throw new Error(`Database connection failed: ${infoError.message}`);
            }
        }
        catch (error) {
            logger_1.logger.error('CouchDB connection failed:', error.message || error);
            throw error;
        }
    }
    getDatabase() {
        if (!this.db) {
            throw new Error('CouchDB not connected. Call connect() first.');
        }
        return this.db;
    }
    getNano() {
        return this.nano;
    }
    async disconnect() {
        try {
            logger_1.logger.info('CouchDB connection closed');
        }
        catch (error) {
            logger_1.logger.error('Error disconnecting from CouchDB:', error);
        }
    }
    async createIndex(designDoc, index) {
        try {
            await this.db.createIndex({
                index,
                name: designDoc
            });
            logger_1.logger.info(`Created index: ${designDoc}`);
        }
        catch (error) {
            logger_1.logger.error(`Error creating index ${designDoc}:`, error);
        }
    }
    async createDesignDoc(designDoc, views) {
        try {
            await this.db.insert({
                _id: `_design/${designDoc}`,
                views
            });
            logger_1.logger.info(`Created design document: ${designDoc}`);
        }
        catch (error) {
            if (error.statusCode !== 409) {
                logger_1.logger.error(`Error creating design document ${designDoc}:`, error);
            }
        }
    }
}
exports.CouchDBConnection = CouchDBConnection;
const connectCouchDB = async () => {
    const config = {
        url: 'http://localhost:5984',
        username: 'Manzi',
        password: 'Clarisse101',
        database: 'refulearn'
    };
    const connection = CouchDBConnection.getInstance(config);
    await connection.connect();
    await setupDesignDocuments(connection);
    return connection;
};
exports.connectCouchDB = connectCouchDB;
const setupDesignDocuments = async (connection) => {
    const db = connection.getDatabase();
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
    }
    catch (error) {
    }
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
    }
    catch (error) {
    }
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
    }
    catch (error) {
    }
    try {
        await connection.createDesignDoc('sessions', {
            byUser: {
                map: 'function(doc) { if (doc.type === "session") { emit(doc.user, doc); } }'
            },
            byStatus: {
                map: 'function(doc) { if (doc.type === "session") { emit(doc.status, doc); } }'
            }
        });
    }
    catch (error) {
    }
    try {
        await connection.createDesignDoc('assessments', {
            byCourse: {
                map: 'function(doc) { if (doc.type === "assessment") { emit(doc.course, doc); } }'
            },
            byInstructor: {
                map: 'function(doc) { if (doc.type === "assessment") { emit(doc.instructor, doc); } }'
            }
        });
    }
    catch (error) {
    }
    try {
        await connection.createDesignDoc('certificates', {
            byUser: {
                map: 'function(doc) { if (doc.type === "certificate") { emit(doc.user, doc); } }'
            },
            byCourse: {
                map: 'function(doc) { if (doc.type === "certificate") { emit(doc.course, doc); } }'
            }
        });
    }
    catch (error) {
    }
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
    }
    catch (error) {
    }
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
    }
    catch (error) {
    }
};
const disconnectCouchDB = async () => {
    const connection = CouchDBConnection.getInstance();
    await connection.disconnect();
};
exports.disconnectCouchDB = disconnectCouchDB;
//# sourceMappingURL=couchdb.js.map