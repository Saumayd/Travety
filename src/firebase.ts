import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  inMemoryPersistence,
  initializeAuth,
   browserPopupRedirectResolver,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  doc,
  getDocFromServer,
  getFirestore,
  setLogLevel,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Suppress noisy internal Firestore retry console.error logs when offline or token API is propagating
setLogLevel('silent');

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

function createSafeAuth() {
  try {
    return initializeAuth(app, {
      persistence: inMemoryPersistence,
      popupRedirectResolver: browserPopupRedirectResolver,
    });
  } catch {
    return getAuth(app);
  }
}

export const auth = createSafeAuth();
export const googleProvider = new GoogleAuthProvider();

// Clear any stale IndexedDB auth tokens from previous sessions that could block Firestore
try {
  if (typeof window !== 'undefined' && window.indexedDB && window.indexedDB.deleteDatabase) {
    window.indexedDB.deleteDatabase('firebaseLocalStorageDb');
  }
} catch {
  // Ignore IndexedDB cleanup errors
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): void {
  const message = error instanceof Error ? error.message : String(error);

  // If Token Service API (securetoken.googleapis.com) is disabled in the GCP project,
  // sign out the session so Firestore isn't stuck retrying a broken token.
  if (
    message.includes('token-service-api-has-not-been-used') ||
    message.includes('securetoken.googleapis.com')
  ) {
    signOut(auth).catch(() => {});
    window.dispatchEvent(new CustomEvent('firebase-token-api-disabled'));
    return;
  }

  const errInfo: FirestoreErrorInfo = {
    error: message,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Notice: ', JSON.stringify(errInfo));
}

export async function signInWithGoogle() {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (
      msg.includes('token-service-api-has-not-been-used') ||
      msg.includes('securetoken.googleapis.com')
    ) {
      await signOut(auth).catch(() => {});
      window.dispatchEvent(new CustomEvent('firebase-token-api-disabled'));
    }
    throw error;
  }
}

export async function logOutUser() {
  return signOut(auth);
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (
      msg.includes('token-service-api-has-not-been-used') ||
      msg.includes('securetoken.googleapis.com')
    ) {
      await signOut(auth).catch(() => {});
      window.dispatchEvent(new CustomEvent('firebase-token-api-disabled'));
      return;
    }
    if (msg.includes('the client is offline')) {
      console.warn('Firestore operating in local offline cache mode.');
    }
  }
}

testConnection();
