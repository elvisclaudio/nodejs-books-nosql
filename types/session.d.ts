import 'express-session';

declare module 'express-session' {
    interface SessionData {
        success?: string;
        error?: string;
    }
}

