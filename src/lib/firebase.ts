import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  updateProfile,
  signOut,
  User as FirebaseUser,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  doc,
  collection,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  getDocFromServer,
  writeBatch,
} from 'firebase/firestore';
import defaultFirebaseConfig from '../../firebase-applet-config.json';
import { Transaction, Category, AppSettings } from '../types';

export interface FirebaseAppConfig {
  projectId: string;
  appId: string;
  apiKey: string;
  authDomain: string;
  firestoreDatabaseId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  measurementId?: string;
  oAuthClientId?: string;
}

export const CUSTOM_FIREBASE_CONFIG_KEY = 'sakurapi_custom_firebase_config';

const fallbackConfig: FirebaseAppConfig = {
  projectId: (defaultFirebaseConfig as any)?.projectId || 'sakurapi-8a40e',
  appId: (defaultFirebaseConfig as any)?.appId || '1:989840202129:web:0cae951701b8899da9e230',
  apiKey: (defaultFirebaseConfig as any)?.apiKey || 'AIzaSyA_em8l2DOUvGrbtqUhRitGuNX2jvg6F7E',
  authDomain: (defaultFirebaseConfig as any)?.authDomain || 'sakurapi-8a40e.firebaseapp.com',
  firestoreDatabaseId: (defaultFirebaseConfig as any)?.firestoreDatabaseId || 'ai-studio-fintrack-62eea384-3451-41b0-9259-e43944697254',
  storageBucket: (defaultFirebaseConfig as any)?.storageBucket || 'sakurapi-8a40e.firebasestorage.app',
  messagingSenderId: (defaultFirebaseConfig as any)?.messagingSenderId || '989840202129',
};

export function getActiveFirebaseConfig(): FirebaseAppConfig {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(CUSTOM_FIREBASE_CONFIG_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.projectId && parsed?.apiKey) {
          return { ...fallbackConfig, ...parsed };
        }
      }
    } catch (e) {
      console.warn('Failed to parse custom firebase config:', e);
    }
  }
  return fallbackConfig;
}

export function isUsingCustomConfig(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(localStorage.getItem(CUSTOM_FIREBASE_CONFIG_KEY));
}

export function saveCustomFirebaseConfig(config: Partial<FirebaseAppConfig>): boolean {
  if (typeof window === 'undefined') return false;
  if (!config.projectId || !config.apiKey) {
    throw new Error('Project ID dan API Key wajib diisi.');
  }
  const cleanProjectId = config.projectId.trim();
  const merged: FirebaseAppConfig = {
    projectId: cleanProjectId,
    apiKey: config.apiKey.trim(),
    authDomain: config.authDomain?.trim() || `${cleanProjectId}.firebaseapp.com`,
    appId: config.appId?.trim() || '1:123456789:web:sakurapi',
    storageBucket: config.storageBucket?.trim() || `${cleanProjectId}.firebasestorage.app`,
    messagingSenderId: config.messagingSenderId?.trim() || '',
    firestoreDatabaseId: config.firestoreDatabaseId?.trim() || '(default)',
  };
  localStorage.setItem(CUSTOM_FIREBASE_CONFIG_KEY, JSON.stringify(merged));
  return true;
}

export function resetCustomFirebaseConfig(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CUSTOM_FIREBASE_CONFIG_KEY);
  }
}

export function parseFirebaseConfigInput(input: string): Partial<FirebaseAppConfig> {
  const cleaned = input.trim();
  if (!cleaned) return {};

  if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
    try {
      return JSON.parse(cleaned);
    } catch {
      // Continue to regex
    }
  }

  const extract = (key: string): string => {
    const match = cleaned.match(new RegExp(`${key}\\s*:\\s*["'\`]([^"'\`]+)["'\`]`));
    return match ? match[1].trim() : '';
  };

  const apiKey = extract('apiKey');
  const projectId = extract('projectId');
  const authDomain = extract('authDomain');
  const appId = extract('appId');
  const storageBucket = extract('storageBucket');
  const messagingSenderId = extract('messagingSenderId');
  const firestoreDatabaseId = extract('firestoreDatabaseId') || extract('databaseId');

  if (apiKey || projectId) {
    return {
      apiKey,
      projectId,
      authDomain: authDomain || (projectId ? `${projectId}.firebaseapp.com` : undefined),
      appId: appId || (projectId ? `1:123456789:web:${projectId}` : undefined),
      storageBucket: storageBucket || (projectId ? `${projectId}.firebasestorage.app` : undefined),
      messagingSenderId,
      firestoreDatabaseId: firestoreDatabaseId || undefined,
    };
  }

  return {};
}

const activeConfig = getActiveFirebaseConfig();

// Initialize Firebase SDK safely without duplicate apps
const app = getApps().length === 0 ? initializeApp(activeConfig) : getApp();

// Configure Firestore with experimentalForceLongPolling
const targetDbId =
  activeConfig.firestoreDatabaseId &&
  activeConfig.firestoreDatabaseId !== '(default)' &&
  activeConfig.firestoreDatabaseId !== ''
    ? activeConfig.firestoreDatabaseId
    : undefined;

