import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { isDevEnvironment } from '../lib/env';

interface UserProfile {
  uid: string;
  email: string;
  firmId: string;
  role: 'firm-admin' | 'advisor' | 'compliance-officer' | 'demo';
  firmName: string;
  fullName: string;
  title?: string;
  phone?: string;
  onboardingCompleted?: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isDevDemo: boolean;
  loginAsDevDemo: () => void;
  logoutDevDemo: () => void;
}

const DEV_DEMO_USER: User = {
  uid: 'dev-demo-user-sg3',
  email: 'demo@sentinelguardian.ai',
  displayName: 'Compliance Officer',
  emailVerified: true,
  isAnonymous: true,
  metadata: {},
  providerData: [],
  refreshToken: '',
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => 'demo-token',
  getIdTokenResult: async () => ({} as any),
  reload: async () => {},
  toJSON: () => ({}),
  phoneNumber: null,
  photoURL: null,
  providerId: 'demo',
} as unknown as User;

const DEV_DEMO_PROFILE: UserProfile = {
  uid: 'dev-demo-user-sg3',
  email: 'demo@sentinelguardian.ai',
  firmId: 'demo-firm-123',
  role: 'firm-admin',
  firmName: 'Demo Advisory Partners',
  fullName: 'Compliance Officer (Demo)',
  onboardingCompleted: true,
};

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  profile: null, 
  loading: true,
  isDevDemo: false,
  loginAsDevDemo: () => {},
  logoutDevDemo: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDevDemo, setIsDevDemo] = useState(false);

  const loginAsDevDemo = () => {
    if (!isDevEnvironment()) {
      console.warn("Dev demo mode is disabled in production/client-test environment.");
      return;
    }
    sessionStorage.setItem('sg3_dev_demo_active', 'true');
    setUser(DEV_DEMO_USER);
    setProfile(DEV_DEMO_PROFILE);
    setIsDevDemo(true);
    setLoading(false);
  };

  const logoutDevDemo = () => {
    sessionStorage.removeItem('sg3_dev_demo_active');
    setUser(null);
    setProfile(null);
    setIsDevDemo(false);
  };

  useEffect(() => {
    const isDev = isDevEnvironment();
    if (!isDev) {
      sessionStorage.removeItem('sg3_dev_demo_active');
    }

    const isDevDemoSaved = isDev && sessionStorage.getItem('sg3_dev_demo_active') === 'true';
    if (isDevDemoSaved) {
      setUser(DEV_DEMO_USER);
      setProfile(DEV_DEMO_PROFILE);
      setIsDevDemo(true);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (isDev && sessionStorage.getItem('sg3_dev_demo_active') === 'true') {
        return;
      }

      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setProfile(userDoc.data() as UserProfile);
          } else {
            setProfile(null);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = React.useMemo(() => ({ 
    user, 
    profile, 
    loading, 
    isDevDemo, 
    loginAsDevDemo, 
    logoutDevDemo 
  }), [user, profile, loading, isDevDemo]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
