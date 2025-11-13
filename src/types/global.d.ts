declare global {
    // Environment variables
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: 'development' | 'production' | 'test';
            PORT?: string;
            JWT_SECRET: string;
            BACKEND_URI: string | undefined;

            // Firebase credentials
            FIREBASE_API_KEY: string;
            FIREBASE_AUTH_DOMAIN: string;
            FIREBASE_PROJECT_ID: string;
            FIREBASE_STORAGE_BUCKET: string;
            FIREBASE_MESSAGING_SENDER_ID: string;
            FIREBASE_APP_ID: string;
        }
    }


    // Custom types can be added here
    type NoteData = {
        id: string;
        encryptedData: string;
        mimetype?: string;
        filename?: string;
        iv: string;
        authTag: string;
    }

    

}

export {};