let firestoreInstance;
try {
  firestoreInstance = targetDbId
    ? initializeFirestore(app, { experimentalForceLongPolling: true }, targetDbId)
    : initializeFirestore(app, { experimentalForceLongPolling: true });
} catch {
  firestoreInstance = targetDbId ? getFirestore(app, targetDbId) : getFirestore(app);
}

export const db = firestoreInstance;

// Standard Firebase Auth instance
export const auth = getAuth(app);

// Operation types for strict error telemetry
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
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
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
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection
export async function testConnection(): Promise<boolean> {
  try {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Connection check timeout')), 3000)
    );
    await Promise.race([
      getDocFromServer(doc(db, 'test', 'connection')),
      timeout,
    ]);
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client appears offline. Operating with local persistence.');
      return false;
    }
    // Server responded or non-fatal timeout
    return true;
  }
}

// Authentication Service
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
googleProvider.addScope('profile');
googleProvider.addScope('email');

export async function loginWithGoogle(): Promise<FirebaseUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Sync user record to /users/{uid} safely
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          id: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Pengguna',
          photoURL: user.photoURL || '',
          lastLoginAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (syncErr) {
      console.warn('Non-fatal: user profile sync to Firestore skipped:', syncErr);
    }

    return user;
  } catch (error: any) {
    if (
      error?.code !== 'auth/unauthorized-domain' &&
      error?.code !== 'auth/popup-closed-by-user' &&
      error?.code !== 'auth/cancelled-popup-request'
    ) {
      console.error('Google Sign-In failed:', error);
    }
    throw error;
  }
}

export async function loginWithEmail(email: string, pass: string): Promise<FirebaseUser> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return cred.user;
  } catch (error) {
    console.error('Email sign-in failed:', error);
    throw error;
  }
}

export async function registerWithEmail(
  email: string,
  pass: string,
  displayName: string
): Promise<FirebaseUser> {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const user = cred.user;

    if (displayName) {
      await updateProfile(user, { displayName });
    }

    const userRef = doc(db, 'users', user.uid);
    await setDoc(
      userRef,
      {
        id: user.uid,
        email: user.email || email,
        displayName: displayName || user.displayName || 'Pengguna',
        photoURL: user.photoURL || '',
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return user;
  } catch (error) {
    console.error('Email registration failed:', error);
    throw error;
  }
}

export async function loginAnonymously(): Promise<FirebaseUser> {
  try {
    const cred = await signInAnonymously(auth);
    const user = cred.user;

    const userRef = doc(db, 'users', user.uid);
    await setDoc(
      userRef,
      {
        id: user.uid,
        email: 'tamu@catatan.local',
        displayName: 'Pengguna Cloud (Instan)',
        photoURL: '',
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return user;
  } catch (error) {
    console.error('Anonymous sign-in failed:', error);
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// Firestore Realtime Listeners
export function subscribeUserTransactions(
  userId: string,
  onData: (txs: Transaction[]) => void,
  onError?: (err: Error) => void
) {
  // If not signed in to Firebase Auth with this userId, skip cloud listener
  if (!auth.currentUser || auth.currentUser.uid !== userId) {
    return () => {};
  }
  const path = `users/${userId}/transactions`;
  const colRef = collection(db, 'users', userId, 'transactions');

  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: Transaction[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          title: data.title || '',
          amount: Number(data.amount) || 0,
          type: data.type === 'income' ? 'income' : 'expense',
          categoryId: data.categoryId || '',
          categoryName: data.categoryName || '',
          date: data.date || new Date().toISOString().split('T')[0],
          notes: data.notes || '',
          createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
        });
      });
      // Sort newest first
      list.sort((a, b) => b.createdAt - a.createdAt);
      onData(list);
    },
    (error) => {
      onError?.(error);
      console.warn(`Firestore sync notice (${path}):`, error?.message || error);
    }
  );
}

export function subscribeUserCategories(
  userId: string,
  onData: (cats: Category[]) => void,
  onError?: (err: Error) => void
) {
  if (!auth.currentUser || auth.currentUser.uid !== userId) {
    return () => {};
  }
  const path = `users/${userId}/categories`;
  const colRef = collection(db, 'users', userId, 'categories');

  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: Category[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          name: data.name || '',
          type: data.type === 'income' ? 'income' : 'expense',
          icon: data.icon || 'Tag',
          color: data.color || '#64748b',
        });
      });
      onData(list);
    },
    (error) => {
      onError?.(error);
      console.warn(`Firestore sync notice (${path}):`, error?.message || error);
    }
  );
}

export function subscribeUserSettings(
  userId: string,
  onData: (settings: AppSettings) => void,
  onError?: (err: Error) => void
) {
  if (!auth.currentUser || auth.currentUser.uid !== userId) {
    return () => {};
  }
  const path = `users/${userId}/settings/current`;
  const docRef = doc(db, 'users', userId, 'settings', 'current');

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        onData({
          currency: data.currency || 'Rp',
          pinEnabled: !!data.pinEnabled,
          pinCode: data.pinCode || '',
          theme: data.theme || 'slate',
          userName: data.userName || 'Pengguna',
        });
      }
    },
    (error) => {
      onError?.(error);
      console.warn(`Firestore sync notice (${path}):`, error?.message || error);
    }
  );
}

