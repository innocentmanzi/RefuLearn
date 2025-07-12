import nano from 'nano';
export interface CouchDBConfig {
    url: string;
    username: string;
    password: string;
    database: string;
}
export declare class CouchDBConnection {
    private static instance;
    private nano;
    private db;
    private config;
    private constructor();
    static getInstance(config?: CouchDBConfig): CouchDBConnection;
    connect(): Promise<void>;
    getDatabase(): nano.DocumentScope<any>;
    getNano(): nano.ServerScope;
    disconnect(): Promise<void>;
    createIndex(designDoc: string, index: any): Promise<void>;
    createDesignDoc(designDoc: string, views: any): Promise<void>;
}
export declare const connectCouchDB: () => Promise<CouchDBConnection>;
export declare const disconnectCouchDB: () => Promise<void>;
//# sourceMappingURL=couchdb.d.ts.map