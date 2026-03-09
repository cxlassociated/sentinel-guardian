import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface UserProfile {
  uid: string;
  email: string;
  tenantId: string;
  role: 'firm-admin' | 'advisor' | 'compliance-officer';
  firmName: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          // In a real app, this would fetch the user profile from Firestore
          // For the preview/demo, we'll mock the profile if it doesn't exist yet
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setProfile(userDoc.data() as UserProfile);
          } else {
            // Mock profile for demo purposes
            setProfile({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              tenantId: 'demo-tenant-123',
              role: 'firm-admin',
              firmName: 'Demo Advisory Partners'
            });
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          // Fallback mock profile
          setProfile({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            tenantId: 'demo-tenant-123',
            role: 'firm-admin',
            firmName: 'Demo Advisory Partners'
          });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