// Write Operations
export async function saveTransactionToFirestore(userId: string, tx: Transaction) {
  if (!auth.currentUser || auth.currentUser.uid !== userId) {
    return;
  }
  const path = `users/${userId}/transactions/${tx.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'transactions', tx.id);
    await setDoc(
      docRef,
      {
        id: tx.id,
        userId: userId,
        title: tx.title.slice(0, 100),
        amount: Math.max(0, Number(tx.amount) || 0),
        type: tx.type,
        categoryId: tx.categoryId.slice(0, 64),
        categoryName: tx.categoryName.slice(0, 64),
        date: tx.date,
        notes: (tx.notes || '').slice(0, 500),
        createdAt: tx.createdAt || Date.now(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('Firestore save transaction notice:', error);
  }
}

export async function deleteTransactionFromFirestore(userId: string, txId: string) {
  if (!auth.currentUser || auth.currentUser.uid !== userId) {
    return;
  }
  const path = `users/${userId}/transactions/${txId}`;
  try {
    const docRef = doc(db, 'users', userId, 'transactions', txId);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn('Firestore delete transaction notice:', error);
  }
}

export async function saveCategoryToFirestore(userId: string, cat: Category) {
  if (!auth.currentUser || auth.currentUser.uid !== userId) {
    return;
  }
  const path = `users/${userId}/categories/${cat.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'categories', cat.id);
    await setDoc(
      docRef,
      {
        id: cat.id,
        userId: userId,
        name: cat.name.slice(0, 50),
        type: cat.type,
        icon: cat.icon.slice(0, 50),
        color: cat.color.slice(0, 20),
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('Firestore save category notice:', error);
  }
}

export async function deleteCategoryFromFirestore(userId: string, catId: string) {
  if (!auth.currentUser || auth.currentUser.uid !== userId) {
    return;
  }
  const path = `users/${userId}/categories/${catId}`;
  try {
    const docRef = doc(db, 'users', userId, 'categories', catId);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn('Firestore delete category notice:', error);
  }
}

export async function saveSettingsToFirestore(userId: string, settings: AppSettings) {
  if (!auth.currentUser || auth.currentUser.uid !== userId) {
    return;
  }
  const path = `users/${userId}/settings/current`;
  try {
    const docRef = doc(db, 'users', userId, 'settings', 'current');
    await setDoc(
      docRef,
      {
        userId: userId,
        currency: (settings.currency || 'Rp').slice(0, 10),
        pinEnabled: !!settings.pinEnabled,
        pinCode: (settings.pinCode || '').slice(0, 6),
        theme: settings.theme || 'slate',
        userName: (settings.userName || 'Pengguna').slice(0, 50),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('Firestore save settings notice:', error);
  }
}

// Initial Sync helper: upload existing local transactions to Firestore on first login
export async function syncLocalDataToFirestore(
  userId: string,
  localTxs: Transaction[],
  localCats: Category[],
  localSettings: AppSettings
) {
  if (!auth.currentUser || auth.currentUser.uid !== userId) {
    return;
  }
  const path = `users/${userId}`;
  try {
    // Check if user already has transactions in cloud
    const txCol = collection(db, 'users', userId, 'transactions');
    const existing = await getDocs(txCol);

    if (existing.empty && localTxs.length > 0) {
      const batch = writeBatch(db);

      for (const tx of localTxs) {
        const txDoc = doc(db, 'users', userId, 'transactions', tx.id);
        batch.set(txDoc, {
          id: tx.id,
          userId: userId,
          title: tx.title.slice(0, 100),
          amount: Math.max(0, Number(tx.amount) || 0),
          type: tx.type,
          categoryId: tx.categoryId.slice(0, 64),
          categoryName: tx.categoryName.slice(0, 64),
          date: tx.date,
          notes: (tx.notes || '').slice(0, 500),
          createdAt: tx.createdAt || Date.now(),
        });
      }

      for (const cat of localCats) {
        const catDoc = doc(db, 'users', userId, 'categories', cat.id);
        batch.set(catDoc, {
          id: cat.id,
          userId: userId,
          name: cat.name.slice(0, 50),
          type: cat.type,
          icon: cat.icon.slice(0, 50),
          color: cat.color.slice(0, 20),
          createdAt: new Date().toISOString(),
        });
      }

      const settingsDoc = doc(db, 'users', userId, 'settings', 'current');
      batch.set(settingsDoc, {
        userId: userId,
        currency: (localSettings.currency || 'Rp').slice(0, 10),
        pinEnabled: !!localSettings.pinEnabled,
        pinCode: (localSettings.pinCode || '').slice(0, 6),
        theme: localSettings.theme || 'slate',
        userName: (localSettings.userName || 'Pengguna').slice(0, 50),
        updatedAt: new Date().toISOString(),
      });

      await batch.commit();
    }
  } catch (error) {
    console.warn('Firestore initial sync notice:', error);
  }
}
