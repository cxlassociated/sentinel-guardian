import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Building2, User, Mail, Lock, AlertTriangle, Loader2 } from 'lucide-react';
import { Logo } from '../components/Logo';
import { getFriendlyErrorMessage, handleFirestoreError, OperationType } from '../lib/errorHandlers';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firmName: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleRegister = async () => {
    setError('');
    setLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // 1. Check if user already has a profile
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        // User already registered, just navigate home
        navigate('/');
        return;
      }

      // 2. If not registered, create firm and user records
      // Use the firm name from the form if provided, otherwise use a default
      const finalFirmName = formData.firmName.trim() || `${user.displayName || 'New'}'s Advisory`;
      const firmId = `firm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create user profile
      const userPath = `users/${user.uid}`;
      try {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          fullName: user.displayName || '',
          firmName: finalFirmName,
          firmId: firmId,
          role: 'firm-admin',
          onboardingCompleted: false,
          createdAt: new Date()
        });
      } catch (err) {
        handleFirestoreError(auth, err, OperationType.WRITE, userPath);
      }

      // Create firm record
      const firmPath = `firms/${firmId}`;
      try {
        await setDoc(doc(db, 'firms', firmId), {
          id: firmId,
          name: finalFirmName,
          createdAt: new Date(),
          subscriptionStatus: 'trial',
          adminUid: user.uid
        });
      } catch (err) {
        handleFirestoreError(auth, err, OperationType.WRITE, firmPath);
      }

      navigate('/');
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    
    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2. Generate a firm ID
      const firmId = `firm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // 3. Create user profile in Firestore
      const userPath = `users/${user.uid}`;
      try {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: formData.email,
          fullName: formData.fullName,
          firmName: formData.firmName,
          firmId: firmId,
          role: 'firm-admin',
          onboardingCompleted: false,
          createdAt: new Date()
        });
      } catch (err) {
        handleFirestoreError(auth, err, OperationType.WRITE, userPath);
      }

      // 4. Create firm record
      const firmPath = `firms/${firmId}`;
      try {
        await setDoc(doc(db, 'firms', firmId), {
          id: firmId,
          name: formData.firmName,
          createdAt: new Date(),
          subscriptionStatus: 'trial',
          adminUid: user.uid
        });
      } catch (err) {
        handleFirestoreError(auth, err, OperationType.WRITE, firmPath);
      }

      navigate('/');
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <Logo className="h-16 mx-auto mb-6" />
          <h2 className="mt-6 text-3xl font-extrabold text-[#265C7E] tracking-tight">
            Create Your Firm
          </h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">
            Start your 14-day free trial of Sentinel Guardian AI
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <button
            onClick={handleGoogleRegister}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg bg-white text-gray-700 font-bold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4BB7BA] transition-all shadow-sm disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                CONTINUE WITH GOOGLE
              </>
            )}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500 font-medium uppercase tracking-wider">Or register with email</span>
            </div>
          </div>
        </div>

        <form className="mt-4 space-y-6" onSubmit={handleRegister}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">RIA Firm Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="firmName"
                  type="text"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4BB7BA] focus:border-transparent sm:text-sm transition-shadow"
                  placeholder="Sentinel Advisory Partners"
                  value={formData.firmName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="fullName"
                  type="text"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4BB7BA] focus:border-transparent sm:text-sm transition-shadow"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Work Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4BB7BA] focus:border-transparent sm:text-sm transition-shadow"
                  placeholder="john@advisorypartners.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4BB7BA] focus:border-transparent sm:text-sm transition-shadow"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4BB7BA] focus:border-transparent sm:text-sm transition-shadow"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-extrabold rounded-lg text-white bg-[#EB5924] hover:bg-[#C9491A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EB5924] transition-colors disabled:opacity-70 shadow-md"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'CREATE NEW ACCOUNT'}
            </button>
          </div>
        </form>
        
        <p className="mt-8 text-center text-sm text-gray-600 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-[#265C7E] hover:text-[#4BB7BA] transition-colors">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
