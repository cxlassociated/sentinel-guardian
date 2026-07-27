import { FirebaseError } from 'firebase/app';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
  AUTH = 'auth'
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    firmId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function getFriendlyErrorMessage(error: any): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/configuration-not-found':
        return 'Authentication is not enabled for this project. Please enable Email/Password in the Firebase Console.';
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please sign in instead.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password.';
      case 'permission-denied':
        return 'Account setup permission error. Please verify your permissions or try again.';
      default:
        return error.message;
    }
  }

  const rawMsg = error?.message || (typeof error === 'string' ? error : '');
  if (rawMsg.includes('permission-denied') || rawMsg.includes('Missing or insufficient permissions')) {
    return 'Permission denied when creating user profile or accessing firm data.';
  }

  if (rawMsg.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(rawMsg);
      if (parsed.error && typeof parsed.error === 'string') {
        if (parsed.error.includes('permission') || parsed.error.includes('Missing or insufficient permissions')) {
          return 'Permission denied when accessing user profile or firm data.';
        }
        return parsed.error;
      }
    } catch {
      // ignore JSON parse error
    }
  }

  return rawMsg || 'An unexpected error occurred.';
}

export function handleFirestoreError(auth: any, error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      firmId: auth.currentUser?.firmId,
      providerInfo: auth.currentUser?.providerData.map((provider: any) => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  
  console.error('[Firestore Diagnostic Info]:', JSON.stringify(errInfo, null, 2));
  
  const originalMsg = error instanceof Error ? error.message : String(error);
  if (originalMsg.includes('permission') || originalMsg.includes('Missing or insufficient permissions')) {
    throw new Error('Permission denied when accessing user profile or firm data.');
  }
  throw error instanceof Error ? error : new Error(originalMsg);
}
