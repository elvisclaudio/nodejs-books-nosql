import dotenv from 'dotenv';
import * as admin from 'firebase-admin';
import * as path from 'path';

dotenv.config();

class DatabaseConnection {
    private static instance: DatabaseConnection;
    private db: admin.firestore.Firestore | null = null;

    private constructor() {}

    public static getInstance(): DatabaseConnection {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }

    public getConnection(): admin.firestore.Firestore {
        if (!this.db) {
            try {
                // Initialize Firebase Admin SDK
                const serviceAccount = require(path.join(__dirname, '../../firebase.json'));
                
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount)
                });

                this.db = admin.firestore();
                console.log('Firebase Firestore connection established');
            } catch (err) {
                console.log('Connection to Firestore failed', err);
                throw err;
            }
        }
        return this.db;
    }

    public async closeConnection(): Promise<void> {
        if (this.db) {
            await admin.app().delete();
            this.db = null;
            console.log('Firestore connection closed');
        }
    }
}

// Export a function that returns the singleton Firestore instance
export default function dbConnection(): admin.firestore.Firestore {
    const dbInstance = DatabaseConnection.getInstance();
    return dbInstance.getConnection();
}

// Also export the class for direct access if needed
export { DatabaseConnection };

