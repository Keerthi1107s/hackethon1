import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// This file is intended for server-side use.

export function initializeFirebase() {
    if (getApps().length > 0) {
        return getSdks(getApp());
    }

    const app = initializeApp(firebaseConfig);
    return getSdks(app);
}

function getSdks(app: FirebaseApp) {
    return {
        firebaseApp: app,
        auth: getAuth(app),
        firestore: getFirestore(app),
    };
}
